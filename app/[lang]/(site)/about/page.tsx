import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/ui/section-title";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getPublishedProfileContent } from "@/lib/profile/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";

type AboutPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return buildPageMetadata({
    locale: lang,
    pathname: "/about",
    title: dictionary.about.title,
    description: dictionary.about.description,
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const profile = await getPublishedProfileContent(lang);

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          title={dictionary.about.introTitle}
          description={dictionary.about.introDescription}
        />
        <p className="text-base leading-8 text-muted">{profile.aboutExperience}</p>
      </section>

      <section className="space-y-4">
        <SectionTitle title={dictionary.about.strengthsTitle} />
        <ul className="space-y-2">
          {profile.strengths.map((item) => (
            <li key={item} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle title={dictionary.about.workStyleTitle} />
        <p className="text-base leading-8 text-muted">{profile.workStyle}</p>
      </section>
    </div>
  );
}
