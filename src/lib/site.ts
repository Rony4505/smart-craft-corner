const SITE_URL = "https://noorzaa.com";

/** Canonical public site URL for Noorzaa. */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || SITE_URL;
  const normalized = raw.replace(/\/$/, "");
  if (!normalized || normalized.includes("bloodlinkbd.")) return SITE_URL;
  return normalized;
}
