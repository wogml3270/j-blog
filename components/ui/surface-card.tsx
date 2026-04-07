import { cn } from "@/lib/utils/cn";

type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "surface" | "background";
  radius?: "md" | "lg" | "xl" | "2xl";
  padding?: "none" | "sm" | "md" | "lg";
  dashed?: boolean;
  interactive?: boolean;
};

const toneClassMap = {
  surface: "bg-surface",
  background: "bg-background",
} as const;

const radiusClassMap = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
} as const;

const paddingClassMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
} as const;

export function SurfaceCard({
  children,
  className,
  tone = "surface",
  radius = "xl",
  padding = "none",
  dashed = false,
  interactive = false,
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "border border-border",
        toneClassMap[tone],
        radiusClassMap[radius],
        paddingClassMap[padding],
        dashed && "border-dashed",
        interactive && "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
