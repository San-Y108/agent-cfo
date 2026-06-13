"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { useT } from "@/lib/i18n/context";

/* ========================================================================
 * Web3NodeCloud — Orbital Trust Stack v4
 * ========================================================================
 * Three independently rotating rings make protocols orbit the central
 * Cobo core like satellites around a sun. Inner rings move faster, outer
 * rings slower. Nodes counter-rotate so their icons and labels stay upright.
 * Orbits pause on hover for readability and respect reduced motion.
 */

type Tier = "core" | "mid" | "tool";

type NodeData = {
  id: string;
  label: string;
  shortLabel: string;
  desc: string;
  color: string;
  tier: Tier;
  angle: number;
  logo: string;
};

const LOGO_BASE = "/logos/agentcfo-logo-pack/node-svg";

const NODES: NodeData[] = [
  // Inner ring — core trust anchors
  { id: "caw", label: "CAW Core", shortLabel: "CAW", desc: "Cobo Agentic Wallet execution core", color: "#B5FF4D", tier: "core", angle: 30, logo: `${LOGO_BASE}/09-execution-core.svg` },
  { id: "gnosis", label: "Gnosis Safe", shortLabel: "Gnosis", desc: "Multi-sig vault protection", color: "#00D084", tier: "core", angle: 210, logo: `${LOGO_BASE}/02-safe-wallet.svg` },
  // Middle ring — execution layer
  { id: "metamask", label: "MetaMask SDK", shortLabel: "MetaMask", desc: "Owner cryptographic signing", color: "#F6851B", tier: "mid", angle: 90, logo: `${LOGO_BASE}/03-metamask.svg` },
  { id: "sepolia", label: "Sepolia", shortLabel: "Sepolia", desc: "Isolated testnet execution", color: "#8B5CF6", tier: "mid", angle: 270, logo: `${LOGO_BASE}/04-ethereum-sepolia-fallback.svg` },
  { id: "sablier", label: "Sablier", shortLabel: "Sablier", desc: "Continuous payroll streams", color: "#FF6B9D", tier: "mid", angle: 180, logo: `${LOGO_BASE}/05-sablier.svg` },
  // Outer ring — tooling & integration (spread to the right/bottom, away from left copy)
  { id: "drizzle", label: "Drizzle ORM", shortLabel: "Drizzle", desc: "Type-safe database layer", color: "#C5F74F", tier: "tool", angle: 60, logo: `${LOGO_BASE}/06-drizzle-orm.svg` },
  { id: "framer", label: "Framer", shortLabel: "Framer", desc: "Motion & interaction design", color: "#60A5FA", tier: "tool", angle: 200, logo: `${LOGO_BASE}/07-framer.svg` },
  { id: "github", label: "GitHub", shortLabel: "GitHub", desc: "CI/CD & version control", color: "#E2E8F0", tier: "tool", angle: 340, logo: `${LOGO_BASE}/08-github-octocat.svg` },
];

// Radii spread out so nodes do not visually overlap, while still fitting
// comfortably inside the 360×360 card. The inner ring is kept tight to the
// Cobo core, mid and tool rings are pushed outward with larger gaps.
const TIER_DISTANCE: Record<Tier, number> = { core: 60, mid: 115, tool: 160 };
const TIER_SIZE: Record<Tier, number> = { core: 42, mid: 33, tool: 26 };
const TIER_GLOW: Record<Tier, number> = { core: 17, mid: 13, tool: 9 };
// Kepler-style orbital periods: angular speed falls with distance from the
// center, so inner satellites race ahead and outer ones drift slowly.
const ORBIT_PERIOD: Record<Tier, number> = { core: 32, mid: 72, tool: 125 };

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

