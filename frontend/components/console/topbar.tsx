"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FlaskConical, Activity, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/lib/i18n/context";

const TAB_META: Record<
  string,
  { titleKey: string; subtitleKey: string; color: string }
> = {
  "/console": {
    titleKey: "console.tab.agent",
    subtitleKey: "console.agent.desc",
    color: "#B5FF4D",
  },
  "/console/agent": {
    titleKey: "console.tab.agent",
    subtitleKey: "console.agent.desc",
    color: "#B5FF4D",
  },
  "/console/wallets": {
    titleKey: "console.tab.wallets",
    subtitleKey: "console.wallets.desc",
    color: "#60A5FA",
  },
  "/console/analytics": {
    titleKey: "console.tab.analytics",
    subtitleKey: "console.analytics.desc",
    color: "#C084FC",
  },
  "/console/policy": {
    titleKey: "console.tab.policy",
    subtitleKey: "console.policy.desc",
    color: "#FB7185",
  },
};

export function ConsoleTopbar({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const pathname = usePathname();
  const { t } = useApp();

  const meta = TAB_META[pathname] || TAB_META["/console"];

  return (
    <header className="flex items-center justify-between border-b border-border-token dark:border-white/[0.06] bg-surface/80 dark:bg-[#0D0D0D]/80 px-6 py-4 backdrop-blur-sm">
      {/* Left: title + subtitle */}
      <div>
        <h1
          className="text-base font-semibold text-fg"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {t(meta.titleKey as any)}
        </h1>
        <p
          className="mt-0.5 max-w-md text-xs text-fg-subtle"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {t(meta.subtitleKey as any)}
        </p>
      </div>

      {/* Right: activity pill + drawer trigger */}
      <div className="flex items-center gap-3">
        {/* Activity indicator pill */}
        <div className="hidden items-center gap-2 rounded-full border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] px-3 py-1.5 sm:flex">
          <Activity size={12} className="text-emerald-400" />
          <span
            className="text-[10px] font-mono uppercase tracking-wider text-fg-muted"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            Sepolia Testnet
          </span>
        </div>

        {/* Sandbox / Live Rules trigger */}
        <button
          onClick={onOpenDrawer}
          className="group flex items-center gap-2 rounded-lg border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] px-3 py-2 text-xs text-fg-muted transition-all hover:border-border-strong dark:hover:border-white/20 hover:bg-surface-hover dark:hover:bg-white/[0.06] hover:text-fg"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <FlaskConical size={14} className="text-hud-cyan" />
          <span className="hidden sm:inline">Sandbox</span>
          <span className="mx-0.5 text-fg-subtle dark:text-white/20">|</span>
          <SlidersHorizontal size={14} className="text-hud-coral" />
          <span className="hidden sm:inline">Rules</span>
        </button>
      </div>
    </header>
  );
}
