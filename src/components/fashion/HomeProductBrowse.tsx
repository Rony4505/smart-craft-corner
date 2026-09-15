"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryCircle, CategoryCircleRow } from "@/components/fashion/CategoryCircle";
import { ProductGrid } from "@/components/fashion/ProductGrid";
import { VisibleSelect } from "@/components/fashion/VisibleSelect";
import { getEffectivePrice } from "@/lib/fashion/pricing";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { filterProductsByCategory } from "@/lib/fashion/category-match";
import type { Category, Product } from "@/lib/fashion/types";

type PriceSort = "default" | "price-asc" | "price-desc";
const PAGE_SIZE = 20;

function sortProducts(products: Product[], sort: PriceSort): Product[] {
  if (sort === "default") return products;
  return [...products].sort((a, b) => {
    const diff = getEffectivePrice(a) - getEffectivePrice(b);
    return sort === "price-asc" ? diff : -diff;
  });
}

function PriceSortSelect({
  value,
  onChange,
}: {
  value: PriceSort;
  onChange: (value: PriceSort) => void;
}) {
  const { fc } = useFashionCopy();

  return (
    <VisibleSelect
      value={value}
      onChange={(v) => onChange(v as PriceSort)}
      ariaLabel={fc.home.sortPrice}
      options={[
        { value: "default", label: fc.search.sortFeatured },
        { value: "price-asc", label: fc.search.sortPriceLow },
        { value: "price-desc", label: fc.search.sortPriceHigh },
      ]}
    />
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`min-w-10 rounded-full px-3 py-2 text-sm font-semibold transition ${
            page === n
              ? "bg-[#2b1d19] text-white"
              : "border border-black/10 bg-white text-[#5b4339] hover:bg-[#f0e8e2]"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  sort,
  onSortChange,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  sort: PriceSort;
  onSortChange: (value: PriceSort) => void;
}) {
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="border-b border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#9b7766]">{title}</p>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#6e5449]">{subtitle}</p>
            ) : null}
          </div>
          <PriceSortSelect value={sort} onChange={onSortChange} />
        </div>
        <div className="mt-8">
          <ProductGrid products={pageItems} />
        </div>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={(n) => {
            setPage(n);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </section>
  );
}

export function HomeProductBrowse({
  categories,
  products,
  newProducts,
  offerProducts,
  showNewProducts = true,
  showOffers = true,
}: {
  categories: Category[];
  products: Product[];
  newProducts: Product[];
  offerProducts: Product[];
  showNewProducts?: boolean;
  showOffers?: boolean;
}) {
  const { fc } = useFashionCopy();
  const [categorySlug, setCategorySlug] = useState("");
  const [categorySort, setCategorySort] = useState<PriceSort>("default");
  const [newSort, setNewSort] = useState<PriceSort>("default");
  const [offerSort, setOfferSort] = useState<PriceSort>("default");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("category") || "";
    if (fromUrl) setCategorySlug(fromUrl);
  }, []);

  function selectCategory(slug: string) {
    setCategorySlug(slug);
    setPage(1);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    url.hash = "products";
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const categoryProducts = useMemo(() => {
    const filtered = filterProductsByCategory(products, categorySlug || undefined, categories);
    return sortProducts(filtered, categorySort);
  }, [products, categorySlug, categorySort, categories]);

  const totalPages = Math.max(1, Math.ceil(categoryProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = categoryProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <>
      <section className="border-b border-black/5 bg-[#f4f5f7]">
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
          <h2 className="text-lg font-extrabold tracking-wide text-[#1f1f1f] md:text-xl">
            {fc.home.categoryTitle}
          </h2>
          <div className="mt-5">
            <CategoryCircleRow>
              <CategoryCircle
                label={fc.search.allCategories}
                selected={!categorySlug}
                onClick={() => selectCategory("")}
              />
              {categories.map((cat) => (
                <CategoryCircle
                  key={cat.slug}
                  label={cat.titleBn || cat.title}
                  imageUrl={cat.imageUrl}
                  selected={categorySlug === cat.slug}
                  onClick={() => selectCategory(cat.slug)}
                />
              ))}
            </CategoryCircleRow>
          </div>
        </div>
      </section>

      <section id="products" className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
                {selectedCategory ? selectedCategory.titleBn : fc.home.allProducts}
              </h2>
              <p className="mt-2 text-sm text-[#6e5449]">{fc.home.categoryHint}</p>
            </div>
            <PriceSortSelect
              value={categorySort}
              onChange={(v) => {
                setCategorySort(v);
                setPage(1);
              }}
            />
          </div>

          <div className="mt-8">
            <ProductGrid products={pageItems} />
          </div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={(n) => {
              setPage(n);
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {showNewProducts ? (
        <ProductSection
          title={fc.home.newProducts}
          subtitle={fc.home.newProductsSub}
          products={newProducts}
          sort={newSort}
          onSortChange={setNewSort}
        />
      ) : null}

      {showOffers ? (
        <ProductSection
          title={fc.home.offers}
          subtitle={fc.home.offersSub}
          products={offerProducts}
          sort={offerSort}
          onSortChange={setOfferSort}
        />
      ) : null}
    </>
  );
}
