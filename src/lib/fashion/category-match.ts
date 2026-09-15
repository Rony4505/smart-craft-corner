import type { Category, Product } from "./types";

function norm(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function slugifyLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GENERIC_TITLES = new Set(["new category", "নতুন ক্যাটাগরি", "category", "ক্যাটাগরি"]);

export function categoryIdentity(category: Pick<Category, "id" | "slug">): string {
  return category.id?.trim() || category.slug;
}

export function categoryMatchKeys(category: Category): string[] {
  const keys = [
    category.id,
    category.slug,
    category.title,
    category.titleBn,
    slugifyLabel(category.title ?? ""),
    slugifyLabel(category.titleBn ?? ""),
  ]
    .map(norm)
    .filter((key) => key && !GENERIC_TITLES.has(key));
  return [...new Set(keys)];
}

export function productMatchesCategory(product: Product, category: Category): boolean {
  const slug = norm(product.categorySlug);
  if (!slug) return false;
  return categoryMatchKeys(category).includes(slug);
}

function guessCategoryFromName(product: Product, categories: Category[]): Category | undefined {
  const haystack = `${product.name} ${product.nameBn}`.toLowerCase();
  let best: { category: Category; score: number } | undefined;

  for (const category of categories) {
    const labels = [category.titleBn, category.title]
      .map((label) => label?.trim())
      .filter((label): label is string => Boolean(label) && !GENERIC_TITLES.has(norm(label)));

    for (const label of labels) {
      if (label.length < 2) continue;
      if (haystack.includes(label.toLowerCase())) {
        const score = label.length;
        if (!best || score > best.score) best = { category, score };
      }
    }
  }

  return best?.category;
}

/** Resolve the live category a product belongs to, including orphan slug repair. */
export function findCategoryForProduct(
  product: Product,
  categories: Category[],
): Category | undefined {
  const exact = categories.find((category) => productMatchesCategory(product, category));
  if (exact) return exact;
  return guessCategoryFromName(product, categories);
}

export function productInCategory(
  product: Product,
  category: Category,
  categories: Category[],
): boolean {
  const resolved = findCategoryForProduct(product, categories);
  if (!resolved) return false;
  return categoryIdentity(resolved) === categoryIdentity(category);
}

export function filterProductsByCategory(
  products: Product[],
  categorySlug: string | undefined,
  categories: Category[],
): Product[] {
  if (!categorySlug) return products;
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return products.filter((product) => product.categorySlug === categorySlug);
  return products.filter((product) => productInCategory(product, category, categories));
}

export function repairProductCategorySlugs(
  products: Product[],
  categories: Category[],
): boolean {
  let changed = false;
  for (const product of products) {
    const known = categories.some((category) => productMatchesCategory(product, category));
    if (known) continue;
    const guessed = guessCategoryFromName(product, categories);
    if (guessed && guessed.slug !== product.categorySlug) {
      product.categorySlug = guessed.slug;
      changed = true;
    }
  }
  return changed;
}
