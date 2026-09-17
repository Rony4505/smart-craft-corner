import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/store-admin", "/api/", "/account", "/checkout"],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
