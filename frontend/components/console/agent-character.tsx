"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* =============================================================================
 * AGENT CHARACTER — Visual placeholder 3D anime character for Agent chat page.
 * Large gradient circle + Bot icon + sparkle particles + breathing animation.
 * ===========================================================================*/

const LIME = "#B5FF4D";
const CYAN = "#5EEAD4";
const VIOLET = "#C084FC";
const FG_SUBTLE = "rgba(255,255,255,0.6)";

export interface AgentCharacterProps {
  state: "idle" | "thinking" | "speaking" | "happy" | "warning";
}

const STATE_LABEL: Record<AgentCharacterProps["state"], string> = {
  idle: "Ready",
  thinking: "Thinking...",
  speaking: "Speaking...",
  happy: "All good!",
  warning: "Attention needed",
};

const STATE_COLOR: Record<AgentCharacterProps["state"], string> = {
  idle: CYAN,
  thinking: VIOLET,
  speaking: CYAN,
  happy: LIME,
  warning: "#FB7185",
};

export function AgentCharacter({ state }: AgentCharacterProps) {
  const color = STATE_COLOR[state];
  const isThinking = state === "thinking";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main character circle */}
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main gradient circle */}
        <motion.div
          className="relative flex h-32 w-32 items-center justify-center rounded-full"
          style={{
            background: `linear-gradient(135deg, ${LIME} 0%, ${CYAN} 100%)`,
            boxShadow: `0 0 40px ${color}44, 0 0 80px ${color}22`,
          }}
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Inner subtle shine */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)",
            }}
          />

          {/* Bot icon */}
          <motion.div
            animate={
              isThinking
                ? {
                    rotate: [0, -5, 5, -5, 5, 0],
                  }
                : {}
            }
            transition={{
              duration: 1.2,
              repeat: isThinking ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <Bot
              className="h-14 w-14 text-[#0D0D0D]"
              strokeWidth={1.5}
            />
          </motion.div>
        </motion.div>

        {/* Sparkle particles */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 72 * Math.PI) / 180;
          const radius = 72;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: [
                  0,
                  Math.cos(angle) * radius,
                  Math.cos(angle) * radius * 1.2,
                  Math.cos(angle) * radius,
                ],
                y: [
                  0,
                  Math.sin(angle) * radius,
                  Math.sin(angle) * radius * 1.2,
                  Math.sin(angle) * radius,
                ],
                opacity: [0, 1, 0.6, 0],
                scale: [0.3, 1, 0.8, 0.3],
              }}
              transition={{
                duration: 2.5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              <Sparkles
                className="h-3.5 w-3.5"
                style={{
                  color: i % 2 === 0 ? LIME : CYAN,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* State label */}
      <motion.span
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm font-medium"
        style={{ color: color }}
      >
        {STATE_LABEL[state]}
      </motion.span>
    </div>
  );
}
