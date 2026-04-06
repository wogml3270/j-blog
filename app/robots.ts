import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"],
      },
    ],
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap.xml`,
  };
}
