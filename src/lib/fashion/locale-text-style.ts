import { cn } from "@/lib/fashion/cn";
import type { FashionLocale } from "@/lib/fashion/i18n";

/** Text on blush / light page background */
export const fashionDarkPageClass = "text-[#4a1235]";

/** Text on white / light cards */
export const fashionLightSurfaceClass = "text-[#4a1235]";

/** Eyebrow / section labels: wide tracking breaks Bengali conjuncts — English only. */
export function localeEyebrowClass(
  locale: FashionLocale,
  base = "text-sm font-medium text-[#c2186b]",
) {
  return cn(base, locale === "en" && "uppercase tracking-[0.28em]");
}

/** Eyebrow on magenta / branded backgrounds */
export function localeEyebrowOnDarkClass(locale: FashionLocale) {
  return localeEyebrowClass(locale, "text-sm font-medium text-[#c2186b]");
}
