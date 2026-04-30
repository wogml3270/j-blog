import { ToastMarkdownViewer } from "@/components/ui/toast-markdown-viewer";

interface MarkdownContentProps {
  markdown: string;
}

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  // 상세 페이지 본문은 모바일에서 가로 스크롤이 페이지 전체로 번지지 않도록 래퍼에서 폭을 제한한다.
  return (
    <div className="min-w-0 w-full overflow-x-clip">
      <ToastMarkdownViewer markdown={markdown} className="markdown-viewer min-w-0 w-full max-w-none" />
    </div>
  );
}
