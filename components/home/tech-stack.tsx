import { SectionTitle } from "@/components/ui/section-title";
import { Tag } from "@/components/ui/tag";

type TechStackProps = {
  items: string[];
};

export function TechStack({ items }: TechStackProps) {
  return (
    <section aria-labelledby="tech-stack-title">
      <SectionTitle
        title="기술 스택"
        description="최근 1~2년 동안 실무에서 주로 사용한 도구와 기술입니다."
      />
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </section>
  );
}
