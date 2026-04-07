import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type MediaCardProps = {
  href: string;
  media?: React.ReactNode;
  meta?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  tags?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
};

export type MediaCardBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export function MediaCardBody({ children, className }: MediaCardBodyProps) {
  return <div className={cn("space-y-3 p-5", className)}>{children}</div>;
}

export function MediaCard({
  href,
  media,
  meta,
  title,
  description,
  tags,
  footer,
  className,
  bodyClassName,
}: MediaCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-foreground/30",
        className,
      )}
    >
      {media ?? null}
      <MediaCardBody className={bodyClassName}>
        {meta ?? null}
        <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:underline">{title}</h3>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
        {tags ?? null}
        {footer ?? null}
      </MediaCardBody>
    </Link>
  );
}
