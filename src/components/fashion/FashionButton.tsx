import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/fashion/cn";

export function FashionButton({
  href,
  children,
  variant = "primary",
  className,
  type,
  onClick,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const styles = cn(
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
    variant === "primary" &&
      "bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white hover:-translate-y-0.5 hover:opacity-95",
    variant === "secondary" &&
      "border border-[#f3c6dc] bg-white text-[#8e1050] hover:bg-[#fff5f8]",
    variant === "ghost" &&
      "border border-[#f3c6dc] bg-transparent text-[#8e1050] hover:bg-[#fff5f8]",
    disabled && "cursor-not-allowed opacity-55 hover:translate-y-0",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={styles} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
