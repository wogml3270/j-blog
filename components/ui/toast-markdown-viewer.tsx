"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

type ToastMarkdownViewerProps = {
  markdown: string;
  className?: string;
};

type ToastViewerInstance = {
  setMarkdown: (markdown: string) => void;
  destroy: () => void;
};

export function ToastMarkdownViewer({ markdown, className }: ToastMarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<ToastViewerInstance | null>(null);
  const initialValueRef = useRef(markdown ?? "");

  // 공개/관리자 렌더를 동일하게 맞추기 위해 Toast Viewer를 공통으로 사용한다.
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { default: ToastViewer } = await import("@toast-ui/editor/viewer");

      if (!isMounted || !containerRef.current) {
        return;
      }

      const instance = new ToastViewer({
        el: containerRef.current,
        initialValue: initialValueRef.current,
        usageStatistics: false,
      });

      viewerRef.current = instance as unknown as ToastViewerInstance;
    };

    void init();

    return () => {
      isMounted = false;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setMarkdown(markdown ?? "");
  }, [markdown]);

  return <div ref={containerRef} className={cn("markdown-viewer", className)} />;
}
