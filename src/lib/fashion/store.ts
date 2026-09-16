import { mkdir, readFile, writeFile } from "fs/promises";
import bcrypt from "bcryptjs";
import { computeSellPrice, getEffectivePrice } from "./pricing";
import { defaultCategories, defaultSettings } from "./defaults";
import { seedProducts as rawSeedProducts } from "./seed-products";
import type {
  AdminNotification,
  AnalyticsSummary,
  Category,
  Coupon,
  FashionCustomer,
  FashionOrder,
  FashionStore,
  OrderStatus,
  OrderStatusUpdate,
  Product,
  ProductInput,
  ProductReview,
  PromoBanner,
  StoreSettings,
  UserNotification,
} from "./types";
import { computeAnalytics } from "./analytics";
import { generateTrackingNumber } from "./tracking";
import { buildProductSlug, isAsciiProductSlug } from "./product-slug";
import { fashionDataDir, fashionStorePath } from "./paths";
import {
  categoryIdentity,
  filterProductsByCategory,
  findCategoryForProduct,
  repairProductCategorySlugs,
} from "./category-match";
import { definedEntries, resolvePersistedCoupons, syncBannersForProduct } from "./promo-visibility";

function defaultAdminPassword(): string {
  // Do not fall back to BloodLink ADMIN_PASSWORD — that locked founders out on shared Railway.
  return process.env.FASHION_ADMIN_PASSWORD?.trim() || "rony4505";
}

async function syncAdminPasswordHash(store: FashionStore): Promise<boolean> {
  const desired = defaultAdminPassword();
  const matches = await bcrypt.compare(desired, store.adminPasswordHash);
  if (matches) return false;
  store.adminPasswordHash = await bcrypt.hash(desired, 12);
  return true;
}

function dataDir(): string {
  return fashionDataDir();
}

function storePath(): string {
  return fashionStorePath();
}

