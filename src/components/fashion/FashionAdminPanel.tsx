"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FashionButton } from "@/components/fashion/FashionButton";
import {
  AdminConfirmModal,
  AdminModal,
  AdminShell,
  AdminSuccessModal,
} from "@/components/fashion/admin/AdminShell";
import { OrderInvoiceView } from "@/components/fashion/admin/OrderInvoiceView";
import { ReportContent, type ReportType } from "@/components/fashion/admin/ReportContent";
import { SettingsEditor } from "@/components/fashion/admin/SettingsEditor";
import { adminThemes, type AdminTheme } from "@/components/fashion/admin/admin-themes";
import { copy } from "@/lib/fashion/copy";
import { advertiseKindLabel } from "@/lib/fashion/i18n";
import { bangladeshDistricts, BANNER_RECOMMENDED_SIZE } from "@/lib/fashion/districts";
import { formatBdt } from "@/lib/fashion/format";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { categoryIdentity, findCategoryForProduct, productInCategory } from "@/lib/fashion/category-match";
import { applyProductGallery, getProductImages, MAX_PRODUCT_IMAGES } from "@/lib/fashion/product-images";
import { buildProductPromoBanner } from "@/lib/fashion/promo-visibility";
import type {
  AdminNotification,
  AnalyticsSummary,
  AdvertiseKind,
  Category,
  Coupon,
  FashionOrder,
  OrderStatus,
  Product,
  ProductInput,
  PromoBanner,
  StoreSettings,
} from "@/lib/fashion/types";

type Tab = "products" | "orders" | "delivery" | "coupons" | "offers-product" | "settings" | "analytics" | "reports";
type ProductSubTab = "inventory" | "categories";
type OffersSubTab = "offers" | "advertisement";

const emptyProduct: ProductInput = {
  name: "", nameBn: "", price: 0, buyPrice: 0, categorySlug: "festive",
  description: "", descriptionBn: "", fabric: "", sizes: ["S", "M", "L"],
  colors: [{ name: "Default", hex: "#f8efe9" }], tone: "bg-[#f8efe9]",
  imageUrl: "", imageUrls: [],
  stock: 25, inStock: true, featured: false, pricingMode: "manual", advertiseActive: false,
};

const emptyCoupon: Coupon = {
  id: "",
  code: "",
  discountType: "percent",
  discountValue: 10,
  active: true,
  productIds: [],
  description: "",
};

const emptyBanner: PromoBanner = {
  id: "",
  imageUrl: "",
  title: "",
  badgeLabel: "অফার",
  advertiseKind: "offer",
  active: true,
  sortOrder: 0,
};

