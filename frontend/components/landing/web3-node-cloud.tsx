"use client";

import React, { useState, useRef } from "react";
import { motion, type PanInfo } from "framer-motion";
import {
  Orbit,
  ShieldCheck,
  Wallet,
  Cpu,
  Database,
  Zap,
  Sliders,
  Code,
  Workflow,
} from "lucide-react";
import { useT } from "@/lib/i18n/context";

const web3Integrations = [
  {
    name: "Cobo Agentic Wallet",
    icon: Orbit,
    color:
      "bg-[#B5FF4D]/20 text-[#B5FF4D] shadow-[0_0_15px_rgba(181,255,77,0.2)]",
    desc: "Autonomous API execution",
    x: 0,
    y: -100,
    scale: 1.15,
    isCore: true,
  },
  {
    name: "Gnosis Safe",
    icon: ShieldCheck,
    color:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    desc: "Multi-sig protection layout",
    x: -105,
    y: -60,
    scale: 1.0,
    isCore: false,
  },
  {
    name: "MetaMask SDK",
    icon: Wallet,
    color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    desc: "Instant owner cryptographic sign",
    x: 105,
    y: -60,
    scale: 1.0,
    isCore: false,
  },
  {
    name: "Sepolia Testnet",
    icon: Cpu,
    color: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    desc: "Isolated smart contract run",
    x: 125,
    y: 15,
    scale: 1.1,
    isCore: false,
  },
  {
    name: "Drizzle ORM",
    icon: Database,
    color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    desc: "Pristine database storage engine",
    x: -125,
    y: 15,
    scale: 1.0,
    isCore: false,
  },
  {
    name: "Sablier Streams",
    icon: Zap,
    color: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    desc: "Realtime continuous payroll",
    x: -100,
    y: 85,
    scale: 1.05,
    isCore: false,
  },
  {
    name: "Framer Physics",
    icon: Sliders,
    color: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    desc: "Elastic UI spring animations",
    x: 0,
    y: 105,
    scale: 1.0,
    isCore: false,
  },
  {
    name: "Github Actions",
    icon: Code,
    color: "bg-neutral-500/10 text-neutral-300 border border-neutral-500/20",
    desc: "Trigger continuous deliveries",
    x: 100,
    y: 85,
    scale: 1.05,
    isCore: false,
  },
];

const DRAG_CLAMP = 40;
const clamp = (v: number) => Math.max(-DRAG_CLAMP, Math.min(DRAG_CLAMP, v));

