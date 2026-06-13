"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Orbit, Bot, ShieldCheck, Snowflake } from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import { useDrawSvgLines } from "@/lib/console/motion/use-draw-svg-lines";

/* =============================================================================
 * WALLET HOLOGRAM — console-side enhanced takes on two landing visuals.
 * Landing originals stay untouched (components/landing/ is locked); these are
 * blue-accent (#60A5FA) rebuilds with extra motion:
 *   WalletHoloCard  — 3D tilt + cursor-tracked glare + hover lift/glow
 *                     (landing HolographicCard has static gloss, no glare).
 *   WalletTopology  — CAW-core node map with animated data packets and
 *                     click-to-switch vaults (landing cloud is hover-only).
 * ===========================================================================*/

const BLUE = "#60A5FA";
const SPRING = { stiffness: 200, damping: 20, mass: 0.8 } as const;

/* ── 3D tilt wrapper ── */

export function WalletHoloCard({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springX = useSpring(rawX, SPRING);
  const springY = useSpring(rawY, SPRING);

  // Gentler tilt for large content cards: avoids the "whole panel is warping"
  // effect that made the wallet detail card feel cheap on a big surface.
  const MAX_ROTATE = 6;
  const TILT_DIVISOR = 22;
  const LIFT_DIVISOR = 16;

  const rotateX = useTransform(springY, (v) =>
    Math.max(-MAX_ROTATE, Math.min(MAX_ROTATE, -v / TILT_DIVISOR))
  );
  const rotateY = useTransform(springX, (v) =>
    Math.max(-MAX_ROTATE, Math.min(MAX_ROTATE, v / TILT_DIVISOR))
  );

  // Subtle lift — roughly half of what it used to be for a more refined feel.
  const contentZ = useTransform(
    [springX, springY],
    (values) => {
      const [sx, sy] = values as [number, number];
      const dist = Math.sqrt(sx * sx + sy * sy);
      return Math.min(16, dist / LIFT_DIVISOR);
    }
  );

  const glare = useTransform(
    [glareX, glareY],
    (values) => {
      const [gx, gy] = values as [number, number];
      return `radial-gradient(circle at ${gx}% ${gy}%, rgba(96,165,250,0.14), rgba(255,255,255,0.04) 32%, transparent 62%)`;
    }
  );

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - box.left - box.width / 2);
    rawY.set(e.clientY - box.top - box.height / 2);
    glareX.set(((e.clientX - box.left) / box.width) * 100);
    glareY.set(((e.clientY - box.top) / box.height) * 100);
  };

  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <div style={{ perspective: "1000px" }}>
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileHover={reduce ? undefined : { scale: 1.012, z: 10 }}
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative will-change-transform rounded-xl transition-shadow duration-500 hover:shadow-[0_24px_80px_rgba(96,165,250,0.18)]"
      >
        <motion.div
          style={{
            translateZ: reduce ? 0 : contentZ,
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </motion.div>
        {/* Cursor-tracked glare — sits above content, never blocks input */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: glare, opacity: reduce ? 0 : undefined }}
        />
      </motion.div>
    </div>
  );
}

/* ── Treasury topology ── */

export interface TopologyWallet {
  id: string;
  name: string;
  type: string;
  valueUsd: number;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  "Agent Vault": Bot,
  "Multi-sig": ShieldCheck,
  "Cold Storage": Snowflake,
};

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

