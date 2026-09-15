import { NextResponse } from "next/server";
import { isFashionAdminAuthenticated } from "@/lib/fashion/customer-auth";
import { clearProductOffer } from "@/lib/fashion/store";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isFashionAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await clearProductOffer(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
