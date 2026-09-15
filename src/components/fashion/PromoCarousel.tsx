"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CarouselSlide } from "@/lib/fashion/carousel-slides";

export function PromoCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  return (
    <section aria-label="Advertisement" className="bg-[#f7f2ef]">
      <div
        className="relative w-full overflow-hidden"
        onTouchStart={(e) => {
          touchStart.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) go(diff > 0 ? 1 : -1);
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <Link
              key={slide.id}
              href={slide.href}
              className="relative block aspect-[3/1] w-full max-h-[9.5rem] shrink-0 overflow-hidden bg-[#f0ebe6] sm:max-h-[11rem] md:max-h-[13rem]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.label || "Advertisement"}
                className="h-full w-full object-cover object-center"
                loading={slideIndex === index ? "eager" : "lazy"}
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(43,29,25,0.28),transparent_50%)]" />
              {slide.badge ? (
                <span className="absolute left-3 top-3 rounded-full bg-[#f4d4c2]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3d2a24] shadow-sm sm:left-4 sm:px-3 sm:text-xs">
                  {slide.badge}
                </span>
              ) : null}
              {slide.label ? (
                <p className="absolute bottom-2.5 left-3 max-w-[72%] font-[family-name:var(--font-display)] text-base font-bold leading-tight text-white drop-shadow sm:bottom-3 sm:left-4 sm:text-lg md:text-xl">
                  {slide.label}
                </p>
              ) : null}
            </Link>
          ))}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-2.5 py-2 text-sm font-bold text-[#5c3d5e] shadow-md backdrop-blur-sm sm:px-3"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-2.5 py-2 text-sm font-bold text-[#5c3d5e] shadow-md backdrop-blur-sm sm:px-3"
              aria-label="Next"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white shadow" : "w-1.5 bg-white/55"}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
