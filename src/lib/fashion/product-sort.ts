import type { Product } from "./types";

function isExpired(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

/** Active offer/discount product (respects expiry). */
export function isActiveOfferProduct(product: Product): boolean {
  return Boolean(product.offerActive && !isExpired(product.offerExpiresAt));
}

/** New arrival flag or recent listing. */
export function isNewArrivalProduct(product: Product, sinceDays = 14): boolean {
  if (product.isNew) return true;
  const cutoff = Date.now() - sinceDays * 86400000;
  return new Date(product.createdAt).getTime() > cutoff;
}

/** Higher = show earlier. Offers first, then new arrivals, then featured. */
export function productDisplayPriority(product: Product): number {
  let score = 0;
  if (isActiveOfferProduct(product)) score += 100;
  if (isNewArrivalProduct(product)) score += 50;
  if (product.featured) score += 25;
  if (
    product.compareAtPrice &&
    product.compareAtPrice > product.price &&
    !isActiveOfferProduct(product)
  ) {
    score += 10;
  }
  return score;
}

/** Default catalog order: offer/discount → new arrival → featured → newest. */
export function sortProductsByDisplayPriority(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const diff = productDisplayPriority(b) - productDisplayPriority(a);
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