export function Web3NodeCloud() {
  const t = useT();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [deltas, setDeltas] = useState<Record<number, { x: number; y: number }>>({});
  const sectionRef = useRef<HTMLDivElement>(null);
  const dragStartDeltaRef = useRef<Record<number, { x: number; y: number }>>({});

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const computeTarget = (
    elem: (typeof web3Integrations)[number],
    idx: number,
  ) => {
    const parallaxX =
      mousePosition.x * (elem.isCore ? 0.3 : 1.2) * (elem.x > 0 ? 1 : -1);
    const parallaxY =
      mousePosition.y * (elem.isCore ? 0.3 : 1.2) * (elem.y > 0 ? 1 : -1);
    const delta = deltas[idx] || { x: 0, y: 0 };
    return {
      x: elem.x + parallaxX + delta.x,
      y: elem.y + parallaxY + delta.y,
    };
  };

  return (
    <section
      id="integrations-hub"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full text-left relative border rounded-3xl bg-neutral-900/60 backdrop-blur-xl border-white/10 p-6"
    >
      <div className="grid grid-cols-1 gap-6 items-center">
        {/* Headline */}
        <div className="space-y-3">
          <div className="px-3 py-1 rounded-full border inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider bg-blue-500/10 border-blue-500/20 text-blue-400">
            <Workflow className="w-3 h-3 text-blue-400" />
            {t("web3Cloud.eyebrow")}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none text-white">
            {t("web3Cloud.title")}
          </h2>
          <p className="text-sm font-light leading-relaxed text-white/50">
            {t("web3Cloud.desc")}
          </p>
          <p className="text-xs text-white/30 font-mono">{t("web3Cloud.hint")}</p>
        </div>

        {/* Floating Node Grid — draggable */}
        <div className="relative aspect-square w-full max-w-[340px] mx-auto border rounded-3xl overflow-hidden shadow-inner flex items-center justify-center bg-white/[0.01] border-white/5">
          {/* Concentric rings */}
          <div className="absolute w-[200px] h-[200px] rounded-full border border-dashed pointer-events-none z-0 border-white/5" />
          <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed pointer-events-none z-0 animate-[spin_40s_linear_infinite] border-[#B5FF4D]/5" />

          {/* Center container */}
          <div className="absolute w-[340px] h-[340px] flex items-center justify-center overflow-visible">
            {/* SVG Connecting lines — single source of truth: deltas + parallax */}
            <svg
              viewBox="-200 -200 400 400"
              className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
            >
              <defs>
                <linearGradient
                  id="glow-line"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#b5ff4d" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {web3Integrations.map((elem, idx) => {
                const { x: targetX, y: targetY } = computeTarget(elem, idx);
                return (
                  <g key={idx}>
                    <line
                      x1="0"
                      y1="0"
                      x2={targetX}
                      y2={targetY}
                      stroke="url(#glow-line)"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="0"
                      y1="0"
                      x2={targetX}
                      y2={targetY}
                      stroke="#b5ff4d"
                      strokeWidth="0.5"
                      className="opacity-20"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Central Cobo Core */}
            <div className="absolute z-10 w-16 h-16 bg-[#B5FF4D] rounded-full border-4 border-[#0D0D0D] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(181,255,77,0.3)]">
              <Orbit className="w-6 h-6 text-[#0D0D0D] animate-spin [animation-duration:8s]" />
              <span className="text-[6px] font-mono font-bold uppercase text-[#0D0D0D] mt-0.5">
                Cobo Core
              </span>
            </div>

            {/* Floating nodes — draggable */}
            {web3Integrations.map((elem, index) => {
              const IconComponent = elem.icon;
              const { x: targetX, y: targetY } = computeTarget(elem, index);

              return (
                <motion.div
                  key={index}
                  animate={{ x: targetX, y: targetY }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  drag
                  dragConstraints={{
                    left: -DRAG_CLAMP,
                    right: DRAG_CLAMP,
                    top: -DRAG_CLAMP,
                    bottom: DRAG_CLAMP,
                  }}
                  dragElastic={0.15}
                  dragMomentum={false}
                  onDragStart={() => {
                    dragStartDeltaRef.current[index] =
                      deltas[index] || { x: 0, y: 0 };
                  }}
                  onDrag={(_, info: PanInfo) => {
                    const start =
                      dragStartDeltaRef.current[index] || { x: 0, y: 0 };
                    setDeltas((prev) => ({
                      ...prev,
                      [index]: {
                        x: clamp(start.x + info.offset.x),
                        y: clamp(start.y + info.offset.y),
                      },
                    }));
                  }}
                  whileDrag={{ scale: 1.15, zIndex: 50 }}
                  style={{ scale: elem.scale }}
                  className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing group/btn z-10"
                >
                  {/* Node circle */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${elem.color} hover:bg-white/20 transition-all duration-300 relative group`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />

                    {/* Hover tooltip */}
                    <div className="absolute top-11 left-1/2 -translate-x-1/2 w-28 border rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-2xl z-30 bg-black border-white/10">
                      <div className="text-[9px] font-bold text-white mb-0.5 leading-tight">
                        {elem.name}
                      </div>
                      <div className="text-[7px] leading-tight font-mono text-white/50">
                        {elem.desc}
                      </div>
                    </div>
                  </div>

                  {/* Sub-label */}
                  <span className="text-[8px] font-mono mt-1 opacity-0 group-hover/btn:opacity-100 transition-opacity text-white/40">
                    {elem.name.split(" ")[0]}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
