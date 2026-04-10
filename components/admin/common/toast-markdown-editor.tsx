"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

type ToastMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
};

type ToastEditorInstance = {
  getMarkdown: () => string;
  setMarkdown: (value: string, cursorToEnd?: boolean) => void;
  destroy: () => void;
};

export function ToastMarkdownEditor({
  value,
  onChange,
  placeholder = "",
  height = "280px",
  className,
}: ToastMarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ToastEditorInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const destroyedRef = useRef(false);

  // StrictMode/빠른 언마운트에서도 destroy가 중복 호출되지 않도록 안전하게 정리한다.
  const safeDestroy = useCallback(() => {
    if (destroyedRef.current) {
      return;
    }

    destroyedRef.current = true;

    try {
      editorRef.current?.destroy();
    } catch {
      // 이미 DOM이 분리된 타이밍에 destroy가 불리더라도 런타임 오류를 전파하지 않는다.
    } finally {
      editorRef.current = null;

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    }
  }, []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Toast UI는 브라우저 API에 의존하므로 클라이언트 마운트 이후 동적 생성한다.
  useEffect(() => {
    let isMounted = true;
    destroyedRef.current = false;

    const init = async () => {
      const { Editor } = await import("@toast-ui/editor");

      if (!isMounted || !containerRef.current) {
        return;
      }

      let nextEditor: ToastEditorInstance | null = null;

      const instance = new Editor({
        el: containerRef.current,
        initialEditType: "markdown",
        // 미리보기는 Toast UI 기본 렌더를 그대로 신뢰하고 탭 형태로 노출한다.
        previewStyle: "tab",
        hideModeSwitch: true,
        usageStatistics: false,
        height,
        initialValue: initialValueRef.current,
        placeholder,
        events: {
          change: () => {
            if (!nextEditor) {
              return;
            }

            onChangeRef.current(nextEditor.getMarkdown());
          },
        },
      });

      nextEditor = instance as unknown as ToastEditorInstance;

      if (!isMounted) {
        safeDestroy();
        return;
      }

      editorRef.current = nextEditor;
    };

    void init();

    return () => {
      isMounted = false;
      safeDestroy();
    };
  }, [height, placeholder, safeDestroy]);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (editor.getMarkdown() !== value) {
      editor.setMarkdown(value ?? "", false);
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={cn("admin-toast-editor rounded-md border border-border bg-background", className)}
    />
  );
}
