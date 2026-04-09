import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "solid" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  solid:
    "bg-foreground text-background hover:bg-foreground/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90",
  outline: "border border-border bg-transparent text-foreground hover:bg-foreground/5",
  ghost: "bg-transparent text-foreground hover:bg-foreground/10",
  destructive:
    "border border-red-500/40 bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:border-red-400/40 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function buttonStyles({
  variant = "solid",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium cursor-pointer transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
