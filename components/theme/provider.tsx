"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: "class";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
};

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme | undefined;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = true,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    try {
      const saved = window.localStorage.getItem(storageKey) as Theme | null;
      return saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemTheme(),
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  const applyTheme = useCallback(
    (nextResolvedTheme: ResolvedTheme) => {
      const root = document.documentElement;

      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(nextResolvedTheme);
      }
      root.style.colorScheme = nextResolvedTheme;
    },
    [attribute],
  );

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [applyTheme, resolvedTheme]);

  useEffect(() => {
    if (!enableSystem) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [enableSystem]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      const root = document.documentElement;

      root.dataset.themeTransition = "active";
      window.setTimeout(() => {
        delete root.dataset.themeTransition;
      }, 420);

      setThemeState(nextTheme);
      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch {}
      const nextResolvedTheme: ResolvedTheme =
        nextTheme === "system" ? getSystemTheme() : nextTheme;
      applyTheme(nextResolvedTheme);
    },
    [applyTheme, storageKey],
  );

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: mounted ? resolvedTheme : undefined,
      setTheme,
    }),
    [mounted, resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
