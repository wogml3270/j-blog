import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: number | string;
  animated?: boolean;
};

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton({
  className,
  width = "100%",
  height = "1rem",
  rounded = "0.5rem",
  animated = true,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("ui-skeleton", animated && "ui-skeleton-animated", className)}
      style={{
        width: toCssSize(width),
        height: toCssSize(height),
        borderRadius: toCssSize(rounded),
      }}
    />
  );
}
