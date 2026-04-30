import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

// 공개 목록 페이지(블로그/프로젝트) 공통 스켈레톤 UI
export function ContentListLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton width={220} height={34} rounded="0.55rem" />
        <Skeleton width="56%" height={15} rounded="0.45rem" />
      </div>

      <SurfaceCard tone="surface" dashed padding="md">
        <div className="flex flex-col gap-3">
          <Skeleton className="w-full" height={40} rounded="0.6rem" />
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <Skeleton className="w-full sm:w-[6.5rem]" height={40} rounded="0.6rem" />
            <Skeleton className="w-full sm:w-[5.5rem]" height={40} rounded="0.6rem" />
            <Skeleton className="w-full sm:w-[8.5rem]" height={40} rounded="0.6rem" />
          </div>
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SurfaceCard
            key={`content-list-skeleton-${index}`}
            tone="surface"
            radius="xl"
            className="flex h-full flex-col overflow-hidden"
          >
            <Skeleton className="block" height={188} rounded={0} />
            <div className="flex flex-1 flex-col gap-3 p-4">
              <Skeleton width="68%" height={16} rounded="0.45rem" />
              <Skeleton width="92%" height={13} rounded="0.35rem" />
              <Skeleton width="84%" height={13} rounded="0.35rem" />
              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                {Array.from({ length: 3 }).map((__, tagIndex) => (
                  <Skeleton
                    key={`content-list-tag-skeleton-${index}-${tagIndex}`}
                    width={52 + tagIndex * 10}
                    height={22}
                    rounded="999px"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <Skeleton width="58%" height={11} rounded="0.35rem" />
                <Skeleton width="60%" height={11} rounded="0.35rem" />
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
