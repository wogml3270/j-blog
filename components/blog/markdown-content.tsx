import { renderMarkdownToHtml } from "@/lib/blog/markdown";

type MarkdownContentProps = {
  markdown: string;
};

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  const html = renderMarkdownToHtml(markdown);

  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
