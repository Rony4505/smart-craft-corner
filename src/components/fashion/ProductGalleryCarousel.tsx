"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProductImages } from "@/lib/fashion/product-images";
import type { Product } from "@/lib/fashion/types";
import { ProductImage } from "./ProductImage";

const AUTO_SCROLL_MS = 2500;
const SLIDE_TRANSITION_MS = 700;

function SlideDots({
  count,
  index,
  onSelect,
  compact,
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5"
          : "flex justify-center gap-1.5 border-t border-black/5 bg-white/80 py-2"
      }
    >
      {Array.from({ length: count }, (_, imageIndex) => (
        <button
          key={imageIndex}
          type="button"
          aria-label={`Image ${imageIndex + 1}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect(imageIndex);
          }}
          className={`rounded-full transition-all ${
            imageIndex === index
              ? compact
                ? "h-1.5 w-3 bg-[#9d6b8a]"
                : "h-2 w-5 bg-[#9d6b8a]"
              : compact
                ? "h-1.5 w-1.5 bg-white/80"
                : "h-2 w-2 bg-[#c9a890]"
          }`}
        />
      ))}
    </div>
  );
}

function ImageSlides({
  images,
  alt,
  index,
  onIndexChange,
  className,
  showArrows,
  compactArrows,
  onImageClick,
  onSwipe,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (next: number) => void;
  className?: string;
  showArrows?: boolean;
  compactArrows?: boolean;
  onImageClick?: () => void;
  onSwipe?: (delta: number) => void;
}) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${onImageClick ? "cursor-zoom-in" : ""} ${className ?? ""}`}
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStartX === null || !onSwipe) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        if (Math.abs(delta) > 40) onSwipe(delta < 0 ? 1 : -1);
        setTouchStartX(null);
      }}
      onClick={onImageClick}
    >
      <div
        className="flex h-full w-full ease-in-out will-change-transform"
        style={{
          transition: `transform ${SLIDE_TRANSITION_MS}ms ease-in-out`,
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {images.map((src, imageIndex) => (
          <div key={`${src}-${imageIndex}`} className="h-full min-w-full flex-[0_0_100%] shrink-0">
            <ProductImage
              src={src}
              alt={`${alt} ${imageIndex + 1}`}
              className="h-full rounded-none"
              priority={imageIndex === 0}
            />
          </div>
        ))}
      </div>

      {showArrows && images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className={
              compactArrows
                ? "absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1 text-sm shadow-md opacity-100 transition sm:opacity-0 sm:group-hover/card-gallery:opacity-100"
                : "absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg shadow-md"
            }
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onIndexChange(Math.max(0, index - 1));
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            className={
              compactArrows
                ? "absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1 text-sm shadow-md opacity-100 transition sm:opacity-0 sm:group-hover/card-gallery:opacity-100"
                : "absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg shadow-md"
            }
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onIndexChange(Math.min(images.length - 1, index + 1));
            }}
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}

function ThumbnailStrip({
  images,
  alt,
  selectedIndex,
  onSelect,
}: {
  images: string[];
  alt: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (images.length <= 1) return null;

  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-black/5 bg-white/95 p-2 sm:p-3">
      {images.map((src, imageIndex) => (
        <button
          key={`${src}-${imageIndex}`}
          type="button"
          aria-label={`View image ${imageIndex + 1}`}
          aria-current={imageIndex === selectedIndex ? "true" : undefined}
          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-16 ${
            imageIndex === selectedIndex
              ? "border-[#9d6b8a] ring-2 ring-[#9d6b8a]/30"
              : "border-[#e8c4b0]/60 hover:border-[#9d6b8a]"
          }`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect(imageIndex);
          }}
        >
          <ProductImage src={src} alt={`${alt} ${imageIndex + 1}`} className="h-full w-full rounded-lg" />
        </button>
      ))}
    </div>
  );
}

function useAutoGallery(images: string[], intervalMs: number, enabled: boolean, pingPong = false) {
  const [index, setIndex] = useState(0);
  const directionRef = useRef(1);
  const imagesKey = images.join("|");

  useEffect(() => {
    setIndex(0);
    directionRef.current = 1;
  }, [imagesKey]);

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => {
        if (!images.length) return 0;
        return (current + delta + images.length) % images.length;
      });
      directionRef.current = delta >= 0 ? 1 : -1;
    },
    [images.length],
  );

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      directionRef.current = next >= current ? 1 : -1;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled || images.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((current) => {
        const last = images.length - 1;
        if (!pingPong || last === 0) {
          return (current + 1) % images.length;
        }

        let next = current + directionRef.current;
        if (next >= last) {
          directionRef.current = -1;
          next = last;
        } else if (next <= 0) {
          directionRef.current = 1;
          next = 0;
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [enabled, images.length, imagesKey, intervalMs, pingPong]);

  return { index, setIndex: goTo, step };
}

/** Product page: one main image with smaller thumbnails below (no auto ping-pong). */
export function ProductGalleryCarousel({
  images,
  alt,
  className = "h-[34rem]",
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images.join("|")]);

  if (!images.length) {
    return <ProductImage src="" alt={alt} className={className} priority />;
  }

  if (images.length === 1) {
    return (
      <>
        <button type="button" className="block w-full" onClick={() => setLightbox(true)}>
          <ProductImage src={images[0]} alt={alt} className={className} priority />
        </button>
        {lightbox ? (
          <LightboxViewer images={images} alt={alt} startIndex={0} onClose={() => setLightbox(false)} />
        ) : null}
      </>
    );
  }

  const mainSrc = images[selectedIndex] ?? images[0];

  return (
    <>
      <div
        className={`flex flex-col overflow-hidden rounded-[2rem] border border-black/6 bg-[#faf4f0] ${className}`}
      >
        <button
          type="button"
          className="relative min-h-0 flex-1 cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <ProductImage
            key={mainSrc}
            src={mainSrc}
            alt={`${alt} ${selectedIndex + 1}`}
            className="h-full rounded-none"
            priority={selectedIndex === 0}
          />
        </button>
        <ThumbnailStrip
          images={images}
          alt={alt}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </div>
      {lightbox ? (
        <LightboxViewer
          images={images}
          alt={alt}
          startIndex={selectedIndex}
          onClose={() => setLightbox(false)}
        />
      ) : null}
    </>
  );
}

/** Home page cards: auto ping-pong only — click card to open product page. */
export function ProductCardGallery({
  product,
  alt,
  className = "h-40 sm:h-56 md:h-72",
}: {
  product: Pick<Product, "imageUrl" | "imageUrls">;
  alt: string;
  className?: string;
}) {
  const images = useMemo(
    () => getProductImages(product),
    [product.imageUrl, product.imageUrls?.join("|")],
  );
  const { index } = useAutoGallery(images, AUTO_SCROLL_MS, images.length > 1, true);

  if (images.length <= 1) {
    return <ProductImage src={images[0] ?? ""} alt={alt} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden rounded-none ${className}`}>
      <ImageSlides images={images} alt={alt} index={index} onIndexChange={() => {}} className="h-full" />
    </div>
  );
}

function LightboxViewer({
  images,
  alt,
  startIndex,
  onClose,
}: {
  images: string[];
  alt: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((i) => Math.min(images.length - 1, i + 1));
      if (event.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/88 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-[610] rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white"
        onClick={onClose}
      >
        বন্ধ
      </button>
      <div
        className="relative h-[min(85vh,760px)] w-full max-w-4xl overflow-hidden rounded-[1.5rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <ImageSlides
          images={images}
          alt={alt}
          index={index}
          onIndexChange={setIndex}
          className="h-full"
          showArrows
          onSwipe={(delta) =>
            setIndex((i) => Math.max(0, Math.min(images.length - 1, i + delta)))
          }
        />
        <SlideDots count={images.length} index={index} onSelect={setIndex} compact />
      </div>
    </div>
  );
}
