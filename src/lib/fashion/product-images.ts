import type { Product } from "./types";

export const MAX_PRODUCT_IMAGES = 8;

/** Deduped gallery URLs (imageUrls first, then legacy imageUrl). */
export function getProductImages(product: Pick<Product, "imageUrl" | "imageUrls">): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...(product.imageUrls ?? []), product.imageUrl ?? ""]) {
    const url = raw.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= MAX_PRODUCT_IMAGES) break;
  }
  return out;
}

export function applyProductGallery(
  product: Pick<Product, "imageUrl" | "imageUrls">,
  urls: string[],
): { imageUrl: string; imageUrls: string[] } {
  const imageUrls = getProductImages({ imageUrl: "", imageUrls: urls });
  return { imageUrl: imageUrls[0] ?? "", imageUrls };
}
