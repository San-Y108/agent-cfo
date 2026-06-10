"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Orbit,
  ShieldCheck,
  Wallet,
  Cpu,
  Database,
  Zap,
  Sliders,
  Code,
} from "lucide-react";

type Node = {
  name: string;
  icon: React.ElementType;
  desc: string;
  angle: number;
  distance: number;
};

const NODES: Node[] = [
  { name: "Cobo Agentic", icon: Orbit, desc: "Autonomous API execution", angle: 0, distance: 110 },
  { name: "Gnosis Safe", icon: ShieldCheck, desc: "Multi-sig protection", angle: 45, distance: 110 },
  { name: "MetaMask SDK", icon: Wallet, desc: "Owner cryptographic sign", angle: 90, distance: 110 },
  { name: "Sepolia", icon: Cpu, desc: "Isolated contract run", angle: 135, distance: 110 },
  { name: "Drizzle ORM", icon: Database, desc: "Database storage", angle: 180, distance: 110 },
  { name: "Sablier", icon: Zap, desc: "Continuous payroll", angle: 225, distance: 110 },
  { name: "Framer", icon: Sliders, desc: "Elastic spring animations", angle: 270, distance: 110 },
  { name: "GitHub", icon: Code, desc: "Continuous deliveries", angle: 315, distance: 110 },
];

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

export function Web3NodeCloud() {
  const reduce = useReducedMotion();
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) / 30,
        y: (e.clientY - rect.top - rect.height / 2) / 30,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const nodeParallax = (node: Node) => {
    const base = polarToCartesian(node.angle, node.distance);
    if (reduce) return base;
    return {
      x: base.x + mousePos.x * (base.x > 0 ? 1 : -1) * 0.8,
      y: base.y + mousePos.y * (base.y > 0 ? 1 : -1) * 0.8,
    };
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 lg:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(181,255,77,0.03), transparent 70%)",
        }}
      />

      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-blue-400">
            Web3 Trust Stack
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Web3 Trusted Infrastructure
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            AgentCFO weaves multi-sig suites, automation modules and Cobo HSM
            into a closed-loop trusted capital allocation network.
          </p>
          <p className="text-xs text-white/30 font-mono">
            Hover nodes to explore protocols...
          </p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[360px]">
          {[60, 100, 140].map((r, i) => (
            <motion.div
              key={r}
              className="absolute left-1/2 top-1/2 rounded-full border"
              style={{
                width: r * 2,
                height: r * 2,
                marginLeft: -r,
                marginTop: -r,
                borderColor: i === 1 ? "rgba(181,255,77,0.08)" : "rgba(255,255,255,0.04)",
              }}
              animate={reduce ? {} : { scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}

          <svg viewBox="-180 -180 360 360" className="absolute inset-0 h-full w-full pointer-events-none">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B5FF4D" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#B5FF4D" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {NODES.map((node) => {
              const pos = nodeParallax(node);
              return (
                <line
                  key={node.name}
                  x1="0"
                  y1="0"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#lineGrad)"
                  strokeWidth="1"
                  opacity={hoveredNode !== null ? 0.8 : 0.4}
                />
              );
            })}
          </svg>

          <motion.div
            className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
              backdropFilter: "blur(12px)",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15), 0 0 40px rgba(181,255,77,0.15), inset 0 0 20px rgba(181,255,77,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            animate={reduce ? {} : { scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Orbit className="h-7 w-7" style={{ color: "#B5FF4D" }} strokeWidth={1.5} />
            <span className="mt-0.5 text-[7px] font-mono font-bold uppercase tracking-wider text-[#B5FF4D]">
              Cobo Core
            </span>
          </motion.div>

          {NODES.map((node, i) => {
            const pos = nodeParallax(node);
            const Icon = node.icon;
            const isHovered = hoveredNode === i;

            return (
              <motion.div
                key={node.name}
                className="absolute z-10 flex flex-col items-center"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => setHoveredNode(i)}
                onMouseLeave={() => setHoveredNode(null)}
                animate={reduce ? {} : {
                  x: mousePos.x * (pos.x > 0 ? 0.3 : -0.3),
                  y: mousePos.y * (pos.y > 0 ? 0.3 : -0.3),
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <motion.div
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
                  style={{
                    background: isHovered ? "rgba(181,255,77,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isHovered ? "rgba(181,255,77,0.4)" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isHovered
                      ? "0 0 20px rgba(181,255,77,0.3), inset 0 1px 1px rgba(255,255,255,0.1)"
                      : "inset 0 1px 1px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon className="h-4 w-4" style={{ color: isHovered ? "#B5FF4D" : "rgba(255,255,255,0.5)" }} strokeWidth={1.5} />

                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 left-1/2 z-30 w-28 -translate-x-1/2 rounded-lg border border-white/[0.08] bg-[#0D0D0D]/95 p-2 text-center shadow-2xl backdrop-blur-md"
                    >
                      <div className="text-[9px] font-bold text-white">{node.name}</div>
                      <div className="mt-0.5 text-[7px] font-mono leading-tight text-white/50">
                        {node.desc}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.span
                  className="mt-1.5 text-[8px] font-mono uppercase tracking-wider"
                  animate={{ opacity: isHovered ? 1 : 0.3 }}
                  style={{ color: isHovered ? "#B5FF4D" : "rgba(255,255,255,0.3)" }}
                >
                  {node.name.split(" ")[0]}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
