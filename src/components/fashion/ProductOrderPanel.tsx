"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Product, StoreSettings } from "@/lib/fashion/types";
import { useCart } from "@/lib/fashion/cart-context";
import { getEffectivePrice } from "@/lib/fashion/pricing";
import { normalizeProductColors } from "@/lib/fashion/product-colors";
import { productDefaultSize, productShowsSizes } from "@/lib/fashion/product-sizes";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { copy } from "@/lib/fashion/copy";

function formatPhoneLink(raw?: string) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("880")
    ? digits
    : `880${digits.replace(/^0/, "")}`;
  return {
    tel: `tel:+${normalized}`,
    display: raw ?? normalized,
    wa: `https://wa.me/${normalized}`,
  };
}

export function ProductOrderPanel({ product }: { product: Product }) {
  const router = useRouter();
  const { fc, locale } = useFashionCopy();
  const { addItem } = useCart();
  const colors = useMemo(
    () => normalizeProductColors(product.colors),
    [product.colors],
  );
  const showsSizes = productShowsSizes(product);
  const [size, setSize] = useState(productDefaultSize(product));
  const [color, setColor] = useState(colors[0]?.name ?? "Default");
  const [quantity, setQuantity] = useState(1);
  const [activeProductId, setActiveProductId] = useState(product.id);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [added, setAdded] = useState(false);

  const price = getEffectivePrice(product);
  const inStock = product.stock > 0 && product.inStock;
  const title = locale === "bn" ? product.nameBn : product.name;
  const productCode =
    product.id.replace(/\D/g, "").slice(-8) || product.id.slice(-8);

  if (activeProductId !== product.id) {
    setActiveProductId(product.id);
    setSize(productDefaultSize(product));
    setColor(normalizeProductColors(product.colors)[0]?.name ?? "Default");
    setQuantity(1);
  }

  useEffect(() => {
    fetch("/api/fashion/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data.settings ?? null))
      .catch(() => setSettings(null));
    fetch(`/api/fashion/reviews?productId=${product.id}`)
      .then((r) => r.json())
      .then((data) => {
        const reviews = data.reviews ?? [];
        setReviewCount(reviews.length);
        if (!reviews.length) {
          setAvgRating(0);
          return;
        }
        const sum = reviews.reduce(
          (acc: number, r: { rating: number }) => acc + (r.rating || 0),
          0,
        );
        setAvgRating(sum / reviews.length);
      })
      .catch(() => {
        setAvgRating(0);
        setReviewCount(0);
      });
  }, [product.id]);

  const phone = useMemo(
    () =>
      formatPhoneLink(
        settings?.adminPhone || settings?.contactPhone || settings?.whatsapp,
      ),
    [settings],
  );
  const whatsapp = useMemo(
    () => formatPhoneLink(settings?.whatsapp),
    [settings],
  );

  function addToCart(redirect?: "checkout") {
    if (!inStock || quantity > product.stock) return;
    if (!color) return;
    addItem({ ...product, price }, size, color, quantity);
    if (redirect === "checkout") {
      router.push("/checkout");
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1 text-sm text-[#b8c9de]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={
              i < Math.round(avgRating) ? "text-[#f0b429]" : "text-[#4a6080]"
            }
          >
            ★
          </span>
        ))}
        <span className="ml-1 font-semibold text-white">
          {reviewCount ? `${avgRating.toFixed(2)}/5` : "0.00/5"}
        </span>
        <a href="#reviews" className="ml-2 text-[#8eb4d9] underline-offset-2 hover:text-white hover:underline">
          {fc.product.seeReviews}
        </a>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#e8c4d8,#c9a0b8)] px-4 py-2.5 text-sm font-bold text-[#3d2440]">
        {fc.product.productCode} : {productCode}
        <span className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-[linear-gradient(135deg,#c9a0b8,#b088a8)] [clip-path:polygon(100%_0,0_0,100%_100%)]" />
      </div>

      <div className="rounded-2xl border border-[#e8d4e8]/60 bg-[#f5f0f4] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#2f6b4f]">
          <span aria-hidden>✓</span>
          {inStock
            ? `${fc.product.availableStock}: ${product.stock} ${fc.product.remaining}`
            : fc.actions.outOfStock}
        </p>

        <p className="mt-4 text-sm font-bold text-[#5c3d5e]">
          {fc.product.selectVariant}
        </p>

        {showsSizes ? (
          <>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7490]">
              {fc.product.selectSize}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  className={`min-w-11 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    size === option
                      ? "border-[#5c3d5e] bg-white text-[#5c3d5e] shadow-sm"
                      : "border-[#e8d4e8]/70 bg-white/70 text-[#8a7490]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7490]">
          {fc.product.selectColor}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => setColor(option.name)}
              className={`inline-flex min-w-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                color === option.name
                  ? "border-[#5c3d5e] bg-white text-[#5c3d5e] shadow-sm"
                  : "border-[#e8d4e8]/70 bg-white/70 text-[#8a7490]"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border border-black/15 shadow-inner"
                style={{ backgroundColor: option.hex }}
                aria-hidden
              />
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-[#e8eef7]">
        <span className="font-bold text-[#8eb4d9]">{fc.product.brand} :</span>{" "}
        <span className="font-semibold text-white">
          {settings?.brandName ?? copy.brand}
        </span>
      </p>

      <div>
        <div className="inline-flex items-center rounded-lg border border-[#c5d4e8]/50 bg-white text-[#4a3348] shadow-sm">
          <button
            type="button"
            className="px-4 py-2 text-lg font-bold text-[#4a3348]"
            onClick={() => setQuantity((v) => Math.max(1, v - 1))}
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm font-bold text-[#4a3348]">
            {quantity}
          </span>
          <button
            type="button"
            className="px-4 py-2 text-lg font-bold text-[#4a3348] disabled:opacity-40"
            onClick={() => setQuantity((v) => Math.min(product.stock, v + 1))}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!inStock || !color}
          onClick={() => addToCart()}
          className="rounded-xl bg-[linear-gradient(135deg,#9d6b8a,#c9a0b8)] px-4 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50"
        >
          {added ? fc.actions.addedToCart : fc.actions.addToCart}
        </button>
        <button
          type="button"
          disabled={!inStock || !color}
          onClick={() => addToCart("checkout")}
          className="rounded-xl bg-[#2b1d19] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {fc.product.buyNow}
        </button>
      </div>

      {phone ? (
        <a
          href={phone.tel}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#5c3d5e] px-4 py-3 text-sm font-bold text-white"
        >
          📞 {phone.display}
        </a>
      ) : null}

      {whatsapp ? (
        <a
          href={`${whatsapp.wa}?text=${encodeURIComponent(`${title} — ${fc.product.askAbout}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#8eb4d9] bg-white px-4 py-3 text-sm font-bold !text-[#0a1628] shadow-sm transition hover:bg-[#e8eef7]"
        >
          💬 {fc.product.askAbout}
        </a>
      ) : null}
    </div>
  );
}
