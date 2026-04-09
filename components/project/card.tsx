import Image from "next/image";
import { SlideIn } from "@/components/ui/slide-in";
import { Tag } from "@/components/ui/tag";
import { MediaCard } from "@/components/ui/media-card";
import { withLocalePath } from "@/lib/i18n/config";
import { stripMarkdownToPlainText } from "@/lib/blog/markdown";
import { encodeSlugSegment } from "@/lib/utils/slug";
import type { ProjectCardProps } from "@/types/ui";

export function ProjectCard({
  project,
  locale,
  roleLabel = "Role",
  periodLabel = "Period",
  animationDelay = 0,
}: ProjectCardProps) {
  const plainSummary = stripMarkdownToPlainText(project.summary);

  // 프로젝트 카드도 블로그 카드와 동일한 골격을 사용해 유지보수 포인트를 줄인다.
  return (
    <SlideIn delay={animationDelay} distance={16} className="h-full">
      <MediaCard
        href={withLocalePath(locale, `/projects/${encodeSlugSegment(project.slug)}`)}
        className="h-full"
        media={
          <div className="aspect-video overflow-hidden border-b border-border bg-foreground/5">
            <Image
              src={project.thumbnail}
              alt={`${project.title} thumbnail`}
              width={1200}
              height={675}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        }
        meta={
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">{roleLabel}</dt>
              <dd className="text-foreground">{project.role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">{periodLabel}</dt>
              <dd className="text-foreground">{project.period}</dd>
            </div>
          </dl>
        }
        title={project.title}
        description={plainSummary}
        tags={
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
        }
        bodyClassName="space-y-4 p-5"
      />
    </SlideIn>
  );
}
