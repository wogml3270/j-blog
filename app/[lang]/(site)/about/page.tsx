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

function textLabels(lang: "ko" | "en" | "ja") {
  if (lang === "ko") {
    return {
      media: "프로필/기술 스택 미디어",
      basic: "기본 정보",
      more: "개 더",
    };
  }

  if (lang === "ja") {
    return {
      media: "プロフィール / 技術スタック",
      basic: "基本情報",
      more: " more",
    };
  }

  return {
    media: "Profile / Tech Media",
    basic: "Base Profile",
    more: " more",
  };
}

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
  const labels = textLabels(lang);
  const visibleTechItems = profile.aboutTechItems.slice(0, 4);
  const hiddenTechCount = Math.max(0, profile.aboutTechItems.length - visibleTechItems.length);

  return (
    <div className="ui-strong-motion relative left-1/2 right-1/2 -mx-[50vw] -my-8 w-screen sm:-my-10 lg:-my-12">
      <section className="min-h-[var(--home-hero-height)] bg-background px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
        <div className="mx-auto grid w-full max-w-[1280px] gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
          <SlideIn>
            <div className="grid h-full gap-4 xl:grid-rows-[minmax(0,1fr)_auto]">
              <section className="rounded-2xl border border-border/70 bg-surface/65 p-4 shadow-sm sm:p-5">
                <SectionTitle title={dictionary.about.introTitle} description={introDescription} />
                <p className="mt-3 text-base leading-8 text-muted">{profile.aboutExperience}</p>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <section className="space-y-3 rounded-2xl border border-border/70 bg-surface/60 p-4 shadow-sm sm:p-5">
                  <SectionTitle title={dictionary.about.strengthsTitle} />
                  <ul className="space-y-2">
                    {profile.strengths.slice(0, 4).map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-border/70 bg-surface/60 p-4 shadow-sm sm:p-5">
                  <SectionTitle title={dictionary.about.workStyleTitle} />
                  <p className="mt-3 text-base leading-8 text-muted">{profile.workStyle}</p>
                </section>
              </div>
            </div>
          </SlideIn>

          <SlideIn delay={90} direction="right">
            <aside className="grid h-full gap-4 xl:grid-rows-[minmax(0,1fr)_auto]">
              <section className="flex min-h-0 flex-col rounded-2xl border border-border/70 bg-surface/60 p-4 shadow-sm sm:p-5">
                <div className="min-h-[280px] flex-1 overflow-hidden rounded-xl border border-border bg-background/70 sm:min-h-[340px]">
                  <div className="relative h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.aboutPhotoUrl}
                      alt={`${profile.name} profile`}
                      className="h-full w-full object-contain object-center"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-black/35 px-4 py-3 backdrop-blur-sm">
                      <p className="text-base font-semibold text-white">{profile.name}</p>
                      <p className="text-sm text-white/85">{profile.title}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border/70 bg-surface/60 p-4 shadow-sm sm:p-5">
                <SectionTitle
                  title={dictionary.home.techStackTitle}
                  description={dictionary.home.techStackDescription}
                />
                <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {visibleTechItems.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      <article className="rounded-xl border border-border bg-background/75 p-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.logoUrl}
                              alt={`${item.name} logo`}
                              className="h-5 w-5 rounded-sm object-contain"
                              loading="lazy"
                            />
                          </span>
                          <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                          {item.description}
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
                {hiddenTechCount > 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    +{hiddenTechCount}
                    {labels.more}
                  </p>
                ) : null}
              </section>
            </aside>
          </SlideIn>
        </div>
      </section>
    </div>
  );
}
