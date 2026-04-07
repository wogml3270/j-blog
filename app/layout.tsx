import type { Metadata } from "next";
import Script from "next/script";
import {
  JetBrains_Mono,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "@toast-ui/editor/dist/toastui-editor.css";
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
const themeInitScript = `(() => {
  try {
    const storageKey = "theme";
    const saved = window.localStorage.getItem(storageKey);
    const isValid = saved === "light" || saved === "dark" || saved === "system";
    const theme = isValid ? saved : "light";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  } catch {
    const root = document.documentElement;
    root.classList.add("light");
    root.style.colorScheme = "light";
  }
})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: {
    default: defaultSite.title,
    template: `%s | ${defaultSite.siteName}`,
  },
  description: defaultSite.description,
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
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
