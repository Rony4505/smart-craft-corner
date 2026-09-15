import type { Product } from "@/lib/fashion/types";

export function productShowsSizes(product: Pick<Product, "showSizes">): boolean {
  return product.showSizes !== false;
}

export function productDefaultSize(product: Pick<Product, "showSizes" | "sizes">): string {
  if (!productShowsSizes(product)) return "Free Size";
  return product.sizes[0] ?? "Free Size";
}
