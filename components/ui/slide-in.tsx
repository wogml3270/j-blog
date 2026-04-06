import { cn } from "@/lib/utils/cn";

type SlideDirection = "up" | "down" | "left" | "right";

type SlideInProps = {
  children: React.ReactNode;
  className?: string;
  direction?: SlideDirection;
  delay?: number;
  duration?: number;
  distance?: number;
};

function getTranslate(direction: SlideDirection, distance: number) {
  if (direction === "left") {
    return { x: `${distance}px`, y: "0px" };
  }

  if (direction === "right") {
    return { x: `-${distance}px`, y: "0px" };
  }

  if (direction === "down") {
    return { x: "0px", y: `-${distance}px` };
  }

  return { x: "0px", y: `${distance}px` };
}

export function SlideIn({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 520,
  distance = 18,
}: SlideInProps) {
  const translate = getTranslate(direction, distance);

  return (
    <div
      className={cn("ui-slide-in", className)}
      style={
        {
          "--slide-delay": `${delay}ms`,
          "--slide-duration": `${duration}ms`,
          "--slide-translate-x": translate.x,
          "--slide-translate-y": translate.y,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
