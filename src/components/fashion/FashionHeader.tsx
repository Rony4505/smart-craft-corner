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
import { NoorzaaWordmark } from "@/components/fashion/NoorzaaWordmark";

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

  const toolbarActive =
    "bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white ring-2 ring-[#f8b4d4]/80 shadow-[0_4px_18px_rgba(194,24,107,0.35)]";
  const toolbarIdle =
    "bg-white text-[#c2186b] ring-1 ring-[#f3c6dc] hover:bg-[#fff0f6] hover:text-[#8e1050]";

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
        <LanguageSwitcher compact className="relative z-40 mr-0.5" />

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
          activeClass="bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white shadow-md hover:opacity-90"
          idleClass="bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white shadow-md hover:opacity-90"
          badge={itemCount}
        >
          <CartIcon />
        </NavIconButton>
      </div>

      <div className="relative px-2 py-5 md:px-4 md:py-7">
        <div className="relative z-10 flex min-h-[4.5rem] items-center justify-center md:min-h-[5.5rem]">
          <NoorzaaWordmark priority className="max-w-[18rem] sm:max-w-[24rem] md:max-w-[32rem] lg:max-w-[38rem]" />
          <span className="sr-only">{brand}</span>
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
