"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/fashion/copy";
import type { Product } from "@/lib/fashion/types";

type PopupData = {
  offers: Product[];
  newProducts: Product[];
};

export function SiteEntryPopup() {
  const [data, setData] = useState<PopupData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("scc_popup_seen");
    if (seen) return;

    fetch("/api/fashion/storefront")
      .then((r) => r.json())
      .then((payload) => {
        const offers = payload.offers ?? [];
        const newProducts = payload.newProducts ?? [];
        if (offers.length || newProducts.length) {
          setData({ offers, newProducts });
          setOpen(true);
          sessionStorage.setItem("scc_popup_seen", "1");
        }
      })
      .catch(() => undefined);
  }, []);

  if (!open || !data) return null;

  const items = [...data.offers, ...data.newProducts].slice(0, 4);

  return (
    <div className="fixed inset-0 z-[560] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#d4b896]/30 bg-[linear-gradient(165deg,#fffaf7,#f5e8dc)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9b7766]">
              {copy.brand}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#2b1d19]">
              {copy.offers.popupTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-[#2b1d19]/8 px-3 py-1 text-sm font-semibold text-[#5b4339]"
          >
            {copy.actions.close}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 rounded-2xl border border-black/6 bg-white/80 p-3 transition hover:bg-white"
            >
              <div
                className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${product.imageUrl})` }}
              />
              <div>
                <p className="font-semibold text-[#2b1d19]">{product.nameBn}</p>
                {product.offerActive ? (
                  <p className="text-sm text-[#8f624e]">
                    {product.offerLabel ?? "অফার"} · {product.offerDiscountPercent}% ছাড়
                  </p>
                ) : (
                  <p className="text-sm text-[#8b6456]">নতুন প্রোডাক্ট</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
