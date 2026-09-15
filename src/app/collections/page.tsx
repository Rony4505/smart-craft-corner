import type { Metadata } from "next";
import Link from "next/link";
import { FashionShell } from "@/components/fashion/FashionShell";
import { getCategories } from "@/lib/fashion/categories-server";
import { filterProductsByCategory } from "@/lib/fashion/category-match";
import { listProducts } from "@/lib/fashion/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "কালেকশন",
  description: "Noorzaa-এর সব লাক্সারি কালেকশন দেখুন।",
};

export default async function CollectionsPage() {
  const [products, categoryList] = await Promise.all([listProducts(), getCategories()]);

  return (
    <FashionShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold text-white md:text-6xl">
            সব কালেকশন
          </h1>
          <p className="mt-4 text-base leading-8 text-[#b8c9de]">
            হিজাব, নোজ নিকাব, ব্যাগ—সব এডিট এক জায়গায়।
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {categoryList.map((category) => {
            const count = filterProductsByCategory(products, category.slug, categoryList).length;
            return (
              <Link
                key={category.slug}
                href={`/collections/${category.slug}`}
                className={`rounded-[2rem] border border-black/6 bg-gradient-to-br ${category.accent} p-8 text-[#4a3348] shadow-[0_24px_80px_rgba(48,27,20,0.06)] transition hover:-translate-y-1`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8d6557]">
                  {count} পিস
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold">
                  {category.titleBn}
                </h2>
                <p className="mt-3 text-base leading-8 text-[#694f45]">{category.subtitle}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </FashionShell>
  );
}
