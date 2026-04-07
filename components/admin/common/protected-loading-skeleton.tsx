import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

function dashboardCardSkeleton(index: number) {
  const widthMap = ["34%", "26%", "31%", "29%"] as const;

  return (
    <SurfaceCard
      key={`dashboard-card-skeleton-${index}`}
      tone="surface"
      radius="xl"
      padding="md"
      className="space-y-2"
    >
      <Skeleton width={widthMap[index] ?? "32%"} height={12} rounded="0.35rem" />
      <Skeleton width="24%" height={30} rounded="0.45rem" />
      <Skeleton width="46%" height={12} rounded="0.35rem" />
    </SurfaceCard>
  );
}

function managerHeaderSkeleton(hasAction: boolean) {
  return (
    <SurfaceCard tone="surface" radius="xl" padding="md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton width={164} height={14} rounded="0.35rem" />
          <Skeleton width={220} height={12} rounded="0.35rem" />
        </div>
        {hasAction ? <Skeleton width={92} height={36} rounded="0.6rem" /> : null}
      </div>
    </SurfaceCard>
  );
}

function managerListSkeleton() {
  const titleWidths = ["43%", "39%", "47%", "34%", "41%"] as const;

  return (
    <SurfaceCard tone="background" radius="xl" className="p-2.5">
      <ul className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={`admin-list-skeleton-${index}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5"
          >
            <Skeleton width={50} height={20} rounded="999px" />
            <Skeleton width={titleWidths[index] ?? "42%"} height={14} rounded="0.35rem" />
            <Skeleton className="hidden sm:inline-block" width={84} height={12} rounded="0.35rem" />
            <Skeleton width={72} height={12} rounded="0.35rem" />
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}

function aboutSectionSkeleton(titleWidth: number, lineWidth: string) {
  return (
    <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-2 sm:p-4">
      <Skeleton width={titleWidth} height={16} rounded="0.35rem" />
      <Skeleton width={lineWidth} height={12} rounded="0.35rem" />
      <Skeleton className="w-full" height={108} rounded="0.65rem" />
    </SurfaceCard>
  );
}

function recentPanelSkeleton(titleWidth: number) {
  return (
    <SurfaceCard tone="surface" padding="md">
      <div className="flex items-center justify-between gap-3">
        <Skeleton width={titleWidth} height={14} rounded="0.35rem" />
        <Skeleton width={46} height={12} rounded="0.35rem" />
      </div>
      <ul className="mt-3 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={`recent-panel-row-${titleWidth}-${index}`}>
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <Skeleton width={index === 0 ? "66%" : index === 1 ? "58%" : "49%"} height={14} rounded="0.35rem" />
              <Skeleton className="mt-1" width={118} height={12} rounded="0.35rem" />
            </div>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}

function pageTitleSkeleton(width = 180) {
  return <Skeleton width={width} height={36} rounded="0.55rem" />;
}

export function AdminDashboardLoadingSkeleton() {
  return (
    <main className="space-y-6">
      {pageTitleSkeleton(188)}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => dashboardCardSkeleton(index))}
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

export function AdminListManagerLoadingSkeleton({
  titleWidth = 148,
  hasAction = true,
}: {
  titleWidth?: number;
  hasAction?: boolean;
}) {
  return (
    <main className="space-y-5">
      {pageTitleSkeleton(titleWidth)}
      {managerHeaderSkeleton(hasAction)}
      {managerListSkeleton()}
    </main>
  );
}

export function AdminHomeLoadingSkeleton() {
  return (
    <main className="space-y-5">
      {pageTitleSkeleton(124)}
      {managerHeaderSkeleton(false)}
      <SurfaceCard tone="surface" radius="2xl" padding="md" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="w-full" height={40} rounded="0.55rem" />
          <Skeleton className="w-full" height={40} rounded="0.55rem" />
        </div>
        <Skeleton className="w-full" height={40} rounded="0.55rem" />
        <Skeleton className="w-full" height={112} rounded="0.7rem" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton width={88} height={28} rounded="999px" />
          <Skeleton width={94} height={36} rounded="0.6rem" />
        </div>
      </SurfaceCard>
    </main>
  );
}

export function AdminAboutLoadingSkeleton() {
  return (
    <main className="space-y-5">
      {pageTitleSkeleton(136)}
      {managerHeaderSkeleton(false)}
      <SurfaceCard tone="surface" radius="2xl" padding="md" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton width={58} height={24} rounded="999px" />
        </div>
        {aboutSectionSkeleton(46, "42%")}
        {aboutSectionSkeleton(64, "36%")}
        {aboutSectionSkeleton(64, "34%")}
        <SurfaceCard tone="background" radius="xl" padding="sm" className="space-y-2 sm:p-4">
          <Skeleton width={64} height={14} rounded="0.35rem" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-9 w-full" rounded="0.55rem" />
            <Skeleton className="h-9 w-full" rounded="0.55rem" />
          </div>
        </SurfaceCard>
        <div className="flex items-center justify-between gap-2">
          <Skeleton width={88} height={28} rounded="999px" />
          <Skeleton width={94} height={36} rounded="0.6rem" />
        </div>
      </SurfaceCard>
    </main>
  );
}
