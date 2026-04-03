import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "@/components/theme/provider";
import "./globals.css";

const sans = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.example.com"),
  title: {
    default: "김준호 | Frontend Portfolio",
    template: "%s | 김준호",
  },
  description: "3년차 프론트엔드 개발자의 포트폴리오와 기술 블로그",
  openGraph: {
    title: "김준호 | Frontend Portfolio",
    description: "3년차 프론트엔드 개발자의 포트폴리오와 기술 블로그",
    url: "https://portfolio.example.com",
    siteName: "김준호 Portfolio",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "김준호 | Frontend Portfolio",
    description: "3년차 프론트엔드 개발자의 포트폴리오와 기술 블로그",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
