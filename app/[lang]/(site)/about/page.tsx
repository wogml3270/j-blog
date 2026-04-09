import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlideIn } from "@/components/ui/slide-in";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getPublishedProfileContent } from "@/lib/profile/repository";
import { buildPageMetadata } from "@/lib/seo/metadata";

type AboutPageProps = {
  params: Promise<{ lang: string }>;
};

function copyLabels(lang: "ko" | "en" | "ja") {
  if (lang === "ko") {
    return {
      aboutBadge: "About",
      photoBadge: "프로필 카드",
      more: "개 더",
    };
  }

  if (lang === "ja") {
    return {
      aboutBadge: "About",
      photoBadge: "プロフィールカード",
      more: " more",
    };
  }

  return {
    aboutBadge: "About",
    photoBadge: "Profile Card",
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
  const labels = copyLabels(lang);

  // KO 페이지는 관리자에서 저장한 소개 문구를 우선 사용한다.
  const introDescription =
    lang === "ko"
      ? profile.aboutIntroDescriptionKo.trim() || dictionary.about.introDescription
      : dictionary.about.introDescription;

  // 기술 스택은 카드 하단에 아이콘 중심으로 보여주고, 나머지는 개수만 노출한다.
  const visibleTechItems = profile.aboutTechItems.slice(0, 8);
  const hiddenTechCount = Math.max(0, profile.aboutTechItems.length - visibleTechItems.length);

  return (
    <div className="ui-strong-motion relative left-1/2 right-1/2 -mx-[50vw] -my-8 w-screen sm:-my-10 lg:-my-12">
      <section className="min-h-[--home-hero-height] bg-[radial-gradient(circle_at_18%_12%,color-mix(in_srgb,var(--accent)_20%,transparent)_0%,transparent_36%),radial-gradient(circle_at_82%_88%,color-mix(in_srgb,var(--foreground)_10%,transparent)_0%,transparent_42%),linear-gradient(145deg,color-mix(in_srgb,var(--surface)_90%,var(--background))_0%,color-mix(in_srgb,var(--background)_86%,var(--surface))_100%)] px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
        <div className="mx-auto grid w-full max-w-[1240px] items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          {/* 왼쪽: 소개 텍스트 영역 */}
          <div className="space-y-4">
            <SlideIn delay={0} distance={20}>
              <span className="inline-flex rounded-full border border-accent/35 bg-accent/12 px-3 py-1 text-xs font-semibold tracking-wide text-foreground">
                {labels.aboutBadge}
              </span>
            </SlideIn>

            <SlideIn delay={80} distance={24}>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {profile.name}
              </h1>
            </SlideIn>

            <SlideIn delay={140} distance={24}>
              <p className="text-sm font-medium text-muted sm:text-base">{profile.title}</p>
            </SlideIn>

            <SlideIn delay={220} distance={26}>
              <p className="text-base leading-8 text-foreground/95">{introDescription}</p>
            </SlideIn>

            <SlideIn delay={300} distance={26}>
              <p className="text-base leading-8 text-muted">{profile.aboutExperience}</p>
            </SlideIn>
          </div>

          {/* 오른쪽: 프로필 카드 + 기술 스택 아이콘 */}
          <div className="space-y-4">
            <SlideIn delay={120} direction="right" distance={26}>
              <article className="overflow-hidden rounded-3xl border border-border/70 bg-surface/75 shadow-xl shadow-black/10 dark:shadow-black/35">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.aboutPhotoUrl}
                    alt={`${profile.name} profile`}
                    className="h-[260px] w-full object-contain object-center sm:h-[320px]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/38 via-transparent to-transparent" />
                </div>
              </article>
            </SlideIn>

            <section className="rounded-2xl border border-border/70 bg-surface/75 p-4 shadow-sm">
              <SlideIn delay={180} direction="right" distance={22}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {dictionary.home.techStackTitle}
                </p>
              </SlideIn>

              <ul className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-4">
                {visibleTechItems.map((item, index) => (
                  <SlideIn key={`${item.name}-${index}`} delay={220 + index * 50} distance={18}>
                    <li>
                      <article className="group flex items-center justify-center rounded-xl border border-border bg-background/75 p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.logoUrl}
                            alt={`${item.name} logo`}
                            className="h-5 w-5 rounded-sm object-contain"
                            loading="lazy"
                          />
                        </span>
                      </article>
                    </li>
                  </SlideIn>
                ))}
              </ul>

              {hiddenTechCount > 0 ? (
                <SlideIn delay={220 + visibleTechItems.length * 50} distance={14}>
                  <p className="mt-2 text-xs text-muted">
                    +{hiddenTechCount}
                    {labels.more}
                  </p>
                </SlideIn>
              ) : null}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
