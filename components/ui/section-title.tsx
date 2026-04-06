import { SlideIn } from "@/components/ui/slide-in";

type SectionTitleProps = {
  title: string;
  description?: string;
};

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <SlideIn className="mb-6 space-y-2" direction="up" distance={14}>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description ? <p className="text-sm text-muted sm:text-base">{description}</p> : null}
    </SlideIn>
  );
}