function isExpired(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

function migrateSettings(parsed?: Partial<StoreSettings>): StoreSettings {
  return {
    ...defaultSettings,
    ...parsed,
    deliveryRules: parsed?.deliveryRules?.length
      ? parsed.deliveryRules
      : defaultSettings.deliveryRules,
    promoBanners: parsed?.promoBanners ?? defaultSettings.promoBanners ?? [],
    availableSizes: parsed?.availableSizes ?? defaultSettings.availableSizes,
    aboutPillars: parsed?.aboutPillars ?? defaultSettings.aboutPillars,
    aboutPillarsEn: parsed?.aboutPillarsEn ?? defaultSettings.aboutPillarsEn,
    serviceHighlights: parsed?.serviceHighlights ?? defaultSettings.serviceHighlights,
    serviceHighlightsEn: parsed?.serviceHighlightsEn ?? defaultSettings.serviceHighlightsEn,
    testimonials: parsed?.testimonials ?? defaultSettings.testimonials,
    faqs: parsed?.faqs ?? defaultSettings.faqs,
    faqsEn: parsed?.faqsEn ?? defaultSettings.faqsEn,
    showTestimonials: parsed?.showTestimonials ?? false,
    adminUsername: parsed?.adminUsername ?? defaultSettings.adminUsername,
    adminEmail: parsed?.adminEmail ?? defaultSettings.adminEmail,
    adminPhone: parsed?.adminPhone ?? defaultSettings.adminPhone,
    vipEnabled: parsed?.vipEnabled ?? defaultSettings.vipEnabled,
    vipMinSpend: parsed?.vipMinSpend ?? defaultSettings.vipMinSpend,
    vipDiscountPercent: parsed?.vipDiscountPercent ?? defaultSettings.vipDiscountPercent,
  };
}

function purgeExpired(store: FashionStore): boolean {
  const beforeCoupons = store.coupons.length;
  const beforeBanners = store.settings.promoBanners?.length ?? 0;
  let changed = false;

  store.coupons = store.coupons.filter((c) => !isExpired(c.expiresAt));
  if (store.settings.promoBanners) {
    store.settings.promoBanners = store.settings.promoBanners.filter(
      (b) => !isExpired(b.expiresAt),
    );
  }

  for (const product of store.products) {
    if (product.offerActive && isExpired(product.offerExpiresAt)) {
      product.offerActive = false;
      product.offerLabel = undefined;
      product.offerDiscountPercent = undefined;
      product.offerExpiresAt = undefined;
      changed = true;
    }
    if (product.advertiseActive) {
      const banner = store.settings.promoBanners?.find((b) => b.productId === product.id);
      if (!banner) {
        product.advertiseActive = false;
        product.advertiseKind = undefined;
        product.advertiseLabel = undefined;
        changed = true;
      }
    }
  }

  return (
    changed ||
    store.coupons.length !== beforeCoupons ||
    (store.settings.promoBanners?.length ?? 0) !== beforeBanners
  );
}

function migrateProduct(product: Partial<Product>, settings: StoreSettings): Product {
  const buyPrice = product.buyPrice ?? Math.round((product.price ?? 0) / 1.35);
  const price =
    product.price ??
    computeSellPrice(buyPrice, settings, {
      pricingMode: product.pricingMode,
      markupPercent: product.markupPercent,
      price: product.price ?? 0,
    });
  const stock = product.stock ?? (product.inStock === false ? 0 : 25);
  return {
    id: product.id!,
    slug: product.slug!,
    name: product.name!,
    nameBn: product.nameBn!,
    price,
    buyPrice,
    compareAtPrice: product.compareAtPrice,
    categorySlug: product.categorySlug!,
    label: product.label,
    description: product.description!,
    descriptionBn: product.descriptionBn!,
    fabric: product.fabric!,
    sizes: product.sizes ?? ["S", "M", "L"],
    colors: product.colors ?? [{ name: "Default", hex: "#f8efe9" }],
    tone: product.tone ?? "bg-[#f8efe9]",
    imageUrl: product.imageUrl!,
    imageUrls: product.imageUrls?.filter((url) => Boolean(url?.trim())),
    showSizes: product.showSizes,
    stock,
    featured: product.featured,
    inStock: stock > 0,
    pricingMode: product.pricingMode,
    markupPercent: product.markupPercent,
    offerActive: product.offerActive,
    offerLabel: product.offerLabel,
    offerDiscountPercent: product.offerDiscountPercent,
    offerExpiresAt: product.offerExpiresAt,
    isNew: product.isNew,
    advertiseActive: product.advertiseActive,
    advertiseKind: product.advertiseKind,
    advertiseLabel: product.advertiseLabel,
    createdAt: product.createdAt ?? new Date().toISOString(),
  };
}

function normalizeProductSlugs(store: FashionStore): boolean {
  let changed = false;
  const slugMap = new Map<string, string>();

  for (const product of store.products) {
    const nextSlug = buildProductSlug(product, product.id);
    if (product.slug !== nextSlug) {
      slugMap.set(product.slug, nextSlug);
      product.slug = nextSlug;
      changed = true;
    } else if (!isAsciiProductSlug(product.slug)) {
      const fixed = buildProductSlug(product, product.id);
      slugMap.set(product.slug, fixed);
      product.slug = fixed;
      changed = true;
    }
  }

  if (slugMap.size > 0) {
    for (const banner of store.settings.promoBanners ?? []) {
      if (banner.linkSlug && slugMap.has(banner.linkSlug)) {
        banner.linkSlug = slugMap.get(banner.linkSlug)!;
        changed = true;
      }
    }
  }

  return changed;
}

function migrateOrder(order: Partial<FashionOrder>): FashionOrder {
  const status = order.status ?? "pending";
  return {
    id: order.id!,
    trackingNumber: order.trackingNumber ?? `SG-TRK-${order.id!}`,
    customerId: order.customerId,
    customerName: order.customerName!,
    phone: order.phone!,
    email: order.email,
    address: order.address!,
    district: order.district!,
    note: order.note,
    paymentMethod: order.paymentMethod ?? "cod",
    items: (order.items ?? []).map((item) => ({
      ...item,
      buyPrice: item.buyPrice ?? Math.round(item.price / 1.35),
    })),
    subtotal: order.subtotal ?? 0,
    discount: order.discount ?? 0,
    couponCode: order.couponCode,
    shipping: order.shipping ?? 0,
    total: order.total ?? 0,
    costTotal:
      order.costTotal ??
      (order.items ?? []).reduce(
        (sum, item) => sum + (item.buyPrice ?? Math.round(item.price / 1.35)) * item.quantity,
        0,
      ),
    status,
    statusHistory: order.statusHistory ?? [
      { status, message: "অর্ডার গ্রহণ করা হয়েছে", updatedAt: order.createdAt ?? new Date().toISOString() },
    ],
    createdAt: order.createdAt ?? new Date().toISOString(),
  };
}

async function ensureStore(): Promise<FashionStore> {
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<FashionStore>;
    const settings = migrateSettings(parsed.settings);
    const products = (parsed.products?.length ? parsed.products : rawSeedProducts).map((p) =>
      migrateProduct(p, settings),
    );
    const store: FashionStore = {
      settings,
      categories: parsed.categories?.length ? parsed.categories : defaultCategories,
      products,
      customers: parsed.customers ?? [],
      orders: (parsed.orders ?? []).map(migrateOrder),
      coupons: resolvePersistedCoupons(parsed.coupons),
      reviews: parsed.reviews ?? [],
      userNotifications: parsed.userNotifications ?? [],
      adminNotifications: parsed.adminNotifications ?? [],
      adminPasswordHash:
        parsed.adminPasswordHash ||
        (await bcrypt.hash(defaultAdminPassword(), 12)),
    };
    if (purgeExpired(store)) await writeStore(store);
    if (normalizeProductSlugs(store)) await writeStore(store);
    if (await syncAdminPasswordHash(store)) await writeStore(store);
    if (stabilizeCategoriesAndRepairProducts(store)) await writeStore(store);
    return store;
  } catch {
    await mkdir(dataDir(), { recursive: true });
    const settings = defaultSettings;
    const initial: FashionStore = {
      settings,
      categories: defaultCategories,
      products: rawSeedProducts.map((p) => migrateProduct(p, settings)),
      customers: [],
      orders: [],
      coupons: [],
      reviews: [],
      userNotifications: [],
      adminNotifications: [],
      adminPasswordHash: await bcrypt.hash(defaultAdminPassword(), 12),
    };
    await writeStore(initial);
    return initial;
  }
}

