"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export type CapsuleSide = "left" | "right";

export interface CapsuleItem {
  id: string;
  href: string;
  labelKey: string;
  icon: React.ElementType;
  color: string;
}

interface EdgeCapsuleGroupProps {
  side: CapsuleSide;
  items: CapsuleItem[];
  activeId?: string | null;
  onActivate?: (id: string) => void;
}

/**
 * EdgeCapsuleGroup — hover-reveal capsule tabs attached to screen edges.
 *
 * Default: only a small colored icon tab peeks out from the edge.
 * Hover edge zone: capsules expand outward to show full labels.
 * Clicking activates the associated module panel.
 */
export function EdgeCapsuleGroup({
  side,
  items,
  activeId,
  onActivate,
}: EdgeCapsuleGroupProps) {
  const { t } = useApp();
  const [hovered, setHovered] = useState(false);
  const isLeft = side === "left";

  return (
    <div
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-40 hidden md:flex",
        isLeft ? "left-0" : "right-0"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Wide invisible hover capture zone */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-80 w-16",
          isLeft ? "left-0" : "right-0"
        )}
      />

      <div className={cn("relative flex flex-col gap-3", isLeft ? "items-start" : "items-end")}>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              initial={false}
              animate={{
                x: hovered ? 0 : isLeft ? -8 : 8,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 26,
                delay: index * 0.04,
              }}
              onClick={() => onActivate?.(item.id)}
              className={cn(
                "group relative flex items-center overflow-hidden rounded-xl border border-white/[0.08] bg-surface/90 dark:bg-[#0D0D0D]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-colors",
                isLeft ? "flex-row pl-3 pr-4 py-2.5" : "flex-row-reverse pr-3 pl-4 py-2.5",
                isActive
                  ? "text-[#0D0D0D]"
                  : "text-fg-muted hover:text-fg"
              )}
              style={{
                backgroundColor: isActive ? item.color : undefined,
                borderColor: isActive ? item.color : undefined,
                boxShadow: isActive
                  ? `0 0 28px ${item.color}45, 0 8px 32px rgba(0,0,0,0.3)`
                  : undefined,
              }}
            >
              {/* Edge indicator line */}
              <span
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full transition-opacity",
                  isLeft ? "left-0" : "right-0",
                  isActive ? "opacity-0" : "opacity-100"
                )}
                style={{ backgroundColor: item.color }}
              />

              <Icon
                size={18}
                className="relative z-10 shrink-0"
                style={{ color: isActive ? "#0D0D0D" : item.color }}
              />

              <motion.span
                initial={false}
                animate={{
                  width: hovered ? "auto" : 0,
                  opacity: hovered ? 1 : 0,
                  marginLeft: hovered ? (isLeft ? 10 : 0) : 0,
                  marginRight: hovered ? (isLeft ? 0 : 10) : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                  delay: index * 0.04 + 0.02,
                }}
                className="relative z-10 whitespace-nowrap text-xs font-medium overflow-hidden"
              >
                {t(item.labelKey as any)}
              </motion.span>

              {/* Hover glow */}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at ${isLeft ? "0%" : "100%"} 50%, ${item.color}12, transparent 70%)`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
