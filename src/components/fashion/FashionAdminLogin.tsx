"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FashionButton } from "@/components/fashion/FashionButton";
import { PasswordField } from "@/components/fashion/PasswordField";
import { AdminShell } from "@/components/fashion/admin/AdminShell";
import { NoorzaaWordmark } from "@/components/fashion/NoorzaaWordmark";
import { AccountOtpPin } from "@/components/fashion/AccountOtpPin";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";

type Step = "login" | "forgot" | "otp";

export function FashionAdminLogin() {
  const router = useRouter();
  const { locale } = useFashionCopy();
  const [step, setStep] = useState<Step>("login");
  const [username, setUsername] = useState("founder");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [targetHint, setTargetHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const bn = locale === "bn";

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fashion/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error || (bn ? "ইউজারনেম বা পাসওয়ার্ড সঠিক নয়" : "Incorrect username or password"),
        );
        setLoading(false);
        return;
      }
      router.push("/store-admin");
      router.refresh();
    } catch {
      setError(bn ? "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন" : "Network error — try again");
      setLoading(false);
    }
  }

  async function handleForgotSend(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fashion/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forgot-send-otp",
          username,
          email: recoveryEmail,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error ||
            (bn ? "Recovery Gmail পাঠানো যায়নি" : "Could not send recovery email"),
        );
        setLoading(false);
        return;
      }
      setDebugOtp(String(data.debugOtp || ""));
      setOtp(data.debugOtp ? String(data.debugOtp) : "");
      setTargetHint(data.targetHint || "");
      setStep("otp");
    } catch {
      setError(bn ? "নেটওয়ার্ক সমস্যা" : "Network error");
    }
    setLoading(false);
  }

  async function handleForgotReset(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fashion/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forgot-reset",
          username,
          email: recoveryEmail,
          code: otp,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || (bn ? "OTP বা পাসওয়ার্ড সঠিক নয়" : "Invalid OTP or password"));
        setLoading(false);
        return;
      }
      router.push("/store-admin");
      router.refresh();
    } catch {
      setError(bn ? "নেটওয়ার্ক সমস্যা" : "Network error");
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-md py-8">
        <div className="mb-6 flex justify-center">
          <NoorzaaWordmark href="/" className="max-w-[16rem]" priority />
        </div>
        <h1 className="text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[#8e1050]">
          {bn ? "অ্যাডমিন লগইন" : "Admin login"}
        </h1>
        <p className="mt-2 text-center text-sm text-[#7a3a5c]">
          {step === "login"
            ? bn
              ? "শুধু ইউজারনেম ও পাসওয়ার্ড — Gmail OTP লাগবে না।"
              : "Username and password only — no Gmail OTP."
            : bn
              ? "Forget password: আপনার recovery Gmail-এ OTP যাবে।"
              : "Forgot password: OTP goes to your recovery Gmail."}
        </p>

        {step === "login" ? (
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-4 rounded-[2rem] border border-[#f3c6dc] bg-white/90 p-6 shadow-[0_18px_50px_rgba(194,24,107,0.08)]"
          >
            {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <label className="block">
              <span className="text-sm text-[#9a5a78]">Username</span>
              <input
                className="field mt-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <PasswordField
              label={bn ? "পাসওয়ার্ড" : "Password"}
              value={password}
              onChange={setPassword}
              required
            />
            <FashionButton type="submit" disabled={loading} className="w-full">
              {loading ? "..." : bn ? "লগইন" : "Log in"}
            </FashionButton>
            <button
              type="button"
              className="w-full text-center text-sm font-semibold text-[#c2186b]"
              onClick={() => {
                setStep("forgot");
                setError("");
              }}
            >
              {bn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
            </button>
          </form>
        ) : null}

        {step === "forgot" ? (
          <form
            onSubmit={handleForgotSend}
            className="mt-8 space-y-4 rounded-[2rem] border border-[#f3c6dc] bg-white/90 p-6 shadow-[0_18px_50px_rgba(194,24,107,0.08)]"
          >
            {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <p className="text-sm leading-6 text-[#7a3a5c]">
              {bn
                ? "Settings-এ যে recovery Gmail সেট করেছেন, সেই ঠিকানায় OTP যাবে। সেট না থাকলে আগে পাসওয়ার্ড দিয়ে লগইন করুন।"
                : "OTP is sent to the recovery Gmail saved in Settings. If none is set, log in with your password first."}
            </p>
            <label className="block">
              <span className="text-sm text-[#9a5a78]">Username</span>
              <input
                className="field mt-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="text-sm text-[#9a5a78]">Recovery Gmail</span>
              <input
                className="field mt-1"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <FashionButton type="submit" disabled={loading} className="w-full">
              {loading ? "..." : bn ? "OTP পাঠান" : "Send OTP"}
            </FashionButton>
            <button
              type="button"
              className="text-sm font-semibold text-[#c2186b]"
              onClick={() => {
                setStep("login");
                setError("");
              }}
            >
              ← {bn ? "লগইনে ফিরুন" : "Back to login"}
            </button>
          </form>
        ) : null}

        {step === "otp" ? (
          <form
            onSubmit={handleForgotReset}
            className="mt-8 space-y-4 rounded-[2rem] border border-[#f3c6dc] bg-white/90 p-6 shadow-[0_18px_50px_rgba(194,24,107,0.08)]"
          >
            {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <p className="text-sm text-[#7a3a5c]">
              {bn ? "OTP পাঠানো হয়েছে:" : "OTP sent to:"} <strong>{targetHint}</strong>
            </p>
            {debugOtp ? (
              <p className="rounded-xl border border-[#f3c6dc] bg-[#fff5f8] px-4 py-3 text-center text-lg font-bold tracking-[0.35em] text-[#8e1050]">
                {debugOtp}
              </p>
            ) : null}
            <AccountOtpPin value={otp} onChange={setOtp} disabled={loading} />
            <PasswordField
              label={bn ? "নতুন পাসওয়ার্ড" : "New password"}
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            <FashionButton type="submit" disabled={loading} className="w-full">
              {loading ? "..." : bn ? "পাসওয়ার্ড সেট করে লগইন" : "Reset password and log in"}
            </FashionButton>
            <button
              type="button"
              className="text-sm font-semibold text-[#c2186b]"
              onClick={() => {
                setStep("forgot");
                setError("");
              }}
            >
              ← {bn ? "ফিরুন" : "Back"}
            </button>
          </form>
        ) : null}
      </section>
    </AdminShell>
  );
}
