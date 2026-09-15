"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DeveloperCreditFooter } from "./DeveloperCredit";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { tSetting } from "@/lib/fashion/locale-settings";
import { copy } from "@/lib/fashion/copy";
import type { StoreSettings } from "@/lib/fashion/types";

function FooterIconLink({
  href,
  label,
  children,
  external,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#d8e4f2] transition hover:-translate-y-0.5 hover:border-[#8eb4d9]/50 hover:bg-white/15 hover:shadow-md";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={label} title={label} className={className}>
      {children}
    </Link>
  );
}

export function FashionFooter() {
  const { locale, fc } = useFashionCopy();
  const [brand, setBrand] = useState(copy.brand);
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});

  useEffect(() => {
    fetch("/api/fashion/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.brandName) setBrand(data.settings.brandName);
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);
  }, []);

  const email = settings.contactEmail || "hello@noorzaa.com";
  const whatsapp = (settings.whatsapp || "8801700000000").replace(/\D/g, "");
  const blurb = tSetting(
    settings as StoreSettings,
    "footerText",
    "footerTextEn",
    locale,
    fc.footer.blurb,
  );

  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(165deg,#081220_0%,#0a1628_45%,#0f2744_100%)] px-5 py-14 text-[#d8e4f2] md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[0.18em] uppercase text-white">
            {brand}
          </p>
          <p className="mt-4 max-w-md text-base leading-8 text-[#b8c9de]">{blurb}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8eb4d9]">
            {fc.footer.explore}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <FooterIconLink href="/collections" label={fc.footer.collections}>
              <GridIcon />
            </FooterIconLink>
            <FooterIconLink href="/cart" label={fc.footer.cart}>
              <CartIcon />
            </FooterIconLink>
            <FooterIconLink href="/about" label={fc.footer.about}>
              <StoryIcon />
            </FooterIconLink>
            <FooterIconLink href="/contact" label={fc.footer.contact}>
              <ContactIcon />
            </FooterIconLink>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8eb4d9]">
            {fc.footer.support}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <FooterIconLink
              href={`https://wa.me/${whatsapp}`}
              label={fc.footer.whatsapp}
              external
            >
              <WhatsAppIcon />
            </FooterIconLink>
            {settings.facebookUrl ? (
              <FooterIconLink href={settings.facebookUrl} label={fc.footer.facebook} external>
                <FacebookIcon />
              </FooterIconLink>
            ) : null}
            <FooterIconLink href={`mailto:${email}`} label={fc.footer.email}>
              <EmailIcon />
            </FooterIconLink>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-[#8ea8c4]">
        © {new Date().getFullYear()} {brand}. {fc.footer.rights}
      </div>
      <DeveloperCreditFooter />
    </footer>
  );
}

function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L6 6Zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function StoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 9h3l-1 4h-3v9h-4v-9H7V9h2V7.5C9 4.5 10.5 3 13.2 3H16v4h-2.2c-1 0-1.8.6-1.8 1.5V9z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
