"use client";

import React from "react";
import { Bot } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";

const CYAN = "#5EEAD4";

export const AGENT_CFO_MASCOT_SRC = "/console/mascots/agent-cfo-mascot.png";
export const AGENT_CFO_AVATAR_SRC = "/console/mascots/agent-cfo-avatar.png";

interface AgentCfoMascotProps {
  analyzing?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  src?: string;
  interactive?: boolean;
  embedded?: boolean;
}

const SIZE_MAP = {
  sm: { stageH: 92, figureH: 80, figureW: 108 },
  md: { stageH: 224, figureH: 196, figureW: 216 },
  lg: { stageH: 268, figureH: 232, figureW: 252 },
} as const;

export function AgentCfoMascot({
  analyzing = false,
  size = "md",
  className,
  src = AGENT_CFO_MASCOT_SRC,
  interactive = true,
  embedded = true,
}: AgentCfoMascotProps) {
  const reduce = useReducedMotion();
  const dims = SIZE_MAP[size];
  const hasImage = Boolean(src);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 160, damping: 24 });
  const springY = useSpring(rawY, { stiffness: 160, damping: 24 });
  const rotateY = useTransform(springX, (v) => (reduce ? 0 : v / 22));
  const rotateX = useTransform(springY, (v) => (reduce ? 0 : -v / 22));

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - box.left - box.width / 2);
    rawY.set(e.clientY - box.top - box.height / 2);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const figure = (
    <motion.div
      className="relative mx-auto"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        width: dims.figureW,
        height: dims.figureH,
        filter: analyzing
          ? "drop-shadow(0 18px 32px rgba(94,234,212,0.35))"
          : "drop-shadow(0 16px 28px rgba(192,132,252,0.28)) drop-shadow(0 6px 14px rgba(0,0,0,0.55))",
      }}
      animate={
        analyzing
          ? { y: [0, -8, 0], scale: [1, 1.02, 1] }
          : reduce
            ? undefined
            : { y: [0, -10, 0] }
      }
      whileHover={interactive && !reduce ? { y: -12, scale: 1.03 } : undefined}
      transition={
        analyzing
          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {hasImage ? (
        <img
          src={src}
          alt="AgentCFO"
          className="h-full w-full select-none object-contain object-center"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-end justify-center pb-1">
          <Bot size={size === "sm" ? 22 : 40} className="text-[#C084FC]" strokeWidth={1.3} />
        </div>
      )}
    </motion.div>
  );

  if (embedded) {
    return (
      <div
        className={cn("relative w-full overflow-hidden", className)}
        style={{ height: dims.stageH }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 92%, rgba(192,132,252,0.14) 0%, transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 45%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {analyzing && <SparklesFX count={12} color={CYAN} className="opacity-60" />}

        <motion.div
          className="pointer-events-none absolute left-1/2 rounded-[50%]"
          style={{
            width: dims.figureW * 0.78,
            height: size === "sm" ? 10 : 18,
            bottom: size === "sm" ? 4 : 8,
            x: "-50%",
            background: analyzing
              ? "rgba(94,234,212,0.5)"
              : "rgba(192,132,252,0.42)",
            filter: "blur(14px)",
          }}
          animate={reduce ? undefined : { opacity: [0.5, 0.85, 0.5], scaleX: [0.9, 1.08, 0.9] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="relative flex h-full items-end justify-center pb-3"
          style={{ perspective: 900 }}
        >
          {figure}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("relative mx-auto", className)}
      style={{ width: dims.figureW, height: dims.figureH }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {figure}
    </motion.div>
  );
}

export function AgentChatAvatar({
  analyzing = false,
  className,
  src = AGENT_CFO_AVATAR_SRC,
}: {
  analyzing?: boolean;
  className?: string;
  src?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative mt-0.5 h-[46px] w-[46px] shrink-0", className)}
      animate={
        reduce
          ? undefined
          : analyzing
            ? { scale: [1, 1.04, 1] }
            : { y: [0, -3, 0] }
      }
      transition={{
        duration: analyzing ? 1.2 : 3.2,
        repeat: reduce ? 0 : Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-full",
          "border-2 bg-[#0a0f18]/80",
          analyzing
            ? "border-cyan-400/60 shadow-[0_0_14px_-2px_rgba(94,234,212,0.45)]"
            : "border-[#C084FC]/45 shadow-[0_0_12px_-3px_rgba(192,132,252,0.35)]"
        )}
      >
        {src ? (
          <div className="flex h-full w-full items-center justify-center overflow-hidden p-[2px]">
            <img
              src={src}
              alt="AgentCFO"
              className="pointer-events-none h-full w-full select-none object-cover object-[center_30%] scale-[1.45]"
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Bot size={18} className="text-sky-300" strokeWidth={1.5} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.08] via-transparent to-black/10" />
      </div>
    </motion.div>
  );
}
