import type { Locale } from "@/lib/i18n/config";
import type { TocItem } from "@/types/content";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatInline(markdown: string): string {
  const escaped = escapeHtml(markdown);

  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    );
}

export function extractTocFromMarkdown(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const matched = line.match(/^(#{2,4})\s+(.+)$/);

    if (!matched) {
      continue;
    }

    const level = matched[1].length as TocItem["level"];
    const text = matched[2].trim();
    const baseId = slugifyHeading(text) || "section";
    const existingCount = usedIds.get(baseId) ?? 0;
    const nextCount = existingCount + 1;
    usedIds.set(baseId, nextCount);

    toc.push({
      id: existingCount === 0 ? baseId : `${baseId}-${nextCount}`,
      text,
      level,
    });
  }

  return toc;
}

export function estimateReadingTime(markdown: string, locale: Locale = "ko"): string {
  const normalized = markdown.replace(/```[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ");
  const wordCount = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(wordCount / 220));

  if (locale === "ko") {
    return `${minutes}분`;
  }

  if (locale === "ja") {
    return `${minutes}分`;
  }

  return `${minutes} min read`;
}

export function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const chunks: string[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let codeBlockBuffer: string[] = [];
  let isCodeBlock = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    chunks.push(`<p>${formatInline(paragraphBuffer.join(" "))}</p>`);
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    const items = listBuffer.map((item) => `<li>${formatInline(item)}</li>`).join("");
    chunks.push(`<ul>${items}</ul>`);
    listBuffer = [];
  };

  const flushCodeBlock = () => {
    if (codeBlockBuffer.length === 0) {
      return;
    }

    const code = escapeHtml(codeBlockBuffer.join("\n"));
    chunks.push(`<pre><code>${code}</code></pre>`);
    codeBlockBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      flushParagraph();
      flushList();

      if (isCodeBlock) {
        flushCodeBlock();
        isCodeBlock = false;
      } else {
        isCodeBlock = true;
      }

      continue;
    }

    if (isCodeBlock) {
      codeBlockBuffer.push(rawLine);
      continue;
    }

    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();

      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugifyHeading(text);

      chunks.push(`<h${level} id="${id}">${formatInline(text)}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^-\s+(.+)$/);

    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
      continue;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    paragraphBuffer.push(line.trim());
  }

  flushParagraph();
  flushList();

  if (isCodeBlock) {
    flushCodeBlock();
  }

  return chunks.join("\n");
}
