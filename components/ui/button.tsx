import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  solid:
    "bg-foreground text-background hover:bg-foreground/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-foreground/5",
  ghost: "bg-transparent text-foreground hover:bg-foreground/10",
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
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
