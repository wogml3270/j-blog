import { Skeleton } from "@/components/ui/skeleton";

// 공개 사이트 라우트 전환 시 공통으로 보여줄 페이지 레벨 스켈레톤이다.
export default function SiteLoading() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="space-y-4">
        <Skeleton width="18%" height={16} />
        <Skeleton width="42%" height={42} />
        <Skeleton width="76%" height={18} />
        <Skeleton width="64%" height={18} />
      </section>

      <section className="space-y-4">
        <Skeleton width="22%" height={24} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={`site-loading-card-${index}`} className="space-y-3 rounded-xl border p-4">
              <Skeleton height={170} rounded="0.75rem" />
              <Skeleton width="36%" height={12} />
              <Skeleton width="70%" height={20} />
              <Skeleton width="92%" height={14} />
              <Skeleton width="78%" height={14} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
