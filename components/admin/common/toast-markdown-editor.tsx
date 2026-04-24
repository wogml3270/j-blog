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
  const themeObserverRef = useRef<MutationObserver | null>(null);

  // 현재 사이트 테마(light/dark)에 맞춰 Toast UI 에디터 루트 클래스를 동기화한다.
  const syncEditorThemeClass = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const editorRoot = containerRef.current.querySelector(".toastui-editor-defaultUI");

    if (!editorRoot) {
      return;
    }

    const isDarkMode = document.documentElement.classList.contains("dark");
    editorRoot.classList.toggle("toastui-editor-dark", isDarkMode);
  }, []);

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

      if (themeObserverRef.current) {
        themeObserverRef.current.disconnect();
        themeObserverRef.current = null;
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
        autofocus: false,
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
      syncEditorThemeClass();

      // 테마 토글 시 Toast UI 루트 다크 클래스를 즉시 동기화한다.
      themeObserverRef.current = new MutationObserver(() => {
        syncEditorThemeClass();
      });
      themeObserverRef.current.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    };

    void init();

    return () => {
      isMounted = false;
      safeDestroy();
    };
  }, [height, placeholder, safeDestroy, syncEditorThemeClass]);

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
