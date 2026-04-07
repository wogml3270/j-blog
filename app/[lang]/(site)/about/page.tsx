import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/ui/section-title";
import { SlideIn } from "@/components/ui/slide-in";
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
  const introDescription =
    lang === "ko"
      ? profile.aboutIntroDescriptionKo.trim() || dictionary.about.introDescription
      : dictionary.about.introDescription;

  return (
    <div className="ui-strong-motion space-y-8">
      <SlideIn>
        <section className="rounded-2xl border border-border/70 bg-surface/60 p-5 sm:p-6 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
          <SectionTitle title={dictionary.about.introTitle} description={introDescription} />
          <p className="text-base leading-8 text-muted">{profile.aboutExperience}</p>
        </section>
      </SlideIn>

      <SlideIn delay={90}>
        <section className="space-y-4 rounded-2xl border border-border/70 bg-surface/55 p-5 sm:p-6 shadow-sm">
          <SectionTitle title={dictionary.about.strengthsTitle} />
          <ul className="space-y-2.5">
            {profile.strengths.map((item, index) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm"
                style={{ transitionDelay: `${index * 45}ms` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </SlideIn>

      <SlideIn delay={180}>
        <section className="rounded-2xl border border-border/70 bg-surface/60 p-5 sm:p-6 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
          <SectionTitle title={dictionary.about.workStyleTitle} />
          <p className="text-base leading-8 text-muted">{profile.workStyle}</p>
        </section>
      </SlideIn>
    </div>
  );
}
