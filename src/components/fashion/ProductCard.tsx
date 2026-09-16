"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/fashion/types";
import { formatBdt } from "@/lib/fashion/format";
import { getEffectivePrice } from "@/lib/fashion/pricing";
import { getProductImages } from "@/lib/fashion/product-images";
import { clampProductImageScrollSeconds } from "@/lib/fashion/product-display";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { ProductImage } from "./ProductImage";
import { cn } from "@/lib/fashion/cn";

function ProductCardGallery({
  product,
  alt,
  seconds,
}: {
  product: Product;
  alt: string;
  seconds: number;
}) {
  const images = getProductImages(product);
  const urls = images.length ? images : [product.imageUrl].filter(Boolean);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (urls.length < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % urls.length);
    }, clampProductImageScrollSeconds(seconds) * 1000);
    return () => window.clearInterval(id);
  }, [urls.length, seconds, paused]);

  if (!urls.length) {
    return <div className={cn("relative", product.tone, "h-44 sm:h-60 md:h-72")} />;
  }

  return (
    <div
      className={cn("relative h-44 overflow-hidden sm:h-60 md:h-72", product.tone)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {urls.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          <ProductImage src={url} alt={alt} className="h-full rounded-none" />
        </div>
      ))}
      {urls.length > 1 ? (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
          {urls.map((url, i) => (
            <span
              key={`${url}-dot-${i}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductCard({
  product,
  imageScrollSeconds = 2,
  revealIndex = 0,
}: {
  product: Product;
  imageScrollSeconds?: number;
  revealIndex?: number;
}) {
  const { locale } = useFashionCopy();
  const price = getEffectivePrice(product);
  const showStrike = product.offerActive || product.compareAtPrice;
  const strikePrice = product.offerActive ? product.price : product.compareAtPrice;
  const title = locale === "bn" ? product.nameBn : product.name;
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "48px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      style={{ transitionDelay: `${(revealIndex % 8) * 70}ms` }}
      className={cn(
        "product-reveal group overflow-hidden rounded-[1.35rem] border border-black/5 bg-white shadow-[0_16px_50px_rgba(48,27,20,0.06)] sm:rounded-[2rem]",
        visible && "is-in",
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative">
          <ProductCardGallery product={product} alt={title} seconds={imageScrollSeconds} />
          {(product.offerActive ? product.offerLabel : product.label) ? (
            <div className="absolute right-3 top-3 rounded-full bg-[linear-gradient(135deg,#c2186b,#e91e8c)] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:right-5 sm:top-5 sm:px-3 sm:py-1 sm:text-xs">
              {product.offerActive ? product.offerLabel ?? "অফার" : product.label}
            </div>
          ) : null}
        </div>
        <div className="p-3 sm:p-6">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <h3 className="font-[family-name:var(--font-display)] text-base font-bold leading-snug sm:text-2xl">
              {title}
            </h3>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-[#c2186b] sm:text-base">
                {formatBdt(price)}
              </p>
              {showStrike && strikePrice ? (
                <p className="text-[11px] text-[#a0897d] line-through sm:text-xs">
                  {formatBdt(strikePrice)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
