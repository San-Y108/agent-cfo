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
 * ModulePanel — persistent split-screen panel that slides in from left/right.
 *
 * Used for the 4 functional modules (Treasury/Wallets/Analytics/Policy).
 * Stacks above the Agent hub but keeps Agent visible in the center gap.
 */
export function ModulePanel({
  side,
  isOpen,
  onClose,
  title,
  subtitle,
  color = "#B5FF4D",
  glowColor = "lime",
  width = 420,
  children,
}: ModulePanelProps) {
  const isLeft = side === "left";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop dim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: isLeft ? -width : width, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLeft ? -width : width, opacity: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
            }}
            style={{ width }}
            className={cn(
              "fixed top-0 bottom-0 z-40 hidden md:flex flex-col",
              isLeft ? "left-0 border-r" : "right-0 border-l"
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
        </>
      )}
    </AnimatePresence>
  );
}
