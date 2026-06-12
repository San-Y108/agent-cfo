"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SquaresFour,
  Wallet,
  ChartBar,
  Shield,
  Robot,
} from "@phosphor-icons/react";
import { useApp } from "@/lib/i18n/context";

const NAV_ITEMS = [
  {
    href: "/console",
    labelKey: "console.tab.treasury" as const,
    icon: SquaresFour,
    color: "#B5FF4D",
  },
  {
    href: "/console/wallets",
    labelKey: "console.tab.wallets" as const,
    icon: Wallet,
    color: "#60A5FA",
  },
  {
    href: "/console/analytics",
    labelKey: "console.tab.analytics" as const,
    icon: ChartBar,
    color: "#C084FC",
  },
  {
    href: "/console/policy",
    labelKey: "console.tab.policy" as const,
    icon: Shield,
    color: "#FB7185",
  },
  {
    href: "/console/agent",
    labelKey: "console.tab.agent" as const,
    icon: Robot,
    color: "#C084FC",
  },
];

/**
 * Mobile top navigation bar.
 * Desktop navigation is handled by ConsoleNavDock.
 */
export function ConsoleSidebar() {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border-token dark:border-white/[0.06] bg-surface dark:bg-[#0D0D0D] px-4 md:hidden">
      <span className="text-base font-bold text-fg">AgentCFO</span>
      <div className="flex items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center rounded-lg p-2 transition-colors",
                isActive ? "bg-white/[0.05] text-fg" : "text-fg-subtle"
              )}
            >
              <Icon size={18} style={{ color: isActive ? item.color : undefined }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
