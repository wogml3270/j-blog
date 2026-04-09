import { ToastMarkdownViewer } from "@/components/ui/toast-markdown-viewer";

interface MarkdownContentProps {
  markdown: string;
}

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  return <ToastMarkdownViewer markdown={markdown} className="markdown-viewer prose max-w-none" />;
}
