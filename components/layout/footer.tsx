import { Container } from "@/components/layout/container";
import { SITE_CONFIG } from "@/lib/site/profile";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE_CONFIG.siteName}. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={SITE_CONFIG.linkedInUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${SITE_CONFIG.email}`}>Email</a>
        </div>
      </Container>
    </footer>
  );
}