/* ── Background particles (subtle, dark-adapted) ───────────────────────── */
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function NebulaParticles({ count = 12 }: { count?: number }) {
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.floor(rand() * 100),
      y: Math.floor(rand() * 100),
      size: 1 + Math.floor(rand() * 15) / 10,
      opacity: 0.05 + Math.floor(rand() * 8) / 100,
      duration: 10 + Math.floor(rand() * 10),
      delay: Math.floor(rand() * 5 * 10) / 10,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "rgba(255,255,255,0.35)",
            boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.06)`,
          }}
          animate={reduce ? {} : {
            opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ── Orbital ring: SVG path + radial ties + counter-rotated nodes ──────── */
function OrbitRing({
  tier,
  nodes,
  hoveredId,
  centerPulse,
  anyHovered,
  onHover,
  onLeave,
}: {
  tier: Tier;
  nodes: NodeData[];
  hoveredId: string | null;
  centerPulse: boolean;
  anyHovered: boolean;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  const reduce = useReducedMotion();
  const radius = TIER_DISTANCE[tier];
  const period = ORBIT_PERIOD[tier];
  const isPaused = reduce || anyHovered;
  const active = hoveredId === null ? centerPulse : nodes.some((n) => n.id === hoveredId);
  const ringOpacity = tier === "core" ? 0.22 : tier === "mid" ? 0.14 : 0.08;

  return (
    <motion.div
      className="absolute inset-0"
      style={{ transformOrigin: "center center" }}
      animate={isPaused ? {} : { rotate: 360 }}
      transition={{ duration: period, repeat: Infinity, ease: "linear" }}
    >
      {/* Ring + radial ties */}
      <svg
        viewBox="-200 -200 400 400"
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          {nodes.map((node) => (
            <linearGradient key={node.id} id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={node.color} stopOpacity="0.45" />
              <stop offset="60%" stopColor={node.color} stopOpacity="0.1" />
              <stop offset="100%" stopColor={node.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        <g>
          <circle
            cx={0}
            cy={0}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            opacity={ringOpacity}
          />
          <circle
            cx={0}
            cy={0}
            r={radius}
            fill="none"
            stroke="#B5FF4D"
            strokeWidth={1.5}
            strokeDasharray={active ? "0" : `${radius * 0.25} ${radius * 0.75}`}
            opacity={active ? 0.18 : 0.05}
            style={{
              filter: active ? "drop-shadow(0 0 4px rgba(181,255,77,0.25))" : "none",
              transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </g>

        {nodes.map((node) => {
          const pos = polarToCartesian(node.angle, radius);
          const isActive = hoveredId === node.id || centerPulse;
          const isDimmed = hoveredId !== null && hoveredId !== node.id && !centerPulse;

          return (
            <g key={node.id}>
              <line
                x1={0}
                y1={0}
                x2={pos.x}
                y2={pos.y}
                stroke={isActive ? node.color : `url(#grad-${node.id})`}
                strokeWidth={isActive ? 2 : node.tier === "core" ? 1.5 : node.tier === "mid" ? 1 : 0.6}
                strokeLinecap="round"
                opacity={isDimmed ? 0.04 : isActive ? 0.85 : node.tier === "core" ? 0.35 : 0.15}
                style={{
                  filter: isActive ? `drop-shadow(0 0 5px ${node.color})` : "none",
                  transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
              {!reduce && (
                <line
                  x1={0}
                  y1={0}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={node.color}
                  strokeWidth={isActive ? 3 : 3}
                  strokeLinecap="round"
                  opacity={isActive ? 0 : 0}
                >
                  <animate
                    attributeName="opacity"
                    values={`0;${isActive ? 0.18 : node.tier === "core" ? 0.12 : 0.06};0`}
                    dur={`${3 + ((node.angle * 7) % 2)}s`}
                    repeatCount="indefinite"
                    begin={`${(node.angle * 3) % 2}s`}
                  />
                </line>
              )}
            </g>
          );
        })}
      </svg>

      {/* Counter-rotated nodes so labels stay upright while orbiting */}
      {nodes.map((node) => {
        const pos = polarToCartesian(node.angle, radius);
        const originalIndex = NODES.findIndex((n) => n.id === node.id);

        return (
          <motion.div
            key={node.id}
            className="absolute"
            style={{
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
              transform: "translate(-50%, -50%)",
            }}
            animate={isPaused ? {} : { rotate: -360 }}
            transition={{ duration: period, repeat: Infinity, ease: "linear" }}
          >
            <NetworkNode
              node={node}
              index={originalIndex}
              isHovered={hoveredId === node.id}
              anyHovered={anyHovered}
              onHover={() => onHover(node.id)}
              onLeave={onLeave}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ── Central Cobo Core ───────────────────────────────────────────────── */
function CoboCoreCenter({ isHovered }: { isHovered: boolean }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 z-20 flex items-center justify-center"
      style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40 }}
      animate={reduce ? {} : { scale: isHovered ? 1.12 : [1, 1.03, 1] }}
      transition={isHovered ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Permanent soft glow */}
      <div
        className="absolute inset-[-12px] rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(74,155,255,0.18) 0%, transparent 65%)",
        }}
      />

      {/* Ripple rings */}
      <motion.div
        className="absolute inset-[-8px] rounded-full"
        style={{ border: "1px solid rgba(74,155,255,0.25)" }}
        animate={reduce ? {} : { scale: [1, 1.6], opacity: [0.4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-[-8px] rounded-full"
        style={{ border: "1px solid rgba(74,155,255,0.18)" }}
        animate={reduce ? {} : { scale: [1, 2], opacity: [0.25, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
      />
      <motion.div
        className="absolute inset-[-8px] rounded-full"
        style={{ border: "1px solid rgba(74,155,255,0.12)" }}
        animate={reduce ? {} : { scale: [1, 2.4], opacity: [0.15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1.6 }}
      />

      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(74,155,255,0.22) 0%, transparent 70%)" }}
      />

      {/* Core icon + tight outer ring */}
      <div
        className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full"
      >
        {/* Outer thin ring with glow */}
        <div
          className="absolute rounded-full transition-all duration-300"
          style={{
            inset: -2,
            border: `1px solid ${isHovered ? "#4A9BFF" : "rgba(74,155,255,0.55)"}`,
            boxShadow: isHovered
              ? "0 0 20px rgba(74,155,255,0.55), 0 0 34px rgba(74,155,255,0.28)"
              : "0 0 12px rgba(74,155,255,0.35)",
          }}
        />

        <img
          src="/logos/agentcfo-logo-pack/node-svg/01-cobo.svg"
          alt="Cobo"
          className="h-full w-full object-contain"
          style={{
            filter: isHovered ? "drop-shadow(0 0 12px rgba(74,155,255,0.8))" : "none",
            transition: "filter 0.3s ease",
          }}
        />
      </div>
    </motion.div>
  );
}

/* ── Individual Network Node ─────────────────────────────────────────── */
function NetworkNode({
  node,
  isHovered,
  anyHovered,
  onHover,
  onLeave,
  index,
}: {
  node: NodeData;
  isHovered: boolean;
  anyHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  index: number;
}) {
  const size = TIER_SIZE[node.tier];
  const glowSize = TIER_GLOW[node.tier];
  const isDimmed = anyHovered && !isHovered;
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: isDimmed ? 0.4 : 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Back glow — static, only scale on hover */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size + glowSize * 2.4,
          height: size + glowSize * 2.4,
          marginLeft: -(size + glowSize * 2.4) / 2,
          marginTop: -(size + glowSize * 2.4) / 2,
          background: `radial-gradient(circle at 50% 50%, ${node.color}22, transparent 70%)`,
          opacity: isDimmed ? 0.25 : isHovered ? 0.85 : 0.4,
        }}
        animate={{ scale: isHovered ? 1.15 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Node: icon fills the circle + tight outer ring with glow */}
      <motion.div
        className="relative flex items-center justify-center rounded-full cursor-pointer"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* Outer thin ring — sits very close to the icon edge */}
        <div
          className="absolute rounded-full transition-all duration-300"
          style={{
            inset: -2,
            border: `1px solid ${isHovered ? node.color : `${node.color}50`}`,
            boxShadow: isHovered
              ? `0 0 ${glowSize}px ${node.color}45, 0 0 ${glowSize * 1.4}px ${node.color}25`
              : `0 0 ${glowSize * 0.5}px ${node.color}30`,
            opacity: isDimmed ? 0.4 : 1,
          }}
        />

        {/* Icon fills the inner circle */}
        <img
          src={node.logo}
          alt={node.shortLabel}
          className="h-full w-full object-contain"
          style={{
            filter: isHovered ? `drop-shadow(0 0 10px ${node.color})` : "none",
            transition: "filter 0.3s ease",
            opacity: isDimmed ? 0.45 : 1,
          }}
        />
      </motion.div>

      {/* Label — bright enough to read on dark background */}
      <span
        className="mt-2 text-[6px] font-mono uppercase tracking-[0.12em] whitespace-nowrap transition-all duration-400"
        style={{
          color: isHovered ? node.color : `${node.color}CC`,
          opacity: isDimmed ? 0.5 : isHovered ? 1 : 0.85,
          textShadow: isHovered ? `0 0 10px ${node.color}80` : `0 0 6px ${node.color}40`,
        }}
      >
        {node.shortLabel}
      </span>

      {/* Hover info card */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-full mt-2 z-30 w-28"
          style={{ left: "50%", marginLeft: -56 }}
        >
          <div
            className="rounded-lg border p-2 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(18,18,18,0.96))",
              borderColor: `${node.color}35`,
              boxShadow: `0 6px 24px rgba(0,0,0,0.5), 0 0 16px ${node.color}12`,
            }}
          >
            <div className="text-[8px] font-bold" style={{ color: node.color }}>
              {node.label}
            </div>
            <div
              className="mt-0.5 h-[1px] w-full"
              style={{ background: `linear-gradient(90deg, transparent 10%, ${node.color}40, transparent 90%)` }}
            />
            <div className="mt-1 text-[6.5px] font-mono leading-relaxed text-white/70">
              {node.desc}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
export function Web3NodeCloud() {
  const t = useT();
  const reduce = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [centerHovered, setCenterHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const anyHovered = hoveredId !== null || centerHovered;

  // Subtle parallax — use MotionValue to avoid React re-renders on every mousemove
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const springX = useSpring(rawMouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(rawMouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      rawMouseX.set((e.clientX - rect.left - rect.width / 2) / 40);
      rawMouseY.set((e.clientY - rect.top - rect.height / 2) / 40);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawMouseX, rawMouseY]);

  const grouped = useMemo(() => {
    return NODES.reduce(
      (acc, node) => {
        acc[node.tier].push(node);
        return acc;
      },
      { core: [] as NodeData[], mid: [] as NodeData[], tool: [] as NodeData[] }
    );
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D]/90 p-6 lg:p-8 shadow-2xl"
    >
      {/* Subtle top sheen — low opacity so the card stays dark */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
        aria-hidden="true"
      />

      {/* Soft corner glows — matches CardSplitter depth language */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(74,155,142,0.12), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(0,86,210,0.10), transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* Left: Copy — sits above the orbit canvas so satellites pass behind it */}
        <motion.div
          className="relative z-30 flex-shrink-0 lg:w-[180px] flex flex-col justify-center space-y-3 text-center lg:text-left"
          initial={reduce ? false : { opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.07] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white/65">
            {t("web3Cloud.eyebrow")}
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
            {t("web3Cloud.title")}
          </h2>
          <p className="text-xs leading-relaxed text-white/75 italic">
            {t("web3Cloud.desc")}
          </p>
          <p className="text-[9px] text-white/65 font-mono italic">
            {t("web3Cloud.hint")}
          </p>
        </motion.div>

        {/* Right: Constellation — kept below the left copy layer */}
        <div className="relative z-0" style={{ height: 360, width: 360 }}>
          {/* Parallax layer — style-driven to skip React render on mousemove */}
          <motion.div
            className="absolute inset-0"
            style={{ x: springX, y: springY }}
          >
            <NebulaParticles count={12} />

            {/* Tiered orbital rings */}
            <OrbitRing
              tier="core"
              nodes={grouped.core}
              hoveredId={hoveredId}
              centerPulse={centerHovered}
              anyHovered={anyHovered}
              onHover={setHoveredId}
              onLeave={() => setHoveredId(null)}
            />
            <OrbitRing
              tier="mid"
              nodes={grouped.mid}
              hoveredId={hoveredId}
              centerPulse={centerHovered}
              anyHovered={anyHovered}
              onHover={setHoveredId}
              onLeave={() => setHoveredId(null)}
            />
            <OrbitRing
              tier="tool"
              nodes={grouped.tool}
              hoveredId={hoveredId}
              centerPulse={centerHovered}
              anyHovered={anyHovered}
              onHover={setHoveredId}
              onLeave={() => setHoveredId(null)}
            />

            {/* Cobo Core center */}
            <div
              onMouseEnter={() => setCenterHovered(true)}
              onMouseLeave={() => setCenterHovered(false)}
              className="cursor-pointer"
            >
              <CoboCoreCenter isHovered={centerHovered} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
