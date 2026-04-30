import { Skeleton } from "@/components/ui/skeleton";

// 블로그 상세 하단 댓글 영역의 레이아웃 비율을 맞춘 스켈레톤 블록
function commentsLoadingSkeleton() {
  return (
    <section className="space-y-4 border-t border-border/70 pt-6">
      <Skeleton width={118} height={20} rounded="0.45rem" />
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <Skeleton width={36} height={36} rounded="999px" />
          <div className="flex-1 space-y-2">
            <Skeleton width="28%" height={12} rounded="0.35rem" />
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
            key={`blog-comment-item-skeleton-${index}`}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start gap-3">
              <Skeleton width={34} height={34} rounded="999px" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton width="36%" height={12} rounded="0.35rem" />
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

// 블로그 상세 이동 시 상단 메타, 본문, 목차, 태그, 댓글 구조를 동일 골격으로 보여준다.
export function BlogDetailLoadingSkeleton() {
  return (
    <article className="space-y-8">
      <Skeleton width={108} height={14} />

      <header className="space-y-4">
        <Skeleton width="20%" height={12} />
        <Skeleton width="62%" height={42} rounded="0.7rem" />
        <Skeleton width="84%" height={15} />
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-9">
        <div className="space-y-4">
          <Skeleton width="42%" height={20} rounded="0.5rem" />
          {Array.from({ length: 11 }).map((_, index) => (
            <Skeleton
              key={`blog-body-skeleton-${index}`}
              width={index % 3 === 1 ? "92%" : "100%"}
              height={15}
            />
          ))}
        </div>
        <aside className="hidden space-y-2 rounded-xl border border-border bg-surface p-4 xl:block">
          <Skeleton width="48%" height={14} />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`blog-toc-skeleton-${index}`} width="100%" height={12} />
          ))}
        </aside>
      </div>

      <section className="space-y-3 border-t border-border/70 pt-6">
        <Skeleton width={86} height={12} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`blog-tag-skeleton-${index}`}
              width={68 + index * 8}
              height={26}
              rounded="999px"
            />
          ))}
        </div>
      </section>

      {commentsLoadingSkeleton()}
    </article>
  );
}
