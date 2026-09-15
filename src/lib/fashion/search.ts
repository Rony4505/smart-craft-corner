import type { Product, SearchFilters } from "./types";
import { filterProductsByCategory, findCategoryForProduct } from "./category-match";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function searchProducts(products: Product[], filters: SearchFilters): Product[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  let results = [...products];

  if (query) {
    results = results.filter((product) => {
      const category = findCategoryForProduct(product, filters.categories ?? []);
      const haystack = [
        product.name,
        product.nameBn,
        product.description,
        product.descriptionBn,
        product.fabric,
        product.categorySlug,
        product.label ?? "",
        category?.title ?? "",
        category?.titleBn ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  if (filters.categorySlug) {
    results = filterProductsByCategory(results, filters.categorySlug, filters.categories ?? []);
  }

  if (typeof filters.minPrice === "number") {
    results = results.filter((product) => product.price >= filters.minPrice!);
  }

  if (typeof filters.maxPrice === "number") {
    results = results.filter((product) => product.price <= filters.maxPrice!);
  }

  if (filters.inStockOnly) {
    results = results.filter((product) => product.inStock);
  }

  switch (filters.sort) {
    case "price-asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      results.sort((a, b) => b.id.localeCompare(a.id));
      break;
    default:
      results.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }

  return results;
}
