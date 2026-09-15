"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/fashion/cart-context";
import { cn } from "@/lib/fashion/cn";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import { copy } from "@/lib/fashion/copy";
import { LanguageSwitcher } from "@/components/fashion/LanguageSwitcher";

function NavIconButton({
  href,
  label,
  active,
  activeClass,
  idleClass,
  children,
  badge,
}: {
  href: string;
  label: string;
  active?: boolean;
  activeClass: string;
  idleClass: string;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-full transition duration-200",
        active ? activeClass : idleClass,
      )}
    >
      {children}
      {badge && badge > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9859a] px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function FashionHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { fc, locale } = useFashionCopy();
  const [loggedIn, setLoggedIn] = useState(false);
  const [unread, setUnread] = useState(0);
  const [myMenuOpen, setMyMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const [brand, setBrand] = useState(copy.brand);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  void variant;

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/fashion/auth").then((r) => r.json()),
      fetch("/api/fashion/notifications").then((r) => r.json()),
    ])
      .then(([auth, notifData]) => {
        if (!alive) return;
        const customer = auth.customer as { id?: string } | null;
        setLoggedIn(Boolean(customer));
        const cid = customer?.id;
        const count = (notifData.notifications ?? []).filter(
          (n: { readBy?: string[] }) =>
            cid ? !(n.readBy ?? []).includes(cid) : !(n.readBy ?? []).length,
        ).length;
        setUnread(count);
      })
      .catch(() => {
        if (!alive) return;
        setLoggedIn(false);
        setUnread(0);
      });

    return () => {
      alive = false;
    };
  }, [pathname]);

  useEffect(() => {
    let alive = true;
    fetch("/api/fashion/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (data.settings?.brandName) setBrand(data.settings.brandName);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [locale]);

  useEffect(() => {
    setMyMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!myMenuOpen || !triggerRef.current) {
      setMenuPos(null);
      return;
    }

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 176),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [myMenuOpen]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setMyMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setSearchOpen(false);
  }

  // Icons sit above the white brand card on dark navy — keep them bright.
  const toolbarActive =
    "bg-[linear-gradient(135deg,#f0c9a8,#f8e4d4)] text-[#5c3d5e] ring-2 ring-[#f4d4c2]/80 shadow-[0_4px_18px_rgba(240,201,168,0.45)]";
  const toolbarIdle =
    "bg-white/12 text-[#e8eef7] ring-1 ring-white/25 hover:bg-white/22 hover:text-white";

  const myProductActive = pathname.startsWith("/track");
  const notificationsHref = loggedIn ? "/account#notifications" : "/account/login";
  const accountHref = loggedIn ? "/account" : "/account/login";

  const dropdown =
    myMenuOpen && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[500] overflow-hidden rounded-2xl border border-[#e8d4e8]/70 bg-white py-2 shadow-[0_24px_60px_rgba(90,60,95,0.22)]"
            style={{ top: menuPos.top, left: menuPos.left, minWidth: menuPos.width }}
          >
            <Link
              href="/account"
              className="block px-4 py-3 text-[#4a3348] transition hover:bg-[#faf0f5]"
              onClick={() => setMyMenuOpen(false)}
            >
              {fc.nav.myOrders}
            </Link>
            <Link
              href="/track"
              className="block px-4 py-3 text-[#4a3348] transition hover:bg-[#faf0f5]"
              onClick={() => setMyMenuOpen(false)}
            >
              {fc.nav.track}
            </Link>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative z-30 space-y-3">
      {/* Icons + language toggle ABOVE the white card */}
      <div className="flex flex-wrap items-center justify-end gap-2 md:gap-2.5">
        <LanguageSwitcher compact className="mr-0.5" />

        <NavIconButton
          href="/"
          label={locale === "bn" ? "হোম" : "Home"}
          active={pathname === "/"}
          activeClass={toolbarActive}
          idleClass={toolbarIdle}
        >
          <HomeIcon />
        </NavIconButton>

        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="w-full min-w-[160px] flex-1 md:max-w-xs">
            <input
              autoFocus
              className="field w-full rounded-full border-white/20 bg-white/95 py-2 text-sm text-[#4a3348]"
              placeholder={fc.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
            />
          </form>
        ) : (
          <button
            type="button"
            aria-label={fc.nav.search}
            title={fc.nav.search}
            onClick={() => setSearchOpen(true)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full transition duration-200",
              pathname.startsWith("/search") ? toolbarActive : toolbarIdle,
            )}
          >
            <SearchIcon />
          </button>
        )}

        <NavIconButton
          href="/collections"
          label={fc.nav.collections}
          active={pathname === "/collections" || pathname.startsWith("/collections/")}
          activeClass={toolbarActive}
          idleClass={toolbarIdle}
        >
          <GridIcon />
        </NavIconButton>

        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            aria-label={fc.nav.myProduct}
            title={fc.nav.myProduct}
            onClick={() => setMyMenuOpen((open) => !open)}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-full transition duration-200",
              myProductActive || myMenuOpen ? toolbarActive : toolbarIdle,
            )}
          >
            <PackageIcon />
          </button>
        </div>

        <NavIconButton
          href={notificationsHref}
          label={fc.nav.notifications}
          active={false}
          activeClass={toolbarActive}
          idleClass={toolbarIdle}
          badge={loggedIn ? unread : undefined}
        >
          <BellIcon />
        </NavIconButton>

        <NavIconButton
          href={accountHref}
          label={loggedIn ? fc.nav.account : fc.nav.login}
          active={pathname.startsWith("/account")}
          activeClass={toolbarActive}
          idleClass={toolbarIdle}
        >
          <UserIcon />
        </NavIconButton>

        <NavIconButton
          href="/cart"
          label={fc.nav.cart}
          active={pathname.startsWith("/cart") || pathname.startsWith("/checkout")}
          activeClass="bg-[linear-gradient(135deg,#9d6b8a,#c9a0b8)] text-white shadow-md hover:opacity-90"
          idleClass="bg-[linear-gradient(135deg,#9d6b8a,#c9a0b8)] text-white shadow-md hover:opacity-90"
          badge={itemCount}
        >
          <CartIcon />
        </NavIconButton>
      </div>

      {/* White card: ONLY large unique Noorzaa + stronger feminine watermark */}
      <div className="relative overflow-hidden rounded-[2rem] border border-[#e8d4c4]/55 bg-white px-6 py-9 shadow-[0_18px_60px_rgba(122,85,128,0.1)] md:px-10 md:py-11">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
          <svg
            className="absolute -right-2 top-1/2 h-[155%] w-auto -translate-y-1/2 opacity-[0.24]"
            viewBox="0 0 220 280"
            fill="none"
          >
            <path
              d="M110 28c-28 8-48 34-48 66 0 22 10 40 26 52-18 10-30 30-30 54 0 38 34 68 76 68s76-30 76-68c0-24-12-44-30-54 16-12 26-30 26-52 0-32-20-58-48-66-8 22-28 36-48 36s-40-14-48-36Z"
              fill="#8f4e6a"
            />
            <path
              d="M110 42c18 0 34-10 42-26 6 20 22 34 42 38-16 10-28 28-28 48 0 20 10 36 26 46-14 8-24 24-24 42 0 28-26 50-58 50s-58-22-58-50c0-18-10-34-24-42 16-10 26-26 26-46 0-20-12-38-28-48 20-4 36-18 42-38 8 16 24 26 42 26Z"
              fill="#c9859a"
              opacity="0.75"
            />
            <circle cx="48" cy="210" r="12" fill="#b76e79" opacity="0.7" />
            <circle cx="172" cy="210" r="12" fill="#b76e79" opacity="0.7" />
            <path
              d="M36 232c22-20 44-20 66 0M118 232c22-20 44-20 66 0"
              stroke="#8f4e6a"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.65"
            />
            <path
              d="M110 150c8-18 28-22 38-10-14 4-22 16-22 28 12 0 24 8 28 20-16-2-28 6-34 18-2-14-12-26-28-28 10-8 14-20 18-28Z"
              fill="#d4a0b0"
              opacity="0.6"
            />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(201,133,154,0.32),transparent_52%),radial-gradient(ellipse_at_90%_100%,rgba(143,78,106,0.22),transparent_48%)]" />
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-display)] text-[10px] font-semibold tracking-[0.38em] text-[#8f4e6a]/60 uppercase md:text-xs">
            for her · নারীর ফ্যাশন
          </p>
        </div>

        <div className="relative z-10 flex min-h-[5.75rem] items-center justify-center md:min-h-[6.75rem]">
          <p
            className="select-none bg-[linear-gradient(115deg,#3d2a3c_0%,#8f4e6a_38%,#5c3d5e_70%,#3d2a3c_100%)] bg-clip-text text-center font-[family-name:var(--font-display)] text-[2.35rem] font-bold tracking-[0.3em] text-transparent uppercase md:text-5xl lg:text-6xl"
            aria-label={brand}
          >
            {brand}
          </p>
        </div>
      </div>

      {dropdown}
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 20 7v10l-8 4-8-4V7l8-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 12 20 7M12 12 4 7M12 12v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.5 1.2 5 2 6H4c.8-1 2-2.5 2-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
