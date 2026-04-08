"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Toast UI는 브라우저 API에 의존하므로 클라이언트 마운트 이후 동적 생성한다.
  useEffect(() => {
    let isMounted = true;

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
      editorRef.current = nextEditor;
    };

    void init();

    return () => {
      isMounted = false;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [height, placeholder]);

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
