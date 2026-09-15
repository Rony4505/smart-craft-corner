import { NextResponse } from "next/server";
import { isFashionAdminAuthenticated } from "@/lib/fashion/customer-auth";
import {
  deletePromoBanner,
  getActivePromoBanners,
  getStoreSettings,
  upsertPromoBanner,
} from "@/lib/fashion/store";
import type { PromoBanner } from "@/lib/fashion/types";

export const dynamic = "force-dynamic";

/** Public: active banners for homepage. Admin sees all. */
export async function GET() {
  const admin = await isFashionAdminAuthenticated();
  if (admin) {
    const settings = await getStoreSettings();
    return NextResponse.json(
      { banners: settings.promoBanners ?? [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
  const banners = await getActivePromoBanners();
  return NextResponse.json(
    { banners },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(request: Request) {
  if (!(await isFashionAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as PromoBanner;
  const banner = await upsertPromoBanner({
    ...body,
    id: body.id || `pb${Date.now()}`,
    sortOrder: body.sortOrder ?? Date.now(),
    active: body.active !== false,
  });
  return NextResponse.json({ banner });
}

export async function DELETE(request: Request) {
  if (!(await isFashionAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deletePromoBanner(id);
  return NextResponse.json({ ok: true });
}
