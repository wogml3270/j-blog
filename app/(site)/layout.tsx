import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Container } from "@/components/layout/container";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
      >
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main-content" className="flex-1 py-10 sm:py-12">
        <Container>{children}</Container>
      </main>
      <Footer />
    </div>
  );
}
