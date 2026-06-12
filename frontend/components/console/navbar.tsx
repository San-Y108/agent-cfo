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
import { useConsoleState } from "@/lib/console/console-state";

const NAV_TABS = [
  { href: "/console", label: "Agent", icon: Robot, color: "#B5FF4D" },
  { href: "/console/treasury", label: "Treasury", icon: SquaresFour, color: "#5EEAD4" },
  { href: "/console/wallets", label: "Wallets", icon: Wallet, color: "#60A5FA" },
  { href: "/console/analytics", label: "Analytics", icon: ChartBar, color: "#C084FC" },
  { href: "/console/policy", label: "Policy", icon: Shield, color: "#FB7185" },
];

function isTabActive(pathname: string, href: string) {
  if (href === "/console") {
    return pathname === "/console" || pathname === "/console/agent";
  }
  return pathname === href;
}

function NavPills({ pathname, compact }: { pathname: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full p-1.5",
        "border border-white/[0.08] bg-white/[0.06] backdrop-blur-xl"
      )}
    >
      {NAV_TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex items-center gap-2 rounded-full transition-colors duration-200",
              compact ? "px-3 py-1.5" : "px-4 py-1.5",
              active ? "text-white" : "text-white/55 hover:text-white/90"
            )}
          >
            {active && (
              <motion.span
                layoutId="console-nav-pill"
                className="absolute inset-0 rounded-full bg-white/[0.1] border border-white/[0.1]"
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -6px ${tab.color}66`,
                }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon
              size={15}
              weight={active ? "fill" : "regular"}
              className="relative z-10 shrink-0"
              style={{ color: active ? tab.color : undefined }}
            />
            <span
              className={cn(
                "relative z-10 text-[13px] font-medium whitespace-nowrap",
                compact && "text-xs"
              )}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {tab.label}
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
  const { lang } = useApp();
  const { openDrawer } = useConsoleState();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className="relative border-b border-white/[0.07]"
        style={{
          backgroundColor: "rgba(13,13,13,0.78)",
          backdropFilter: "blur(16px) saturate(1.2)",
          WebkitBackdropFilter: "blur(16px) saturate(1.2)",
        }}
      >
        {/* lime hairline glow, same recipe as landing nav */}
        <div
          className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(181,255,77,0.16) 25%, rgba(94,234,212,0.18) 50%, rgba(181,255,77,0.16) 75%, transparent 100%)",
          }}
        />

        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Left: brand + back to landing */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              <img
                src="/logo.png"
                alt="AgentCFO"
                className="h-8 w-8"
                style={{ filter: "drop-shadow(0 0 6px rgba(181,255,77,0.45))" }}
              />
              <span
                className="hidden sm:block text-base font-bold tracking-tight bg-gradient-to-r from-lime-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AgentCFO
              </span>
            </Link>
            <span className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-white/45">
              Console
            </span>
          </div>

          {/* Center: pill tabs (desktop) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <NavPills pathname={pathname} />
          </div>

          {/* Right: network + drawer triggers + exit */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <Activity size={11} className="text-emerald-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                Sepolia
              </span>
            </div>

            <button
              onClick={() => openDrawer("sandbox")}
              className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <FlaskConical size={13} className="text-hud-cyan" />
              <span className="hidden lg:inline">Sandbox</span>
              <span className="mx-0.5 text-white/15">|</span>
              <SlidersHorizontal size={13} className="text-hud-coral" />
              <span className="hidden lg:inline">Rules</span>
            </button>

            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-300 hover:opacity-80"
              style={{
                fontFamily: "Inter, sans-serif",
                backgroundColor: "#B5FF4D",
                color: "#0D0D0D",
              }}
            >
              <ArrowLeft size={13} />
              {lang === "zh" ? "首页" : "Home"}
            </Link>
          </div>
        </div>

        {/* Mobile: scrollable pill strip */}
        <div className="md:hidden px-3 pb-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-max">
            <NavPills pathname={pathname} compact />
          </div>
        </div>
      </div>
    </header>
  );
}