const statusOptions: OrderStatus[] = ["pending", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"];

export function FashionAdminPanel() {
  const router = useRouter();
  const { locale, fc } = useFashionCopy();
  const menuItems: { id: Tab; label: string; theme: AdminTheme; hint: string }[] = [
    { id: "products", label: fc.admin.products, theme: "rose", hint: fc.admin.productHint },
    { id: "orders", label: fc.admin.orders, theme: "ocean", hint: fc.admin.orderHint },
    { id: "delivery", label: fc.admin.delivery, theme: "sunset", hint: fc.admin.deliveryHint },
    { id: "coupons", label: fc.admin.coupons, theme: "violet", hint: fc.admin.couponHint },
    { id: "offers-product", label: fc.admin.offersProduct, theme: "gold", hint: fc.admin.offersMenuHint },
    { id: "settings", label: fc.admin.settings, theme: "gold", hint: fc.admin.settingsHint },
    { id: "analytics", label: fc.admin.analytics, theme: "slate", hint: fc.admin.analyticsHint },
    { id: "reports", label: fc.admin.reports, theme: "pearl", hint: fc.admin.reportsHint },
  ];
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [productSubTab, setProductSubTab] = useState<ProductSubTab>("inventory");
  const [offersSubTab, setOffersSubTab] = useState<OffersSubTab>("offers");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<FashionOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [analytics, setAnalytics] = useState<{ daily: AnalyticsSummary; monthly: AnalyticsSummary } | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [couponForm, setCouponForm] = useState<Coupon>(emptyCoupon);
  const [bannerForm, setBannerForm] = useState<PromoBanner>(emptyBanner);
  const [offerEditId, setOfferEditId] = useState<string>("");
  const [offerLabel, setOfferLabel] = useState("অফার");
  const [offerDiscount, setOfferDiscount] = useState(10);
  const [offerExpiresAt, setOfferExpiresAt] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<FashionOrder | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<FashionOrder | null>(null);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ orderId: string; status: OrderStatus } | null>(null);
  const [success, setSuccess] = useState<{ title: string; message: string; theme: AdminTheme } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [districtSearch, setDistrictSearch] = useState("");
  const [newSize, setNewSize] = useState("");
  const [productNewSize, setProductNewSize] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [newCategoryTitleBn, setNewCategoryTitleBn] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);
  const [advertiseModalOpen, setAdvertiseModalOpen] = useState(false);
  const [advertiseKind, setAdvertiseKind] = useState<AdvertiseKind>("new");
  const [advertiseLabel, setAdvertiseLabel] = useState("");
  const [uploadBannerId, setUploadBannerId] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [offersSearch, setOffersSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);
  const categoryUploadSlugRef = useRef("");
  const [categoryUploadSlug, setCategoryUploadSlug] = useState("");
  const [uploadError, setUploadError] = useState("");
  const advertiseIntentRef = useRef(false);

  async function load() {
    const safeFetch = async (url: string) => {
      try {
        return await fetch(url, { cache: "no-store" });
      } catch {
        // Network blips (port-forward drop) must not throw into the Next.js overlay.
        return new Response(JSON.stringify({}), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
    };

    const urls = [
      "/api/fashion/products",
      "/api/fashion/orders",
      "/api/fashion/categories",
      "/api/fashion/coupons",
      "/api/fashion/settings",
      "/api/fashion/analytics?period=daily",
      "/api/fashion/analytics?period=monthly",
      "/api/fashion/notifications?scope=admin",
    ] as const;

    const settled = await Promise.allSettled(urls.map((url) => safeFetch(url)));
    const res = settled.map((item) =>
      item.status === "fulfilled"
        ? item.value
        : new Response(JSON.stringify({}), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }),
    );

    if (res.some((r) => r.status === 401)) {
      router.push("/store-admin/login");
      return;
    }

    const bodies = await Promise.all(
      res.map(async (r) => {
        try {
          return await r.json();
        } catch {
          return {};
        }
      }),
    );
    const [p, o, c, cp, s, d, m, n] = bodies;
    setProducts(p.products ?? []);
    setOrders(o.orders ?? []);
    setCategories(c.categories ?? []);
    setCoupons(cp.coupons ?? []);
    setSettings(s.settings ?? null);
    setBanners(s.settings?.promoBanners ?? []);
    setAnalytics({ daily: d.analytics, monthly: m.analytics });
    setAdminNotifications(n.notifications ?? []);
  }

  useEffect(() => { void load(); }, [router]);

  function showSuccess(title: string, message: string, theme: AdminTheme) {
    setSuccess({ title, message, theme });
  }

  const inventoryProducts = products.filter((p) => {
    if (selectedCategorySlug) {
      const selected = categories.find((c) => c.slug === selectedCategorySlug);
      if (selected) {
        if (!productInCategory(p, selected, categories)) return false;
      } else if (p.categorySlug !== selectedCategorySlug) {
        return false;
      }
    }
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return [p.name, p.nameBn, p.id, p.slug].join(" ").toLowerCase().includes(q);
  });

  const filteredOrders = orders.filter((order) => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return [
      order.trackingNumber,
      order.id,
      order.customerName,
      order.phone,
      order.district,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const offerSearchQuery = offersSearch.trim().toLowerCase();
  function matchesOfferSearch(product: Product) {
    if (!offerSearchQuery) return true;
    return [
      product.name,
      product.nameBn,
      product.id,
      product.slug,
      product.offerLabel,
      product.advertiseLabel,
      product.advertiseKind,
    ]
      .join(" ")
      .toLowerCase()
      .includes(offerSearchQuery);
  }
  function matchesBannerSearch(banner: PromoBanner) {
    if (!offerSearchQuery) return true;
    const linked = products.find((p) => p.id === banner.productId);
    return [
      banner.title,
      banner.badgeLabel,
      banner.advertiseKind,
      banner.id,
      banner.productId,
      linked?.name,
      linked?.nameBn,
      linked?.id,
    ]
      .join(" ")
      .toLowerCase()
      .includes(offerSearchQuery);
  }

  const filteredCategories = categories.filter((c) => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return true;
    return [c.titleBn, c.title, c.slug, c.subtitle].join(" ").toLowerCase().includes(q);
  });

  function openProductEdit(product: Product) {
    setEditingId(product.id);
    setUseNewCategory(false);
    const resolved = findCategoryForProduct(product, categories);
    const gallery = getProductImages(product);
    setForm({
      ...product,
      ...applyProductGallery(product, gallery),
      categorySlug: categories.some((c) => c.slug === product.categorySlug)
        ? product.categorySlug
        : resolved?.slug || product.categorySlug,
      featured: product.featured ?? false,
      advertiseActive:
        product.advertiseActive ??
        settings?.promoBanners?.some((b) => b.productId === product.id && b.active) ??
        false,
      advertiseKind: product.advertiseKind,
      advertiseLabel: product.advertiseLabel,
    });
    setProductModalOpen(true);
  }

  function openProductCreate() {
    setEditingId(null);
    setUseNewCategory(false);
    setNewCategoryTitleBn("");
    setNewCategorySlug("");
    setForm({
      ...emptyProduct,
      categorySlug: selectedCategorySlug || categories[0]?.slug || "",
      sizes: settings?.availableSizes?.slice(0, 3) ?? emptyProduct.sizes,
    });
    setProductModalOpen(true);
  }

  function toggleProductSize(size: string) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((s) => s !== size)
        : [...current.sizes, size],
    }));
  }

  async function addProductSize() {
    const size = productNewSize.trim();
    if (!size || !settings) return;
    const availableSizes = [...new Set([...(settings.availableSizes ?? []), size])];
    setSettings({ ...settings, availableSizes });
    setForm((current) => ({ ...current, sizes: [...new Set([...current.sizes, size])] }));
    setProductNewSize("");
    await fetch("/api/fashion/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availableSizes }),
    });
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    let categorySlug = form.categorySlug;

    if (useNewCategory) {
      const titleBn = newCategoryTitleBn.trim() || "নতুন ক্যাটাগরি";
      const existing = categories.find((c) => {
        const name = newCategoryTitleBn.trim();
        return (
          (name && (c.titleBn.trim() === name || c.title.trim() === name)) ||
          (newCategorySlug.trim() && c.slug === newCategorySlug.trim())
        );
      });
      if (existing) {
        categorySlug = existing.slug;
      } else {
        const id = `cat-${Date.now()}`;
        const slug = newCategorySlug.trim() || id;
        const cat: Category = {
          id,
          slug,
          title: newCategoryTitleBn.trim() || "New Category",
          titleBn: titleBn,
          subtitle: "",
          accent: "from-[#f5e8dc] via-[#fffaf6] to-[#ead5c3]",
          description: "",
          imageUrl: "",
        };
        const updatedCategories = [...categories, cat];
        const catRes = await fetch("/api/fashion/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories: updatedCategories }),
        });
        if (!catRes.ok) return;
        categorySlug = cat.slug;
        setCategories(updatedCategories);
      }
    } else if (!categories.some((c) => c.slug === categorySlug)) {
      if (selectedCategorySlug && categories.some((c) => c.slug === selectedCategorySlug)) {
        categorySlug = selectedCategorySlug;
      } else {
        return;
      }
    }

    const res = await fetch(editingId ? `/api/fashion/products/${editingId}` : "/api/fashion/products", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, categorySlug, pricingMode: "manual" }),
    });
    if (!res.ok) return;
    const saved = ((await res.json()) as { product?: Product }).product;
    if (saved?.id && form.advertiseActive) {
      const existing = banners.find((banner) => banner.productId === saved.id);
      if (existing || advertiseIntentRef.current) {
        await fetch("/api/fashion/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildProductPromoBanner(saved, existing)),
        });
      }
    }
    advertiseIntentRef.current = false;
    setProductModalOpen(false);
    setUseNewCategory(false);
    setNewCategoryTitleBn("");
    setNewCategorySlug("");
    showSuccess("সফল!", "প্রোডাক্ট সংরক্ষণ হয়েছে", "rose");
    await load();
  }

  async function confirmDeleteProduct() {
    if (!pendingDeleteProduct) return;
    const res = await fetch(`/api/fashion/products/${pendingDeleteProduct.id}`, { method: "DELETE" });
    setPendingDeleteProduct(null);
    if (!res.ok) return;
    showSuccess("মুছে ফেলা হয়েছে", `${pendingDeleteProduct.nameBn} সরানো হয়েছে`, "rose");
    await load();
  }

  async function handleUpload(file: File, target: "product" | "banner" | "category", bannerId?: string) {
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/fashion/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok || !data.url) {
      setUploadError(data.error || "ছবি আপলোড হয়নি");
      return;
    }
    if (target === "product") {
      setForm((c) => {
        const gallery = getProductImages(c);
        if (gallery.length >= MAX_PRODUCT_IMAGES) return c;
        return { ...c, ...applyProductGallery(c, [...gallery, data.url as string]) };
      });
    } else if (target === "banner" && settings && bannerId) {
      setSettings({ ...settings, promoBanners: (settings.promoBanners ?? []).map((b) => b.id === bannerId ? { ...b, imageUrl: data.url } : b) });
    } else if (target === "category" && bannerId) {
      const next = categories.map((c) =>
        (c.id || c.slug) === bannerId ? { ...c, imageUrl: data.url } : c,
      );
      setCategories(next);
      await fetch("/api/fashion/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: next }),
      });
      showSuccess("সফল!", "ক্যাটাগরি ইমেজ সেভ হয়েছে", "sage");
    }
  }

  async function handleProductFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const remaining = MAX_PRODUCT_IMAGES - getProductImages(form).length;
    for (const file of files.slice(0, Math.max(0, remaining))) {
      if (file.size > 8 * 1024 * 1024) {
        setUploadError("ছবি ৮ MB-এর কম হতে হবে");
        continue;
      }
      await handleUpload(file, "product");
    }
  }

  function removeProductImage(url: string) {
    setForm((current) => {
      const next = getProductImages(current).filter((item) => item !== url);
      return { ...current, ...applyProductGallery(current, next) };
    });
  }

  async function saveCategories() {
    await fetch("/api/fashion/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categories }) });
    showSuccess("সফল!", "ক্যাটাগরি আপডেট হয়েছে", "sage");
    await load();
  }

  async function addCategory() {
    const id = `cat-${Date.now()}`;
    const cat: Category = {
      id,
      slug: id,
      title: "New Category",
      titleBn: "নতুন ক্যাটাগরি",
      subtitle: "",
      accent: "from-[#f5e8dc] via-[#fffaf6] to-[#ead5c3]",
      description: "",
      imageUrl: "",
    };
    setCategories([...categories, cat]);
  }

  function updateCategory(key: string, patch: Partial<Category>) {
    setCategories((list) => list.map((c) => (categoryIdentity(c) === key ? { ...c, ...patch } : c)));
  }

  async function removeCategoryImage(key: string) {
    const next = categories.map((c) => (categoryIdentity(c) === key ? { ...c, imageUrl: "" } : c));
    setCategories(next);
    await fetch("/api/fashion/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: next }),
    });
  }

  async function removeCategory(slug: string) {
    await fetch(`/api/fashion/categories?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setCategories(categories.filter((c) => c.slug !== slug));
    showSuccess("মুছে ফেলা হয়েছে", "ক্যাটাগরি সরানো হয়েছে", "sage");
  }

  async function saveSizes() {
    if (!settings) return;
    await fetch("/api/fashion/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availableSizes: settings.availableSizes }) });
    showSuccess("সফল!", "সাইজ লিস্ট সেভ হয়েছে", "rose");
    await load();
  }

  function addSize() {
    if (!settings || !newSize.trim()) return;
    const sizes = [...(settings.availableSizes ?? []), newSize.trim()];
    setSettings({ ...settings, availableSizes: [...new Set(sizes)] });
    setNewSize("");
  }

  function removeSize(size: string) {
    if (!settings) return;
    setSettings({ ...settings, availableSizes: (settings.availableSizes ?? []).filter((s) => s !== size) });
  }

  async function saveSettings() {
    if (!settings) return;
    await fetch("/api/fashion/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    showSuccess("সফল!", "ওয়েবসাইট সেটিংস সেভ হয়েছে", "gold");
    await load();
  }

  async function saveDelivery() {
    if (!settings) return;
    await fetch("/api/fashion/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deliveryRules: settings.deliveryRules }) });
    showSuccess("সফল!", "ডেলিভারি নিয়ম সেভ হয়েছে", "sunset");
    await load();
  }

  async function saveCoupon(event: FormEvent) {
    event.preventDefault();
    const coupon = { ...couponForm, id: couponForm.id || `cp${Date.now()}` };
    await fetch("/api/fashion/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(coupon) });
    setCouponForm(emptyCoupon);
    showSuccess("সফল!", `কুপন ${coupon.code} সেভ হয়েছে`, "violet");
    await load();
  }

  async function removeCoupon(id: string) {
    await fetch(`/api/fashion/coupons?id=${id}`, { method: "DELETE" });
    showSuccess("মুছে ফেলা হয়েছে", "কুপন সরানো হয়েছে", "violet");
    await load();
  }

  async function saveProductOffer(event: FormEvent) {
    event.preventDefault();
    const product = products.find((p) => p.id === offerEditId);
    if (!product) return;
    const res = await fetch(`/api/fashion/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...product,
        offerActive: true,
        offerLabel,
        offerDiscountPercent: offerDiscount,
        offerExpiresAt: offerExpiresAt ? new Date(offerExpiresAt).toISOString() : undefined,
        pricingMode: "manual",
      }),
    });
    if (!res.ok) return;
    setOfferEditId("");
    setOfferExpiresAt("");
    showSuccess("সফল!", "Offer সেট হয়েছে", "gold");
    await load();
  }

  async function removeProductOffer(productId: string) {
    const res = await fetch(`/api/fashion/products/${productId}/offer`, { method: "DELETE" });
    if (!res.ok) return;
    showSuccess("মুছে ফেলা হয়েছে", "Offer সরানো হয়েছে", "gold");
    await load();
  }

  async function saveBanner(event: FormEvent) {
    event.preventDefault();
    const product = bannerForm.productId ? products.find((p) => p.id === bannerForm.productId) : undefined;
    const payload: PromoBanner = {
      ...bannerForm,
      id: bannerForm.id || `pb${Date.now()}`,
      imageUrl: bannerForm.imageUrl || product?.imageUrl || "",
      linkSlug: product?.slug || bannerForm.linkSlug,
      title: bannerForm.title || product?.nameBn || "Advertisement",
      sortOrder: bannerForm.sortOrder || Date.now(),
      expiresAt: bannerForm.expiresAt || undefined,
      active: true,
    };
    await fetch("/api/fashion/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBannerForm(emptyBanner);
    showSuccess("সফল!", "Advertisement সেভ হয়েছে", "gold");
    await load();
  }

  async function removeBanner(id: string) {
    await fetch(`/api/fashion/banners?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    showSuccess("মুছে ফেলা হয়েছে", "Advertisement সরানো হয়েছে", "gold");
    await load();
  }

  async function confirmOrderStatus() {
    if (!pendingStatus) return;
    const { orderId, status } = pendingStatus;
    const res = await fetch(`/api/fashion/orders/${orderId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, message: `অর্ডার ${copy.orderStatus[status]} হয়েছে` }),
    });
    const data = await res.json();
    setPendingStatus(null);
    if (data.order) {
      setSelectedOrder(data.order);
      if (status === "confirmed") setInvoiceOrder(data.order as FashionOrder);
    }
    showSuccess("অর্ডার আপডেট!", `${copy.orderStatus[status]} স্ট্যাটাস সেট হয়েছে`, "ocean");
    await load();
  }

  function getRuleForDistrict(district: string) {
    return settings?.deliveryRules.find((r) => r.district === district);
  }

  function upsertDistrictRule(district: string) {
    if (!settings) return;
    const existing = settings.deliveryRules.find((r) => r.district === district);
    if (existing) return;
    setSettings({
      ...settings,
      deliveryRules: [
        ...settings.deliveryRules,
        {
          id: `d${Date.now()}-${district}`,
          district,
          fee: district === "Dhaka" ? 80 : 150,
          minOrderForFree: district === "Dhaka" ? 7000 : 10000,
          active: true,
        },
      ],
    });
  }

  function seedAllDistrictRules() {
    if (!settings) return;
    const existing = new Set(settings.deliveryRules.map((r) => r.district));
    const next = [...settings.deliveryRules];
    for (const district of bangladeshDistricts) {
      if (existing.has(district)) continue;
      next.push({
        id: `d${Date.now()}-${district}`,
        district,
        fee: district === "Dhaka" ? 80 : 150,
        minOrderForFree: district === "Dhaka" ? 7000 : 10000,
        active: true,
      });
    }
    setSettings({ ...settings, deliveryRules: next });
  }

  const activeRule = getRuleForDistrict(selectedDistrict);
  const activeRuleIndex = settings?.deliveryRules.findIndex((r) => r.district === selectedDistrict) ?? -1;
  function openAdvertiseSetup() {
    setAdvertiseKind(form.advertiseKind ?? "new");
    setAdvertiseLabel(form.advertiseLabel ?? "");
    setAdvertiseModalOpen(true);
  }

  function confirmAdvertiseSetup() {
    advertiseIntentRef.current = true;
    setForm((current) => ({
      ...current,
      advertiseActive: true,
      advertiseKind,
      advertiseLabel: advertiseKind === "custom" ? advertiseLabel.trim() : undefined,
    }));
    setAdvertiseModalOpen(false);
  }

  function disableAdvertise() {
    advertiseIntentRef.current = false;
    setForm((current) => ({
      ...current,
      advertiseActive: false,
      advertiseKind: undefined,
      advertiseLabel: undefined,
    }));
  }

  const unreadCount = adminNotifications.filter((n) => !n.read).length;
  const filteredDistricts = bangladeshDistricts.filter((d) => {
    const q = districtSearch.trim().toLowerCase();
    if (!q) return true;
    return d.toLowerCase().includes(q);
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl">{fc.admin.founder}</h1>
          {unreadCount > 0 ? <p className="mt-2 text-sm text-[#b86a2e]">{unreadCount} {fc.admin.newOrders}</p> : null}
        </div>
        <FashionButton variant="secondary" onClick={async () => { await fetch("/api/fashion/admin", { method: "DELETE" }); router.push("/store-admin/login"); }}>{fc.nav.logout}</FashionButton>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item) => {
          const t = adminThemes[item.theme];
          return (
            <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
              className={`rounded-[1.75rem] border p-5 text-left shadow-[0_16px_50px_rgba(43,29,25,0.08)] transition hover:-translate-y-1 ${t.gradient} ${t.border}`}>
              <span className="text-2xl">{t.icon}</span>
              <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold">{item.label}</p>
              <p className="mt-1 text-sm text-[#7a5c50]">{item.hint}</p>
            </button>
          );
        })}
      </div>

      {/* Products Modal */}
      <AdminModal open={activeTab === "products"} onClose={() => setActiveTab(null)} title={fc.admin.products} subtitle={fc.admin.categoriesSizes} theme="rose" wide>
        <div className="mb-4 flex gap-2">
          <button type="button" onClick={() => setProductSubTab("inventory")} className={`rounded-full px-4 py-2 text-sm font-semibold ${productSubTab === "inventory" ? "bg-[#e8b896] text-[#3d2a24]" : "border border-[#c9a890] bg-[#f3ebe4] text-[#1c1412]"}`}>{fc.admin.inventory}</button>
          <button type="button" onClick={() => setProductSubTab("categories")} className={`rounded-full px-4 py-2 text-sm font-semibold ${productSubTab === "categories" ? "bg-[#b5d4b5] text-[#2d4a32]" : "border border-[#c9a890] bg-[#f3ebe4] text-[#1c1412]"}`}>{fc.admin.categoriesSizes}</button>
        </div>

        {productSubTab === "inventory" ? (
          <>
            <div className="flex flex-wrap gap-2">
              <input className="field flex-1 min-w-[200px]" placeholder="প্রোডাক্ট সার্চ..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
              <select className="field w-auto" value={selectedCategorySlug} onChange={(e) => setSelectedCategorySlug(e.target.value)}>
                <option value="">সব ক্যাটাগরি</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.titleBn}</option>)}
              </select>
              <FashionButton onClick={openProductCreate}>{copy.actions.create}</FashionButton>
            </div>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">মোট {inventoryProducts.length} প্রোডাক্ট</p>
              {inventoryProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-2xl border border-black/6 bg-white/80 px-4 py-3">
                  <button type="button" onClick={() => openProductEdit(p)} className="flex flex-1 items-center gap-3 text-left hover:opacity-90">
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#faf0ea]">
                      {getProductImages(p)[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={getProductImages(p)[0]} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{p.nameBn}</p>
                      <p className="text-xs text-[#8b6456]">
                        {findCategoryForProduct(p, categories)?.titleBn || p.categorySlug} · {p.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#8f624e]">{formatBdt(p.price)}</p>
                      <p className={`text-xs font-bold ${p.stock <= 5 ? "text-red-700" : "text-[#4a7350]"}`}>স্টক: {p.stock}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteProduct(p)}
                    className="shrink-0 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    {copy.actions.delete}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <input className="field flex-1" placeholder="ক্যাটাগরি সার্চ..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
              <FashionButton variant="secondary" onClick={addCategory}>+ ক্যাটাগরি</FashionButton>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setSelectedCategorySlug("")} className={`rounded-full px-3 py-1 text-xs font-semibold ${!selectedCategorySlug ? "bg-[#b5d4b5]" : "bg-white/70"}`}>সব</button>
              {filteredCategories.map((c) => (
                <button key={c.slug} type="button" onClick={() => setSelectedCategorySlug(c.slug)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedCategorySlug === c.slug ? "bg-[#b5d4b5]" : "bg-white/70"}`}>{c.titleBn}</button>
              ))}
            </div>
            <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto">
              <input
                ref={categoryFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  const slug = categoryUploadSlugRef.current || categoryUploadSlug;
                  if (f && slug) void handleUpload(f, "category", slug);
                }}
              />
              {filteredCategories.map((cat) => {
                const key = categoryIdentity(cat);
                return (
                <div key={key} className="flex flex-col gap-3 rounded-xl border border-black/6 bg-white/80 p-3 sm:flex-row sm:items-center">
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-[#f3ebe4] ring-2 ring-white shadow">
                      {cat.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg font-bold text-[#8f624e]">
                          {(cat.titleBn || cat.title || "•").trim().charAt(0)}
                        </span>
                      )}
                    </span>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className="rounded-full border border-[#c9a890] bg-[#f3ebe4] px-3 py-1 text-xs font-semibold text-[#3d2a24] disabled:opacity-60"
                        disabled={uploading}
                        onClick={() => {
                          categoryUploadSlugRef.current = key;
                          setCategoryUploadSlug(key);
                          categoryFileRef.current?.click();
                        }}
                      >
                        {fc.admin.categoryImage}
                      </button>
                      {cat.imageUrl ? (
                        <button
                          type="button"
                          className="text-left text-xs font-semibold text-[#8f624e]"
                          onClick={() => void removeCategoryImage(key)}
                        >
                          {fc.admin.removeImage}
                        </button>
                      ) : (
                        <p className="max-w-[9rem] text-[10px] leading-4 text-[#9b7766]">{fc.admin.categoryImageHint}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-2">
                    <input className="field" value={cat.titleBn} onChange={(e) => updateCategory(key, { titleBn: e.target.value })} />
                    <input className="field" value={cat.slug} onChange={(e) => updateCategory(key, { slug: e.target.value })} />
                  </div>
                  <button type="button" className="text-sm font-semibold text-red-700" onClick={() => removeCategory(cat.slug)}>{copy.actions.delete}</button>
                </div>
                );
              })}
            </div>
            <FashionButton className="mt-3" onClick={saveCategories}>{copy.actions.save} ক্যাটাগরি</FashionButton>

            <div className="mt-6 rounded-2xl border border-black/6 bg-white/80 p-4">
              <p className="font-semibold">সাইজ ম্যানেজমেন্ট</p>
              <div className="mt-2 flex gap-2">
                <input className="field flex-1" placeholder="নতুন সাইজ (যেমন XXL)" value={newSize} onChange={(e) => setNewSize(e.target.value)} />
                <FashionButton variant="secondary" onClick={addSize}>যোগ</FashionButton>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(settings?.availableSizes ?? []).map((size) => (
                  <span key={size} className="inline-flex items-center gap-1 rounded-full bg-[#faf0ea] px-3 py-1 text-sm">
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="text-red-600">×</button>
                  </span>
                ))}
              </div>
              <FashionButton className="mt-3" variant="secondary" onClick={saveSizes}>সাইজ সেভ</FashionButton>
            </div>
          </>
        )}
      </AdminModal>

      {/* Orders Modal - list only */}
      <AdminModal open={activeTab === "orders"} onClose={() => setActiveTab(null)} title={fc.admin.orders} theme="ocean" wide>
        <input
          className="field mb-3"
          placeholder={fc.admin.trackSearch}
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
        />
        <div className="max-h-[28rem] space-y-2 overflow-y-auto">
          {filteredOrders.map((order) => (
            <button key={order.id} type="button" onClick={() => setSelectedOrder(order)}
              className="flex w-full items-center justify-between rounded-2xl border border-black/6 bg-white/80 px-4 py-3 text-left hover:bg-white">
              <div>
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-xs text-[#8b6456]">{order.id} · {order.trackingNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatBdt(order.total)}</p>
                <p className="text-xs text-[#3d6a9e]">{copy.orderStatus[order.status]}</p>
              </div>
            </button>
          ))}
          {filteredOrders.length === 0 ? (
            <p className="text-sm text-[#9b7766]">{locale === "bn" ? "কোনো অর্ডার পাওয়া যায়নি" : "No orders found"}</p>
          ) : null}
        </div>
      </AdminModal>

      {/* Order Detail Popup */}
      {selectedOrder ? (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#2b1d19]/55 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#a8c8ef]/60 bg-[linear-gradient(145deg,#eef6ff,#f8fbff)] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">{selectedOrder.customerName}</h2>
                <p className="text-sm text-[#3d6a9e]">Tracking: <strong>{selectedOrder.trackingNumber}</strong></p>
                <p className="text-xs text-[#6f554a]">{selectedOrder.id} · {selectedOrder.phone}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold">✕</button>
            </div>
            <p className="mt-3 text-sm">{selectedOrder.address}, {selectedOrder.district}</p>
            <p className="mt-2 font-semibold">{copy.orderStatus[selectedOrder.status]} · {formatBdt(selectedOrder.total)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((st) => (
                <button key={st} type="button" onClick={() => setPendingStatus({ orderId: selectedOrder.id, status: st })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedOrder.status === st ? "bg-[#a8c8ef] text-[#3d6a9e]" : "bg-white border border-black/8"}`}>
                  {copy.orderStatus[st]}
                </button>
              ))}
            </div>
            <ul className="mt-4 space-y-2 border-t border-black/5 pt-3 text-xs text-[#6f554a]">
              {selectedOrder.statusHistory?.map((h, i) => (
                <li key={i}>{new Date(h.updatedAt).toLocaleString("bn-BD")} — {h.message}</li>
              ))}
            </ul>
            <div className="mt-4">
              <FashionButton variant="secondary" onClick={() => setInvoiceOrder(selectedOrder)}>Invoice দেখুন</FashionButton>
            </div>
          </div>
        </div>
      ) : null}

      {/* Invoice Popup */}
      {invoiceOrder ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#2b1d19]/60 p-4 backdrop-blur-md print:bg-white print:p-0">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#e8c4b0]/60 bg-white p-6 shadow-2xl print:max-h-none print:shadow-none">
            <div className="mb-4 flex items-center justify-between print:hidden">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">Invoice / PDF</h2>
              <button type="button" onClick={() => setInvoiceOrder(null)} className="rounded-full bg-[#faf4f0] px-3 py-1 text-sm font-semibold">✕</button>
            </div>
            <OrderInvoiceView order={invoiceOrder} settings={settings} />
          </div>
        </div>
      ) : null}

      {/* Delivery Modal - scroll districts */}
      <AdminModal open={activeTab === "delivery"} onClose={() => setActiveTab(null)} title={fc.admin.delivery} theme="sunset" wide>
        <p className="mb-3 text-sm text-[#7a5c50]">
          বাংলাদেশের {bangladeshDistricts.filter((d) => d !== "*").length} জেলা — সার্চ বক্সে ক্লিক/টাইপ করুন, অথবা স্ক্রল করে সিলেক্ট করুন।
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          <FashionButton type="button" variant="secondary" onClick={seedAllDistrictRules}>
            সব ৬৪ জেলায় ডিফল্ট ফি যোগ করুন
          </FashionButton>
          <FashionButton type="button" onClick={saveDelivery}>
            {copy.actions.save}
          </FashionButton>
        </div>
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <div className="flex max-h-96 flex-col rounded-2xl border border-[#f0c49a]/50 bg-[#fff8f0] p-2">
            <input
              className="field mb-2 shrink-0 text-sm"
              placeholder="জেলা সার্চ বা টাইপ... (৬৪ জেলা)"
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
              onFocus={() => {
                if (!districtSearch) setDistrictSearch("");
              }}
            />
            <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#9b7766]">
              {filteredDistricts.length} জেলা
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {filteredDistricts.map((d) => {
                const hasRule = settings?.deliveryRules.some((r) => r.district === d);
                return (
                  <button key={d} type="button" onClick={() => { setSelectedDistrict(d); upsertDistrictRule(d); }}
                    className={`mb-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${selectedDistrict === d ? "bg-[#ffd4b8] text-[#6b3a1e]" : "text-[#1c1412] hover:bg-[#fff8f0]"}`}>
                    {d === "*" ? "Other / Nationwide (*)" : d} {hasRule ? "✓" : ""}
                  </button>
                );
              })}
              {filteredDistricts.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-[#9b7766]">কোনো জেলা পাওয়া যায়নি</p>
              ) : null}
            </div>
          </div>
          {activeRule && settings && activeRuleIndex >= 0 ? (
            <div className="space-y-3 rounded-2xl border border-black/6 bg-white/80 p-4">
              <p className="font-semibold">{selectedDistrict} — ডেলিভারি সেটিং</p>
              <label className="block"><span className="text-xs text-[#9b7766]">ডেলিভারি ফি (৳)</span>
                <input className="field mt-1" type="number" value={activeRule.fee} onChange={(e) => {
                  const rules = [...settings.deliveryRules]; rules[activeRuleIndex] = { ...activeRule, fee: Number(e.target.value) };
                  setSettings({ ...settings, deliveryRules: rules });
                }} /></label>
              <label className="block"><span className="text-xs text-[#9b7766]">ফ্রি ডেলিভারি min (৳)</span>
                <input className="field mt-1" type="number" value={activeRule.minOrderForFree ?? ""} onChange={(e) => {
                  const rules = [...settings.deliveryRules]; rules[activeRuleIndex] = { ...activeRule, minOrderForFree: Number(e.target.value) || undefined };
                  setSettings({ ...settings, deliveryRules: rules });
                }} /></label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={activeRule.active} onChange={(e) => {
                  const rules = [...settings.deliveryRules]; rules[activeRuleIndex] = { ...activeRule, active: e.target.checked };
                  setSettings({ ...settings, deliveryRules: rules });
                }} /> সক্রিয়
              </label>
              <FashionButton onClick={saveDelivery}>{copy.actions.save}</FashionButton>
            </div>
          ) : null}
        </div>
      </AdminModal>

      {/* Coupons, Settings, Analytics modals - keep similar to before but condensed */}
      <AdminModal open={activeTab === "coupons"} onClose={() => setActiveTab(null)} title={fc.admin.coupons} theme="violet" wide>
        <form onSubmit={saveCoupon} className="mb-4 space-y-3 rounded-2xl border border-black/6 bg-white/80 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="field" placeholder="কুপন কোড" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required />
            <input className="field" type="number" placeholder="ছাড়" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })} required />
            <select className="field" value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as "percent" | "fixed" })}>
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed ৳</option>
            </select>
            <input className="field" type="number" placeholder="মিনিমাম অর্ডার (ঐচ্ছিক)" value={couponForm.minOrder ?? ""} onChange={(e) => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) || undefined })} />
            <input className="field md:col-span-2" type="datetime-local" value={couponForm.expiresAt?.slice(0, 16) ?? ""} onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
            <textarea className="field md:col-span-2 min-h-20" placeholder="কুপন বিবরণ" value={couponForm.description ?? ""} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[#9b7766]">প্রযোজ্য প্রোডাক্ট (খালি = সব)</p>
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-black/6 bg-white p-2">
              {products.map((p) => {
                const checked = couponForm.productIds?.includes(p.id) ?? false;
                return (
                  <label key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-[#faf4f0]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const ids = new Set(couponForm.productIds ?? []);
                        if (e.target.checked) ids.add(p.id);
                        else ids.delete(p.id);
                        setCouponForm({ ...couponForm, productIds: [...ids] });
                      }}
                    />
                    {p.nameBn}
                  </label>
                );
              })}
            </div>
          </div>
          <FashionButton type="submit">{copy.actions.save}</FashionButton>
        </form>
        {coupons.map((coupon) => (
          <div key={coupon.id} className="mb-2 flex justify-between rounded-xl border border-black/6 bg-white/80 p-3">
            <div>
              <span className="font-semibold">{coupon.code}</span>
              <p className="text-xs text-[#8b6456]">
                {coupon.discountType === "percent" ? `${coupon.discountValue}%` : formatBdt(coupon.discountValue)}
                {coupon.expiresAt ? ` · ${new Date(coupon.expiresAt).toLocaleDateString("bn-BD")} পর্যন্ত` : ""}
                {coupon.productIds?.length ? ` · ${coupon.productIds.length} প্রোডাক্ট` : " · সব প্রোডাক্ট"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCouponForm(coupon)}>{copy.actions.edit}</button>
              <button type="button" className="text-red-700" onClick={() => removeCoupon(coupon.id)}>{copy.actions.delete}</button>
            </div>
          </div>
        ))}
      </AdminModal>

      <AdminModal open={activeTab === "offers-product"} onClose={() => setActiveTab(null)} title={fc.admin.offersProduct} subtitle={fc.admin.offersHint} theme="gold" wide>
        <div className="mb-4 flex gap-2">
          <button type="button" onClick={() => setOffersSubTab("offers")} className={`rounded-full px-4 py-2 text-sm font-semibold ${offersSubTab === "offers" ? "bg-[#e8b896] text-[#3d2a24]" : "border border-[#c9a890] bg-[#f3ebe4] text-[#1c1412]"}`}>{fc.admin.offersTab}</button>
          <button type="button" onClick={() => setOffersSubTab("advertisement")} className={`rounded-full px-4 py-2 text-sm font-semibold ${offersSubTab === "advertisement" ? "bg-[#e8b896] text-[#3d2a24]" : "border border-[#c9a890] bg-[#f3ebe4] text-[#1c1412]"}`}>{fc.admin.adsTab}</button>
        </div>
        <input
          className="field mb-4"
          placeholder={fc.admin.offersSearch}
          value={offersSearch}
          onChange={(e) => setOffersSearch(e.target.value)}
        />

        {offersSubTab === "offers" ? (
          <div className="space-y-4">
            <form onSubmit={saveProductOffer} className="space-y-3 rounded-2xl border border-black/6 bg-white/80 p-4">
              <select className="field" value={offerEditId} onChange={(e) => setOfferEditId(e.target.value)} required>
                <option value="">{fc.admin.selectProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{(locale === "bn" ? p.nameBn : p.name) || p.nameBn} — {formatBdt(p.price)}</option>
                ))}
              </select>
              <div className="grid gap-3 md:grid-cols-3">
                <input className="field" placeholder={fc.admin.offerLabel} value={offerLabel} onChange={(e) => setOfferLabel(e.target.value)} required />
                <input className="field" type="number" placeholder={fc.admin.discountPercent} value={offerDiscount} onChange={(e) => setOfferDiscount(Number(e.target.value))} required />
                <input className="field" type="datetime-local" value={offerExpiresAt} onChange={(e) => setOfferExpiresAt(e.target.value)} />
              </div>
              <p className="text-xs text-[#9b7766]">{fc.admin.expiryHint}</p>
              <FashionButton type="submit">{fc.admin.saveOffer}</FashionButton>
            </form>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {products.filter((p) => p.offerActive && matchesOfferSearch(p)).map((p) => (
                <div key={p.id} className="rounded-xl border border-black/6 bg-white/80 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{locale === "bn" ? p.nameBn : p.name}</p>
                      <p className="mt-1 text-sm text-[#6f554a]">
                        <span className="font-semibold text-[#8f624e]">{fc.admin.offerReason}: </span>
                        {p.offerLabel || fc.admin.offer}
                        {p.offerDiscountPercent ? ` · ${p.offerDiscountPercent}% ${fc.admin.discount}` : ""}
                      </p>
                      <p className="text-xs text-[#8b6456]">
                        {p.offerExpiresAt
                          ? `${fc.admin.until}: ${new Date(p.offerExpiresAt).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD")}`
                          : fc.couponNoExpiry}
                      </p>
                    </div>
                    <button type="button" className="text-sm font-semibold text-red-700" onClick={() => removeProductOffer(p.id)}>{fc.actions.delete}</button>
                  </div>
                </div>
              ))}
              {products.filter((p) => p.offerActive && matchesOfferSearch(p)).length === 0 ? (
                <p className="text-sm text-[#9b7766]">{fc.admin.noOffers}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={saveBanner} className="space-y-3 rounded-2xl border border-black/6 bg-white/80 p-4">
              <p className="rounded-xl border border-[#e8cc80]/70 bg-[#fffbf0] px-3 py-2 text-sm text-[#6b5420]">
                Banner size: <strong>{BANNER_RECOMMENDED_SIZE.label}</strong> ({BANNER_RECOMMENDED_SIZE.ratio}).
                {" "}{BANNER_RECOMMENDED_SIZE.hint}
              </p>
              <select className="field" value={bannerForm.productId ?? ""} onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value);
                setBannerForm({
                  ...bannerForm,
                  productId: e.target.value || undefined,
                  imageUrl: product?.imageUrl || bannerForm.imageUrl,
                  linkSlug: product?.slug,
                  title: product?.nameBn || bannerForm.title,
                });
              }}>
                <option value="">{fc.admin.selectProduct}</option>
                {products.map((p) => <option key={p.id} value={p.id}>{locale === "bn" ? p.nameBn : p.name}</option>)}
              </select>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="field" placeholder={fc.admin.offerLabel} value={bannerForm.title ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
                <input className="field" placeholder="Badge" value={bannerForm.badgeLabel ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, badgeLabel: e.target.value })} />
                <select className="field" value={bannerForm.advertiseKind ?? "offer"} onChange={(e) => setBannerForm({ ...bannerForm, advertiseKind: e.target.value as AdvertiseKind })}>
                  <option value="new">{fc.admin.newProduct}</option>
                  <option value="discount">{fc.admin.discount}</option>
                  <option value="offer">{fc.admin.offer}</option>
                  <option value="custom">{fc.admin.custom}</option>
                </select>
                <input className="field" type="datetime-local" value={bannerForm.expiresAt?.slice(0, 16) ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
              </div>
              <input className="field" placeholder="Image URL" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} required={!bannerForm.productId} />
              <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                void (async () => {
                  setUploading(true);
                  const fd = new FormData();
                  fd.append("file", f);
                  const res = await fetch("/api/fashion/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  setUploading(false);
                  if (data.url) setBannerForm((c) => ({ ...c, imageUrl: data.url }));
                })();
              }} />
              <FashionButton type="button" variant="secondary" onClick={() => bannerFileRef.current?.click()} disabled={uploading}>{fc.actions.upload}</FashionButton>
              <p className="text-xs text-[#9b7766]">{fc.admin.expiryHint}</p>
              <FashionButton type="submit">{fc.admin.saveAd}</FashionButton>
            </form>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {banners.filter(matchesBannerSearch).map((b) => {
                const linked = products.find((p) => p.id === b.productId);
                return (
                  <div key={b.id} className="rounded-xl border border-black/6 bg-white/80 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{b.title || linked?.nameBn || b.id}</p>
                        <p className="mt-1 text-sm text-[#6f554a]">
                          <span className="font-semibold text-[#8f624e]">{fc.admin.adReason}: </span>
                          {advertiseKindLabel(b.advertiseKind, fc)}
                          {b.badgeLabel ? ` · ${b.badgeLabel}` : ""}
                          {linked ? ` · ${locale === "bn" ? linked.nameBn : linked.name}` : ""}
                        </p>
                        <p className="text-xs text-[#8b6456]">
                          {b.expiresAt
                            ? `${fc.admin.until}: ${new Date(b.expiresAt).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD")}`
                            : fc.couponNoExpiry}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => setBannerForm(b)}>{fc.actions.edit}</button>
                        <button type="button" className="text-red-700" onClick={() => removeBanner(b.id)}>{fc.actions.delete}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {banners.filter(matchesBannerSearch).length === 0 ? <p className="text-sm text-[#9b7766]">{fc.admin.noAds}</p> : null}
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={activeTab === "settings"}
        onClose={() => setActiveTab(null)}
        title={fc.admin.settings}
        subtitle={fc.admin.settingsHint}
        theme="gold"
        wide="xl"
      >
        {settings ? (
          <SettingsEditor
            settings={settings}
            setSettings={setSettings}
            onSave={saveSettings}
            newSize={newSize}
            setNewSize={setNewSize}
            onAddSize={addSize}
            onRemoveSize={removeSize}
          />
        ) : null}
      </AdminModal>

      <AdminModal open={activeTab === "analytics"} onClose={() => setActiveTab(null)} title={fc.admin.analytics} theme="slate" wide>
        {analytics ? (
          <div className="grid gap-4 md:grid-cols-2">
            {(["daily", "monthly"] as const).map((period) => (
              <div key={period} className="rounded-2xl border border-black/6 bg-white/80 p-4">
                <h3 className="font-bold">{period === "daily" ? "আজ" : "মাস"}</h3>
                <p className="text-sm">বিক্রয়: {formatBdt(analytics[period].revenue)} · লাভ: {formatBdt(analytics[period].profit)}</p>
              </div>
            ))}
          </div>
        ) : null}
      </AdminModal>

      {/* Reports Modal - sub menus */}
      <AdminModal open={activeTab === "reports"} onClose={() => { setActiveTab(null); setReportType(null); }} title={fc.admin.reports} theme="pearl" wide>
        <div className="grid gap-3 sm:grid-cols-3">
          {([
            ["sell", "বিক্রয় রিপোর্ট"],
            ["delivery", "ডেলিভারি রিপোর্ট"],
            ["customer", "গ্রাহক রিপোর্ট"],
          ] as const).map(([type, label]) => (
            <button key={type} type="button" onClick={() => setReportType(type)}
              className="rounded-2xl border border-black/6 bg-white/80 p-5 text-left font-semibold transition hover:bg-white">
              {label}
            </button>
          ))}
        </div>
      </AdminModal>

      {reportType ? (
        <div className="fixed inset-0 z-[88] flex items-center justify-center bg-[#2b1d19]/55 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[#d8cfc4]/60 bg-[#fdfcfa] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between print:hidden">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">রিপোর্ট</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => window.print()} className="rounded-full bg-[#ebe3da] px-4 py-2 text-sm font-semibold">{copy.actions.print} / PDF</button>
                <button type="button" onClick={() => setReportType(null)} className="rounded-full bg-white px-3 py-1 text-sm">✕</button>
              </div>
            </div>
            <ReportContent type={reportType} orders={orders} />
          </div>
        </div>
      ) : null}

      {/* Product Edit Modal */}
      {productModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2b1d19]/50 p-4 backdrop-blur-md">
          <form onSubmit={saveProduct} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-[#e8c4b0]/60 bg-[linear-gradient(160deg,#fff8f4,#fdeee4)] p-6 shadow-2xl space-y-3">
            <div className="flex justify-between"><h2 className="text-2xl font-bold">{editingId ? copy.actions.edit : copy.actions.create}</h2>
              <button type="button" onClick={() => setProductModalOpen(false)}>✕</button></div>
            <div className="rounded-2xl border border-[#e8c4b0]/70 bg-white/80 p-3">
              <p className="text-sm font-semibold text-[#8e1050]">প্রোডাক্ট ছবি</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {getProductImages(form).map((url) => (
                  <div key={url} className="relative h-24 w-24 overflow-hidden rounded-2xl bg-[#faf0ea]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-[#8e1050]"
                      onClick={() => removeProductImage(url)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {getProductImages(form).length < MAX_PRODUCT_IMAGES ? (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-dashed border-[#c2186b]/45 bg-[#fff5f8] text-center text-[11px] font-semibold leading-4 text-[#c2186b]"
                  >
                    {uploading ? "..." : "ছবি যোগ করুন"}
                  </button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  e.target.value = "";
                  if (files?.length) void handleProductFiles(files);
                }}
              />
              {uploadError ? <p className="mt-2 text-xs text-red-700">{uploadError}</p> : null}
            </div>
            {([["nameBn", "নাম (বাংলা)"], ["name", "Name (English)"], ["buyPrice", "কেনা দাম"], ["price", "বিক্রয়"], ["stock", "স্টক"]] as const).map(([key, label]) => (
              <label key={key} className="block"><span className="text-sm text-[#9b7766]">{label}</span>
                <input className="field mt-1" value={String(form[key as keyof ProductInput] ?? "")} onChange={(e) => setForm((c) => ({ ...c, [key]: ["price", "buyPrice", "stock"].includes(key) ? Number(e.target.value) : e.target.value }))} /></label>
            ))}
            <label className="block">
              <span className="text-sm text-[#9b7766]">বিবরণ (বাংলা)</span>
              <textarea
                className="field mt-1 min-h-[80px]"
                value={form.descriptionBn ?? ""}
                onChange={(e) => setForm((c) => ({ ...c, descriptionBn: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-[#9b7766]">Description (English)</span>
              <textarea
                className="field mt-1 min-h-[80px]"
                value={form.description ?? ""}
                onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
              />
            </label>
            <div className="block">
              <span className="text-sm text-[#9b7766]">ক্যাটাগরি</span>
              <select
                className="field mt-1"
                value={
                  useNewCategory
                    ? "__new__"
                    : categories.some((c) => c.slug === form.categorySlug)
                      ? form.categorySlug
                      : ""
                }
                required={!useNewCategory}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setUseNewCategory(true);
                    return;
                  }
                  setUseNewCategory(false);
                  setForm((c) => ({ ...c, categorySlug: e.target.value }));
                }}
              >
                <option value="" disabled>
                  ক্যাটাগরি বেছে নিন
                </option>
                {categories.map((c) => (
                  <option key={categoryIdentity(c)} value={c.slug}>
                    {c.titleBn}
                  </option>
                ))}
                <option value="__new__">+ নতুন ক্যাটাগরি তৈরি</option>
              </select>
              {useNewCategory ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input className="field" placeholder="ক্যাটাগরি নাম (বাংলা)" value={newCategoryTitleBn} onChange={(e) => setNewCategoryTitleBn(e.target.value)} required />
                  <input className="field" placeholder="slug (ঐচ্ছিক)" value={newCategorySlug} onChange={(e) => setNewCategorySlug(e.target.value)} />
                </div>
              ) : null}
            </div>
            <div className="block">
              <span className="text-sm text-[#9b7766]">সাইজ</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...(settings?.availableSizes ?? []), ...form.sizes].filter((s, i, arr) => arr.indexOf(s) === i).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleProductSize(size)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${form.sizes.includes(size) ? "bg-[#e8b896] text-[#3d2a24]" : "border border-black/10 bg-white/80 text-[#6f554a]"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input className="field flex-1" placeholder="নতুন সাইজ যোগ (যেমন XXL)" value={productNewSize} onChange={(e) => setProductNewSize(e.target.value)} />
                <FashionButton type="button" variant="secondary" onClick={() => void addProductSize()}>যোগ</FashionButton>
              </div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-white/80 p-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form.advertiseActive)}
                  onChange={(e) => {
                    if (e.target.checked) openAdvertiseSetup();
                    else disableAdvertise();
                  }}
                />
                হোমপেজ advertise/carousel-এ দেখান
              </label>
              {form.advertiseActive ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6f554a]">
                  <span className="rounded-full bg-[#faf0ea] px-3 py-1 font-semibold">
                    {form.advertiseKind === "new"
                      ? "নতুন প্রোডাক্ট"
                      : form.advertiseKind === "discount"
                        ? "ডিসকাউন্ট"
                        : form.advertiseKind === "offer"
                          ? "অফার"
                          : form.advertiseLabel || "কাস্টম"}
                  </span>
                  <button type="button" className="font-semibold text-[#8f624e]" onClick={openAdvertiseSetup}>
                    advertise সেটিং পরিবর্তন
                  </button>
                </div>
              ) : null}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(form.offerActive)} onChange={(e) => setForm((c) => ({ ...c, offerActive: e.target.checked }))} />
              অফার/ডিসকাউন্ট প্রোডাক্ট
            </label>
            {form.offerActive ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="field" placeholder="অফার লেবেল" value={form.offerLabel ?? ""} onChange={(e) => setForm((c) => ({ ...c, offerLabel: e.target.value }))} />
                <input className="field" type="number" placeholder="ছাড় %" value={form.offerDiscountPercent ?? ""} onChange={(e) => setForm((c) => ({ ...c, offerDiscountPercent: Number(e.target.value) || undefined }))} />
              </div>
            ) : null}
            <FashionButton type="submit">{copy.actions.save}</FashionButton>
          </form>
        </div>
      ) : null}

      <AdminConfirmModal open={Boolean(pendingStatus)} onClose={() => setPendingStatus(null)} onConfirm={confirmOrderStatus}
        title="স্ট্যাটাস নিশ্চিত করুন" message={pendingStatus ? `${copy.orderStatus[pendingStatus.status]}?` : ""} confirmLabel="হ্যাঁ" theme="ocean" />
      <AdminConfirmModal open={Boolean(pendingDeleteProduct)} onClose={() => setPendingDeleteProduct(null)} onConfirm={confirmDeleteProduct}
        title="প্রোডাক্ট মুছবেন?" message={pendingDeleteProduct ? `${pendingDeleteProduct.nameBn} স্থায়ীভাবে মুছে ফেলা হবে।` : ""} confirmLabel="মুছুন" theme="rose" />

      {advertiseModalOpen ? (
        <div className="fixed inset-0 z-[82] flex items-center justify-center bg-[#2b1d19]/55 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] border border-[#e8c4b0]/60 bg-[linear-gradient(160deg,#fff8f4,#fdeee4)] p-6 shadow-2xl">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">Advertise হিসেবে দেখাবেন?</h3>
            <p className="mt-2 text-sm text-[#6f554a]">homepage carousel-এ কী ধরনের advertise দেখাবে select করুন</p>
            <div className="mt-4 space-y-2">
              {([
                ["new", "নতুন প্রোডাক্ট"],
                ["discount", "ডিসকাউন্ট"],
                ["offer", "অফার"],
                ["custom", "অন্যান্য (নিজে লিখুন)"],
              ] as const).map(([kind, label]) => (
                <label key={kind} className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/6 bg-white/80 px-4 py-3">
                  <input type="radio" name="advertiseKind" checked={advertiseKind === kind} onChange={() => setAdvertiseKind(kind)} />
                  <span className="font-semibold">{label}</span>
                </label>
              ))}
            </div>
            {advertiseKind === "custom" ? (
              <input
                className="field mt-3"
                placeholder="যেমন: Summer Sale, Best Seller..."
                value={advertiseLabel}
                onChange={(e) => setAdvertiseLabel(e.target.value)}
              />
            ) : null}
            <div className="mt-5 flex gap-2">
              <FashionButton type="button" variant="secondary" className="flex-1" onClick={() => setAdvertiseModalOpen(false)}>
                {copy.actions.close}
              </FashionButton>
              <FashionButton type="button" className="flex-1" onClick={confirmAdvertiseSetup}>
                Confirm
              </FashionButton>
            </div>
          </div>
        </div>
      ) : null}

      <AdminSuccessModal open={Boolean(success)} onClose={() => setSuccess(null)} title={success?.title ?? ""} message={success?.message ?? ""} theme={success?.theme ?? "rose"} />
    </AdminShell>
  );
}
