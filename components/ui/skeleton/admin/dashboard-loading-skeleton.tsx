import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

// 대시보드 KPI 카드 한 칸을 실제 카드 비율에 맞춰 렌더링한다.
function dashboardCardSkeleton(index: number) {
  const titleWidths = ["36%", "28%", "34%", "31%", "33%"] as const;

  return (
    <SurfaceCard
      key={`dashboard-card-skeleton-${index}`}
      tone="surface"
      radius="xl"
      padding="md"
      className="space-y-2"
    >
      <Skeleton width={titleWidths[index] ?? "32%"} height={12} rounded="0.35rem" />
      <Skeleton width="26%" height={30} rounded="0.45rem" />
      <Skeleton width="48%" height={12} rounded="0.35rem" />
    </SurfaceCard>
  );
}

// 대시보드 하단 최근 항목 패널(블로그/프로젝트/문의)의 공통 스켈레톤
function recentPanelSkeleton(titleWidth: number) {
  return (
    <SurfaceCard tone="surface" padding="md">
      <div className="flex items-center justify-between gap-3">
        <Skeleton width={titleWidth} height={14} rounded="0.35rem" />
        <Skeleton width={28} height={28} rounded="0.45rem" />
      </div>
      <ul className="mt-3 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={`recent-panel-row-${titleWidth}-${index}`}>
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <Skeleton
                width={index === 0 ? "66%" : index === 1 ? "58%" : "49%"}
                height={14}
                rounded="0.35rem"
              />
              <Skeleton className="mt-1" width={118} height={12} rounded="0.35rem" />
            </div>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}

// 관리자 대시보드 페이지 전체 스켈레톤 조합 UI
export function AdminDashboardLoadingSkeleton() {
  return (
    <main className="space-y-6">
      <Skeleton width={136} height={34} rounded="0.55rem" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => dashboardCardSkeleton(index))}
      </div>

      <SurfaceCard tone="surface" padding="md" className="space-y-2.5">
        <Skeleton width={116} height={14} rounded="0.35rem" />
        <Skeleton width="52%" height={14} rounded="0.35rem" />
        <Skeleton width="44%" height={14} rounded="0.35rem" />
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-3">
        {recentPanelSkeleton(104)}
        {recentPanelSkeleton(128)}
        {recentPanelSkeleton(76)}
      </div>
    </main>
  );
}
