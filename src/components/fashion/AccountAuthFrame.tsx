"use client";

import type { ReactNode } from "react";
import { FashionShell } from "@/components/fashion/FashionShell";
import { NoorzaaWordmark } from "@/components/fashion/NoorzaaWordmark";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";

export function AccountAuthFrame({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { fc } = useFashionCopy();

  return (
    <FashionShell>
      <section className="relative overflow-hidden px-4 py-10 md:px-8 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#e91e8c]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#c2186b]/20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[2.4rem] border border-[#f3c6dc]/70 bg-white shadow-[0_40px_120px_rgba(194,24,107,0.14)] md:grid-cols-[1.05fr_1fr]">
          <aside className="relative hidden min-h-[560px] overflow-hidden bg-[linear-gradient(165deg,#8e1050_0%,#c2186b_48%,#e91e8c_100%)] p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="auth-filigree pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative">
              <div className="inline-flex rounded-2xl bg-white px-3 py-2">
                <NoorzaaWordmark href="/" className="max-w-[12rem]" />
              </div>
              <p className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-white">
                {fc.account.authSideLine1}
                <br />
                {fc.account.authSideLine2}
              </p>
            </div>
            <blockquote className="relative mt-10 max-w-sm text-sm leading-7 text-[#fde8f2]">
              “{fc.account.authQuote}”
              <span className="mt-4 block text-[11px] tracking-[0.28em] text-white/75">
                {fc.account.authTag}
              </span>
            </blockquote>
          </aside>
          <div className="relative px-6 py-8 sm:px-10 sm:py-12">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[#c2186b]">{eyebrow}</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#8e1050] md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6f554a]">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-sm text-[#6f554a]">{footer}</div>
          </div>
        </div>
      </section>
    </FashionShell>
  );
}
