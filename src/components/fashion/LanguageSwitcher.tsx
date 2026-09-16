"use client";

import { cn } from "@/lib/fashion/cn";
import { useLocale } from "@/lib/i18n/locale-context";

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border border-[#e8c4b0]/60 bg-white/95 text-xs font-bold shadow-sm",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={cn(
          "px-3 py-1.5 transition",
          locale === "bn" ? "bg-[#c2186b] text-white" : "text-[#8e1050] hover:bg-[#fff5f8]",
          compact && "px-2.5 py-1",
        )}
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "px-3 py-1.5 transition",
          locale === "en" ? "bg-[#c2186b] text-white" : "text-[#8e1050] hover:bg-[#fff5f8]",
          compact && "px-2.5 py-1",
        )}
      >
        English
      </button>
    </div>
  );
}

/** Fixed top-right language control for storefront + admin */
export function TopLanguageBar() {
  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[100] sm:right-5 sm:top-4">
      <div className="pointer-events-auto">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
