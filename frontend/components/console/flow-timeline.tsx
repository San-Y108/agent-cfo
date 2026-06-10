"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* =============================================================================
 * FLOW TIMELINE — Horizontal step timeline for payment workflow.
 * Steps: Generate Plan → Risk Check → Approval → Execution → Audit
 * ===========================================================================*/

const LIME = "#B5FF4D";
const CYAN = "#5EEAD4";
const FG_SUBTLE = "rgba(255,255,255,0.6)";

export interface FlowTimelineProps {
  currentStep: number; // 0–4
  steps: { label: string; icon: React.ReactNode }[];
}

export function FlowTimeline({ currentStep, steps }: FlowTimelineProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step node */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {/* Completed: lime solid circle */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: LIME }}
                    >
                      <div className="text-[#0D0D0D]">{step.icon}</div>
                    </motion.div>
                  )}

                  {/* Current: cyan pulsing circle with Sparkles */}
                  {isCurrent && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 250, damping: 18 }}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: CYAN,
                        boxShadow: `0 0 20px ${CYAN}66, 0 0 40px ${CYAN}33`,
                      }}
                    >
                      {/* 3 sparkle particles */}
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            x: [0, Math.cos((i * 120 * Math.PI) / 180) * 18],
                            y: [0, Math.sin((i * 120 * Math.PI) / 180) * 18],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut",
                          }}
                        >
                          <Sparkles
                            className="h-3 w-3"
                            style={{ color: CYAN }}
                          />
                        </motion.div>
                      ))}
                      <div className="relative z-10 text-[#0D0D0D]">
                        {step.icon}
                      </div>
                    </motion.div>
                  )}

                  {/* Future: gray empty circle */}
                  {isFuture && (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: "rgba(255,255,255,0.15)",
                        backgroundColor: "transparent",
                      }}
                    >
                      <div style={{ color: FG_SUBTLE }}>{step.icon}</div>
                    </div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    isCompleted && "font-semibold"
                  )}
                  style={{
                    color: isCompleted
                      ? LIME
                      : isCurrent
                        ? CYAN
                        : FG_SUBTLE,
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div className="relative mx-2 h-[2px] flex-1 overflow-hidden rounded-full">
                  {/* Background track */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  />
                  {/* Animated fill */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: LIME }}
                    initial={{ width: "0%" }}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                      delay: isCompleted ? 0.1 : 0,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
