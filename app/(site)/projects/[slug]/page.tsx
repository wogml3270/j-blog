import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectMeta } from "@/components/project/meta";
import { SectionTitle } from "@/components/ui/section-title";
import { getAllProjects, getProjectBySlug } from "@/lib/projects/data";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <Link href="/projects" className="inline-flex text-sm text-muted underline">
          ← 프로젝트 목록
        </Link>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{project.title}</h1>
          <p className="text-base text-muted">{project.summary}</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border">
        <Image
          src={project.thumbnail}
          alt={`${project.title} thumbnail`}
          width={1200}
          height={675}
          className="h-full w-full object-cover"
        />
      </div>

      <ProjectMeta role={project.role} period={project.period} techStack={project.techStack} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <SectionTitle title="성과" />
          <ul className="space-y-2">
            {project.achievements.map((item) => (
              <li key={item} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <SectionTitle title="주요 기여" />
          <ul className="space-y-2">
            {project.contributions.map((item) => (
              <li key={item} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle title="관련 링크" />
        <ul className="flex flex-wrap gap-3 text-sm">
          {project.links.live ? (
            <li>
              <a href={project.links.live} target="_blank" rel="noreferrer" className="underline">
                Live
              </a>
            </li>
          ) : null}
          {project.links.repo ? (
            <li>
              <a href={project.links.repo} target="_blank" rel="noreferrer" className="underline">
                Repository
              </a>
            </li>
          ) : null}
          {project.links.detail ? (
            <li>
              <a href={project.links.detail} target="_blank" rel="noreferrer" className="underline">
                Case Study
              </a>
            </li>
          ) : null}
        </ul>
      </section>
    </article>
  );
}
