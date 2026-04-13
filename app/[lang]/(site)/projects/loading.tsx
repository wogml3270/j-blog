import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

export default function ProjectsListLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 flex flex-col gap-1">
        <Skeleton width={210} height={36} rounded="0.55rem" />
        <Skeleton width="58%" height={16} rounded="0.45rem" />
      </div>

      <SurfaceCard tone="surface" dashed padding="md">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Skeleton className="h-15 w-full" rounded="0.6rem" />
          <Skeleton width={96} height={40} rounded="0.6rem" />
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SurfaceCard
            key={`projects-list-skeleton-${index}`}
            tone="surface"
            radius="xl"
            className="overflow-hidden"
          >
            <Skeleton className="block" height={182} rounded={0} />
            <div className="space-y-3 p-5">
              <Skeleton width="62%" height={16} rounded="0.45rem" />
              <Skeleton width="96%" height={13} rounded="0.35rem" />
              <Skeleton width="88%" height={13} rounded="0.35rem" />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Skeleton width="90%" height={12} rounded="0.35rem" />
                <Skeleton width="86%" height={12} rounded="0.35rem" />
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
