import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";
import type { ManagerShellProps } from "@/types/ui";

export function ManagerShell({
  title,
  children,
  summary,
  detail,
  action,
  message,
  className,
  motion = false,
}: ManagerShellProps) {
  // 관리자 섹션의 공통 상단 정보/메시지 레이아웃을 통일한다.
  return (
    <section className={cn("mx-auto w-full space-y-4", motion && "ui-strong-motion", className)}>
      <SurfaceCard className="px-4 py-3.5" tone="surface">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted">{summary}</p>
            {detail ? <p className="text-xs text-muted">{detail}</p> : null}
          </div>
          {action ?? null}
        </div>
      </SurfaceCard>

      {children}

      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </section>
  );
}
