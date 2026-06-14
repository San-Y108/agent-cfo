"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const AGENT_ROUTES = new Set(["/console", "/console/agent"]);

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

/**
 * Console main shell — module routes fill viewport below nav (same budget as Agent hub).
 */
export function ConsoleMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAgentHome = AGENT_ROUTES.has(pathname);

  return (
    <main
      className={cn(
        "relative z-10 flex flex-col pt-[7.5rem] md:pt-16",
        isAgentHome ? "min-h-[100dvh]" : "h-[100dvh] min-h-0 overflow-hidden"
      )}
    >
      {isAgentHome ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            className="flex flex-col min-h-[100dvh]"
            {...pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex h-[calc(100dvh-7.5rem)] min-h-0 flex-col overflow-hidden md:h-[calc(100dvh-4rem)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              className="flex h-full min-h-0 flex-col overflow-hidden"
              {...pageTransition}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