async function writeStore(store: FashionStore): Promise<void> {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(storePath(), JSON.stringify(store, null, 2), "utf8");
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const store = await ensureStore();
  return store.settings;
}

export async function updateStoreSettings(partial: Partial<StoreSettings>): Promise<StoreSettings> {
  const store = await ensureStore();
  const current = store.settings;
  store.settings = {
    ...current,
    ...partial,
    deliveryRules: partial.deliveryRules ?? current.deliveryRules,
    promoBanners: partial.promoBanners ?? current.promoBanners ?? [],
    availableSizes: partial.availableSizes ?? current.availableSizes,
    aboutPillars: partial.aboutPillars ?? current.aboutPillars,
    aboutPillarsEn: partial.aboutPillarsEn ?? current.aboutPillarsEn,
    serviceHighlights: partial.serviceHighlights ?? current.serviceHighlights,
    serviceHighlightsEn: partial.serviceHighlightsEn ?? current.serviceHighlightsEn,
    testimonials: partial.testimonials ?? current.testimonials,
    faqs: partial.faqs ?? current.faqs,
    faqsEn: partial.faqsEn ?? current.faqsEn,
  };
  purgeExpired(store);
  await writeStore(store);
  return store.settings;
}

export async function listCategories(): Promise<Category[]> {
  const store = await ensureStore();
  return store.categories;
}

