"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrambleValue } from "@/components/ui/gsap-text-effects";

/* =============================================================================
 * RISK GATE ANIMATION — Animated blocked payment indicator.
 * Scales in + shakes when blocked; exits with AnimatePresence.
 * ===========================================================================*/

const CORAL = "#FB7185";

export interface RiskGateAnimationProps {
  isBlocked: boolean;
  reason?: string;
}

export function RiskGateAnimation({ isBlocked, reason }: RiskGateAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      {isBlocked && (
        <motion.div
          key="risk-gate"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: [0, -5, 5, -5, 5, 0],
          }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
          transition={{
            opacity: { duration: 0.25 },
            scale: { type: "spring", stiffness: 300, damping: 20 },
            x: {
              duration: 0.5,
              ease: "easeInOut",
              delay: 0.15,
            },
          }}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3",
            "bg-[#0D0D0D]"
          )}
          style={{
            borderColor: `${CORAL}40`,
            boxShadow: `0 0 24px ${CORAL}22`,
          }}
        >
          {/* ShieldAlert icon with subtle glow */}
          <motion.div
            animate={{
              rotate: [0, -3, 3, -3, 3, 0],
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              delay: 0.2,
              repeat: 0,
            }}
          >
            <ShieldAlert
              className="h-6 w-6 shrink-0"
              style={{ color: CORAL }}
              strokeWidth={2}
            />
          </motion.div>

          {/* Text content */}
          <div className="flex flex-col gap-0.5">
            <span
              className="text-sm font-bold"
              style={{ color: CORAL }}
            >
              Payment Blocked
            </span>
            {reason && (
              <span
                className="text-xs font-mono"
                style={{ color: `${CORAL}cc` }}
              >
                <ScrambleValue value={reason} delay={0.3} duration={1} />
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
