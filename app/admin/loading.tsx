import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

export default function AdminLoading() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl items-center px-4">
      <SurfaceCard tone="surface" radius="2xl" padding="md" className="w-full space-y-4">
        <Skeleton width={160} height={24} rounded="0.45rem" />
        <Skeleton width="68%" height={14} rounded="0.35rem" />
        <Skeleton className="w-full" height={42} rounded="0.6rem" />
        <Skeleton className="w-full" height={42} rounded="0.6rem" />
      </SurfaceCard>
    </main>
  );
}
