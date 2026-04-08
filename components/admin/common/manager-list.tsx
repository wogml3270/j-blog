import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";
import type { ManagerListProps, ManagerListRowProps } from "@/types/ui";

export function ManagerList({ children, hasItems, emptyLabel }: ManagerListProps) {
  // 리스트 비어있음/정상 상태 렌더를 동일한 카드 컴포넌트로 처리한다.
  return (
    <SurfaceCard tone="surface" className="overflow-hidden">
      <ul>
        {hasItems ? (
          children
        ) : (
          <li className="px-4 py-8 text-center text-sm text-muted">{emptyLabel}</li>
        )}
      </ul>
    </SurfaceCard>
  );
}

export function ManagerListRow({ onClick, children, className }: ManagerListRowProps) {
  // 행 전체를 클릭 타겟으로 고정해 관리자 선택 UX를 단순화한다.
  return (
    <li className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/5",
          className,
        )}
      >
        {children}
      </button>
    </li>
  );
}
