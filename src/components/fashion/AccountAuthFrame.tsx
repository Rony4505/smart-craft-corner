import type { ReactNode } from "react";
import { FashionShell } from "@/components/fashion/FashionShell";

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
  return (
    <FashionShell>
      <section className="relative overflow-hidden px-4 py-10 md:px-8 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#d4b896]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#8f624e]/20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[2.4rem] border border-[#d4b896]/35 bg-[#fffaf6] shadow-[0_40px_120px_rgba(8,18,40,0.28)] md:grid-cols-[1.05fr_1fr]">
          <aside className="relative hidden min-h-[560px] overflow-hidden bg-[linear-gradient(165deg,#071018_0%,#122d52_48%,#1c456e_100%)] p-10 text-[#f4ead8] md:flex md:flex-col md:justify-between">
            <div className="auth-filigree pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative">
              <p className="text-[11px] font-semibold tracking-[0.42em] text-[#d4b896]">NOORZAA</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-white">
                লাক্সারি ফ্যাশন,
                <br />
                নিজস্ব অ্যাকাউন্ট।
              </p>
            </div>
            <blockquote className="relative mt-10 max-w-sm text-sm leading-7 text-[#d5e3f5]">
              “প্রতিটি অর্ডার, ঠিকানা আর পছন্দ — আপনার প্রোফাইলে এক জায়গায় থাকবে।”
              <span className="mt-4 block text-[11px] tracking-[0.28em] text-[#d4b896]">
                FOR HER · লাক্সারি ফ্যাশন
              </span>
            </blockquote>
          </aside>
          <div className="relative px-6 py-8 sm:px-10 sm:py-12">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[#8f624e]">{eyebrow}</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#122d52] md:text-4xl">
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
