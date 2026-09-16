"use client";

import { useSearchParams } from "next/navigation";
import { CategoryCircle, CategoryCircleRow } from "@/components/fashion/CategoryCircle";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { Category } from "@/lib/fashion/types";

export function HomeCategoryShowcase({ categories }: { categories: Category[] }) {
  const { locale, fc } = useFashionCopy();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("category")?.trim() || "";

  if (!categories.length) {
    return (
      <div className="mt-8 px-1 py-4 text-center">
        <p className="text-sm text-[#7a3a5c]">
          {locale === "bn"
            ? "শীঘ্রই ক্যাটাগরি যোগ করা হবে।"
            : "Categories will appear here soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-extrabold tracking-wide text-[#8e1050] md:text-xl">
        {fc.home.categoryTitle}
      </h2>
      <div className="mt-5">
        <CategoryCircleRow>
          <CategoryCircle
            href="/#products"
            label={fc.search.allCategories}
            selected={!selectedSlug}
          />
          {categories.map((cat) => (
            <CategoryCircle
              key={cat.slug}
              href={`/?category=${encodeURIComponent(cat.slug)}#products`}
              label={locale === "en" ? cat.title || cat.titleBn : cat.titleBn || cat.title}
              imageUrl={cat.imageUrl}
              selected={selectedSlug === cat.slug}
            />
          ))}
        </CategoryCircleRow>
      </div>
    </div>
  );
}
