import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";

type ManagerShellProps = {
  children: React.ReactNode;
  summary: string;
  detail?: string;
  action?: React.ReactNode;
  message?: string | null;
  className?: string;
  motion?: boolean;
};

export function ManagerShell({
  children,
  summary,
  detail,
  action,
  message,
  className,
  motion = false,
}: ManagerShellProps) {
  return (
    <section className={cn("mx-auto w-full space-y-4", motion && "ui-strong-motion", className)}>
      <SurfaceCard className="px-4 py-3.5" tone="surface">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
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
