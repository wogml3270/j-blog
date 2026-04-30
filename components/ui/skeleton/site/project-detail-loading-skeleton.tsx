import { Skeleton } from "@/components/ui/skeleton";

// 프로젝트 상세 하단 댓글 영역을 실제 폼/리스트 배치 비율로 맞춘다.
function projectCommentsLoadingSkeleton() {
  return (
    <section className="space-y-4 border-t border-border/70 pt-6">
      <Skeleton width={120} height={20} rounded="0.45rem" />
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <Skeleton width={36} height={36} rounded="999px" />
          <div className="flex-1 space-y-2">
            <Skeleton width="30%" height={12} rounded="0.35rem" />
            <Skeleton className="w-full" height={84} rounded="0.65rem" />
          </div>
        </div>
        <div className="flex justify-end">
          <Skeleton width={96} height={36} rounded="0.6rem" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`project-comment-item-skeleton-${index}`}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start gap-3">
              <Skeleton width={34} height={34} rounded="999px" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton width="34%" height={12} rounded="0.35rem" />
                <Skeleton width="96%" height={13} rounded="0.35rem" />
                <Skeleton width="64%" height={13} rounded="0.35rem" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// 프로젝트 상세 이동 시 상단 메타/썸네일과 리뷰/TOC 배치를 동일 골격으로 미리 보여준다.
export function ProjectDetailLoadingSkeleton() {
  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <Skeleton width={116} height={14} />
        <Skeleton width="22%" height={12} />
        <Skeleton width="56%" height={42} rounded="0.7rem" />
        <Skeleton width="66%" height={15} />
      </div>

      <section className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
        <div className="overflow-hidden rounded-xl border border-border lg:col-span-7">
          <Skeleton className="h-56 w-full sm:h-72 lg:h-full" rounded={0} />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5 lg:col-span-5">
          <Skeleton width="24%" height={13} />
          <Skeleton width="82%" height={14} />
          <Skeleton width="28%" height={13} />
          <Skeleton width="74%" height={14} />
          <Skeleton width="34%" height={13} />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`project-meta-tag-skeleton-${index}`} width={66} height={24} rounded="999px" />
            ))}
          </div>
          <Skeleton width="36%" height={13} />
          <div className="space-y-2">
            <Skeleton width="88%" height={12} />
            <Skeleton width="72%" height={12} />
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-9">
        <section className="space-y-3">
          <Skeleton width="26%" height={24} rounded="0.55rem" />
          <div className="space-y-3 rounded-xl border border-border bg-surface p-5">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton
                key={`project-review-skeleton-${index}`}
                width={index % 3 === 0 ? "90%" : "100%"}
                height={14}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <Skeleton width={172} height={12} />
          </div>
        </section>
        <aside className="hidden space-y-2 rounded-xl border border-border bg-surface p-4 xl:block">
          <Skeleton width="48%" height={14} />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`project-toc-skeleton-${index}`} width="100%" height={12} />
          ))}
        </aside>
      </div>

      {projectCommentsLoadingSkeleton()}
    </article>
  );
}
