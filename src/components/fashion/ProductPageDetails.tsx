"use client";

import Link from "next/link";
import { ProductOrderPanel } from "@/components/fashion/ProductOrderPanel";
import { formatBdt } from "@/lib/fashion/format";
import { getEffectivePrice } from "@/lib/fashion/pricing";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { Product } from "@/lib/fashion/types";

export function ProductPageDetails({
  product,
  categoryTitle,
}: {
  product: Product;
  categoryTitle?: string;
}) {
  const { locale, fc } = useFashionCopy();
  const price = getEffectivePrice(product);
  const originalPrice = product.offerActive ? product.price : product.compareAtPrice;
  const title = locale === "bn" ? product.nameBn : product.name;
  const description = locale === "bn" ? product.descriptionBn : product.description;

  return (
    <div>
      <nav className="text-sm text-[#8a7490]">
        <Link href="/" className="hover:text-[#5c3d5e]">
          {fc.product.home}
        </Link>
        {categoryTitle ? (
          <>
            {" / "}
            <Link href={`/collections/${product.categorySlug}`} className="hover:text-[#5c3d5e]">
              {categoryTitle}
            </Link>
          </>
        ) : null}
      </nav>

      {product.offerActive && product.offerLabel ? (
        <span className="mt-3 inline-flex rounded-full bg-[linear-gradient(135deg,#2b1d19,#8b6456)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d4c2]">
          {product.offerLabel} · {product.offerDiscountPercent}%
          {locale === "bn" ? " ছাড়" : " off"}
        </span>
      ) : product.label ? (
        <span className="mt-3 inline-flex rounded-full bg-[#f4e6dd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8d6657]">
          {product.label}
        </span>
      ) : null}

      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#e8eef7] md:text-4xl">
        {title}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <p className="text-3xl font-bold text-[#8f624e]">{formatBdt(price)}</p>
        {originalPrice ? (
          <p className="text-sm text-[#a0897d] line-through">{formatBdt(originalPrice)}</p>
        ) : null}
      </div>

      <div className="mt-6">
        <ProductOrderPanel product={product} />
      </div>

      <p className="mt-8 text-base leading-8 text-[#b8c9de]">{description}</p>
      <p className="mt-3 text-sm text-[#8eb4d9]">{product.fabric}</p>
    </div>
  );
}
