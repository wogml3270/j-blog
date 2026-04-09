import { cn } from "@/lib/utils/cn";

type LogoutIconProps = {
  className?: string;
};

export function LogoutIcon({ className }: LogoutIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-4 w-4", className)}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H4" />
    </svg>
  );
}
