import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
