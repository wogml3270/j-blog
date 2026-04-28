import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 네이버(Yeti) 포함 주요 검색엔진이 공개 페이지를 수집하도록 허용한다.
      {
        userAgent: "Yeti",
        allow: "/",
        disallow: ["/admin", "/api", "/auth/callback"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/auth/callback"],
      },
    ],
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap.xml`,
    host: SITE_CONFIG.siteUrl,
  };
}
