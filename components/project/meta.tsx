import { Tag } from "@/components/ui/tag";

type ProjectMetaProps = {
  role: string;
  period: string;
  techStack: string[];
};

export function ProjectMeta({ role, period, techStack }: ProjectMetaProps) {
  return (
    <dl className="grid gap-5 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
      <div className="space-y-1">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Role</dt>
        <dd className="text-sm text-foreground">{role}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Period</dt>
        <dd className="text-sm text-foreground">{period}</dd>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Tech Stack</dt>
        <dd className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </dd>
      </div>
    </dl>
  );
}
