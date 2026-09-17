import type { Metadata } from "next";
import { AboutPageClient } from "@/components/fashion/AboutPageClient";
import { FashionShell } from "@/components/fashion/FashionShell";
import { getStoreSettings } from "@/lib/fashion/store";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: settings.aboutTitleEn || settings.aboutTitle || "Our Story",
    description: settings.aboutTextEn || settings.aboutText || settings.metaDescription,
  };
}

export default async function AboutPage() {
  const settings = await getStoreSettings();
  return (
    <FashionShell>
      <AboutPageClient settings={settings} />
    </FashionShell>
  );
}
