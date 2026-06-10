"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

/**
 * BentoGrid — Aceternity-style asymmetric card grid.
 * Simplified and adapted for AgentCFO dark theme.
 * No external image dependencies, pure CSS/JSX skeletons.
 */

interface BentoItem {
  title: string;
  description: string;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function BentoGrid({
  items,
  className,
}: {
  items: BentoItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[minmax(180px,auto)]",
        className
      )}
    >
      {items.map((item, index) => (
        <BentoCard
          key={index}
          title={item.title}
          description={item.description}
          className={item.className}
          icon={item.icon}
          index={index}
        >
          {item.children}
        </BentoCard>
      ))}
    </div>
  );
}

function BentoCard({
  title,
  description,
  className,
  icon,
  children,
  index,
}: BentoItem & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl",
        "border border-white/[0.06] bg-surface p-6",
        "hover:border-white/[0.12] transition-colors duration-300",
        className
      )}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.03] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {icon && (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold text-fg">{title}</h3>
        <p className="mt-2 text-sm text-fg-subtle leading-relaxed">{description}</p>
      </div>

      {/* Visual area */}
      {children && (
        <div className="relative z-10 mt-4 flex-1 min-h-[100px]">{children}</div>
      )}
    </motion.div>
  );
}

/**
 * BentoSkeleton — animated placeholder for loading states.
 */
export function BentoSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-surface p-6",
        className
      )}
    >
      <div className="h-10 w-10 rounded-xl bg-white/[0.03] animate-pulse" />
      <div className="h-5 w-2/3 rounded bg-white/[0.03] animate-pulse" />
      <div className="h-4 w-full rounded bg-white/[0.03] animate-pulse" />
      <div className="h-4 w-4/5 rounded bg-white/[0.03] animate-pulse" />
    </div>
  );
}
