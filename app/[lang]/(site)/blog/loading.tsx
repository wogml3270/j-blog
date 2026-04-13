import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

export default function BlogListLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 flex flex-col gap-1">
        <Skeleton width={188} height={36} rounded="0.55rem" />
        <Skeleton width="54%" height={16} rounded="0.45rem" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SurfaceCard
            key={`blog-list-skeleton-${index}`}
            tone="surface"
            radius="xl"
            className="overflow-hidden"
          >
            <Skeleton className="block" height={182} rounded={0} />
            <div className="space-y-3.5 p-5">
              <Skeleton width="72%" height={12} rounded="0.35rem" />
              <Skeleton width="64%" height={16} rounded="0.45rem" />
              <Skeleton width="94%" height={13} rounded="0.35rem" />
              <Skeleton width="86%" height={13} rounded="0.35rem" />
              <div className="flex gap-2 pt-1">
                <Skeleton width={44} height={22} rounded="999px" />
                <Skeleton width={54} height={22} rounded="999px" />
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
