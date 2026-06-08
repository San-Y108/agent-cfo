"use client";

import React from "react";
import { Moon, Sun, Languages } from "lucide-react";
import { useApp } from "@/lib/i18n/context";

/**
 * 主题 + 语言切换器。
 * variant="hero" 用于落地页 Hero（恒暗背景，固定浅色描边样式）。
 * variant="app" 用于 /demo header（跟随 token 主题）。
 */
export function ThemeLanguageToggle({
  variant = "app",
}: {
  variant?: "hero" | "app";
}) {
  const { theme, lang, toggleTheme, toggleLang } = useApp();

  if (variant === "hero") {
    // Hero 恒暗：用半透明白描边，保证在暗视频上始终可见
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleLang}
          aria-label="Toggle language"
          className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <Languages size={14} />
          {lang === "en" ? "EN" : "中"}
        </button>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    );
  }

  // app: 跟随 token 主题
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggleLang}
        aria-label="Toggle language"
        className="flex items-center gap-1 rounded-full border border-border-token bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-fg"
      >
        <Languages size={14} />
        {lang === "en" ? "EN" : "中"}
      </button>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border-token bg-surface-2 text-fg-muted transition-colors hover:text-fg"
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}
