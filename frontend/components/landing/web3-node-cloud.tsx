"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ========================================================================
 * Web3NodeCloud — Network Constellation v2
 * ========================================================================
 * Compact organic node distribution that fits two-column layout.
 * Border style unified with HolographicCard (white/15, blur, gradient).
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
  distance: number; // pixels at base scale
};

const NODES: NodeData[] = [
  // Core — closest to center
  { id: "cobo", label: "Cobo Agentic", shortLabel: "Cobo", desc: "Autonomous API execution via CAW", color: "#4A9BFF", tier: "core", angle: -15, distance: 52 },
  { id: "gnosis", label: "Gnosis Safe", shortLabel: "Gnosis", desc: "Multi-sig vault protection", color: "#00D084", tier: "core", angle: 165, distance: 55 },
  // Mid
  { id: "metamask", label: "MetaMask SDK", shortLabel: "MetaMask", desc: "Owner cryptographic signing", color: "#F6851B", tier: "mid", angle: 55, distance: 100 },
  { id: "sepolia", label: "Sepolia", shortLabel: "Sepolia", desc: "Isolated testnet execution", color: "#8B5CF6", tier: "mid", angle: 205, distance: 98 },
  { id: "sablier", label: "Sablier", shortLabel: "Sablier", desc: "Continuous payroll streams", color: "#FF6B9D", tier: "mid", angle: 285, distance: 105 },
  // Tool — outer ring
  { id: "drizzle", label: "Drizzle ORM", shortLabel: "Drizzle", desc: "Type-safe database layer", color: "#C5F74F", tier: "tool", angle: 110, distance: 150 },
  { id: "framer", label: "Framer", shortLabel: "Framer", desc: "Motion & interaction design", color: "#60A5FA", tier: "tool", angle: 245, distance: 148 },
  { id: "github", label: "GitHub", shortLabel: "GitHub", desc: "CI/CD & version control", color: "#E2E8F0", tier: "tool", angle: 340, distance: 155 },
];

const TIER_SIZE: Record<Tier, number> = { core: 38, mid: 28, tool: 22 };
const TIER_GLOW: Record<Tier, number> = { core: 18, mid: 12, tool: 8 };

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

