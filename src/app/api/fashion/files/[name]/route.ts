import { NextResponse } from "next/server";
import {
  contentTypeForUpload,
  isSafeFashionUploadName,
  readFashionUpload,
} from "@/lib/fashion/serve-upload";

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  if (!isSafeFashionUploadName(name)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const data = await readFashionUpload(name);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentTypeForUpload(name),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
