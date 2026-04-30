import { Skeleton } from "@/components/ui/skeleton";

// About 페이지 리빌 레이아웃(프로필 원형 + 소개 카드 + 기술 카드) 전용 스켈레톤
export function InteractiveAboutLoadingSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="relative min-h-[--home-hero-height] px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full overflow-hidden lg:max-w-[58%]">
          <article className="w-full rounded-3xl border border-border/70 bg-background/70 p-4 pt-60 backdrop-blur-sm lg:pt-5">
            <Skeleton width={98} height={34} rounded="0.65rem" />
            <div className="mt-4 space-y-2.5">
              <Skeleton width="95%" height={16} />
              <Skeleton width="88%" height={16} />
              <Skeleton width="74%" height={16} />
            </div>

            <div className="mt-5 rounded-2xl border border-border/60 bg-surface/75 p-3.5 sm:p-4">
              <Skeleton width="42%" height={20} rounded="0.45rem" />
              <Skeleton className="mt-2" width="56%" height={14} />
            </div>

            <Skeleton className="mt-5" width={88} height={12} />
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`about-category-skeleton-${index}`} width={74} height={30} rounded="999px" />
              ))}
            </div>

            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={`about-tech-card-skeleton-${index}`}
                  className="rounded-xl border border-border bg-surface/85 p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton width={36} height={36} rounded="0.55rem" />
                    <Skeleton width="44%" height={14} />
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <Skeleton width="96%" height={12} />
                    <Skeleton width="82%" height={12} />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="absolute left-1/2 top-0 z-20 aspect-square w-52 -translate-x-1/2 overflow-hidden rounded-full bg-surface/95 p-1.5 shadow-2xl sm:w-60 lg:left-4/5 lg:top-1/2 lg:w-72 lg:-translate-y-1/2">
          <Skeleton className="h-full w-full" rounded="999px" />
        </div>
      </div>
    </section>
  );
}
