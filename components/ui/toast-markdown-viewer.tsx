"use client";

import { useCallback, useEffect, useRef } from "react";
import { extractTocFromMarkdown } from "@/lib/blog/markdown";
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

  // 본문 마크다운의 h1은 SEO 일관성을 위해 h2로 강등한다.
  const demoteContentH1 = useCallback(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    const headings = root.querySelectorAll<HTMLHeadingElement>(".toastui-editor-contents h1");

    headings.forEach((heading) => {
      const replaced = document.createElement("h2");
      replaced.setAttribute("data-demoted-from-h1", "true");
      replaced.innerHTML = heading.innerHTML;

      if (heading.id) {
        replaced.id = heading.id;
      }

      heading.replaceWith(replaced);
    });
  }, []);

  // TOC와 본문 heading id를 동일 규칙으로 맞춰 해시 이동이 항상 정확히 동작하도록 동기화한다.
  const syncHeadingIds = useCallback((sourceMarkdown: string) => {
    const root = containerRef.current;

    if (!root || typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      demoteContentH1();

      const headings = root.querySelectorAll<HTMLHeadingElement>(
        ".toastui-editor-contents h2:not([data-demoted-from-h1]), .toastui-editor-contents h3, .toastui-editor-contents h4",
      );
      const toc = extractTocFromMarkdown(sourceMarkdown ?? "");

      headings.forEach((heading, index) => {
        const tocItem = toc[index];

        if (!tocItem) {
          return;
        }

        heading.id = tocItem.id;
      });
    });
  }, [demoteContentH1]);

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
      syncHeadingIds(initialValueRef.current);
    };

    void init();

    return () => {
      isMounted = false;
      safeDestroy();
    };
  }, [safeDestroy, syncHeadingIds]);

  useEffect(() => {
    const nextMarkdown = markdown ?? "";

    viewerRef.current?.setMarkdown(nextMarkdown);
    syncHeadingIds(nextMarkdown);
  }, [markdown, syncHeadingIds]);

  return <div ref={containerRef} className={cn("markdown-viewer", className)} />;
}