function stabilizeCategoriesAndRepairProducts(store: FashionStore): boolean {
  let changed = false;
  store.categories = store.categories.map((category) => {
    const id = category.id?.trim() || category.slug;
    if (category.id === id) return category;
    changed = true;
    return { ...category, id };
  });
  if (repairProductCategorySlugs(store.products, store.categories)) changed = true;
  return changed;
}

function normalizeCategory(cat: Category): Category {
  const imageUrl = cat.imageUrl?.trim();
  const slug = cat.slug.trim();
  return {
    id: cat.id?.trim() || slug,
    slug,
    title: cat.title?.trim() || cat.titleBn?.trim() || "Category",
    titleBn: cat.titleBn?.trim() || cat.title?.trim() || "ক্যাটাগরি",
    subtitle: cat.subtitle ?? "",
    accent: cat.accent || "from-[#f5e8dc] via-[#fffaf6] to-[#ead5c3]",
    description: cat.description ?? "",
    imageUrl: imageUrl || undefined,
  };
}

export async function updateCategories(incoming: Category[]): Promise<Category[]> {
  const store = await ensureStore();
  const previous = store.categories;
  const next = incoming.map(normalizeCategory).filter((cat) => cat.slug);
  if (next.length === 0) return previous;

  for (const cat of next) {
    const prev = previous.find((item) => categoryIdentity(item) === categoryIdentity(cat));
    if (prev && prev.slug !== cat.slug) {
      for (const product of store.products) {
        if (product.categorySlug === prev.slug) product.categorySlug = cat.slug;
      }
    }
  }

  store.categories = next;
  repairProductCategorySlugs(store.products, store.categories);
  await writeStore(store);
  return store.categories;
}

export async function deleteCategory(slug: string): Promise<boolean> {
  const store = await ensureStore();
  const next = store.categories.filter((c) => c.slug !== slug);
  if (next.length === store.categories.length) return false;
  store.categories = next;
  await writeStore(store);
  return true;
}

export async function listProducts(): Promise<Product[]> {
  const store = await ensureStore();
  return store.products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const store = await ensureStore();
  const decoded = decodeURIComponent(slug);
  return store.products.find(
    (product) => product.slug === slug || product.slug === decoded,
  );
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const store = await ensureStore();
  return store.products.find((p) => p.id === id);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await listProducts();
  return products.filter((product) => product.featured);
}

export async function getActiveOffers(): Promise<Product[]> {
  const store = await ensureStore();
  return store.products.filter((p) => p.offerActive && !isExpired(p.offerExpiresAt));
}

export async function getNewProducts(sinceDays = 14): Promise<Product[]> {
  const store = await ensureStore();
  const cutoff = Date.now() - sinceDays * 86400000;
  return store.products.filter((p) => new Date(p.createdAt).getTime() > cutoff || p.isNew);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const store = await ensureStore();
  return filterProductsByCategory(store.products, categorySlug, store.categories);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const store = await ensureStore();
  const category = findCategoryForProduct(product, store.categories);
  const related = category
    ? filterProductsByCategory(store.products, category.slug, store.categories)
    : store.products.filter((item) => item.categorySlug === product.categorySlug);
  return related.filter((item) => item.id !== product.id).slice(0, limit);
}

