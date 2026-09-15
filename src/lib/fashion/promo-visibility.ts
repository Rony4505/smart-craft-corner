import type { Coupon, Product, PromoBanner } from "./types";

/** Keep an explicit empty array. Only fall back when the field is missing. */
export function resolvePersistedList<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback;
}

export function resolvePersistedCoupons(value: unknown): Coupon[] {
  return resolvePersistedList<Coupon>(value, []);
}

export function advertiseBadge(
  product: Pick<Product, "advertiseKind" | "advertiseLabel" | "offerDiscountPercent" | "offerLabel">,
): string {
  switch (product.advertiseKind) {
    case "new":
      return "নতুন";
    case "discount":
      return product.offerDiscountPercent ? `${product.offerDiscountPercent}% ছাড়` : "ডিসকাউন্ট";
    case "offer":
      return product.advertiseLabel || product.offerLabel || "অফার";
    case "custom":
      return product.advertiseLabel || "অফার";
    default:
      return product.advertiseLabel || "অফার";
  }
}

export function buildProductPromoBanner(
  product: Product,
  existing?: PromoBanner,
): PromoBanner {
  return {
    id: existing?.id || `pb-${product.id}`,
    imageUrl: product.imageUrl,
    title: product.advertiseLabel || product.nameBn,
    linkSlug: product.slug,
    productId: product.id,
    badgeLabel: advertiseBadge(product),
    advertiseKind: product.advertiseKind,
    active: true,
    expiresAt: existing?.expiresAt,
    sortOrder: existing?.sortOrder ?? Date.now(),
  };
}

/**
 * Ads live in `promoBanners`. Saving a product must never recreate a banner
 * the admin already deleted — only update or remove an existing one.
 */
export function syncBannersForProduct(banners: PromoBanner[], product: Product): PromoBanner[] {
  const next = [...banners];
  const existingIndex = next.findIndex((banner) => banner.productId === product.id);

  if (!product.advertiseActive) {
    if (existingIndex >= 0) next.splice(existingIndex, 1);
    return next;
  }

  if (existingIndex < 0) return next;

  next[existingIndex] = buildProductPromoBanner(product, next[existingIndex]);
  return next;
}

export function definedEntries<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}
