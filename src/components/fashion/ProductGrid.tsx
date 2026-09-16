"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/fashion/types";
import { clampProductImageScrollSeconds } from "@/lib/fashion/product-display";
import { ProductCard } from "./ProductCard";
import { ProductGridTitle } from "./ProductGridTitle";

export function ProductGrid({
  products,
  showRelatedTitle,
  imageScrollSeconds,
}: {
  products: Product[];
  showRelatedTitle?: boolean;
  imageScrollSeconds?: number;
}) {
  const [seconds, setSeconds] = useState(imageScrollSeconds ?? 2);

  useEffect(() => {
    if (imageScrollSeconds != null) {
      setSeconds(clampProductImageScrollSeconds(imageScrollSeconds));
      return;
    }
    fetch("/api/fashion/settings")
      .then((r) => r.json())
      .then((data) => {
        setSeconds(clampProductImageScrollSeconds(data.settings?.productImageScrollSeconds));
      })
      .catch(() => undefined);
  }, [imageScrollSeconds]);

  if (products.length === 0) {
    return (
      <div className="rounded-[2rem] border border-black/6 bg-white p-10 text-center text-[#6f554a]">
        <ProductGridTitle kind="empty" />
      </div>
    );
  }

  return (
    <div>
      {showRelatedTitle ? (
        <div className="mb-8">
          <ProductGridTitle kind="related" />
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            imageScrollSeconds={seconds}
            revealIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
