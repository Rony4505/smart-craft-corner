import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const now = new Date();
  const paths = ["", "/collections", "/about", "/contact", "/store-admin", "/track", "/cart"];

  return paths.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/collections" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/collections" ? 0.9 : 0.7,
  }));
}
