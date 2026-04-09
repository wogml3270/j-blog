import { notFound } from "next/navigation";
import { ContactFab } from "@/components/contact/fab";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Container } from "@/components/layout/container";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header locale={lang} dictionary={dictionary} />
      <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12">
        <Container>{children}</Container>
      </main>
      <ContactFab labels={dictionary.contact} />
      <Footer locale={lang} dictionary={dictionary} />
    </div>
  );
}
