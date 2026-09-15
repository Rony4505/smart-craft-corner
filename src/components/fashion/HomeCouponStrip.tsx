"use client";

import Link from "next/link";
import { useState } from "react";
import type { Coupon, Product } from "@/lib/fashion/types";
import { formatBdt } from "@/lib/fashion/format";
import { localeEyebrowClass } from "@/lib/fashion/locale-text-style";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { FashionModalPortal } from "./FashionModalPortal";

export function HomeCouponStrip({
  coupons,
  products = [],
}: {
  coupons: Coupon[];
  products?: Product[];
}) {
  const { locale, fc } = useFashionCopy();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  if (!coupons.length) return null;

  function couponProducts(coupon: Coupon) {
    if (!coupon.productIds?.length) return [];
    return products.filter((p) => coupon.productIds!.includes(p.id));
  }

  function discountLabel(coupon: Coupon) {
    return coupon.discountType === "percent"
      ? `${coupon.discountValue}% ${locale === "bn" ? "ছাড়" : "off"}`
      : `${formatBdt(coupon.discountValue)} ${locale === "bn" ? "ছাড়" : "off"}`;
  }

  return (
    <>
      <section
        aria-label={fc.couponLabel}
        className="rounded-[1.25rem] border border-[#e8d4e8]/60 bg-[linear-gradient(180deg,#fff8fc_0%,#faf4f0_100%)] px-4 py-5 shadow-[0_8px_32px_rgba(74,51,72,0.06)] md:px-6 md:py-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 text-center">
            <p className={localeEyebrowClass(locale, "text-[11px] font-semibold text-[#9d6b8a]")}>
              {fc.couponLabel}
            </p>
            <p className="mt-1 text-xs text-[#8a7490]">
              {locale === "bn"
                ? "চেকআউটে কোড দিয়ে ছাড় নিন"
                : "Apply at checkout for instant savings"}
            </p>
          </div>

          <div className="flex flex-wrap items-stretch justify-center gap-3 md:gap-4">
            {coupons.map((coupon) => (
              <button
                key={coupon.id}
                type="button"
                onClick={() => setSelectedCoupon(coupon)}
                className="group flex min-w-[9.5rem] max-w-[11rem] flex-1 items-center gap-3 rounded-2xl border-2 border-dashed border-[#c9a0b8]/55 bg-white px-3.5 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#9d6b8a]/70 hover:shadow-md sm:min-w-[10.5rem] sm:px-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#9d6b8a,#c9a0b8)] text-sm font-bold text-white shadow-inner">
                  {coupon.discountType === "percent" ? "%" : "৳"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm font-bold tracking-[0.12em] text-[#5c3d5e]">
                    {coupon.code}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-[#9b7766]">
                    {discountLabel(coupon)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedCoupon ? (
        <FashionModalPortal open onBackdropClick={() => setSelectedCoupon(null)}>
          <div
            className="w-full max-w-md rounded-[2rem] border border-[#e8c4b0]/60 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={localeEyebrowClass(locale, "text-xs font-semibold text-[#9b7766]")}>
                  {fc.couponDetails}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#8f624e]">
                  {selectedCoupon.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoupon(null)}
                className="rounded-full bg-[#faf4f0] px-3 py-1 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#5b4339]">
              <p>
                <span className="font-semibold">{fc.couponDiscount}: </span>
                {selectedCoupon.discountType === "percent"
                  ? `${selectedCoupon.discountValue}%`
                  : formatBdt(selectedCoupon.discountValue)}
              </p>
              {selectedCoupon.description ? <p>{selectedCoupon.description}</p> : null}
              <p>
                <span className="font-semibold">{fc.couponValidUntil}: </span>
                {selectedCoupon.expiresAt
                  ? new Date(selectedCoupon.expiresAt).toLocaleDateString(
                      locale === "bn" ? "bn-BD" : "en-BD",
                      { year: "numeric", month: "long", day: "numeric" },
                    )
                  : fc.couponNoExpiry}
              </p>
              {selectedCoupon.minOrder ? (
                <p>
                  <span className="font-semibold">{fc.couponMinOrder}: </span>
                  {formatBdt(selectedCoupon.minOrder)}
                </p>
              ) : null}
              <div>
                <p className="font-semibold">{fc.couponProducts}</p>
                {selectedCoupon.productIds?.length ? (
                  <ul className="mt-2 space-y-1">
                    {couponProducts(selectedCoupon).map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.slug}`}
                          className="text-[#8f624e] underline-offset-2 hover:underline"
                        >
                          {locale === "bn" ? p.nameBn : p.name}
                        </Link>
                      </li>
                    ))}
                    {couponProducts(selectedCoupon).length === 0 ? (
                      <li className="text-[#9b7766]">
                        {selectedCoupon.productIds.length} product(s)
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="mt-1 text-[#6f554a]">{fc.couponAllProducts}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCoupon(null)}
              className="mt-6 w-full rounded-full bg-[linear-gradient(135deg,#e8b896,#f4d4c2)] px-6 py-3 text-sm font-semibold text-[#3d2a24]"
            >
              {fc.close}
            </button>
          </div>
        </FashionModalPortal>
      ) : null}
    </>
  );
}
