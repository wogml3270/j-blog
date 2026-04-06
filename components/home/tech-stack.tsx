import { SectionTitle } from "@/components/ui/section-title";
import { Tag } from "@/components/ui/tag";

type TechStackProps = {
  items: string[];
  title: string;
  description: string;
};

export function TechStack({ items, title, description }: TechStackProps) {
  return (
    <section aria-labelledby="tech-stack-title">
      <SectionTitle title={title} description={description} />
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </section>
  );
}
