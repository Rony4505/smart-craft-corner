import type { Metadata } from "next";
import { CategoryCircle, CategoryCircleRow } from "@/components/fashion/CategoryCircle";
import { FashionShell } from "@/components/fashion/FashionShell";
import { getCategories } from "@/lib/fashion/categories-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "কালেকশন",
  description: "Noorzaa-এর সব লাক্সারি কালেকশন দেখুন।",
};

export default async function CollectionsPage() {
  const categoryList = await getCategories();

  return (
    <FashionShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold text-[#4a1235] md:text-6xl">
            সব কালেকশন
          </h1>
        </div>

        <div className="mt-10">
          <h2 className="mb-5 text-lg font-extrabold tracking-wide text-[#8e1050]">টপ ক্যাটাগরি</h2>
          <CategoryCircleRow>
            {categoryList.map((category) => (
              <CategoryCircle
                key={category.slug}
                href={`/collections/${category.slug}`}
                label={category.titleBn || category.title}
                imageUrl={category.imageUrl}
              />
            ))}
          </CategoryCircleRow>
        </div>
      </section>
    </FashionShell>
  );
}
