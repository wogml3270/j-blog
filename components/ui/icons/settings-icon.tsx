import { cn } from "@/lib/utils/cn";

type SettingsGearIconProps = {
  className?: string;
};

export function SettingsIcon({ className }: SettingsGearIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-4.5 w-4.5", className)}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2.8" />
      <path d="M19.4 12a7.6 7.6 0 0 0-.1-1.2l2-1.5-1.8-3.1-2.4 1a7.7 7.7 0 0 0-2-1.2L14.7 3h-3.5L10.8 6a7.7 7.7 0 0 0-2 1.2l-2.4-1L4.6 9.3l2 1.5a7.6 7.6 0 0 0 0 2.4l-2 1.5 1.8 3.1 2.4-1a7.7 7.7 0 0 0 2 1.2l.4 3h3.5l.4-3a7.7 7.7 0 0 0 2-1.2l2.4 1 1.8-3.1-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}
