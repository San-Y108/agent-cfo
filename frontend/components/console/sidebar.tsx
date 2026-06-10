"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Wallet,
  BarChart3,
  Shield,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { ThemeLanguageToggle } from "@/components/ui/theme-language-toggle";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  {
    href: "/console/agent",
    labelKey: "console.tab.agent" as const,
    shortLabel: "Agent",
    icon: Bot,
    color: "#C084FC",
  },
];

/* =============================================================================
 * COLLAPSIBLE SIDEBAR
 * ===========================================================================*/

export function ConsoleSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border-token dark:border-white/[0.06] bg-surface dark:bg-[#0D0D0D] md:flex"
        animate={{ width: open ? 260 : 72 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-fg-subtle opacity-0 transition-opacity hover:text-fg",
            "group-hover/aside:opacity-100"
          )}
          style={{ opacity: 1 }}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? (
            <PanelLeftClose className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 px-5 pt-6 pb-4 h-16"
        >
          <div className="h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-lime-400"
          />
          <motion.span
            animate={{ opacity: open ? 1 : 0, display: open ? "inline" : "none" }}
            className="whitespace-pre text-lg font-bold tracking-tight text-fg"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            AgentCFO
          </motion.span>
          <motion.span
            animate={{ opacity: open ? 1 : 0, display: open ? "inline" : "none" }}
            className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-fg-subtle"
          >
            v0.1
          </motion.span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4"
        >
          <ul className="space-y-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? ""
                        : "text-fg-muted hover:text-fg"
                    )}
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
                    {/* Active indicator */}
                    {isActive && open && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                        style={{ backgroundColor: item.color }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {isActive && !open && (
                      <motion.div
                        layoutId="sidebar-active-dot"
                        className="absolute inset-0 rounded-lg"
                        style={{ backgroundColor: `${item.color}15` }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Color dot */}
                    <span
                      className="flex h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />

                    <Icon
                      size={16}
                      style={{ color: isActive ? item.color : "inherit" }}
                      className="flex-shrink-0"
                    />

                    <motion.span
                      animate={{
                        opacity: open ? 1 : 0,
                        display: open ? "inline-block" : "none",
                      }}
                      className="font-medium whitespace-pre"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {t(item.labelKey as any)}
                    </motion.span>

                    {/* Tooltip for collapsed state */}
                    {!open && (
                      <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-surface border border-white/[0.08] text-xs text-fg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
                      >
                        {t(item.labelKey as any)}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom: theme/lang toggle + exit */}
        <motion.div
          className="border-t border-white/[0.06] px-4 py-4"
          animate={{ opacity: open ? 1 : 0 }}
        >
          <div className="flex items-center justify-between"
          >
            <ThemeLanguageToggle variant="app" />
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-fg-subtle transition-colors hover:bg-white/5 hover:text-fg"
            >
              <LogOut size={13} />
              <span>Exit</span>
            </Link>
          </div>
        </motion.div>
      </motion.aside>

      {/* Mobile Sidebar (unchanged logic) */}
      <MobileSidebar />
    </>
  );
}

/* =============================================================================
 * MOBILE SIDEBAR — unchanged from original
 * ===========================================================================*/

function MobileSidebar() {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border-token dark:border-white/[0.06] bg-surface dark:bg-[#0D0D0D] px-4 md:hidden"
    >
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
