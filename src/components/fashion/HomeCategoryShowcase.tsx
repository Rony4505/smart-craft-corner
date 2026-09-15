"use client";

import Link from "next/link";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { Category } from "@/lib/fashion/types";

export function HomeCategoryShowcase({ categories }: { categories: Category[] }) {
  const { locale, fc } = useFashionCopy();

  if (!categories.length) {
    return (
      <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/8 px-5 py-8 text-center backdrop-blur-sm">
        <p className="text-sm text-[#c5d4e8]">
          {locale === "bn"
            ? "শীঘ্রই ক্যাটাগরি যোগ করা হবে।"
            : "Categories will appear here soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#c5d4e8]/80">
        {fc.home.categoryTitle}
      </p>
      <h2 className="mt-2 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">
        {locale === "bn" ? "আপনার পছন্দ বেছে নিন" : "Browse by category"}
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, index) => {
          const label = locale === "en" ? cat.title || cat.titleBn : cat.titleBn || cat.title;
          return (
            <Link
              key={cat.slug}
              href={`/?category=${encodeURIComponent(cat.slug)}#products`}
              className="group relative overflow-hidden rounded-[1.35rem] border border-white/18 bg-white/10 px-5 py-5 shadow-[0_12px_40px_rgba(8,20,40,0.25)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/16"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl"
                style={{ background: cat.accent || "#c9a0b8" }}
              />
              <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-display)] text-lg font-bold text-white">
                    {label}
                  </p>
                  {cat.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#c5d4e8]/90">
                      {cat.subtitle}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-[#c5d4e8]/80">
                      {locale === "bn" ? "প্রোডাক্ট দেখুন →" : "View products →"}
                    </p>
                  )}
                </div>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                  style={{ background: cat.accent || "#9d6b8a" }}
                >
                  {index + 1}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-[#b8c9de]/75">{fc.home.categoryHint}</p>
    </div>
  );
}
