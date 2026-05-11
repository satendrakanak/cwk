"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};

const THEME_STORAGE_KEY = "theme";
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(resolvedTheme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = React.useState<Theme>("light");
  const [systemTheme, setSystemTheme] =
    React.useState<ResolvedTheme>("light");

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "light";
    const nextSystemTheme = mediaQuery.matches ? "dark" : "light";

    setTheme(savedTheme);
    setSystemTheme(nextSystemTheme);
    applyTheme(savedTheme === "system" ? nextSystemTheme : savedTheme);

    const handleChange = (event: MediaQueryListEvent) => {
      const nextTheme = event.matches ? "dark" : "light";
      setSystemTheme(nextTheme);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      setTheme((event.newValue as Theme | null) ?? "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  React.useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(resolvedTheme);
  }, [theme, resolvedTheme]);

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      setTheme,
    }),
    [resolvedTheme, systemTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
