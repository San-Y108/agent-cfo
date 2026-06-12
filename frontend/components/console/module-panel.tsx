"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FrostedPanel, Scanline } from "@/components/console/command-deck";
import type { HudColor } from "@/components/console/command-deck";

export type PanelSide = "left" | "right";

interface ModulePanelProps {
  side: PanelSide;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  color?: string;
  glowColor?: HudColor;
  width?: number;
  children: React.ReactNode;
}

/**
 * ModulePanel — split-screen panel that lives inside a grid cell on desktop.
 *
 * Used for the 4 functional modules (Treasury/Wallets/Analytics/Policy).
 * The parent layout controls positioning; this component simply fills its
 * container with a frosted panel and handles enter/exit animation.
 */
export function ModulePanel({
  side,
  isOpen,
  onClose,
  title,
  subtitle,
  color = "#B5FF4D",
  glowColor = "lime",
  children,
}: ModulePanelProps) {
  const isLeft = side === "left";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: isLeft ? -40 : 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLeft ? -40 : 40, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 30,
          }}
          className={cn(
            "absolute inset-0 z-40 flex flex-col",
            isLeft ? "border-r" : "border-l"
          )}
        >
          <FrostedPanel
            glowColor={glowColor}
            sheen
            className="h-full rounded-none border-y-0 border-white/[0.06] bg-surface/80 dark:bg-[#0D0D0D]/85"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h2
                  className="text-sm font-bold text-fg tracking-tight"
                  style={{ color }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[11px] text-fg-subtle mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-white/[0.06] transition-colors"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>

            <Scanline color={glowColor} className="opacity-30" />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </FrostedPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
