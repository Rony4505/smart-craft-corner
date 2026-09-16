import { NextResponse } from "next/server";
import { isFashionAdminAuthenticated } from "@/lib/fashion/customer-auth";
import { isGmailAddress, normalizeEmail } from "@/lib/fashion/admin-security";
import { clampProductImageScrollSeconds } from "@/lib/fashion/product-display";
import { getStoreSettings, updateStoreSettings } from "@/lib/fashion/store";

export async function GET() {
  const settings = await getStoreSettings();
  if (await isFashionAdminAuthenticated()) {
    return NextResponse.json({ settings });
  }
  return NextResponse.json({
    settings: {
      ...settings,
      adminRecoveryEmail: "",
      adminEmail: "",
      adminPhone: "",
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isFashionAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (body.adminRecoveryEmail != null) {
    const email = normalizeEmail(String(body.adminRecoveryEmail));
    if (email && !isGmailAddress(email)) {
      return NextResponse.json(
        { error: "Recovery email must be a Gmail address" },
        { status: 400 },
      );
    }
    body.adminRecoveryEmail = email;
  }
  if (body.productImageScrollSeconds != null) {
    body.productImageScrollSeconds = clampProductImageScrollSeconds(
      body.productImageScrollSeconds,
    );
  }
  const settings = await updateStoreSettings(body);
  return NextResponse.json({ settings });
}
