import type { Product } from "./types";

/** All gallery URLs for a product (imageUrls first, then legacy imageUrl). */
export function getProductImages(product: Pick<Product, "imageUrl" | "imageUrls">): string[] {
  const fromList = (product.imageUrls ?? []).map((url) => url.trim()).filter(Boolean);
  if (fromList.length) return fromList;
  const single = product.imageUrl?.trim();
  return single ? [single] : [];
}
