import Link from "next/link";
import { Container } from "@/components/layout/container";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { SITE_CONFIG, getSiteCopy } from "@/lib/site/profile";
import { SocialProviderIcon } from "../ui/icons/social-provider-icon";

type FooterProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function Footer({ locale, dictionary }: FooterProps) {
  const site = getSiteCopy(locale);

  return (
    <footer id="site-footer" className="border-t-2 border-border/70 bg-background">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.siteName}. {dictionary.footer.rightsReserved}
        </p>
        <div className="flex items-center gap-4">
          <a href={SITE_CONFIG.githubUrl} className="flex gap-2" target="_blank" rel="noreferrer">
            <SocialProviderIcon provider="github" /> GitHub
          </a>
          <a href={`mailto:${SITE_CONFIG.email}`}>{dictionary.footer.emailLabel}</a>
          <Link href="/admin/login">{dictionary.footer.adminLabel}</Link>
        </div>
      </Container>
    </footer>
  );
}
