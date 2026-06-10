"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { dict, type Lang, type DictKey } from "./dict";

type Theme = "light" | "dark";

interface AppPrefs {
  lang: Lang;
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  t: (key: DictKey) => string;
}

const AppContext = createContext<AppPrefs | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Defaults: dark theme + english (per product decision).
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<Theme>("dark");

  // Hydrate from localStorage / DOM (the inline script in <head> already set the class).
  useEffect(() => {
    const storedLang = (localStorage.getItem("agentcfo-lang") as Lang) || "en";
    const storedTheme = (localStorage.getItem("agentcfo-theme") as Theme) || "dark";
    setLangState(storedLang);
    setThemeState(storedTheme);
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem("agentcfo-theme", t);
      applyTheme(t);
    },
    [applyTheme]
  );

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("agentcfo-lang", l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme]
  );
  const toggleLang = useCallback(
    () => setLang(lang === "en" ? "zh" : "en"),
    [lang, setLang]
  );

  const t = useCallback(
    (key: DictKey) => dict[lang][key] ?? dict.en[key] ?? key,
    [lang]
  );

  return (
    <AppContext.Provider
      value={{ lang, theme, setLang, setTheme, toggleLang, toggleTheme, t }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppPrefs {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/** Convenience hook returning just the translator. */
export function useT() {
  return useApp().t;
}
