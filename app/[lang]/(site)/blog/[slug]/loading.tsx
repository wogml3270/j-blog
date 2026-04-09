import { Skeleton } from "@/components/ui/skeleton";

// 블로그 상세 이동 시 본문 구조에 맞춘 스켈레톤을 제공한다.
export default function BlogDetailLoading() {
  return (
    <article className="space-y-8">
      <Skeleton width="20%" height={14} />
      <header className="space-y-4">
        <Skeleton width="18%" height={12} />
        <Skeleton width="60%" height={40} />
        <Skeleton width="88%" height={16} />
        <Skeleton width="72%" height={16} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`blog-tag-skeleton-${index}`} width={72} height={26} rounded="999px" />
          ))}
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={`blog-body-skeleton-${index}`}
              width={index % 3 === 0 ? "92%" : "100%"}
              height={16}
            />
          ))}
        </div>
        <div className="space-y-2 rounded-xl border p-4">
          <Skeleton width="42%" height={14} />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`blog-toc-skeleton-${index}`} width="100%" height={12} />
          ))}
        </div>
      </div>
    </article>
  );
}
