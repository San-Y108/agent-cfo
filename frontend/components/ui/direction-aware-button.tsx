"use client";

import React, { useRef, useCallback } from "react";
import { motion } from "framer-motion";

type Direction = "top" | "right" | "bottom" | "left";

const DIRECTION_MAP: Record<Direction, { enter: string; exit: string }> = {
  top:    { enter: "translateY(-101%)", exit: "translateY(-101%)" },
  right:  { enter: "translateX(101%)",  exit: "translateX(101%)" },
  bottom: { enter: "translateY(101%)",  exit: "translateY(101%)" },
  left:   { enter: "translateX(-101%)", exit: "translateX(-101%)" },
};

const GRADIENT_MAP: Record<Direction, string> = {
  top:    "linear-gradient(to bottom, rgba(181,255,77,0.25), rgba(181,255,77,0.05))",
  right:  "linear-gradient(to left, rgba(181,255,77,0.25), rgba(181,255,77,0.05))",
  bottom: "linear-gradient(to top, rgba(181,255,77,0.25), rgba(181,255,77,0.05))",
  left:   "linear-gradient(to right, rgba(181,255,77,0.25), rgba(181,255,77,0.05))",
};

function getDirection(e: React.MouseEvent<HTMLButtonElement>): Direction {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const dist: [Direction, number][] = [
    ["top", y],
    ["right", rect.width - x],
    ["bottom", rect.height - y],
    ["left", x],
  ];
  return dist.reduce((a, b) => (a[1] < b[1] ? a : b))[0];
}

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
};

export function DirectionAwareButton({ children, className = "", style, onClick, type = "button" }: Props) {
  const overlayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const dir = getDirection(e);
    // Reset all overlays
    Object.values(overlayRefs.current).forEach((el) => {
      if (el) {
        el.style.transition = "none";
        el.style.transform = DIRECTION_MAP[dir].enter;
      }
    });
    // Activate the correct overlay
    const active = overlayRefs.current[dir];
    if (active) {
      requestAnimationFrame(() => {
        active.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
        active.style.transform = "translate(0, 0)";
      });
    }
  }, []);

  const handleLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const dir = getDirection(e);
    const overlay = overlayRefs.current[dir];
    if (overlay) {
      overlay.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      overlay.style.transform = DIRECTION_MAP[dir].exit;
    }
  }, []);

  return (
    <motion.button
      type={type}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Four directional overlays */}
      {(["top", "right", "bottom", "left"] as Direction[]).map((dir) => (
        <div
          key={dir}
          ref={(el) => { overlayRefs.current[dir] = el; }}
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: GRADIENT_MAP[dir],
            transform: DIRECTION_MAP[dir].enter,
          }}
        />
      ))}

      {/* Water ripple pseudo effect via animated circles */}
      <span className="absolute inset-0 z-0 overflow-hidden rounded-[inherit] pointer-events-none">
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B5FF4D]/10 opacity-0 transition-all duration-700 group-hover:w-[300%] group-hover:opacity-100"
          style={{ width: "0%", aspectRatio: "1" }}
        />
      </span>

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
