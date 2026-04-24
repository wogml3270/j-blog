import { Skeleton } from "@/components/ui/skeleton";

// 홈 히어로 로딩 전환 시 사용하는 스켈레톤 UI
export function ImmersiveHeroSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="relative left-1/2 right-1/2 -mx-[50vw] -mb-8 -mt-8 w-screen overflow-hidden sm:-mb-10 sm:-mt-10 lg:-mb-12 lg:-mt-12"
    >
      <div
        className="relative overflow-hidden border-y border-border/40 bg-surface/60"
        style={{
          minHeight: "var(--home-hero-height, calc(100dvh - 64px - 96px))",
          height: "var(--home-hero-height, calc(100dvh - 64px - 96px))",
        }}
      >
        <Skeleton className="absolute inset-0 block" width="100%" height="100%" rounded={0} />
        <div className="absolute inset-0 bg-linear-to-r from-black/28 via-black/14 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1240px] items-end px-5 pb-28 pt-18 sm:px-8 sm:pb-34">
          <div className="w-full max-w-[min(74ch,78vw)] space-y-4">
            <Skeleton width={176} height={28} rounded="999px" />
            <Skeleton width="72%" height={52} rounded="0.75rem" />
            <Skeleton width="66%" height={22} rounded="0.75rem" />
            <Skeleton width={140} height={44} rounded="999px" />
            <Skeleton width="74%" height={86} rounded="0.75rem" />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`hero-thumb-skeleton-${index}`} height={68} rounded="0.75rem" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
