"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { StoreSettings } from "@/lib/fashion/types";

export function ChatSupportWidget() {
  const { locale, fc } = useFashionCopy();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});

  useEffect(() => {
    fetch("/api/fashion/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);
  }, []);

  if (settings.websiteChatEnabled === false) return null;

  const whatsapp = (settings.whatsapp || "8801700000000").replace(/\D/g, "");
  const facebook = settings.facebookUrl?.trim() || "https://facebook.com";
  const email = settings.contactEmail || "hello@noorzaa.com";

  const labels =
    locale === "bn"
      ? {
          title: "চ্যাট করুন",
          web: "ওয়েবসাইট চ্যাট",
          fb: "Facebook",
          wa: "WhatsApp",
          webHint: "যোগাযোগ পেজে মেসেজ পাঠান",
        }
      : {
          title: "Chat with us",
          web: "Website chat",
          fb: "Facebook",
          wa: "WhatsApp",
          webHint: "Message us on the contact page",
        };

  return (
    <div className="pointer-events-none fixed bottom-24 right-3 z-[100] sm:bottom-6 sm:right-5">
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {open ? (
          <div className="w-56 overflow-hidden rounded-2xl border border-[#e8c4b0]/70 bg-white shadow-[0_20px_60px_rgba(43,29,25,0.22)]">
            <p className="border-b border-black/5 bg-[#faf4f0] px-4 py-3 text-sm font-semibold text-[#2b1d19]">
              {labels.title}
            </p>
            <div className="flex flex-col p-2">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3d2a24] transition hover:bg-[#faf4f0]"
                title={labels.webHint}
              >
                {labels.web}
              </Link>
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3d2a24] transition hover:bg-[#faf4f0]"
              >
                {labels.fb}
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3d2a24] transition hover:bg-[#faf4f0]"
              >
                {labels.wa}
              </a>
              <a
                href={`mailto:${email}`}
                className="sr-only"
              >
                {email}
              </a>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2b1d19] text-xl text-white shadow-[0_12px_40px_rgba(43,29,25,0.35)] transition hover:scale-105"
          aria-label={labels.title}
          aria-expanded={open}
        >
          {open ? "✕" : "💬"}
        </button>
        <span className="sr-only">{fc.nav.contact}</span>
      </div>
    </div>
  );
}
