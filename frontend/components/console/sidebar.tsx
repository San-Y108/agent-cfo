"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Wallet, BarChart3, Shield } from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { ThemeLanguageToggle } from "@/components/ui/theme-language-toggle";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  {
    href: "/console",
    labelKey: "console.tab.treasury" as const,
    shortLabel: "Treasury",
    icon: LayoutDashboard,
    color: "#B5FF4D",
  },
  {
    href: "/console/wallets",
    labelKey: "console.tab.wallets" as const,
    shortLabel: "Wallets",
    icon: Wallet,
    color: "#60A5FA",
  },
  {
    href: "/console/analytics",
    labelKey: "console.tab.analytics" as const,
    shortLabel: "Analytics",
    icon: BarChart3,
    color: "#C084FC",
  },
  {
    href: "/console/policy",
    labelKey: "console.tab.policy" as const,
    shortLabel: "Policy",
    icon: Shield,
    color: "#FB7185",
  },
];

export function ConsoleSidebar() {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-border-token dark:border-white/[0.06] bg-surface dark:bg-[#0D0D0D]"
    >
      {/* Brand wordmark */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <span
          className="text-lg font-bold tracking-tight text-fg"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          AgentCFO
        </span>
        <span
          className="rounded bg-surface-2 dark:bg-white/5 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-fg-subtle"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          v0.1
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? ""
                      : "text-fg-muted dark:text-white/55 hover:text-fg dark:hover:text-white/85"
                  }`}
                  style={{
                    backgroundColor: isActive ? `${item.color}10` : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = `${item.color}08`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-dot"
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                      style={{ backgroundColor: item.color }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {/* Color dot */}
                  <span
                    className="flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Icon size={16} style={{ color: isActive ? item.color : "inherit" }} />
                  <span className="font-medium text-fg-muted dark:text-white/55 group-hover:text-fg dark:group-hover:text-white/85" style={{ fontFamily: "Inter, sans-serif" }}>
                    {t(item.labelKey)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: theme/lang toggle + exit */}
      <div className="border-t border-border-token dark:border-white/[0.06] px-4 py-4">
        <div className="flex items-center justify-between">
          <ThemeLanguageToggle variant="app" />
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-fg-subtle transition-colors hover:bg-surface-hover dark:hover:bg-white/5 hover:text-fg-muted dark:hover:text-white/70"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <LogOut size={13} />
            <span>Exit</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
