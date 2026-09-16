"use client";

import Link from "next/link";
import type { Product } from "@/lib/fashion/types";
import { formatBdt } from "@/lib/fashion/format";
import { getEffectivePrice } from "@/lib/fashion/pricing";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const { locale } = useFashionCopy();
  const price = getEffectivePrice(product);
  const showStrike = product.offerActive || product.compareAtPrice;
  const strikePrice = product.offerActive ? product.price : product.compareAtPrice;
  const title = locale === "bn" ? product.nameBn : product.name;
  const subtitle = locale === "bn" ? product.name : product.nameBn;
  const description = locale === "bn" ? product.descriptionBn : product.description;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(48,27,20,0.06)] transition hover:-translate-y-1">
      <Link href={`/products/${product.slug}`} className="block">
        <div className={`relative ${product.tone}`}>
          <ProductImage src={product.imageUrl} alt={title} className="h-72 rounded-none" />
          {(product.offerActive ? product.offerLabel : product.label) ? (
            <div className="absolute right-5 top-5 rounded-full bg-[linear-gradient(135deg,#c2186b,#e91e8c)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              {product.offerActive ? product.offerLabel ?? "অফার" : product.label}
            </div>
          ) : null}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">{title}</h3>
              <p className="mt-1 text-sm text-[#8b6456]">{subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-semibold text-[#8f624e]">
                {formatBdt(price)}
              </p>
              {showStrike && strikePrice ? (
                <p className="text-xs text-[#a0897d] line-through">
                  {formatBdt(strikePrice)}
                </p>
              ) : null}
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6c5247]">{description}</p>
        </div>
      </Link>
    </article>
  );
}
