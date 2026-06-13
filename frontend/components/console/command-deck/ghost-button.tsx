"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ConsoleGhostButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  accentHover?: "lime" | "cyan" | "blue" | "violet" | "coral";
}

const hoverAccent: Record<NonNullable<ConsoleGhostButtonProps["accentHover"]>, string> = {
  lime: "hover:border-hud-lime/35 hover:text-hud-lime",
  cyan: "hover:border-hud-cyan/35 hover:text-hud-cyan",
  blue: "hover:border-hud-blue/35 hover:text-hud-blue",
  violet: "hover:border-hud-violet/35 hover:text-hud-violet",
  coral: "hover:border-hud-coral/35 hover:text-hud-coral",
};

export function ConsoleGhostButton({
  children,
  className,
  accentHover = "lime",
  type = "button",
  ...props
}: ConsoleGhostButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-border-token bg-surface-2/80 px-3 py-2 text-[12px] font-medium text-fg-muted transition-all hover:bg-surface-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
        hoverAccent[accentHover],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
