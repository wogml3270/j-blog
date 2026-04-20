import { Tag } from "@/components/ui/tag";

type ProjectMetaProps = {
  role: string;
  period: string;
  techStack: string[];
  links: Array<{ label: string; url: string }>;
  roleLabel: string;
  periodLabel: string;
  techStackLabel: string;
  relatedLinksLabel: string;
};

export function ProjectMeta({
  role,
  period,
  techStack,
  links,
  roleLabel,
  periodLabel,
  techStackLabel,
  relatedLinksLabel,
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
      <div className="space-y-2 sm:col-span-2">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
          {relatedLinksLabel}
        </dt>
        <dd className="flex flex-wrap gap-2 text-sm">
          {links.length > 0 ? (
            links.map((item) => (
              <a
                key={`${item.label}-${item.url}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground underline"
              >
                {item.label}
              </a>
            ))
          ) : (
            <span className="text-xs text-muted">-</span>
          )}
        </dd>
      </div>
    </dl>
  );
}
