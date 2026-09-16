"use client";

import { useState } from "react";

/** Password input with show/hide eye toggle. */
export function PasswordField({
  value,
  onChange,
  label,
  required,
  id,
  placeholder,
  className = "",
  autoComplete = "current-password",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className={`block ${className}`}>
      {label ? <span className="text-sm text-[#9b7766]">{label}</span> : null}
      <div className={`relative ${label ? "mt-2" : ""}`}>
        <input
          id={id}
          className="field pr-12"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          name={autoComplete === "new-password" ? "new-password" : "password"}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-1 text-base text-[#5b4339] hover:bg-[#ebe0d6]"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
    </label>
  );
}
