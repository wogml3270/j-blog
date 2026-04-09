import { Skeleton } from "@/components/ui/skeleton";

// 프로젝트 상세 이동 시 상단 미디어/메타와 본문 섹션을 미리 보여준다.
export default function ProjectDetailLoading() {
  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <Skeleton width="20%" height={14} />
        <Skeleton width="46%" height={40} />
      </div>

      <section className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
        <div className="overflow-hidden rounded-xl border border-border lg:col-span-7">
          <Skeleton height={320} rounded={0} />
        </div>
        <div className="space-y-3 rounded-xl border p-5 lg:col-span-5">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={`project-meta-skeleton-${index}`} width="100%" height={14} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Skeleton width="22%" height={24} />
        <div className="rounded-xl border p-5 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`project-summary-skeleton-${index}`} width="100%" height={14} />
          ))}
        </div>
      </section>
    </article>
  );
}
