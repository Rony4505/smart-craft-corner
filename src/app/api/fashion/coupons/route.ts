import { NextResponse } from "next/server";
import { isFashionAdminAuthenticated } from "@/lib/fashion/customer-auth";
import { deleteCoupon, listAllCouponsAdmin, upsertCoupon } from "@/lib/fashion/store";
import type { Coupon } from "@/lib/fashion/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isFashionAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await listAllCouponsAdmin();
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  if (!(await isFashionAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Coupon;
  const coupon = await upsertCoupon({
    ...body,
    id: body.id || `cp${Date.now()}`,
  });
  return NextResponse.json({ coupon });
}

export async function DELETE(request: Request) {
  if (!(await isFashionAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
