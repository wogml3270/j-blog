import Image from "next/image";
import Link from "next/link";
import { SlideIn } from "@/components/ui/slide-in";
import { Tag } from "@/components/ui/tag";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";
import type { Project } from "@/types/content";

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  detailLabel: string;
  roleLabel?: string;
  periodLabel?: string;
  animationDelay?: number;
};

export function ProjectCard({
  project,
  locale,
  detailLabel,
  roleLabel = "Role",
  periodLabel = "Period",
  animationDelay = 0,
}: ProjectCardProps) {
  return (
    <SlideIn delay={animationDelay} distance={16}>
      <article className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-foreground/30">
        <div className="aspect-[16/9] overflow-hidden border-b border-border bg-foreground/5">
          <Image
            src={project.thumbnail}
            alt={`${project.title} thumbnail`}
            width={1200}
            height={675}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{project.title}</h3>
            <p className="text-sm text-muted">{project.summary}</p>
          </div>
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
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
          <Link
            href={withLocalePath(locale, `/projects/${project.slug}`)}
            className="inline-flex items-center text-sm font-medium text-foreground underline"
          >
            {detailLabel}
          </Link>
        </div>
      </article>
    </SlideIn>
  );
}
