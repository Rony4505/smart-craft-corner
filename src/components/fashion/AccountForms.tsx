"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AccountAuthFrame } from "@/components/fashion/AccountAuthFrame";
import { AccountOtpPin } from "@/components/fashion/AccountOtpPin";
import { FashionButton } from "@/components/fashion/FashionButton";
import { PasswordField } from "@/components/fashion/PasswordField";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";

export function LoginForm() {
  const router = useRouter();
  const { fc } = useFashionCopy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/fashion/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || fc.account.loginFailed);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <AccountAuthFrame
      eyebrow={fc.account.memberAccess}
      title={fc.account.loginTitle}
      subtitle={fc.account.loginSubtitle}
      footer={
        <>
          {fc.account.noAccount}{" "}
          <Link href="/account/register" className="font-semibold text-[#8f624e] underline">
            {fc.account.createAccount}
          </Link>
        </>
      }
    >
      <form method="post" onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}
        <label className="block">
          <span className="text-sm text-[#9b7766]">{fc.account.gmail}</span>
          <input
            className="field mt-2"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <PasswordField
          label={fc.account.password}
          value={password}
          onChange={setPassword}
          required
        />
        <FashionButton type="submit" disabled={loading} className="w-full">
          {loading ? fc.account.loggingIn : fc.account.loginSubmit}
        </FashionButton>
      </form>
    </AccountAuthFrame>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { fc } = useFashionCopy();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [targetHint, setTargetHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const lastTried = useRef("");
  const verifying = useRef(false);

  async function sendOtp(event: FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    setLoading(true);
    setError("");
    const res = await fetch("/api/fashion/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register-send-otp", ...form, channel: "email" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || fc.account.otpSendFailed);
      return;
    }
    setDebugOtp(data.debugOtp || "");
    setOtp("");
    lastTried.current = "";
    setTargetHint(data.targetHint || form.email);
    setStatus("");
    setStep("otp");
  }

  async function verifyCode(code: string) {
    if (verifying.current) return;
    verifying.current = true;
    setLoading(true);
    setError("");
    setStatus(fc.account.verifying);
    const res = await fetch("/api/fashion/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register-verify",
        email: form.email,
        code,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      verifying.current = false;
      setLoading(false);
      setStatus("");
      setError(data.error || fc.account.otpWrong);
      return;
    }
    setStatus(fc.account.verified);
    router.push("/account");
    router.refresh();
  }

  useEffect(() => {
    const code = otp.replace(/\D/g, "");
    if (step !== "otp" || code.length !== 6 || loading || code === lastTried.current) return;
    lastTried.current = code;
    void verifyCode(code);
  }, [otp, step, loading, form.email]);

  return (
    <AccountAuthFrame
      eyebrow={fc.account.newMember}
      title={fc.account.registerTitle}
      subtitle={fc.account.registerSubtitle}
      footer={
        <>
          {fc.account.hasAccount}{" "}
          <Link href="/account/login" className="font-semibold text-[#8f624e] underline">
            {fc.nav.login}
          </Link>
        </>
      }
    >
      {step === "form" ? (
        <form method="post" action="/account/register" onSubmit={sendOtp} className="space-y-4">
          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
          {(
            [
              ["name", fc.account.name, "text", "name"],
              ["email", fc.account.gmail, "email", "email"],
              ["phone", fc.account.phone, "tel", "tel"],
            ] as const
          ).map(([key, label, type, autoComplete]) => (
            <label key={key} className="block">
              <span className="text-sm text-[#9b7766]">{label}</span>
              <input
                className="field mt-2"
                type={type}
                name={key}
                autoComplete={autoComplete}
                value={form[key]}
                onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                required
              />
            </label>
          ))}
          <PasswordField
            label={fc.account.password}
            value={form.password}
            onChange={(v) => setForm((c) => ({ ...c, password: v }))}
            autoComplete="new-password"
            required
          />
          <p className="rounded-2xl border border-[#d4b896]/60 bg-[#fff8ee] px-4 py-3 text-sm text-[#6b5420]">
            {fc.account.otpSendNote}
          </p>
          <FashionButton type="submit" disabled={loading} className="w-full">
            {loading ? fc.account.sendingOtp : fc.account.sendOtp}
          </FashionButton>
        </form>
      ) : (
        <div className="space-y-4">
          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
          <p className="text-sm leading-6 text-[#6f554a]">
            {targetHint || fc.account.yourGmail} — {fc.account.otpSentTo}
          </p>
          {debugOtp ? (
            <p className="rounded-xl border border-[#e8cc80] bg-[#fffbf0] px-4 py-3 text-center text-lg font-bold tracking-[0.35em] text-[#6b5420]">
              {debugOtp}
            </p>
          ) : null}
          <p className="text-xs text-[#9b7766]">{fc.account.otpHint}</p>
          <AccountOtpPin value={otp} onChange={setOtp} disabled={loading} />
          <p className="min-h-6 text-center text-sm font-semibold text-[#c2186b]">
            {status || (loading ? fc.account.verifying : fc.account.autoVerify)}
          </p>
          <button
            type="button"
            className="text-sm font-semibold text-[#8f624e]"
            onClick={() => {
              setStep("form");
              setOtp("");
              setError("");
              setStatus("");
              lastTried.current = "";
              verifying.current = false;
            }}
          >
            {fc.account.backToForm}
          </button>
        </div>
      )}
    </AccountAuthFrame>
  );
}
