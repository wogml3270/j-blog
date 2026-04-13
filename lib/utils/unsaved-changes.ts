"use client";

import { useEffect } from "react";

export const UNSAVED_CHANGES_MESSAGE =
  "저장되지 않은 변경 사항이 있습니다. 확인을 누르면 저장하지 않고 이동합니다.";

export function confirmUnsavedChanges(message = UNSAVED_CHANGES_MESSAGE): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.confirm(message);
}

export function useBeforeUnloadUnsavedChanges(
  enabled: boolean,
  message = UNSAVED_CHANGES_MESSAGE,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled, message]);
}
