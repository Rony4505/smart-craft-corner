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
      <div className="mt-8 rounded-[1.5rem] border border-[#f3c6dc] bg-white/80 px-5 py-8 text-center">
        <p className="text-sm text-[#7a3a5c]">
          {locale === "bn"
            ? "শীঘ্রই ক্যাটাগরি যোগ করা হবে।"
            : "Categories will appear here soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[1.5rem] bg-[#f4f5f7] px-4 py-6 shadow-[0_12px_40px_rgba(8,20,40,0.18)] md:px-6 md:py-8">
      <h2 className="text-lg font-extrabold tracking-wide text-[#1f1f1f] md:text-xl">
        {fc.home.categoryTitle}
      </h2>
      <div className="mt-5">
        <CategoryCircleRow>
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
