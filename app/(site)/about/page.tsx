import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/section-title";
import { ABOUT_SUMMARY } from "@/lib/site/profile";

export const metadata: Metadata = {
  title: "About",
  description: "경력, 강점, 협업 방식 등 개발자 소개",
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          title="About"
          description="사용자 중심 UI 구현과 유지보수 가능한 구조 설계를 중요하게 생각합니다."
        />
        <p className="text-base leading-8 text-muted">{ABOUT_SUMMARY.experience}</p>
      </section>

      <section className="space-y-4">
        <SectionTitle title="핵심 역량" />
        <ul className="space-y-2">
          {ABOUT_SUMMARY.strengths.map((item) => (
            <li key={item} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle title="작업 방식" />
        <p className="text-base leading-8 text-muted">{ABOUT_SUMMARY.workStyle}</p>
      </section>
    </div>
  );
}
