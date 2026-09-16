import { NextResponse } from "next/server";
import {
  clearFashionAdminSession,
  createFashionAdminSession,
  isFashionAdminAuthenticated,
} from "@/lib/fashion/customer-auth";
import { issueOtp, verifyOtp } from "@/lib/fashion/otp";
import { deliverOtp } from "@/lib/fashion/mail";
import {
  getStoreSettings,
  verifyFashionAdminCredentials,
} from "@/lib/fashion/store";

export async function GET() {
  return NextResponse.json({ admin: await isFashionAdminAuthenticated() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = body.action ?? "login";

  if (action === "credentials") {
    const ok = await verifyFashionAdminCredentials(
      body.username ?? "",
      body.password ?? "",
    );
    if (!ok) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "send-otp") {
    const ok = await verifyFashionAdminCredentials(
      body.username ?? "",
      body.password ?? "",
    );
    if (!ok) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    const settings = await getStoreSettings();
    const channel = body.channel === "phone" ? "phone" : "email";
    const target =
      channel === "phone"
        ? settings.adminPhone || body.phone || ""
        : settings.adminEmail || body.email || "";
    if (!target) {
      return NextResponse.json(
        { error: "Admin email/phone not configured in Settings" },
        { status: 400 },
      );
    }
    const { code } = await issueOtp({
      purpose: "admin-login",
      channel,
      target,
    });
    let delivery: { delivered: boolean; debugOtp?: string };
    try {
      delivery = await deliverOtp({
        channel,
        target,
        code,
        purpose: "admin-login",
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
      channel,
      delivered: delivery.delivered,
      targetHint:
        channel === "email"
          ? target.replace(/(.{2}).+(@.+)/, "$1***$2")
          : `***${target.slice(-4)}`,
      ...(delivery.debugOtp ? { debugOtp: delivery.debugOtp } : {}),
    });
  }

  if (action === "verify-otp") {
    const okCreds = await verifyFashionAdminCredentials(
      body.username ?? "",
      body.password ?? "",
    );
    if (!okCreds) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    const settings = await getStoreSettings();
    const channel = body.channel === "phone" ? "phone" : "email";
    const target =
      channel === "phone"
        ? settings.adminPhone || body.phone || ""
        : settings.adminEmail || body.email || "";
    const okOtp = await verifyOtp({
      purpose: "admin-login",
      target,
      code: body.code ?? "",
    });
    if (!okOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }
    await createFashionAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (action === "login-direct") {
    const ok = await verifyFashionAdminCredentials(
      body.username ?? "",
      body.password ?? "",
    );
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    await createFashionAdminSession();
    return NextResponse.json({ ok: true });
  }

  // Legacy password-only (still requires matching default username if provided)
  const ok = await verifyFashionAdminCredentials(
    body.username || "founder",
    body.password ?? "",
  );
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await createFashionAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearFashionAdminSession();
  return NextResponse.json({ ok: true });
}
