import { NextResponse } from "next/server";
import {
  clearFashionAdminSession,
  createFashionAdminSession,
  isFashionAdminAuthenticated,
} from "@/lib/fashion/customer-auth";
import { issueOtp, verifyOtp } from "@/lib/fashion/otp";
import { deliverOtp } from "@/lib/fashion/mail";
import {
  isGmailAddress,
  maskEmail,
  normalizeEmail,
  recoveryEmailsMatch,
} from "@/lib/fashion/admin-security";
import {
  getStoreSettings,
  setFashionAdminPassword,
  verifyFashionAdminCredentials,
  verifyFashionAdminPassword,
} from "@/lib/fashion/store";

export async function GET() {
  return NextResponse.json({ admin: await isFashionAdminAuthenticated() });
}

async function loginWithPassword(username: string, password: string) {
  const ok = await verifyFashionAdminCredentials(username, password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }
  await createFashionAdminSession();
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = body.action ?? "login";

  if (action === "login" || action === "login-direct") {
    return loginWithPassword(body.username ?? "", body.password ?? "");
  }

  if (action === "forgot-send-otp") {
    const username = String(body.username ?? "");
    const email = normalizeEmail(String(body.email ?? body.recoveryEmail ?? ""));
    const settings = await getStoreSettings();
    const expectedUser =
      settings.adminUsername?.trim().toLowerCase() ||
      process.env.FASHION_ADMIN_USERNAME?.trim().toLowerCase() ||
      "founder";
    if (username.trim().toLowerCase() !== expectedUser) {
      return NextResponse.json({ error: "Invalid username or recovery Gmail" }, { status: 401 });
    }
    const saved = settings.adminRecoveryEmail?.trim();
    if (!saved) {
      return NextResponse.json(
        {
          error:
            "Recovery Gmail এখনো সেট নেই। পাসওয়ার্ড দিয়ে লগইন করে Settings থেকে Gmail সেট করুন।",
        },
        { status: 400 },
      );
    }
    if (!isGmailAddress(email) || !recoveryEmailsMatch(saved, email)) {
      return NextResponse.json({ error: "Invalid username or recovery Gmail" }, { status: 401 });
    }
    const { code } = await issueOtp({
      purpose: "admin-reset",
      channel: "email",
      target: email,
    });
    let delivery: { delivered: boolean; debugOtp?: string };
    try {
      delivery = await deliverOtp({
        channel: "email",
        target: email,
        code,
        purpose: "admin-reset",
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Gmail-এ OTP পাঠানো যায়নি।",
        },
        { status: 502 },
      );
    }
    return NextResponse.json({
      ok: true,
      delivered: delivery.delivered,
      targetHint: maskEmail(email),
      ...(delivery.debugOtp ? { debugOtp: delivery.debugOtp } : {}),
    });
  }

  if (action === "forgot-reset") {
    const username = String(body.username ?? "");
    const email = normalizeEmail(String(body.email ?? body.recoveryEmail ?? ""));
    const password = String(body.password ?? body.newPassword ?? "");
    const settings = await getStoreSettings();
    const expectedUser =
      settings.adminUsername?.trim().toLowerCase() ||
      process.env.FASHION_ADMIN_USERNAME?.trim().toLowerCase() ||
      "founder";
    if (username.trim().toLowerCase() !== expectedUser) {
      return NextResponse.json({ error: "Invalid username or recovery Gmail" }, { status: 401 });
    }
    if (!recoveryEmailsMatch(settings.adminRecoveryEmail, email)) {
      return NextResponse.json({ error: "Invalid username or recovery Gmail" }, { status: 401 });
    }
    const okOtp = await verifyOtp({
      purpose: "admin-reset",
      target: email,
      code: body.code ?? "",
    });
    if (!okOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }
    try {
      await setFashionAdminPassword(password);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not update password" },
        { status: 400 },
      );
    }
    await createFashionAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (action === "change-password") {
    if (!(await isFashionAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const current = String(body.currentPassword ?? "");
    const next = String(body.newPassword ?? body.password ?? "");
    const ok = await verifyFashionAdminPassword(current);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
    try {
      await setFashionAdminPassword(next);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not update password" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  return loginWithPassword(body.username || "founder", body.password ?? "");
}

export async function DELETE() {
  await clearFashionAdminSession();
  return NextResponse.json({ ok: true });
}
