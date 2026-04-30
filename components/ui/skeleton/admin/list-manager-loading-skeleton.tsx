import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

type ManagerHeaderSkeletonProps = {
  titleWidth: number;
  hasAction: boolean;
  compactToolbar?: boolean;
};

// 관리자 목록형 페이지 헤더(제목/요약/툴바/생성 버튼) 레이아웃을 맞춘 스켈레톤
function managerHeaderSkeleton({
  titleWidth,
  hasAction,
  compactToolbar = false,
}: ManagerHeaderSkeletonProps) {
  return (
    <SurfaceCard tone="surface" radius="xl" padding="md" className="space-y-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton width={titleWidth} height={34} rounded="0.55rem" />
          <Skeleton width={210} height={14} rounded="0.35rem" />
        </div>
        {hasAction ? <Skeleton width={136} height={42} rounded="0.65rem" /> : null}
      </div>

      <div className="flex flex-col gap-2.5">
        <Skeleton className="w-full" height={40} rounded="0.6rem" />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Skeleton className="w-full sm:w-[6.5rem]" height={40} rounded="0.6rem" />
          <Skeleton className="w-full sm:w-[5.5rem]" height={40} rounded="0.6rem" />
          <Skeleton className="w-full sm:w-[8.5rem]" height={40} rounded="0.6rem" />
          {!compactToolbar ? (
            <Skeleton className="w-full sm:w-[8.5rem]" height={40} rounded="0.6rem" />
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}

type ManagerSectionSkeletonProps = {
  index: number;
  withThumbnail: boolean;
};

// 공개/비공개(또는 신규/답변완료) 섹션 카드의 리스트 + 페이지네이션 골격을 맞춘 스켈레톤
function managerSectionSkeleton({ index, withThumbnail }: ManagerSectionSkeletonProps) {
  return (
    <SurfaceCard
      key={`admin-manager-section-skeleton-${index}`}
      tone="surface"
      radius="xl"
      padding="md"
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton width={86 + index * 8} height={24} rounded="0.5rem" />
        <Skeleton width={58} height={20} rounded="999px" />
      </div>

      <ul className="space-y-2">
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <li
            key={`admin-manager-row-skeleton-${index}-${rowIndex}`}
            className="rounded-lg border border-border bg-background px-3 py-3"
          >
            <div className="flex items-start gap-3">
              {withThumbnail ? (
                <Skeleton width={88} height={56} rounded="0.65rem" />
              ) : (
                <Skeleton width={34} height={34} rounded="999px" />
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton width={rowIndex % 2 === 0 ? "56%" : "48%"} height={14} />
                <Skeleton width={rowIndex % 2 === 0 ? "74%" : "62%"} height={12} />
                <div className="flex flex-wrap gap-1.5">
                  <Skeleton width={54} height={22} rounded="999px" />
                  <Skeleton width={62} height={22} rounded="999px" />
                </div>
              </div>
              <div className="flex min-w-[100px] flex-col items-end gap-1">
                <Skeleton width={66} height={22} rounded="999px" />
                <Skeleton width={86} height={11} rounded="0.35rem" />
                <Skeleton width={90} height={11} rounded="0.35rem" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-end gap-2">
        <Skeleton width={32} height={32} rounded="0.45rem" />
        <Skeleton width={36} height={32} rounded="0.45rem" />
        <Skeleton width={32} height={32} rounded="0.45rem" />
      </div>
    </SurfaceCard>
  );
}

export type AdminListManagerLoadingSkeletonProps = {
  titleWidth?: number;
  hasAction?: boolean;
  sectionCount?: number;
  withThumbnail?: boolean;
  compactToolbar?: boolean;
};

// 관리자 목록형 페이지(블로그/프로젝트/문의/홈) 공통 스켈레톤 조합 UI
export function AdminListManagerLoadingSkeleton({
  titleWidth = 164,
  hasAction = true,
  sectionCount = 2,
  withThumbnail = true,
  compactToolbar = false,
}: AdminListManagerLoadingSkeletonProps) {
  return (
    <main className="space-y-5">
      {managerHeaderSkeleton({ titleWidth, hasAction, compactToolbar })}
      <div className="space-y-4">
        {Array.from({ length: Math.max(1, sectionCount) }).map((_, index) =>
          managerSectionSkeleton({ index, withThumbnail }),
        )}
      </div>
    </main>
  );
}
