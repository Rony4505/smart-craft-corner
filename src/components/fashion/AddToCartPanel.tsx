"use client";

import { useState } from "react";
import type { Product } from "@/lib/fashion/types";
import { useCart } from "@/lib/fashion/cart-context";
import { getEffectivePrice } from "@/lib/fashion/pricing";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { FashionButton } from "./FashionButton";

export function AddToCartPanel({ product }: { product: Product }) {
  const { fc } = useFashionCopy();
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "Free Size");
  const [color, setColor] = useState(product.colors[0]?.name ?? "Default");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const maxQty = product.stock;
  const inStock = product.stock > 0 && product.inStock;
  const price = getEffectivePrice(product);

  function handleAdd() {
    if (!inStock || quantity > maxQty) return;
    addItem({ ...product, price }, size, color, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_24px_80px_rgba(48,27,20,0.06)]">
      {!inStock ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {fc.actions.outOfStock}
        </p>
      ) : null}

      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#9b7766]">{fc.actions.size}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                size === option
                  ? "bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white"
                  : "border border-[#f3c6dc] bg-[#fff5f8] text-[#8e1050]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#9b7766]">{fc.actions.color}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => setColor(option.name)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                color === option.name
                  ? "bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white"
                  : "border border-[#f3c6dc] bg-[#fff5f8] text-[#8e1050]"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ backgroundColor: option.hex }}
              />
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#9b7766]">
          {fc.actions.quantity} ({fc.home.stock}: {maxQty})
        </p>
        <div className="mt-3 inline-flex items-center rounded-full border border-black/8 bg-[#faf4f0]">
          <button
            type="button"
            className="px-4 py-2 text-lg"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            className="px-4 py-2 text-lg"
            onClick={() => setQuantity((value) => Math.min(maxQty, value + 1))}
            disabled={quantity >= maxQty}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <FashionButton onClick={handleAdd} disabled={!inStock || quantity > maxQty}>
          {added ? fc.actions.addedToCart : fc.actions.addToCart}
        </FashionButton>
        <FashionButton href="/cart" variant="secondary">
          {fc.actions.viewCart}
        </FashionButton>
      </div>
    </div>
  );
}