function resolveProductPrice(input: ProductInput, settings: StoreSettings): Product {
  const id = input.id ?? `p${Date.now()}`;
  const buyPrice = input.buyPrice ?? Math.round((input.price ?? 0) / 1.35);
  const basePrice = computeSellPrice(buyPrice, settings, input);
  const stock = input.stock ?? 0;
  const pricingMode = input.pricingMode ?? "manual";
  const price = (input.price ?? 0) > 0 ? input.price! : basePrice;
  return {
    id,
    slug: buildProductSlug(
      { slug: input.slug, name: input.name, nameBn: input.nameBn, id },
      id,
    ),
    name: input.name,
    nameBn: input.nameBn,
    price,
    buyPrice,
    compareAtPrice: input.compareAtPrice,
    categorySlug: input.categorySlug,
    label: input.label,
    description: input.description,
    descriptionBn: input.descriptionBn,
    fabric: input.fabric,
    sizes: input.sizes,
    colors: input.colors,
    tone: input.tone,
    imageUrl: input.imageUrl,
    stock,
    featured: input.featured,
    inStock: stock > 0,
    pricingMode,
    markupPercent: input.markupPercent,
    offerActive: input.offerActive,
    offerLabel: input.offerLabel,
    offerDiscountPercent: input.offerDiscountPercent,
    offerExpiresAt: input.offerExpiresAt,
    isNew: input.isNew ?? !input.id,
    advertiseActive: input.advertiseActive,
    advertiseKind: input.advertiseKind,
    advertiseLabel: input.advertiseLabel,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

function applyExplicitPromoFlags(product: Product, input: ProductInput): Product {
  if (input.offerActive === false) {
    product.offerActive = false;
    product.offerLabel = undefined;
    product.offerDiscountPercent = undefined;
    product.offerExpiresAt = undefined;
  }
  if (input.advertiseActive === false) {
    product.advertiseActive = false;
    product.advertiseKind = undefined;
    product.advertiseLabel = undefined;
  }
  return product;
}

function syncProductAdvertisement(store: FashionStore, product: Product): void {
  store.settings.promoBanners = syncBannersForProduct(store.settings.promoBanners ?? [], product);
}

export async function upsertProduct(input: ProductInput): Promise<Product> {
  const store = await ensureStore();
  const isNew = !input.id || !store.products.find((p) => p.id === input.id);
  const product = resolveProductPrice(input, store.settings);
  const index = store.products.findIndex((item) => item.id === product.id);
  const previousProduct = index >= 0 ? store.products[index] : undefined;
  if (index >= 0) {
    store.products[index] = applyExplicitPromoFlags(
      {
        ...store.products[index],
        ...definedEntries(product),
        id: store.products[index].id,
        createdAt: store.products[index].createdAt,
      },
      input,
    );
  } else {
    store.products.push(applyExplicitPromoFlags(product, input));
  }

  repairProductCategorySlugs(store.products, store.categories);
  const savedProduct = store.products.find((p) => p.id === product.id) ?? product;

  if (isNew) {
    await notifyUsersNewProduct(store, savedProduct);
  }
  if (input.offerActive && !previousProduct?.offerActive) {
    await notifyUsersNewOffer(store, savedProduct);
  }

  syncProductAdvertisement(store, savedProduct);

  await writeStore(store);
  return savedProduct;
}

async function notifyUsersNewProduct(store: FashionStore, product: Product): Promise<void> {
  const notification: UserNotification = {
    id: `un${Date.now()}`,
    type: "new_product",
    title: "নতুন প্রোডাক্ট",
    body: `${product.nameBn} এখন Smart craft corner-এ উপলব্ধ`,
    link: `/products/${product.slug}`,
    readBy: [],
    createdAt: new Date().toISOString(),
  };
  store.userNotifications.unshift(notification);
}

async function notifyUsersNewOffer(store: FashionStore, product: Product): Promise<void> {
  const notification: UserNotification = {
    id: `un${Date.now()}o`,
    type: "new_offer",
    title: product.offerLabel ?? "নতুন অফার",
    body: `${product.nameBn}-এ ${product.offerDiscountPercent ?? 0}% ছাড়`,
    link: `/products/${product.slug}`,
    readBy: [],
    createdAt: new Date().toISOString(),
  };
  store.userNotifications.unshift(notification);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = await ensureStore();
  const next = store.products.filter((product) => product.id !== id);
  if (next.length === store.products.length) return false;
  store.products = next;
  store.settings.promoBanners = (store.settings.promoBanners ?? []).filter((b) => b.productId !== id);
  await writeStore(store);
  return true;
}

export async function decrementStock(productId: string, quantity: number): Promise<boolean> {
  const store = await ensureStore();
  const product = store.products.find((p) => p.id === productId);
  if (!product || product.stock < quantity) return false;
  product.stock -= quantity;
  product.inStock = product.stock > 0;
  await writeStore(store);
  return true;
}

export async function listCoupons(): Promise<Coupon[]> {
  const store = await ensureStore();
  return store.coupons.filter((c) => c.active && !isExpired(c.expiresAt));
}

export async function listAllCouponsAdmin(): Promise<Coupon[]> {
  const store = await ensureStore();
  return store.coupons;
}

export async function listPublicCoupons(): Promise<Coupon[]> {
  return listCoupons();
}

export async function getActivePromoBanners(): Promise<PromoBanner[]> {
  const store = await ensureStore();
  return (store.settings.promoBanners ?? [])
    .filter((b) => b.active && !isExpired(b.expiresAt))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertPromoBanner(banner: PromoBanner): Promise<PromoBanner> {
  const store = await ensureStore();
  const banners = [...(store.settings.promoBanners ?? [])];
  const index = banners.findIndex((b) => b.id === banner.id);
  if (index >= 0) banners[index] = banner;
  else banners.push(banner);
  store.settings.promoBanners = banners;

  if (banner.productId) {
    const product = store.products.find((p) => p.id === banner.productId);
    if (product) {
      product.advertiseActive = banner.active;
      product.advertiseKind = banner.advertiseKind;
      product.advertiseLabel = banner.badgeLabel || banner.title;
    }
  }

  await writeStore(store);
  return banner;
}

export async function deletePromoBanner(id: string): Promise<boolean> {
  const store = await ensureStore();
  const banners = store.settings.promoBanners ?? [];
  const target = banners.find((b) => b.id === id);
  const next = banners.filter((b) => b.id !== id);
  if (next.length === banners.length) return false;
  store.settings.promoBanners = next;
  if (target?.productId) {
    const product = store.products.find((p) => p.id === target.productId);
    if (product) {
      product.advertiseActive = false;
      product.advertiseKind = undefined;
      product.advertiseLabel = undefined;
    }
  }
  await writeStore(store);
  return true;
}

export async function clearProductOffer(productId: string): Promise<boolean> {
  const store = await ensureStore();
  const product = store.products.find((p) => p.id === productId);
  if (!product) return false;
  product.offerActive = false;
  product.offerLabel = undefined;
  product.offerDiscountPercent = undefined;
  product.offerExpiresAt = undefined;
  await writeStore(store);
  return true;
}

export async function upsertCoupon(coupon: Coupon): Promise<Coupon> {
  const store = await ensureStore();
  const index = store.coupons.findIndex((c) => c.id === coupon.id);
  if (index >= 0) store.coupons[index] = coupon;
  else store.coupons.push(coupon);
  await writeStore(store);
  return coupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const store = await ensureStore();
  const next = store.coupons.filter((c) => c.id !== id);
  if (next.length === store.coupons.length) return false;
  store.coupons = next;
  await writeStore(store);
  return true;
}

export async function validateCoupon(code: string, subtotal: number): Promise<Coupon | null> {
  const store = await ensureStore();
  purgeExpired(store);
  const coupon = store.coupons.find(
    (c) => c.active && c.code.toLowerCase() === code.trim().toLowerCase(),
  );
  if (!coupon) return null;
  if (isExpired(coupon.expiresAt)) {
    store.coupons = store.coupons.filter((c) => c.id !== coupon.id);
    await writeStore(store);
    return null;
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) return null;
  return coupon;
}

export async function listReviews(productId?: string): Promise<ProductReview[]> {
  const store = await ensureStore();
  const reviews = store.reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return productId ? reviews.filter((r) => r.productId === productId) : reviews;
}

export async function addReview(input: Omit<ProductReview, "id" | "createdAt">): Promise<ProductReview> {
  const store = await ensureStore();
  const review: ProductReview = {
    ...input,
    id: `rv${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.reviews.unshift(review);
  await writeStore(store);
  return review;
}

export async function listUserNotifications(customerId?: string): Promise<UserNotification[]> {
  const store = await ensureStore();
  return store.userNotifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationRead(notificationId: string, customerId: string): Promise<void> {
  const store = await ensureStore();
  const notification = store.userNotifications.find((n) => n.id === notificationId);
  if (notification && !notification.readBy.includes(customerId)) {
    notification.readBy.push(customerId);
    await writeStore(store);
  }
}

export async function listAdminNotifications(): Promise<AdminNotification[]> {
  const store = await ensureStore();
  return store.adminNotifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  const store = await ensureStore();
  const n = store.adminNotifications.find((item) => item.id === id);
  if (n) {
    n.read = true;
    await writeStore(store);
  }
}

export async function listCustomers(): Promise<FashionCustomer[]> {
  const store = await ensureStore();
  return store.customers;
}

export async function findCustomerByEmail(email: string): Promise<FashionCustomer | undefined> {
  const customers = await listCustomers();
  return customers.find(
    (customer) => customer.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

export async function findCustomerById(id: string): Promise<FashionCustomer | undefined> {
  const customers = await listCustomers();
  return customers.find((customer) => customer.id === id);
}

export async function createCustomer(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  verified?: boolean;
  verifiedChannel?: "email" | "phone";
}): Promise<FashionCustomer> {
  const store = await ensureStore();
  const customer: FashionCustomer = {
    id: `c${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: input.passwordHash,
    address: "",
    district: "",
    avatarUrl: "",
    verified: input.verified ?? false,
    verifiedChannel: input.verifiedChannel,
    createdAt: new Date().toISOString(),
  };
  store.customers.push(customer);
  await writeStore(store);
  return customer;
}

export async function updateCustomer(
  id: string,
  patch: Partial<Pick<FashionCustomer, "name" | "phone" | "address" | "district" | "avatarUrl">>,
): Promise<FashionCustomer | null> {
  const store = await ensureStore();
  const customer = store.customers.find((entry) => entry.id === id);
  if (!customer) return null;
  if (patch.name !== undefined) customer.name = patch.name.trim();
  if (patch.phone !== undefined) customer.phone = patch.phone.trim();
  if (patch.address !== undefined) customer.address = patch.address.trim();
  if (patch.district !== undefined) customer.district = patch.district.trim();
  if (patch.avatarUrl !== undefined) customer.avatarUrl = patch.avatarUrl.trim();
  await writeStore(store);
  return customer;
}

/** Lifetime delivered/confirmed spend for VIP top-buyer discount. */
export async function getCustomerLifetimeSpend(customerId: string): Promise<number> {
  const orders = await listOrdersForCustomer(customerId);
  return orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
}

export async function getVipDiscountPreview(input: {
  customerId?: string;
  subtotal: number;
}): Promise<{ eligible: boolean; percent: number; amount: number; minSpend: number; spent: number }> {
  const settings = await getStoreSettings();
  const percent = settings.vipDiscountPercent ?? 0;
  const minSpend = settings.vipMinSpend ?? 0;
  const enabled = settings.vipEnabled !== false && percent > 0;
  if (!enabled || !input.customerId) {
    return { eligible: false, percent, amount: 0, minSpend, spent: 0 };
  }
  const spent = await getCustomerLifetimeSpend(input.customerId);
  const eligible = spent >= minSpend;
  const amount = eligible ? Math.round((input.subtotal * percent) / 100) : 0;
  return { eligible, percent, amount, minSpend, spent };
}

export async function verifyFashionAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const store = await ensureStore();
  const expected =
    store.settings.adminUsername?.trim().toLowerCase() ||
    process.env.FASHION_ADMIN_USERNAME?.trim().toLowerCase() ||
    "founder";
  if (username.trim().toLowerCase() !== expected) return false;
  if (password === defaultAdminPassword()) return true;
  return bcrypt.compare(password, store.adminPasswordHash);
}

export async function verifyFashionAdminPassword(password: string): Promise<boolean> {
  const store = await ensureStore();
  return bcrypt.compare(password, store.adminPasswordHash);
}

export { rawSeedProducts as seedProducts };

export async function listOrders(): Promise<FashionOrder[]> {
  const store = await ensureStore();
  return store.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listOrdersForCustomer(customerId: string): Promise<FashionOrder[]> {
  const orders = await listOrders();
  return orders.filter((order) => order.customerId === customerId);
}

export async function getOrderById(id: string): Promise<FashionOrder | undefined> {
  const orders = await listOrders();
  return orders.find((o) => o.id === id);
}

export async function getOrderByTrackingNumber(tracking: string): Promise<FashionOrder | undefined> {
  const orders = await listOrders();
  const q = tracking.trim().toUpperCase();
  return orders.find(
    (o) =>
      o.trackingNumber.toUpperCase() === q ||
      o.id.toUpperCase() === q,
  );
}

export async function createOrder(
  order: Omit<FashionOrder, "id" | "trackingNumber" | "createdAt" | "status" | "statusHistory">,
): Promise<FashionOrder> {
  const store = await ensureStore();
  const now = new Date().toISOString();
  const record: FashionOrder = {
    ...order,
    id: `SC${Date.now().toString().slice(-8)}`,
    trackingNumber: generateTrackingNumber(),
    status: "pending",
    statusHistory: [{ status: "pending", message: "অর্ডার গ্রহণ করা হয়েছে", updatedAt: now }],
    createdAt: now,
  };

  for (const item of record.items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      product.inStock = product.stock > 0;
    }
  }

  store.orders.unshift(record);
  store.adminNotifications.unshift({
    id: `an${Date.now()}`,
    type: "new_order",
    title: "নতুন অর্ডার",
    body: `${record.customerName} · ${record.id} · ৳${record.total}`,
    orderId: record.id,
    read: false,
    createdAt: now,
  });

  if (record.customerId) {
    const owner = store.customers.find((entry) => entry.id === record.customerId);
    if (owner) {
      owner.address = record.address;
      owner.district = record.district;
      if (record.phone) owner.phone = record.phone;
      if (record.customerName) owner.name = record.customerName;
    }
    store.userNotifications.unshift({
      id: `un${Date.now()}ord`,
      customerId: record.customerId,
      type: "order_update",
      title: "অর্ডার নিশ্চিত",
      body: `আপনার অর্ডার ${record.id} গ্রহণ করা হয়েছে। ট্র্যাকিং: ${record.trackingNumber}`,
      link: "/track",
      readBy: [],
      createdAt: now,
    });
  }

  await writeStore(store);
  return record;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  message: string,
): Promise<FashionOrder | null> {
  const store = await ensureStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  order.status = status;
  order.statusHistory.push({ status, message, updatedAt: now });

  if (order.customerId) {
    store.userNotifications.unshift({
      id: `un${Date.now()}st`,
      customerId: order.customerId,
      type: "order_update",
      title: "অর্ডার আপডেট",
      body: message,
      link: "/account",
      readBy: [],
      createdAt: now,
    });
  }

  await writeStore(store);
  return order;
}

export async function getAnalytics(period: "daily" | "monthly"): Promise<AnalyticsSummary> {
  const store = await ensureStore();
  return computeAnalytics(store.orders, period);
}
