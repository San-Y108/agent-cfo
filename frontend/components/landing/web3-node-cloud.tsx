"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ========================================================================
 * Web3NodeCloud — Network Constellation
 * ========================================================================
 * Organic node distribution with brand-accurate colors, pulsing connections,
 * and a gravitational Cobo Core center. No generic icons — abstract nodes
 * with color + label only, like a real network topology.
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
  distance: number;
};

const NODES: NodeData[] = [
  // Core — closest to center, largest
  { id: "cobo", label: "Cobo Agentic", shortLabel: "Cobo", desc: "Autonomous API execution via CAW", color: "#0056D2", tier: "core", angle: -20, distance: 75 },
  { id: "gnosis", label: "Gnosis Safe", shortLabel: "Gnosis", desc: "Multi-sig vault protection", color: "#00A86B", tier: "core", angle: 160, distance: 80 },
  // Mid — middle ring, medium size
  { id: "metamask", label: "MetaMask SDK", shortLabel: "MetaMask", desc: "Owner cryptographic signing", color: "#F6851B", tier: "mid", angle: 65, distance: 145 },
  { id: "sepolia", label: "Sepolia", shortLabel: "Sepolia", desc: "Isolated testnet execution", color: "#627EEA", tier: "mid", angle: 210, distance: 140 },
  { id: "sablier", label: "Sablier", shortLabel: "Sablier", desc: "Continuous payroll streams", color: "#FF6B6B", tier: "mid", angle: 295, distance: 150 },
  // Tool — outer ring, smallest
  { id: "drizzle", label: "Drizzle ORM", shortLabel: "Drizzle", desc: "Type-safe database layer", color: "#C5F74F", tier: "tool", angle: 110, distance: 210 },
  { id: "framer", label: "Framer", shortLabel: "Framer", desc: "Motion & interaction design", color: "#0055FF", tier: "tool", angle: 250, distance: 205 },
  { id: "github", label: "GitHub", shortLabel: "GitHub", desc: "CI/CD & version control", color: "#E6E6E6", tier: "tool", angle: 340, distance: 215 },
];

const TIER_SIZE: Record<Tier, number> = { core: 48, mid: 34, tool: 26 };
const TIER_GLOW: Record<Tier, number> = { core: 24, mid: 16, tool: 10 };

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

