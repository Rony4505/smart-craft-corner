"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/fashion/cart-context";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { StoreSettings } from "@/lib/fashion/types";

function normalizePath(pathname: string | null): string {

  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

export function OrderBottomNav() {
  const pathname = usePathname();
  const path = normalizePath(pathname);
  const { itemCount } = useCart();
  const { fc } = useFashionCopy();
  const [supportOpen, setSupportOpen] = useState(false);
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});

  useEffect(() => {
    fetch("/api/fashion/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setSupportOpen(false);
  }, [path]);

  const isCategory =
    path.startsWith("/collections") ||
    path.startsWith("/products") ||
    path.startsWith("/search") ||
    path.startsWith("/shop");
  const isCart = path.startsWith("/cart") || path.startsWith("/checkout");
  const isAbout = path.startsWith("/about");
  const isContact = path.startsWith("/contact");

  const whatsapp = (settings.whatsapp || "8801700000000").replace(/\D/g, "");
  const email = settings.contactEmail || "hello@noorzaa.com";
  const facebookUrl = settings.facebookUrl;

  return (
    <>
      {supportOpen ? (
        <div
          className="fixed inset-0 z-[45] bg-black/25 md:hidden"
          onClick={() => setSupportOpen(false)}
          aria-hidden
        />
      ) : null}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#c5d4e8]/40 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(10,22,40,0.15)] md:hidden"
      >
        {supportOpen ? (
          <div className="flex items-center justify-center gap-4 border-b border-[#e8d4e8]/50 px-4 py-3">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C7E]"
              aria-label={fc.footer.whatsapp}
            >
              <WhatsAppIcon />
            </a>
            {facebookUrl ? (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2]/15 text-[#1877F2]"
                aria-label={fc.footer.facebook}
              >
                <FacebookIcon />
              </a>
            ) : null}
            <a
              href={`mailto:${email}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5c3d5e]/10 text-[#5c3d5e]"
              aria-label={fc.footer.email}
            >
              <EmailIcon />
            </a>
          </div>
        ) : null}
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pt-2">
          <BottomLink href="/collections" label={fc.nav.collections} active={isCategory}>
            <MenuIcon />
          </BottomLink>
          <BottomLink href="/cart" label={fc.nav.cart} active={isCart} badge={itemCount}>
            <CartIcon />
          </BottomLink>
          <BottomLink href="/about" label={fc.nav.about} active={isAbout}>
            <StoryIcon />
          </BottomLink>
          <BottomLink href="/contact" label={fc.nav.contact} active={isContact}>
            <ContactIcon />
          </BottomLink>
          <BottomLink
            href="#"
            label={fc.footer.support}
            active={supportOpen}
            onClick={(event) => {
              event.preventDefault();
              setSupportOpen((open) => !open);
            }}
          >
            <SupportIcon />
          </BottomLink>
        </div>
      </nav>
    </>
  );
}

function BottomLink({
  href,
  label,
  active,
  children,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
  badge?: number;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      title={label}
      className={`relative flex flex-col items-center gap-1 px-1 py-1.5 text-[10px] font-semibold transition-colors ${
        active ? "text-[#5c3d5e]" : "text-[#3d4f63]"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ease-out ${
          active
            ? "-translate-y-1 scale-110 bg-[linear-gradient(135deg,#9d6b8a,#c9a0b8)] text-white shadow-[0_8px_20px_rgba(157,107,138,0.35)] ring-2 ring-[#e8c4d8]/80"
            : "bg-[#eef3f8] text-[#2a3f55] shadow-sm"
        }`}
      >
        {children}
      </span>
      {badge && badge > 0 ? (
        <span className="absolute right-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9859a] px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
