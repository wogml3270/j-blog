import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