/* ── Nebula background particles ──────────────────────────────────────── */
function NebulaParticles({ count = 18 }: { count?: number }) {
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      opacity: 0.15 + Math.random() * 0.25,
      duration: 8 + Math.random() * 12,
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
            background: "rgba(255,255,255,0.6)",
            boxShadow: `0 0 ${p.size * 3}px rgba(255,255,255,0.15)`,
          }}
          animate={reduce ? {} : {
            opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
            scale: [1, 1.4, 1],
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
      viewBox="-240 -240 480 480"
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        {NODES.map((node) => (
          <linearGradient
            key={node.id}
            id={`grad-${node.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={node.color} stopOpacity="0.5" />
            <stop offset="60%" stopColor={node.color} stopOpacity="0.15" />
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
            {/* Main line */}
            <line
              x1={0}
              y1={0}
              x2={pos.x}
              y2={pos.y}
              stroke={isActive ? node.color : `url(#grad-${node.id})`}
              strokeWidth={isActive ? 2 : node.tier === "core" ? 1.5 : node.tier === "mid" ? 1 : 0.7}
              strokeLinecap="round"
              opacity={isDimmed ? 0.08 : isActive ? 0.9 : node.tier === "core" ? 0.5 : 0.25}
              style={{
                filter: isActive ? `drop-shadow(0 0 6px ${node.color})` : "none",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {/* Breathing outer glow (only when not hovered) */}
            {!reduce && !isActive && (
              <line
                x1={0}
                y1={0}
                x2={pos.x}
                y2={pos.y}
                stroke={node.color}
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0}
              >
                <animate
                  attributeName="opacity"
                  values={`0;${node.tier === "core" ? 0.15 : 0.08};0`}
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
      style={{
        width: 80,
        height: 80,
        marginLeft: -40,
        marginTop: -40,
      }}
      animate={reduce ? {} : { scale: isHovered ? 1.1 : [1, 1.03, 1] }}
      transition={isHovered ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer pulse ring 1 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "1px solid rgba(0,86,210,0.15)",
        }}
        animate={reduce ? {} : { scale: [1, 1.6], opacity: [0.3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
      {/* Outer pulse ring 2 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "1px solid rgba(0,86,210,0.1)",
        }}
        animate={reduce ? {} : { scale: [1, 2], opacity: [0.2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
      />
      {/* Core glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(0,86,210,0.25) 0%, transparent 70%)",
        }}
      />
      {/* Core circle */}
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(0,100,240,0.3), rgba(0,60,180,0.15))",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,86,210,0.35)",
          boxShadow: `
            0 0 30px rgba(0,86,210,0.3),
            inset 0 0 20px rgba(0,86,210,0.1),
            inset 0 1px 1px rgba(255,255,255,0.1)
          `,
        }}
      >
        <span
          className="text-[7px] font-mono font-bold uppercase tracking-[0.15em]"
          style={{ color: "#4A9BFF" }}
        >
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
}: {
  node: NodeData;
  isHovered: boolean;
  anyHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
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
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: 0.2 + Math.random() * 0.4, ease: [0.16, 1, 0.3, 1] }}
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
          background: `radial-gradient(circle at 50% 50%, ${node.color}30, transparent 70%)`,
          opacity: isHovered ? 1 : 0.4,
        }}
        animate={isHovered ? { scale: 1.2 } : { scale: [1, 1.15, 1] }}
        transition={isHovered ? { duration: 0.3 } : { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Node circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full cursor-pointer"
        style={{
          width: size,
          height: size,
          background: isHovered
            ? `radial-gradient(circle at 35% 35%, ${node.color}40, ${node.color}15)`
            : `radial-gradient(circle at 35% 35%, ${node.color}20, ${node.color}05)`,
          border: `1.5px solid ${isHovered ? node.color : `${node.color}40`}`,
          boxShadow: isHovered
            ? `0 0 ${glowSize}px ${node.color}50, inset 0 1px 1px rgba(255,255,255,0.1)`
            : `inset 0 1px 1px rgba(255,255,255,0.05)`,
          opacity: isDimmed ? 0.25 : 1,
        }}
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* Inner dot */}
        <div
          className="rounded-full"
          style={{
            width: size * 0.35,
            height: size * 0.35,
            background: isHovered ? node.color : `${node.color}80`,
            boxShadow: isHovered ? `0 0 8px ${node.color}` : "none",
          }}
        />
      </motion.div>

      {/* Label (always visible, dimmed when other hovered) */}
      <span
        className="mt-2 text-[8px] font-mono uppercase tracking-[0.12em] whitespace-nowrap transition-all duration-500"
        style={{
          color: isHovered ? node.color : `${node.color}70`,
          opacity: isDimmed ? 0.15 : isHovered ? 1 : 0.5,
          textShadow: isHovered ? `0 0 10px ${node.color}60` : "none",
        }}
      >
        {node.shortLabel}
      </span>

      {/* Hover info card */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-full mt-3 z-30 w-32"
          style={{
            left: "50%",
            marginLeft: -64,
          }}
        >
          <div
            className="rounded-xl border p-3 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(13,13,13,0.98), rgba(20,20,20,0.95))",
              borderColor: `${node.color}40`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${node.color}15`,
            }}
          >
            <div
              className="text-[9px] font-bold"
              style={{ color: node.color }}
            >
              {node.label}
            </div>
            <div
              className="mt-1 h-[1px] w-full"
              style={{
                background: `linear-gradient(90deg, transparent 10%, ${node.color}50, transparent 90%)`,
              }}
            />
            <div className="mt-1.5 text-[7px] font-mono leading-relaxed text-white/50">
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

  // Subtle parallax on mouse move
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
      className="relative w-full overflow-hidden rounded-2xl border border-white/[0.05] p-8 lg:p-12"
      style={{
        background: "linear-gradient(180deg, rgba(8,8,8,0.95) 0%, rgba(4,4,4,0.98) 100%)",
      }}
    >
      {/* Subtle top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(74,155,142,0.3) 50%, transparent 90%)",
        }}
      />

      {/* Background nebula particles */}
      <NebulaParticles count={20} />

      {/* Radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Left: Copy */}
        <motion.div
          className="flex-shrink-0 lg:w-[340px] xl:w-[380px] space-y-4 text-center lg:text-left"
          initial={reduce ? false : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white/40">
            Web3 Trust Stack
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Web3 Trusted Infrastructure
          </h2>
          <p className="text-sm leading-relaxed text-white/45">
            AgentCFO weaves multi-sig suites, automation modules and Cobo HSM
            into a closed-loop trusted capital allocation network.
          </p>
          <p className="text-[10px] text-white/25 font-mono">
            Hover nodes to explore protocols…
          </p>
        </motion.div>

        {/* Right: Constellation */}
        <div
          className="relative flex-1"
          style={{
            height: 460,
            minWidth: 460,
            maxWidth: 520,
          }}
        >
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

            {/* Network nodes */}
            {NODES.map((node) => (
              <NetworkNode
                key={node.id}
                node={node}
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
