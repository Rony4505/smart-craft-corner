"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/fashion/ProductGrid";
import { VisibleSelect } from "@/components/fashion/VisibleSelect";
import { getEffectivePrice } from "@/lib/fashion/pricing";
import { sortProductsByDisplayPriority } from "@/lib/fashion/product-sort";
import { localeEyebrowClass } from "@/lib/fashion/locale-text-style";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { filterProductsByCategory } from "@/lib/fashion/category-match";
import { showHomeMixSections } from "@/lib/fashion/product-display";
import type { Category, Product } from "@/lib/fashion/types";

type PriceSort = "default" | "price-asc" | "price-desc";
const PAGE_SIZE = 20;

function sortProducts(products: Product[], sort: PriceSort): Product[] {
  if (sort === "default") return sortProductsByDisplayPriority(products);
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
              ? "bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white"
              : "border border-[#f3c6dc] bg-white text-[#8e1050] hover:bg-[#fff5f8]"
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
  products,
  sort,
  onSortChange,
  locale,
  sectionId,
  imageScrollSeconds,
}: {
  title: string;
  products: Product[];
  sort: PriceSort;
  onSortChange: (value: PriceSort) => void;
  locale: "bn" | "en";
  sectionId?: string;
  imageScrollSeconds?: number;
}) {
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (!products.length) return null;

  return (
    <section id={sectionId} className="border-b border-black/5 bg-white text-[#4a3348]">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={localeEyebrowClass(locale)}>{title}</p>
          </div>
          <PriceSortSelect value={sort} onChange={onSortChange} />
        </div>
        <div className="mt-8">
          <ProductGrid products={pageItems} imageScrollSeconds={imageScrollSeconds} />
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
  imageScrollSeconds = 2,
}: {
  categories: Category[];
  products: Product[];
  newProducts: Product[];
  offerProducts: Product[];
  showNewProducts?: boolean;
  showOffers?: boolean;
  imageScrollSeconds?: number;
}) {
  const { fc, locale } = useFashionCopy();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category")?.trim() || "";
  const [categorySort, setCategorySort] = useState<PriceSort>("default");
  const [offerSort, setOfferSort] = useState<PriceSort>("default");
  const [newSort, setNewSort] = useState<PriceSort>("default");
  const [pageState, setPageState] = useState({ slug: categorySlug, page: 1 });
  if (pageState.slug !== categorySlug) {
    setPageState({ slug: categorySlug, page: 1 });
  }
  const page = pageState.page;
  const setPage = (next: number) => setPageState({ slug: categorySlug, page: next });

  const mix = showHomeMixSections(categorySlug);
  const visibleOffers = mix && showOffers ? offerProducts : [];
  const visibleNewProducts = mix && showNewProducts ? newProducts : [];

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
      {visibleOffers.length > 0 ? (
        <ProductSection
          title={fc.home.offers}
          products={visibleOffers}
          sort={offerSort}
          onSortChange={setOfferSort}
          locale={locale}
          sectionId="offers"
          imageScrollSeconds={imageScrollSeconds}
        />
      ) : null}

      {visibleNewProducts.length > 0 ? (
        <ProductSection
          title={fc.home.newProducts}
          products={visibleNewProducts}
          sort={newSort}
          onSortChange={setNewSort}
          locale={locale}
          sectionId="new"
          imageScrollSeconds={imageScrollSeconds}
        />
      ) : null}

      <section id="products" className="border-b border-black/5 bg-[#f3f1ef] text-[#4a3348]">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
                {selectedCategory
                  ? selectedCategory.titleBn || selectedCategory.title
                  : fc.home.allProducts}
              </h2>
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
            <ProductGrid products={pageItems} imageScrollSeconds={imageScrollSeconds} />
          </div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={(n) => {
              setPage(n);
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>
      </section>
    </>
  );
}
