import { cn } from "@/lib/utils/cn";

type TrashIconProps = {
  className?: string;
};

export function TrashIcon({ className }: TrashIconProps) {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6.5 6 7.4 19.2A2 2 0 0 0 9.4 21h5.2a2 2 0 0 0 2-1.8L17.5 6" />
      <path d="M10 10.5v6" />
      <path d="M14 10.5v6" />
    </svg>
  );
}
