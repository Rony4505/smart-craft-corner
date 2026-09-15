const DEVELOPER_NAME = "MD: Tajul islam Rony";
const DEVELOPER_ROLE = "website developer";
const DEVELOPER_PHONE = "+35794466947";
const DEVELOPER_PHONE_HREF = "tel:+35794466947";

/** Subtle corner watermark — visible but not distracting. */
export function DeveloperWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-[4.75rem] right-3 z-20 max-w-[9.5rem] select-none text-right opacity-35 md:bottom-6 md:right-6"
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#c5d4e8]">
        {DEVELOPER_NAME}
      </p>
      <p className="text-[8px] uppercase tracking-[0.14em] text-[#8eb4d9]">
        {DEVELOPER_ROLE}
      </p>
      <p className="text-[8px] tracking-wide text-[#8eb4d9]">{DEVELOPER_PHONE}</p>
    </div>
  );
}

/** Footer credit block with tap-to-call phone. */
export function DeveloperCreditFooter() {
  return (
    <div className="mx-auto mt-6 max-w-7xl border-t border-white/10 pt-4 text-center text-xs text-[#6d8aa8] md:text-left">
      <p className="font-semibold text-[#8eb4d9]">{DEVELOPER_NAME}</p>
      <p className="mt-0.5 uppercase tracking-[0.12em]">{DEVELOPER_ROLE}</p>
      <a
        href={DEVELOPER_PHONE_HREF}
        className="mt-1 inline-block font-medium text-[#b8c9de] transition hover:text-white"
      >
        {DEVELOPER_PHONE}
      </a>
    </div>
  );
}
