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
    titleKey: "console.tab.treasury",
    subtitleKey: "console.treasury.welcomeDesc",
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
    <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0D0D0D]/80 px-6 py-4 backdrop-blur-sm">
      {/* Left: title + subtitle */}
      <div>
        <h1
          className="text-base font-semibold text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {t(meta.titleKey as any)}
        </h1>
        <p
          className="mt-0.5 max-w-md text-xs text-white/40"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {t(meta.subtitleKey as any)}
        </p>
      </div>

      {/* Right: activity pill + drawer trigger */}
      <div className="flex items-center gap-3">
        {/* Activity indicator pill */}
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 sm:flex">
          <Activity size={12} className="text-emerald-400" />
          <span
            className="text-[10px] font-mono uppercase tracking-wider text-white/50"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            Sepolia Testnet
          </span>
        </div>

        {/* Sandbox / Live Rules trigger */}
        <button
          onClick={onOpenDrawer}
          className="group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white/90"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <FlaskConical size={14} className="text-[#5EEAD4]" />
          <span className="hidden sm:inline">Sandbox</span>
          <span className="mx-0.5 text-white/20">|</span>
          <SlidersHorizontal size={14} className="text-[#FB7185]" />
          <span className="hidden sm:inline">Rules</span>
        </button>
      </div>
    </header>
  );
}
