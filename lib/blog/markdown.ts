import type { TocItem } from "@/types/blog";

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
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
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

export function stripMarkdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~>]/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const chunks: string[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let quoteBuffer: string[] = [];
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
    if (listBuffer.length === 0 || !listType) {
      return;
    }

    const items = listBuffer.map((item) => `<li>${formatInline(item)}</li>`).join("");
    chunks.push(`<${listType}>${items}</${listType}>`);
    listBuffer = [];
    listType = null;
  };

  const flushQuote = () => {
    if (quoteBuffer.length === 0) {
      return;
    }

    chunks.push(
      `<blockquote><p>${quoteBuffer.map((line) => formatInline(line)).join("<br />")}</p></blockquote>`,
    );
    quoteBuffer = [];
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
    const collapsed = line.replace(/\s+/g, "");

    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      flushQuote();

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

    if (collapsed === "***" || collapsed === "---" || collapsed === "___") {
      flushParagraph();
      flushList();
      flushQuote();
      chunks.push("<hr />");
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();

      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugifyHeading(text);

      chunks.push(`<h${level} id="${id}">${formatInline(text)}</h${level}>`);
      continue;
    }

    const unorderedListMatch = line.match(/^\s*[-*+]\s+(.+)$/);
    const orderedListMatch = line.match(/^\s*\d+\.\s+(.+)$/);

    if (unorderedListMatch || orderedListMatch) {
      flushParagraph();

      const nextListType = orderedListMatch ? "ol" : "ul";

      if (listType && listType !== nextListType) {
        flushList();
      }

      flushQuote();
      listType = nextListType;
      listBuffer.push((orderedListMatch ?? unorderedListMatch)?.[1] ?? "");
      continue;
    }

    const quoteMatch = line.match(/^\s*>\s?(.*)$/);

    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteBuffer.push(quoteMatch[1]);
      continue;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    flushList();
    flushQuote();
    paragraphBuffer.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushQuote();

  if (isCodeBlock) {
    flushCodeBlock();
  }

  return chunks.join("\n");
}
