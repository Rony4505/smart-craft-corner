"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FashionButton } from "@/components/fashion/FashionButton";
import { localeEyebrowOnDarkClass } from "@/lib/fashion/locale-text-style";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { StoreSettings } from "@/lib/fashion/types";

export function ContactPageClient() {
  const { fc, locale } = useFashionCopy();
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});

  useEffect(() => {
    fetch("/api/fashion/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);
  }, []);

  const phone = settings.contactPhone || "+880 1XXX-XXXXXX";
  const email = settings.contactEmail || "hello@noorzaa.com";
  const whatsapp = (settings.whatsapp || "8801700000000").replace(/\D/g, "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 text-[#e8eef7] md:px-8 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className={localeEyebrowOnDarkClass(locale)}>
            {fc.contact.label}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold text-white md:text-6xl">
            {fc.contact.title}
          </h1>
          <div className="mt-8 space-y-4 text-base leading-8 text-[#b8c9de]">
            <p>
              {fc.contact.whatsapp}:{" "}
              <a href={`https://wa.me/${whatsapp}`} className="font-semibold text-[#8eb4d9]">
                {phone}
              </a>
            </p>
            <p>
              {fc.contact.email}:{" "}
              <a href={`mailto:${email}`} className="font-semibold text-[#8eb4d9]">
                {email}
              </a>
            </p>
            <p>
              {fc.contact.hours}: {fc.contact.hoursValue}
            </p>
            <p>{fc.contact.showroomNote}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-black/6 bg-white p-6 text-[#4a3348] shadow-[0_24px_80px_rgba(48,27,20,0.06)]"
        >
          {sent ? (
            <div className="rounded-[1.5rem] bg-[#faf4f0] p-6 text-[#5b4339]">
              <p className="font-semibold">{fc.contact.sentTitle}</p>
              <p className="mt-2 text-sm leading-7">{fc.contact.sentBody}</p>
            </div>
          ) : (
            <>
              <label className="block">
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#9b7766]">
                  {fc.contact.name}
                </span>
                <input className="field mt-2" required />
              </label>
              <label className="mt-5 block">
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#9b7766]">
                  {fc.contact.phone}
                </span>
                <input className="field mt-2" required />
              </label>
              <label className="mt-5 block">
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#9b7766]">
                  {fc.contact.message}
                </span>
                <textarea className="field mt-2 min-h-32 resize-y" required />
              </label>
              <div className="mt-6">
                <FashionButton type="submit">{fc.contact.send}</FashionButton>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
