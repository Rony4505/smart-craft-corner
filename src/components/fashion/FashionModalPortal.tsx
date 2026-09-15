"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Full-screen overlay portaled to document.body so it sits above header/hero layers. */
export function FashionModalPortal({
  open,
  onBackdropClick,
  children,
  zIndexClass = "z-[550]",
}: {
  open: boolean;
  onBackdropClick?: () => void;
  children: React.ReactNode;
  zIndexClass?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center bg-[#2b1d19]/55 p-4 backdrop-blur-md`}
      onClick={onBackdropClick}
    >
      {children}
    </div>,
    document.body,
  );
}
