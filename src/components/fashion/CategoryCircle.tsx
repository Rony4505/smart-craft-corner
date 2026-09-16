import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/fashion/cn";

type CategoryCircleProps = {
  label: string;
  imageUrl?: string;
  selected?: boolean;
  href?: string;
  onClick?: () => void;
};

function CircleFace({
  label,
  imageUrl,
  selected,
}: {
  label: string;
  imageUrl?: string;
  selected?: boolean;
}) {
  const initial = label.trim().charAt(0) || "•";

  return (
    <>
      <span
        className={cn(
          "relative block h-[5.35rem] w-[5.35rem] overflow-hidden rounded-full bg-[#fde8f2] shadow-[0_8px_22px_rgba(194,24,107,0.16)] ring-[3px] md:h-[6.25rem] md:w-[6.25rem]",
          selected ? "ring-[#c2186b]" : "ring-[#f8d0e4]",
        )}
      >
        {imageUrl ? (
          // Uploaded/admin URLs can be local API paths or remote hosts.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#f7d4c4,#e8a88c)] text-2xl font-bold text-[#4a2f28]">
            {initial}
          </span>
        )}
      </span>
      <span
        className={cn(
          "mt-2 line-clamp-2 min-h-[2.4rem] w-[5.5rem] text-center text-[13px] font-semibold leading-tight text-[#2b2b2b] md:w-24 md:text-sm",
          selected && "text-[#241815]",
        )}
      >
        {label}
      </span>
    </>
  );
}

export function CategoryCircle({ label, imageUrl, selected, href, onClick }: CategoryCircleProps) {
  const className =
    "flex shrink-0 flex-col items-center rounded-2xl px-1 py-1 outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#c45a7a]/40";

  if (href) {
    return (
      <Link href={href} className={className}>
        <CircleFace label={label} imageUrl={imageUrl} selected={selected} />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <CircleFace label={label} imageUrl={imageUrl} selected={selected} />
    </button>
  );
}

export function CategoryCircleRow({ children }: { children: ReactNode }) {
  return (
    <div className="category-scroll -mx-1 flex gap-4 overflow-x-auto px-1 pb-2 pt-1 md:gap-6">
      {children}
    </div>
  );
}
