"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// SSR/CSR hydration 시점 불일치 없이 클라이언트 마운트 여부를 구한다.
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

