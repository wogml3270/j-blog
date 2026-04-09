import { Tag } from "@/components/ui/tag";

type ProjectMetaProps = {
  role: string;
  period: string;
  techStack: string[];
  roleLabel: string;
  periodLabel: string;
  techStackLabel: string;
};

export function ProjectMeta({
  role,
  period,
  techStack,
  roleLabel,
  periodLabel,
  techStackLabel,
}: ProjectMetaProps) {
  return (
    <dl className="grid gap-5 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
      <div className="space-y-1">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{roleLabel}</dt>
        <dd className="text-sm text-foreground">{role}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{periodLabel}</dt>
        <dd className="text-sm text-foreground">{period}</dd>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
          {techStackLabel}
        </dt>
        <dd className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </dd>
      </div>
    </dl>
  );
}
