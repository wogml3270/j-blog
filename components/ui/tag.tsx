import { cn } from "@/lib/utils/cn";

type TagProps = {
  children: React.ReactNode;
  className?: string;
};

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