/* ── Background particles ─────────────────────────────────────────────── */
function NebulaParticles({ count = 16 }: { count?: number }) {
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.2,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 5,
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
            background: "rgba(255,255,255,0.5)",
            boxShadow: `0 0 ${p.size * 3}px rgba(255,255,255,0.1)`,
          }}
          animate={reduce ? {} : {
            opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
            scale: [1, 1.3, 1],
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

/* ── Connection lines (SVG) ──────────────────────────────────────────── */
function ConnectionLines({
  hoveredId,
  centerPulse,
}: {
  hoveredId: string | null;
  centerPulse: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="-200 -200 400 400"
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        {NODES.map((node) => (
          <linearGradient key={node.id} id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={node.color} stopOpacity="0.45" />
            <stop offset="60%" stopColor={node.color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={node.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {NODES.map((node) => {
        const pos = polarToCartesian(node.angle, node.distance);
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
              opacity={isDimmed ? 0.06 : isActive ? 0.85 : node.tier === "core" ? 0.4 : 0.2}
              style={{
                filter: isActive ? `drop-shadow(0 0 5px ${node.color})` : "none",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {!reduce && !isActive && (
              <line
                x1={0}
                y1={0}
                x2={pos.x}
                y2={pos.y}
                stroke={node.color}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0}
              >
                <animate
                  attributeName="opacity"
                  values={`0;${node.tier === "core" ? 0.12 : 0.06};0`}
                  dur={`${4 + Math.random() * 3}s`}
                  repeatCount="indefinite"
                  begin={`${Math.random() * 2}s`}
                />
              </line>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Central Cobo Core ───────────────────────────────────────────────── */
function CoboCoreCenter({ isHovered }: { isHovered: boolean }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 z-20 flex items-center justify-center"
      style={{ width: 64, height: 64, marginLeft: -32, marginTop: -32 }}
      animate={reduce ? {} : { scale: isHovered ? 1.1 : [1, 1.03, 1] }}
      transition={isHovered ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-[-4px] rounded-full"
        style={{ border: "1px solid rgba(74,155,255,0.12)" }}
        animate={reduce ? {} : { scale: [1, 1.5], opacity: [0.25, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-[-4px] rounded-full"
        style={{ border: "1px solid rgba(74,155,255,0.08)" }}
        animate={reduce ? {} : { scale: [1, 1.8], opacity: [0.15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(74,155,255,0.2) 0%, transparent 70%)" }}
      />
      <div
        className="relative flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(74,155,255,0.25), rgba(30,100,200,0.1))",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(74,155,255,0.3)",
          boxShadow: `
            0 0 24px rgba(74,155,255,0.25),
            inset 0 0 16px rgba(74,155,255,0.08),
            inset 0 1px 1px rgba(255,255,255,0.08)
          `,
        }}
      >
        <span className="text-[6px] font-mono font-bold uppercase tracking-[0.12em] text-[#6BA8FF]">
          Cobo
        </span>
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
  const pos = polarToCartesian(node.angle, node.distance);
  const size = TIER_SIZE[node.tier];
  const glowSize = TIER_GLOW[node.tier];
  const isDimmed = anyHovered && !isHovered;

  return (
    <motion.div
      className="absolute z-10 flex flex-col items-center"
      style={{
        left: `calc(50% + ${pos.x}px)`,
        top: `calc(50% + ${pos.y}px)`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: isDimmed ? 0.2 : 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Glow behind node */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size + glowSize * 2,
          height: size + glowSize * 2,
          marginLeft: -(size + glowSize * 2) / 2,
          marginTop: -(size + glowSize * 2) / 2,
          background: `radial-gradient(circle at 50% 50%, ${node.color}25, transparent 70%)`,
          opacity: isHovered ? 1 : 0.35,
        }}
        animate={isHovered ? { scale: 1.2 } : { scale: [1, 1.12, 1] }}
        transition={isHovered ? { duration: 0.3 } : { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Node circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full cursor-pointer"
        style={{
          width: size,
          height: size,
          background: isHovered
            ? `radial-gradient(circle at 35% 35%, ${node.color}35, ${node.color}10)`
            : `radial-gradient(circle at 35% 35%, ${node.color}15, ${node.color}03)`,
          border: `1.5px solid ${isHovered ? node.color : `${node.color}35`}`,
          boxShadow: isHovered
            ? `0 0 ${glowSize}px ${node.color}40, inset 0 1px 1px rgba(255,255,255,0.08)`
            : `inset 0 1px 1px rgba(255,255,255,0.04)`,
          opacity: isDimmed ? 0.2 : 1,
        }}
        whileHover={{ scale: 1.15 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: size * 0.32,
            height: size * 0.32,
            background: isHovered ? node.color : `${node.color}70`,
            boxShadow: isHovered ? `0 0 6px ${node.color}` : "none",
          }}
        />
      </motion.div>

      {/* Label */}
      <span
        className="mt-1.5 text-[7px] font-mono uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-400"
        style={{
          color: isHovered ? node.color : `${node.color}60`,
          opacity: isDimmed ? 0.12 : isHovered ? 1 : 0.45,
          textShadow: isHovered ? `0 0 8px ${node.color}50` : "none",
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
              background: "linear-gradient(135deg, rgba(13,13,13,0.97), rgba(18,18,18,0.94))",
              borderColor: `${node.color}35`,
              boxShadow: `0 6px 24px rgba(0,0,0,0.4), 0 0 16px ${node.color}12`,
            }}
          >
            <div className="text-[8px] font-bold" style={{ color: node.color }}>
              {node.label}
            </div>
            <div
              className="mt-0.5 h-[1px] w-full"
              style={{ background: `linear-gradient(90deg, transparent 10%, ${node.color}40, transparent 90%)` }}
            />
            <div className="mt-1 text-[6.5px] font-mono leading-relaxed text-white/45">
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
  const reduce = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [centerHovered, setCenterHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const anyHovered = hoveredId !== null || centerHovered;

  // Subtle parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) / 40,
        y: (e.clientY - rect.top - rect.height / 2) / 40,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-white/15 p-6 lg:p-8 backdrop-blur-md shadow-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.02) 100%)",
      }}
    >
      {/* Glossy overlay — matches HolographicCard */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-[#B5FF4D]/[0.03] to-transparent pointer-events-none opacity-60"
        aria-hidden="true"
      />

      {/* Background corner glows — matches CardSplitter */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(74,155,142,0.15), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, rgba(0,86,210,0.12), transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
        {/* Left: Copy */}
        <motion.div
          className="flex-shrink-0 lg:w-[300px] xl:w-[340px] space-y-3 text-center lg:text-left"
          initial={reduce ? false : { opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white/40">
            Web3 Trust Stack
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
            Web3 Trusted Infrastructure
          </h2>
          <p className="text-xs leading-relaxed text-white/45">
            AgentCFO weaves multi-sig suites, automation modules and Cobo HSM
            into a closed-loop trusted capital allocation network.
          </p>
          <p className="text-[9px] text-white/25 font-mono">
            Hover nodes to explore protocols…
          </p>
        </motion.div>

        {/* Right: Constellation — compact, fits in remaining space */}
        <div className="relative flex-1 w-full" style={{ height: 340, maxWidth: 400 }}>
          {/* Parallax layer */}
          <motion.div
            className="absolute inset-0"
            animate={{ x: mousePos.x, y: mousePos.y }}
            transition={{ type: "spring", stiffness: 100, damping: 30 }}
          >
            {/* Connection lines */}
            <ConnectionLines hoveredId={hoveredId} centerPulse={centerHovered} />

            {/* Cobo Core center */}
            <div
              onMouseEnter={() => setCenterHovered(true)}
              onMouseLeave={() => setCenterHovered(false)}
              className="cursor-pointer"
            >
              <CoboCoreCenter isHovered={centerHovered} />
            </div>

            {/* Network nodes — index-based stagger */}
            {NODES.map((node, i) => (
              <NetworkNode
                key={node.id}
                node={node}
                index={i}
                isHovered={hoveredId === node.id}
                anyHovered={anyHovered}
                onHover={() => setHoveredId(node.id)}
                onLeave={() => setHoveredId(null)}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
