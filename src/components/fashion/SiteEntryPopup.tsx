"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/fashion/copy";
import type { Product } from "@/lib/fashion/types";

export function SiteEntryPopup({ offers }: { offers?: Product[] }) {
  const [activeOffers, setActiveOffers] = useState<Product[]>(offers ?? []);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveOffers() {
      if (offers) {
        if (!cancelled) setActiveOffers(offers);
        return;
      }
      try {
        const response = await fetch("/api/fashion/storefront", { cache: "no-store" });
        const payload = (await response.json()) as { offers?: Product[] };
        if (!cancelled) setActiveOffers(payload.offers ?? []);
      } catch {
        if (!cancelled) setActiveOffers([]);
      }
    }

    void resolveOffers();
    return () => {
      cancelled = true;
    };
  }, [offers]);

  useEffect(() => {
    if (!activeOffers.length) return;
    const seen = sessionStorage.getItem("scc_popup_seen");
    if (seen) return;
    setOpen(true);
    sessionStorage.setItem("scc_popup_seen", "1");
  }, [activeOffers]);

  if (!open || !activeOffers.length) return null;

  const items = activeOffers.slice(0, 4);

  return (
    <div className="fixed inset-0 z-[560] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#f3c6dc] bg-[linear-gradient(165deg,#fff7fa,#fce8f1)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c2186b]">
              {copy.brand}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#8e1050]">
              {copy.offers.banner}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-[#c2186b]/10 px-3 py-1 text-sm font-semibold text-[#8e1050]"
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
                <p className="font-semibold text-[#4a1235]">{product.nameBn}</p>
                <p className="text-sm text-[#c2186b]">
                  {product.offerLabel ?? "অফার"}
                  {product.offerDiscountPercent ? ` · ${product.offerDiscountPercent}% ছাড়` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
