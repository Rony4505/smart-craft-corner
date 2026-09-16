"use client";

import type { ReactNode } from "react";
import { TopLanguageBar } from "@/components/fashion/LanguageSwitcher";
import { adminThemes, type AdminTheme } from "./admin-themes";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#fff7fa_0%,#fce8f1_45%,#f6d5e8_100%)] text-[#4a1235]">
      <TopLanguageBar />
      <div className="mx-auto max-w-7xl px-5 py-8 pt-14 md:px-8 md:py-10 md:pt-16">{children}</div>
    </div>
  );
}

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  theme = "rose",
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  theme?: AdminTheme;
  children: ReactNode;
  wide?: boolean | "xl";
}) {
  if (!open) return null;
  const t = adminThemes[theme];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2b1d19]/45 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[2rem] border shadow-[0_40px_100px_rgba(43,29,25,0.25)] sm:rounded-[2rem] ${t.gradient} ${t.border} ${wide === "xl" ? "max-w-5xl" : wide ? "max-w-4xl" : "max-w-2xl"}`}
      >
        <div className="sticky top-0 z-10 border-b border-black/5 bg-white/40 px-6 py-5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-2xl ${t.accent}`}>{t.icon}</p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#2b1d19]">
                {title}
              </h2>
              {subtitle ? <p className="mt-1 text-sm text-[#7a5c50]">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-semibold text-[#5b4339] shadow-sm transition hover:bg-white"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function AdminSuccessModal({
  open,
  onClose,
  title,
  message,
  theme = "rose",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  theme?: AdminTheme;
}) {
  if (!open) return null;
  const t = adminThemes[theme];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#2b1d19]/50 p-4 backdrop-blur-md">
      <div
        className={`w-full max-w-sm rounded-[2rem] border p-8 text-center shadow-2xl ${t.gradient} ${t.border}`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-3xl shadow-inner">
          ✓
        </div>
        <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[#6f554a]">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[linear-gradient(135deg,#e8b896,#f4d4c2)] px-6 py-3 text-sm font-semibold text-[#3d2a24] shadow-md transition hover:opacity-90"
        >
          ঠিক আছে
        </button>
      </div>
    </div>
  );
}

export function AdminConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "নিশ্চিত করুন",
  theme = "ocean",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  theme?: AdminTheme;
}) {
  if (!open) return null;
  const t = adminThemes[theme];

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-[#2b1d19]/55 p-4 backdrop-blur-md">
      <div className={`w-full max-w-md rounded-[2rem] border p-6 shadow-2xl ${t.gradient} ${t.border}`}>
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#6f554a]">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-full bg-[linear-gradient(135deg,#e8b896,#f4d4c2)] px-4 py-3 text-sm font-semibold text-[#3d2a24] shadow-md"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
