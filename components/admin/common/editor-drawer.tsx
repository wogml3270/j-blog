"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons/close-icon";
import type { EditorDrawerProps } from "@/types/ui";

export function EditorDrawer({ open, title, description, onClose, children }: EditorDrawerProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // 드로어가 열린 동안 스크롤/ESC 닫기 동작을 공통 처리한다.
  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  // 드로어가 열릴 때마다 스크롤을 최상단으로 고정하고 포커스를 패널로 모아 입력 포커스 점프를 막는다.
  useEffect(() => {
    if (!open) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      panelRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [open]);

  // 닫힌 상태에서는 드로어 본문을 언마운트해 에디터 DOM 충돌을 방지한다.
  if (!open) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden={false}
        className="admin-drawer-overlay-in fixed inset-0 z-40 bg-foreground/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        aria-hidden={false}
        className="admin-drawer-panel-in fixed right-0 top-0 z-50 flex h-dvh w-[min(100vw,40rem)] flex-col border-l border-border bg-surface shadow-2xl focus-visible:outline-none"
      >
        <header className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
              {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="닫기">
              <CloseIcon />
              <span className="sr-only">닫기</span>
            </Button>
          </div>
        </header>
        <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </aside>
    </>
  );
}
