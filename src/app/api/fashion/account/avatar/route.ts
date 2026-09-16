import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentCustomer, sanitizeCustomer } from "@/lib/fashion/customer-auth";
import { fashionUploadDir, fashionUploadUrl } from "@/lib/fashion/paths";
import { updateCustomer } from "@/lib/fashion/store";

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "কোনো ছবি বাছাই হয়নি" }, { status: 400 });
  }
  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "ছবি ৩ MB-এর কম হতে হবে" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const idPart = customer.id.replace(/[^A-Za-z0-9._-]/g, "") || "user";
  const filename = `fashion-avatar-${idPart}-${Date.now()}.${safeExt}`;
  const uploadDir = fashionUploadDir();
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const avatarUrl = fashionUploadUrl(filename);
  const updated = await updateCustomer(customer.id, { avatarUrl });
  if (!updated) {
    return NextResponse.json({ error: "ছবি সেভ হয়নি" }, { status: 400 });
  }
  return NextResponse.json({ url: avatarUrl, customer: sanitizeCustomer(updated) });
}
