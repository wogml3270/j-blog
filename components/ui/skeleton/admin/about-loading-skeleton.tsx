import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

// 소개 관리 헤더 블록(제목/검색/선택 UI 자리)을 맞춘 스켈레톤
function aboutHeaderSkeleton() {
  return (
    <SurfaceCard tone="surface" radius="xl" padding="md" className="space-y-3.5">
      <div className="space-y-2">
        <Skeleton width={138} height={34} rounded="0.55rem" />
        <Skeleton width={210} height={14} rounded="0.35rem" />
      </div>

      <div className="flex flex-col gap-2.5">
        <Skeleton className="w-full" height={40} rounded="0.6rem" />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Skeleton className="w-full sm:w-[6.5rem]" height={40} rounded="0.6rem" />
          <Skeleton className="w-full sm:w-[5.5rem]" height={40} rounded="0.6rem" />
          <Skeleton className="w-full sm:w-[8.5rem]" height={40} rounded="0.6rem" />
        </div>
      </div>
    </SurfaceCard>
  );
}

// 관리자 소개 관리 페이지 전용 스켈레톤 조합 UI
export function AdminAboutLoadingSkeleton() {
  return (
    <main className="space-y-5">
      {aboutHeaderSkeleton()}

      <SurfaceCard tone="surface" radius="2xl" padding="md" className="space-y-4">
        <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
          <Skeleton width={92} height={16} />
          <Skeleton width="44%" height={12} />
          <Skeleton className="w-full" height={140} rounded="0.7rem" />
          <Skeleton width="48%" height={12} />
        </SurfaceCard>

        <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <Skeleton width={76} height={16} />
            <Skeleton width={148} height={28} rounded="999px" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="w-full" height={40} rounded="0.6rem" />
            <Skeleton className="w-full" height={40} rounded="0.6rem" />
          </div>
          <Skeleton className="w-full" height={112} rounded="0.7rem" />
        </SurfaceCard>

        <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-3 sm:p-4">
          <Skeleton width={82} height={16} />
          <div className="grid gap-2 sm:grid-cols-3">
            <Skeleton className="w-full" height={40} rounded="0.6rem" />
            <Skeleton className="w-full" height={40} rounded="0.6rem" />
            <Skeleton className="w-full" height={40} rounded="0.6rem" />
          </div>
          <Skeleton className="w-full" height={84} rounded="0.65rem" />
          <Skeleton width={112} height={36} rounded="0.6rem" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`about-tech-row-skeleton-${index}`}
                className="w-full"
                height={60}
                rounded="0.65rem"
              />
            ))}
          </div>
        </SurfaceCard>
      </SurfaceCard>
    </main>
  );
}
