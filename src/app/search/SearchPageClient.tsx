"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FashionShell } from "@/components/fashion/FashionShell";
import { ProductGrid } from "@/components/fashion/ProductGrid";
import { copy } from "@/lib/fashion/copy";
import { searchProducts } from "@/lib/fashion/search";
import type { Category, Product } from "@/lib/fashion/types";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [categorySlug, setCategorySlug] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

  useEffect(() => {
    fetch("/api/fashion/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []));
    fetch("/api/fashion/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  const results = useMemo(
    () =>
      searchProducts(products, {
        query,
        categorySlug: categorySlug || undefined,
        categories,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStockOnly: true,
        sort,
      }),
    [products, categories, query, categorySlug, maxPrice, sort],
  );

  return (
    <FashionShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold">{copy.search.title}</h1>
        <div className="mt-8 grid gap-4 rounded-[2rem] border border-black/6 bg-white p-6 md:grid-cols-4">
          <input className="field md:col-span-2" placeholder={copy.search.placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="field" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
            <option value="">{copy.search.allCategories}</option>
            {categories.map((category) => (
              <option key={category.id || category.slug} value={category.slug}>{category.titleBn}</option>
            ))}
          </select>
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="featured">{copy.search.sortFeatured}</option>
            <option value="price-asc">{copy.search.sortPriceLow}</option>
            <option value="price-desc">{copy.search.sortPriceHigh}</option>
          </select>
          <input className="field md:col-span-2" placeholder="সর্বোচ্চ দাম (৳)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <div className="mt-10">
          {results.length === 0 ? (
            <p className="text-[#6f554a]">{copy.search.noResults}</p>
          ) : (
            <ProductGrid products={results} />
          )}
        </div>
      </section>
    </FashionShell>
  );
}
