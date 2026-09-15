import { cn } from "@/lib/fashion/cn";
import type { FashionLocale } from "@/lib/fashion/i18n";

/** Text on dark navy page background */
export const fashionDarkPageClass = "text-[#e8eef7]";

/** Text on white / light cards */
export const fashionLightSurfaceClass = "text-[#4a3348]";

/** Eyebrow / section labels: wide tracking breaks Bengali conjuncts — English only. */
export function localeEyebrowClass(
  locale: FashionLocale,
  base = "text-sm font-medium text-[#9b7766]",
) {
  return cn(base, locale === "en" && "uppercase tracking-[0.28em]");
}

/** Eyebrow on dark navy backgrounds */
export function localeEyebrowOnDarkClass(locale: FashionLocale) {
  return localeEyebrowClass(locale, "text-sm font-medium text-[#8eb4d9]");
}
