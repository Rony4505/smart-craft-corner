import type { Category } from "./types";
import { listCategories } from "./store";

export async function getCategories(): Promise<Category[]> {
  return listCategories();
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const all = await listCategories();
  return all.find((category) => category.slug === slug || category.id === slug);
}
