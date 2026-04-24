import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_JP, Noto_Sans_KR, Plus_Jakarta_Sans } from "next/font/google";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import "swiper/css";
import "swiper/css/pagination";
import { ThemeProvider } from "@/components/theme/provider";
import { defaultLocale, isLocale, localeInfo } from "@/lib/i18n/config";
import { SITE_CONFIG, getSiteCopy } from "@/lib/site/profile";
import "./globals.css";

const sansKo = Noto_Sans_KR({
  variable: "--font-sans-ko",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const sansEn = Plus_Jakarta_Sans({
  variable: "--font-sans-en",
  subsets: ["latin"],
  display: "swap",
});

const sansJa = Noto_Sans_JP({
  variable: "--font-sans-ja",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const defaultSite = getSiteCopy(defaultLocale);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: defaultSite.title,
  description: defaultSite.description,
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icons/favicon-32.png",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang?: string }>;
}>) {
  const langParam = (await params).lang;
  const htmlLang =
    langParam && isLocale(langParam)
      ? localeInfo[langParam].htmlLang
      : localeInfo[defaultLocale].htmlLang;

  return (
    <html
      lang={htmlLang}
      suppressHydrationWarning
      className={`${sansKo.variable} ${sansEn.variable} ${sansJa.variable} ${mono.variable} light`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
