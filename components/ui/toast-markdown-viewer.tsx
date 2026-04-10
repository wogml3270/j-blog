"use client";

import { useCallback, useEffect, useRef } from "react";
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
  const destroyedRef = useRef(false);

  // Viewer 인스턴스 정리를 안전하게 처리해 DOM detach 충돌을 방지한다.
  const safeDestroy = useCallback(() => {
    if (destroyedRef.current) {
      return;
    }

    destroyedRef.current = true;

    try {
      viewerRef.current?.destroy();
    } catch {
      // 이미 분리된 DOM에서 destroy가 호출된 경우를 무시한다.
    } finally {
      viewerRef.current = null;

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    }
  }, []);

  // 공개/관리자 렌더를 동일하게 맞추기 위해 Toast Viewer를 공통으로 사용한다.
  useEffect(() => {
    let isMounted = true;
    destroyedRef.current = false;

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

      if (!isMounted) {
        safeDestroy();
        return;
      }

      viewerRef.current = instance as unknown as ToastViewerInstance;
    };

    void init();

    return () => {
      isMounted = false;
      safeDestroy();
    };
  }, [safeDestroy]);

  useEffect(() => {
    viewerRef.current?.setMarkdown(markdown ?? "");
  }, [markdown]);

  return <div ref={containerRef} className={cn("markdown-viewer", className)} />;
}
