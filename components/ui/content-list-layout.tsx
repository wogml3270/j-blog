import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/utils/cn";

type ContentListLayoutProps = {
  title: string;
  description?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  listClassName?: string;
};

export function ContentListLayout({
  title,
  description,
  toolbar,
  children,
  className,
  listClassName,
}: ContentListLayoutProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <SectionTitle title={title} description={description} />
      {toolbar ?? null}
      <div className={listClassName}>{children}</div>
    </div>
  );
}
