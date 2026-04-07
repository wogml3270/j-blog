import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils/cn";

type ManagerListProps = {
  children: React.ReactNode;
  hasItems: boolean;
  emptyLabel: string;
};

export function ManagerList({ children, hasItems, emptyLabel }: ManagerListProps) {
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

type ManagerListRowProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export function ManagerListRow({ onClick, children, className }: ManagerListRowProps) {
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
