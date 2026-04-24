import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSiteCopy } from "@/lib/site/profile";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteCopy("ko");

  return buildPageMetadata({
    locale: "ko",
    pathname: "/",
    title: site.title,
    description: site.description,
    shareCard: {
      mode: "dynamicShareCard",
      imagePath: "/PJH-about.png",
    },
  });
}

export default function IndexPage() {
  return null;
}
