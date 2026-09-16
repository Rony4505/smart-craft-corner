"use client";

import Link from "next/link";
import { FashionButton } from "@/components/fashion/FashionButton";
import { FashionShell } from "@/components/fashion/FashionShell";
import { ProductImage } from "@/components/fashion/ProductImage";
import { copy } from "@/lib/fashion/copy";
import { formatBdt } from "@/lib/fashion/format";
import { useCart } from "@/lib/fashion/cart-context";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal >= 7000 || subtotal === 0 ? 0 : 120;
  const total = subtotal + shipping;

  return (
    <FashionShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold md:text-6xl">
          {copy.cart.title}
        </h1>

        {items.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-black/6 bg-white p-10 text-center shadow-[0_24px_80px_rgba(48,27,20,0.06)]">
            <p className="text-lg text-[#6f554a]">{copy.cart.empty}</p>
            <div className="mt-6">
              <FashionButton href="/collections">{copy.actions.continueShopping}</FashionButton>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="grid gap-5 rounded-[2rem] border border-black/6 bg-white p-5 shadow-[0_24px_80px_rgba(48,27,20,0.06)] md:grid-cols-[160px_1fr]"
                >
                  {item.imageUrl ? (
                    <ProductImage src={item.imageUrl} alt={item.name} className="h-32" />
                  ) : (
                    <div className={`rounded-[1.5rem] ${item.tone} min-h-32`} />
                  )}
                  <div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`} className="font-[family-name:var(--font-display)] text-2xl font-bold">
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm text-[#8b6456]">
                          সাইজ: {item.size} · রং: {item.color}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-[#8f624e]">
                        {formatBdt(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <div className="inline-flex items-center rounded-full border border-black/8 bg-[#faf4f0]">
                        <button type="button" className="px-4 py-2" onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                        <span className="min-w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <button type="button" className="px-4 py-2" onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="text-sm font-semibold text-[#8b6456]" onClick={() => removeItem(item.key)}>
                        {copy.actions.delete}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-[2rem] border border-[#f3c6dc] bg-[linear-gradient(165deg,#8e1050,#c2186b)] p-6 text-white shadow-[0_30px_90px_rgba(194,24,107,0.18)]">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">{copy.cart.summary}</h2>
              <div className="mt-6 space-y-3 text-white/78">
                <div className="flex justify-between"><span>{copy.cart.subtotal}</span><span>{formatBdt(subtotal)}</span></div>
                <div className="flex justify-between"><span>{copy.cart.shipping}</span><span>{shipping === 0 ? "Free" : formatBdt(shipping)}</span></div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-semibold text-white">
                  <span>{copy.cart.total}</span><span>{formatBdt(total)}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/60">{copy.cart.freeShipping}</p>
              <div className="mt-8 flex flex-col gap-3">
                <FashionButton href="/checkout">{copy.actions.checkout}</FashionButton>
                <FashionButton href="/collections" variant="secondary">{copy.actions.continueShopping}</FashionButton>
              </div>
            </aside>
          </div>
        )}
      </section>
    </FashionShell>
  );
}
