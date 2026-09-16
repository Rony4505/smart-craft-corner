"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

export function AccountOtpPin({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, 6));
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    const focusAt = Math.min(pasted.length, 5);
    refs.current[focusAt]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  }

  return (
    <div className="flex justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="h-14 w-full max-w-14 rounded-2xl border border-[#f3c6dc] bg-white text-center font-[family-name:var(--font-display)] text-2xl font-bold tracking-widest text-[#8e1050] outline-none transition focus:border-[#c2186b] focus:shadow-[0_0_0_3px_rgba(194,24,107,0.15)]"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          onPaste={handlePaste}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, nextDigit);
            if (nextDigit && index < 5) refs.current[index + 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