function fmtUsd(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v.toFixed(0)}`;
}

export function WalletTopology({
  wallets,
  activeId,
  onSelect,
  compact = false,
}: {
  wallets: TopologyWallet[];
  activeId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const { lang, theme } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const isDark = theme === "dark";
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  // Container-local parallax (landing version listens on window — heavier)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / 25,
      y: (e.clientY - rect.top - rect.height / 2) / 25,
    });
  };

  // Percentage-based hub layout: scales with the card width while keeping labels in bounds.
  const rx = compact ? 36 : 35;
  const ry = compact ? 20 : 28;
  const nodes = wallets.map((w, i) => {
    const angle = (360 / wallets.length) * i;
    const base = polar(angle, 1);
    const x = 50 + rx * base.x;
    const y = 50 + ry * base.y;
    const parallax = reduce
      ? { x: 0, y: 0 }
      : {
          x: mouse.x * (base.x > 0 ? 1 : -1) * 0.8,
          y: mouse.y * (base.y > 0 ? 1 : -1) * 0.8,
        };
    return { wallet: w, x, y, parallax };
  });

  const lineDrawKey = `${activeId}:${wallets.map((w) => w.id).join(",")}`;
  const svgRef = useDrawSvgLines([lineDrawKey, reduce], "[data-draw-svg]");

  return (
    <div
      className={cn(
        "rounded-xl border border-border-token overflow-hidden",
        compact && "border-border-token"
      )}
      onMouseMove={onMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      ref={containerRef}
    >
      {/* Header */}
      {!compact && (
        <div className="px-4 py-3 border-b border-border-token bg-surface-2/40">
          <div className="flex items-center gap-2">
            <Orbit className="w-3.5 h-3.5" style={{ color: BLUE }} />
            <span className="text-xs font-bold text-fg">
              {_("资金拓扑", "Treasury Topology")}
            </span>
          </div>
          <p className="text-[10px] text-fg-subtle mt-0.5 font-mono">
            {_("点击节点切换金库", "Click a node to switch vaults")}
          </p>
        </div>
      )}

      {/* Radar viewport — light surface in light theme, dark radar in dark theme */}
      <div
        className={cn(
          "relative bg-surface-2 dark:bg-[#0A0F18]",
          compact && "bg-surface dark:bg-[#080c14]"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-50"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(96,165,250,0.07), transparent 70%)"
              : "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(96,165,250,0.12), transparent 70%)",
          }}
        />

        <div
          className={cn(
            "relative mx-auto w-full p-4",
            compact ? "aspect-[3/1] max-h-[140px] p-2" : "min-h-[260px]"
          )}
        >
          {/* Concentric pulse rings — percentage-sized so they scale with the card */}
          {[0.45, 0.7, 0.95].map((scale, i) => (
            <motion.div
              key={scale}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border aspect-square"
              style={{
                width: `${scale * 100}%`,
                borderColor: isDark
                  ? i === 1
                    ? "rgba(96,165,250,0.12)"
                    : "rgba(255,255,255,0.05)"
                  : i === 1
                    ? "rgba(96,165,250,0.22)"
                    : "rgba(15,23,42,0.08)",
              }}
              animate={reduce ? {} : { scale: [1, 1.02, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            />
          ))}

          {/* Connection lines + animated data packets */}
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full pointer-events-none"
          >
            <defs>
              <linearGradient id="walletLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={BLUE} stopOpacity="0.35" />
                <stop offset="100%" stopColor={BLUE} stopOpacity="0.06" />
              </linearGradient>
            </defs>
            {nodes.map(({ wallet, x, y }) => (
              <g key={wallet.id}>
                <line
                  data-draw-svg
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke="url(#walletLineGrad)"
                  strokeWidth={wallet.id === activeId ? 1.6 : 1}
                  opacity={wallet.id === activeId || hovered === wallet.id ? 0.9 : 0.4}
                />
                {/* Data packet: core → vault, loops forever */}
                {!reduce && (
                  <motion.circle
                    r={wallet.id === activeId ? 2.6 : 1.8}
                    fill={BLUE}
                    initial={false}
                    animate={{
                      cx: [50, x],
                      cy: [50, y],
                      opacity: [0, 0.9, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeIn",
                      delay: nodes.findIndex((n) => n.wallet.id === wallet.id) * 0.6,
                      repeatDelay: 0.6,
                    }}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Core */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
            style={{
              background: isDark
                ? "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), rgba(255,255,255,0.02))"
                : "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(241,245,249,0.9))",
              backdropFilter: "blur(12px)",
              boxShadow: isDark
                ? "inset 0 1px 2px rgba(255,255,255,0.15), 0 0 36px rgba(96,165,250,0.22), inset 0 0 18px rgba(96,165,250,0.08)"
                : "inset 0 1px 2px rgba(255,255,255,0.9), 0 0 28px rgba(96,165,250,0.18), 0 4px 16px rgba(15,23,42,0.06)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(96,165,250,0.25)",
            }}
            animate={reduce ? {} : { scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Orbit className="h-5 w-5" style={{ color: BLUE }} strokeWidth={1.5} />
            <span className="mt-0.5 text-[6px] font-mono font-bold uppercase tracking-wider" style={{ color: BLUE }}>
              CAW Core
            </span>
          </motion.div>

          {/* Wallet nodes */}
          {nodes.map(({ wallet, x, y, parallax }) => {
            const Icon = TYPE_ICON[wallet.type] ?? ShieldCheck;
            const isActive = wallet.id === activeId;
            const isHovered = hovered === wallet.id;
            const lit = isActive || isHovered;

            return (
              <div
                key={wallet.id}
                className="absolute z-10 flex flex-col items-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(calc(-50% + ${parallax.x}px), calc(-50% + ${parallax.y}px))`,
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => onSelect(wallet.id)}
                  onMouseEnter={() => setHovered(wallet.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "relative flex cursor-pointer items-center justify-center rounded-full outline-none",
                    compact ? "h-8 w-8" : "h-11 w-11"
                  )}
                  style={{
                    background: lit
                      ? isDark
                        ? "rgba(96,165,250,0.16)"
                        : "rgba(96,165,250,0.12)"
                      : isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.88)",
                    border: `1px solid ${
                      lit
                        ? "rgba(96,165,250,0.5)"
                        : isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(148,163,184,0.35)"
                    }`,
                    boxShadow: lit
                      ? isDark
                        ? "0 0 22px rgba(96,165,250,0.35), inset 0 1px 1px rgba(255,255,255,0.1)"
                        : "0 0 18px rgba(96,165,250,0.22), inset 0 1px 1px rgba(255,255,255,0.9)"
                      : isDark
                        ? "inset 0 1px 1px rgba(255,255,255,0.05)"
                        : "0 2px 8px rgba(15,23,42,0.06), inset 0 1px 1px rgba(255,255,255,0.8)",
                  }}
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  aria-label={wallet.name}
                  aria-pressed={isActive}
                >
                  {/* Active halo */}
                  {isActive && !reduce && (
                    <span
                      className="absolute inset-0 animate-ping rounded-full"
                      style={{ backgroundColor: "rgba(96,165,250,0.18)", animationDuration: "2.2s" }}
                    />
                  )}
                  <Icon
                    className="h-4 w-4 relative"
                    style={{
                      color: lit
                        ? BLUE
                        : isDark
                          ? "rgba(255,255,255,0.55)"
                          : "rgba(71,85,105,0.75)",
                    }}
                    strokeWidth={1.5}
                  />

                  {/* Hover sparkles burst */}
                  {isHovered && !reduce && (
                    <SparklesFX
                      count={5}
                      color={BLUE}
                      className="absolute -inset-2"
                    />
                  )}

                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 left-1/2 z-30 w-32 -translate-x-1/2 rounded-lg border border-border-token bg-surface/95 p-2 text-center shadow-2xl backdrop-blur-md dark:bg-[#0A0F18]/95"
                    >
                      <div className="text-[9px] font-bold text-fg">{wallet.name}</div>
                      <div className="mt-0.5 text-[7px] font-mono leading-tight text-fg-muted">
                        {wallet.type} · {fmtUsd(wallet.valueUsd)}
                      </div>
                    </motion.div>
                  )}
                </motion.button>

                <motion.span
                  className="mt-1.5 text-[8px] font-mono uppercase tracking-wider whitespace-nowrap"
                  animate={{ opacity: lit ? 1 : 0.4 }}
                  style={{
                    color: lit
                      ? BLUE
                      : isDark
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(100,116,139,0.85)",
                  }}
                >
                  {wallet.name.split(" ")[0]} · {fmtUsd(wallet.valueUsd)}
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
