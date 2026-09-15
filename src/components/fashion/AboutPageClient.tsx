"use client";

import { localeEyebrowOnDarkClass } from "@/lib/fashion/locale-text-style";
import { tSetting } from "@/lib/fashion/locale-settings";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { StoreSettings } from "@/lib/fashion/types";

export function AboutPageClient({ settings }: { settings: StoreSettings }) {
  const { locale } = useFashionCopy();
  const pillars =
    locale === "en"
      ? settings.aboutPillarsEn?.length
        ? settings.aboutPillarsEn
        : settings.aboutPillars ?? []
      : settings.aboutPillars ?? [];

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 text-[#e8eef7] md:px-8 md:py-20">
      <div className="max-w-3xl">
        <p className={localeEyebrowOnDarkClass(locale)}>
          {tSetting(settings, "aboutSubtitle", "aboutSubtitleEn", locale, "Our story")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold text-white md:text-6xl">
          {tSetting(
            settings,
            "aboutTitle",
            "aboutTitleEn",
            locale,
            "Luxury that feels natural for Bangladeshi women",
          )}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#b8c9de]">
          {tSetting(settings, "aboutText", "aboutTextEn", locale, "")}
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-[2rem] border border-black/6 bg-white p-7 text-[#4a3348] shadow-[0_24px_80px_rgba(48,27,20,0.06)]"
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#4a3348]">
              {pillar.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#6c5247]">{pillar.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
