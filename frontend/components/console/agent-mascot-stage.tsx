"use client";

import React, { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/i18n/context";

const MASCOTS = [
  {
    id: "jiujiu",
    name: "九九八乂",
    roleZh: "后端 Agent",
    roleEn: "Backend Agent",
    src: "/console/mascots/jiujiu-mascot.png",
    accent: "#5EEAD4",
  },
  {
    id: "threetwoa",
    name: "threetwoa",
    roleZh: "前端",
    roleEn: "Frontend",
    src: "/console/mascots/threetwoa-mascot.png",
    accent: "#60A5FA",
  },
  {
    id: "purple-sun",
    name: "purple sun",
    roleZh: "合约 / CAW",
    roleEn: "Contracts & CAW",
    src: "/console/mascots/purple-sun-mascot.png",
    accent: "#C084FC",
  },
  {
    id: "guagua",
    name: "呱呱",
    roleZh: "物料 / 设计",
    roleEn: "Design & Content",
    src: "/console/mascots/guagua-mascot.png",
    accent: "#FB7185",
  },
  {
    id: "huan",
    name: "欢",
    roleZh: "PM",
    roleEn: "PM",
    src: "/console/mascots/huan-mascot.png",
    accent: "#FBBF24",
  },
  {
    id: "zanyk",
    name: "ZanyK",
    roleZh: "导师",
    roleEn: "Mentor",
    src: "/console/mascots/zanyk-mascot.png",
    accent: "#B5FF4D",
    isMentor: true,
  },
] as const;

type MascotId = (typeof MASCOTS)[number]["id"];

interface AgentMascotStageProps {
  analyzing?: boolean;
  variant?: "compact" | "stage";
  className?: string;
}

function MascotPicker({
  activeId,
  hoveredId,
  onSelect,
  onHover,
  size = "md",
}: {
  activeId: MascotId;
  hoveredId: MascotId | null;
  onSelect: (id: MascotId) => void;
  onHover: (id: MascotId | null) => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {MASCOTS.map((m) => {
        const selected = activeId === m.id;
        const hovered = hoveredId === m.id;
        return (
          <button
            key={m.id}
            type="button"
            aria-label={m.name}
            aria-pressed={selected}
            onClick={() => onSelect(m.id)}
            onMouseEnter={() => onHover(m.id)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              "group relative overflow-hidden rounded-full border transition-all duration-200",
              btn,
              selected
                ? "scale-110 border-white/25"
                : "border-white/10 opacity-75 hover:scale-105 hover:opacity-100"
            )}
            style={{
              boxShadow:
                selected || hovered ? `0 0 18px -6px ${m.accent}` : undefined,
            }}
          >
            <img
              src={m.src}
              alt=""
              className="h-full w-full object-cover object-[center_12%] scale-[1.35]"
              draggable={false}
            />
            {"isMentor" in m && m.isMentor && (
              <span
                className="absolute right-0 top-0 h-2 w-2 rounded-full"
                style={{
                  background: m.accent,
                  boxShadow: `0 0 6px ${m.accent}`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function MascotFigure({
  preview,
  analyzing,
  reduce,
  compact,
  rotateX,
  rotateY,
  onPointerMove,
  onPointerLeave,
}: {
  preview: (typeof MASCOTS)[number];
  analyzing: boolean;
  reduce: boolean | null;
  compact: boolean;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
}) {
  return (
    <motion.div
      className={cn("relative shrink-0", compact ? "w-[88px]" : "w-[148px] sm:w-[168px]")}
      style={{ perspective: 900 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <motion.div
        className={cn("relative", compact ? "h-[108px]" : "h-[188px] sm:h-[210px]")}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="pointer-events-none absolute bottom-1 left-1/2 z-0 h-8 w-[78%] -translate-x-1/2 rounded-[50%] blur-2xl transition-colors duration-500"
          style={{
            background: preview.accent,
            opacity: analyzing ? 0.5 : 0.32,
          }}
        />
        <motion.img
          key={preview.id}
          src={preview.src}
          alt={preview.name}
          initial={reduce ? false : { opacity: 0, scale: 0.92, y: 8 }}
          animate={{
            opacity: 1,
            scale: analyzing ? [1, 1.03, 1] : 1,
            y: analyzing ? 0 : reduce ? 0 : [0, -4, 0],
          }}
          transition={
            analyzing
              ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
              : reduce
                ? { duration: 0.2 }
                : {
                    y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.35 },
                    scale: { duration: 0.35 },
                  }
          }
          className="relative z-10 h-full w-full select-none object-contain object-bottom drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Interactive 3D mascot strip — for secondary info panels, not the Agent hero.
 */
export function AgentMascotStage({
  analyzing = false,
  variant = "compact",
  className,
}: AgentMascotStageProps) {
  const { lang } = useApp();
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<MascotId>("jiujiu");
  const [hoveredId, setHoveredId] = useState<MascotId | null>(null);

  const active = MASCOTS.find((m) => m.id === activeId) ?? MASCOTS[0];
  const preview = hoveredId
    ? MASCOTS.find((m) => m.id === hoveredId) ?? active
    : active;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 180, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 22 });
  const rotateY = useTransform(springX, (v) => (reduce ? 0 : v / (variant === "compact" ? 18 : 14)));
  const rotateX = useTransform(springY, (v) => (reduce ? 0 : -v / (variant === "compact" ? 18 : 14)));

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - box.left - box.width / 2);
    rawY.set(e.clientY - box.top - box.height / 2);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const figure = (
    <MascotFigure
      preview={preview}
      analyzing={analyzing}
      reduce={reduce}
      compact={variant === "compact"}
      rotateX={rotateX}
      rotateY={rotateY}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    />
  );

  const meta = (
    <div className={variant === "compact" ? "min-w-0 flex-1" : "text-center"}>
      <p
        className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: preview.accent }}
      >
        {preview.name}
      </p>
      <p className="mt-0.5 text-[10px] text-fg-muted">
        {lang === "zh" ? preview.roleZh : preview.roleEn}
      </p>
    </div>
  );

  const picker = (
    <MascotPicker
      activeId={activeId}
      hoveredId={hoveredId}
      onSelect={setActiveId}
      onHover={setHoveredId}
      size={variant === "compact" ? "sm" : "md"}
    />
  );

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
        {figure}
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          {meta}
          {picker}
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-fg-subtle/70">
            {lang === "zh" ? "悬停预览 · 点击锁定成员" : "Hover to preview · click to lock"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {figure}
      {meta}
      {picker}
      <p className="max-w-[200px] text-center font-mono text-[8px] uppercase tracking-[0.16em] text-fg-subtle/80">
        {lang === "zh" ? "点击切换小队成员" : "Tap squad member to switch"}
      </p>
    </div>
  );
}
