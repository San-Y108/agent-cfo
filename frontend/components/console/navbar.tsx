"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FlaskConical, SlidersHorizontal, Activity } from "lucide-react";
import {
  Robot,
  SquaresFour,
  Wallet,
  ChartBar,
  Shield,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/i18n/context";
import type { DictKey } from "@/lib/i18n/dict";
import { useConsoleState } from "@/lib/console/console-state";
import { isMockMode } from "@/lib/api/client";
import { ThemeLanguageToggle } from "@/components/ui/theme-language-toggle";

const NAV_TABS: {
  href: string;
  labelKey: DictKey;
  icon: React.ElementType;
  color: string;
  lightColor: string;
}[] = [
  { href: "/console", labelKey: "console.tab.agent", icon: Robot, color: "#B5FF4D", lightColor: "#4d7c0f" },
  { href: "/console/treasury", labelKey: "console.tab.treasury", icon: SquaresFour, color: "#5EEAD4", lightColor: "#0e7490" },
  { href: "/console/wallets", labelKey: "console.tab.wallets", icon: Wallet, color: "#60A5FA", lightColor: "#1d4ed8" },
  { href: "/console/analytics", labelKey: "console.tab.analytics", icon: ChartBar, color: "#C084FC", lightColor: "#6d28d9" },
  { href: "/console/policy", labelKey: "console.tab.policy", icon: Shield, color: "#FB7185", lightColor: "#be123c" },
];

function isTabActive(pathname: string, href: string) {
  if (href === "/console") {
    return pathname === "/console" || pathname === "/console/agent";
  }
  return pathname === href;
}

function NavPills({
  pathname,
  compact,
  getLabel,
  isDark,
}: {
  pathname: string;
  compact?: boolean;
  getLabel: (key: DictKey) => string;
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-border-token bg-surface-2/80 p-1 backdrop-blur-xl",
        compact ? "p-1" : "p-1"
      )}
    >
      {NAV_TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        const Icon = tab.icon;
        const accent = isDark ? tab.color : tab.lightColor;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "group relative flex items-center gap-1.5 rounded-full transition-colors duration-200",
              compact ? "px-2.5 py-1.5" : "px-3 py-1.5 xl:px-3.5",
              active ? "text-fg" : "text-fg-muted hover:text-fg"
            )}
            style={{ ["--tab-accent" as string]: accent }}
          >
            {/* Inactive hover wash */}
            {!active && (
              <span className="absolute inset-0 rounded-full bg-surface/0 transition-colors duration-200 group-hover:bg-surface-hover/50" />
            )}

            {/* Active state — accent-tinted glass fill + soft aura, no underline */}
            {active && (
              <>
                <motion.span
                  layoutId="console-nav-pill-aura"
                  aria-hidden
                  className="pointer-events-none absolute -inset-1.5 rounded-full blur-md"
                  style={{
                    background: `radial-gradient(58% 130% at 50% 50%, ${accent}3a, transparent 72%)`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
                <motion.span
                  layoutId="console-nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: isDark
                      ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 24%, transparent) 0%, color-mix(in srgb, ${accent} 9%, transparent) 100%)`
                      : `linear-gradient(180deg, color-mix(in srgb, ${accent} 17%, white) 0%, color-mix(in srgb, ${accent} 8%, white) 100%)`,
                    border: `1px solid ${accent}4d`,
                    boxShadow: `0 6px 20px -10px ${accent}88, inset 0 0 14px -8px ${accent}66`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              </>
            )}

            {/* Icon with active pop + inactive hover lift */}
            <motion.span
              className="relative z-10 flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5"
              animate={active ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <Icon
                size={14}
                weight={active ? "fill" : "regular"}
                style={{ color: active ? accent : undefined }}
              />
            </motion.span>

            <span
              className={cn(
                "relative z-10 font-medium whitespace-nowrap transition-all duration-200",
                compact ? "text-[11px]" : "text-[12px] xl:text-[13px]",
                active && "font-semibold"
              )}
              style={{
                fontFamily: "Inter, sans-serif",
                color: active ? accent : undefined,
                textShadow: active ? `0 0 18px ${accent}44` : undefined,
              }}
            >
              {getLabel(tab.labelKey)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * ConsoleNavbar — fixed top navigation mirroring the landing page pill nav.
 * Desktop: logo left, centered pill tabs, controls right.
 * Mobile: logo row + horizontally scrollable pill strip.
 */
export function ConsoleNavbar() {
  const pathname = usePathname();
  const { lang, t, theme } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const { openDrawer } = useConsoleState();
  const isDark = theme === "dark";
  const mockMode = isMockMode();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="relative border-b border-border-token bg-bg/85 backdrop-blur-xl backdrop-saturate-150">
        {/* lime hairline glow, same recipe as landing nav */}
        <div
          className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(181,255,77,0.16) 25%, rgba(94,234,212,0.18) 50%, rgba(181,255,77,0.16) 75%, transparent 100%)",
          }}
        />

        <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 lg:px-6">
          {/* Left: brand */}
          <div className="flex min-w-0 items-center gap-2.5">
            <Link href="/" className="group flex shrink-0 items-center gap-2">
              <img
                src="/logo.png"
                alt="AgentCFO"
                className="h-7 w-7 lg:h-8 lg:w-8"
                style={{ filter: "drop-shadow(0 0 6px rgba(181,255,77,0.45))" }}
              />
              <span
                className="hidden sm:block text-sm font-bold tracking-tight bg-gradient-to-r from-lime-700 via-cyan-700 to-violet-700 dark:from-lime-400 dark:via-cyan-400 dark:to-violet-400 bg-clip-text text-transparent lg:text-base"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AgentCFO
              </span>
            </Link>
            <span className="hidden xl:flex items-center gap-1.5 rounded-full border border-border-token bg-surface-2/60 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-fg-muted">
              {_('工作台', 'Console')}
            </span>
          </div>

          {/* Center: pill tabs (desktop) — grid column prevents overlap with right controls */}
          <div className="hidden justify-self-center md:block">
            <NavPills pathname={pathname} getLabel={(key) => t(key)} isDark={isDark} />
          </div>

          {/* Right: status + controls */}
          <div className="flex min-w-0 items-center justify-end gap-2 lg:gap-2.5">
            <div className="hidden 2xl:flex items-center gap-1.5 rounded-full border border-border-token bg-surface-2/50 px-2.5 py-1">
              <Activity size={10} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
                {_('Sepolia', 'Sepolia')}
              </span>
              <span className="text-fg-subtle">·</span>
              <span
                className={cn(
                  "text-[10px] font-mono font-semibold uppercase tracking-wider",
                  mockMode ? "text-hud-lime" : "text-hud-cyan"
                )}
              >
                {mockMode ? _('演示', 'Mock') : _('实盘', 'Real')}
              </span>
            </div>

            <span
              className={cn(
                "hidden xl:inline 2xl:hidden rounded-full border px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider",
                mockMode
                  ? "border-hud-lime/35 bg-hud-lime/10 text-hud-lime"
                  : "border-hud-cyan/35 bg-hud-cyan/10 text-hud-cyan"
              )}
            >
              {mockMode ? _('演示', 'Mock') : _('实盘', 'Real')}
            </span>

            <ThemeLanguageToggle variant="app" />

            <button
              type="button"
              onClick={() => openDrawer("sandbox")}
              title={_('沙盒', 'Sandbox')}
              aria-label={_('打开沙盒', 'Open sandbox')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border-token bg-surface-2/60 text-fg-muted transition-all hover:border-border-strong hover:bg-surface-hover hover:text-fg"
            >
              <FlaskConical size={14} className="text-hud-cyan" />
            </button>

            <button
              type="button"
              onClick={() => openDrawer("rules")}
              title={_('护栏', 'Rules')}
              aria-label={_('打开护栏', 'Open rules')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border-token bg-surface-2/60 text-fg-muted transition-all hover:border-border-strong hover:bg-surface-hover hover:text-fg"
            >
              <SlidersHorizontal size={14} className="text-hud-coral" />
            </button>

            <Link
              href="/"
              className="hidden md:inline-flex h-8 items-center gap-1 rounded-full px-3 text-[11px] font-semibold transition-all duration-300 hover:opacity-80 lg:px-3.5 lg:text-xs"
              style={{
                fontFamily: "Inter, sans-serif",
                backgroundColor: "#B5FF4D",
                color: "#0D0D0D",
              }}
            >
              <ArrowLeft size={12} />
              {lang === "zh" ? "首页" : "Home"}
            </Link>
          </div>
        </div>

        {/* Mobile: scrollable pill strip */}
        <div className="md:hidden px-3 pb-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-max">
            <NavPills pathname={pathname} compact getLabel={(key) => t(key)} isDark={isDark} />
          </div>
        </div>
      </div>
    </header>
  );
}
