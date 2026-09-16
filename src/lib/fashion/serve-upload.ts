import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fashionUploadDir } from "./paths";
import { isSafeFashionUploadName } from "./upload-name";

export { isSafeFashionUploadName };

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const MAX_BYTES = 20 * 1024 * 1024;
/** Previous Noorzaa image host. Used only when the file is missing on this volume. */
const DEFAULT_FALLBACK_ORIGIN = "https://smartcraftcorner.up.railway.app";

export function contentTypeForUpload(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "jpg";
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

export function fashionImageFallbackOrigin(): string | null {
  const raw = process.env.FASHION_IMAGE_FALLBACK_ORIGIN;
  if (raw !== undefined) {
    const trimmed = raw.trim();
    const off = trimmed.toLowerCase();
    if (!trimmed || off === "off" || off === "none" || off === "0") return null;
    return trimmed.replace(/\/+$/, "");
  }
  return DEFAULT_FALLBACK_ORIGIN;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

function isSelfOrigin(origin: string): boolean {
  const fallbackHost = hostOf(origin);
  if (!fallbackHost) return true;

  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : "",
  ];
  for (const candidate of candidates) {
    const host = candidate ? hostOf(candidate) : null;
    if (host && host === fallbackHost) return true;
  }

  return (
    fallbackHost === "noorzaa.com" ||
    fallbackHost === "www.noorzaa.com" ||
    (fallbackHost.endsWith(".up.railway.app") && fallbackHost.includes("noorzaa"))
  );
}

function looksLikeImage(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
  return (
    buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP"
  );
}

export async function readFashionUpload(name: string): Promise<Buffer | null> {
  const dir = fashionUploadDir();
  const filePath = path.join(/* turbopackIgnore: true */ dir, name);

  try {
    return await readFile(filePath);
  } catch {
    // Missing on this volume — try the previous image host next.
  }

  const origin = fashionImageFallbackOrigin();
  if (!origin || isSelfOrigin(origin)) return null;

  try {
    const res = await fetch(`${origin}/api/fashion/files/${encodeURIComponent(name)}`, {
      redirect: "error",
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;

    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (!type.startsWith("image/")) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_BYTES || !looksLikeImage(buf)) return null;

    try {
      await mkdir(dir, { recursive: true });
      await writeFile(filePath, buf);
    } catch {
      // Still return the bytes if the volume is not writable.
    }

    return buf;
  } catch {
    return null;
  }
}
