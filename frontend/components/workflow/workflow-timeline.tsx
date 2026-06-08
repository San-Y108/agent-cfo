"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { CheckCircle, AlertTriangle, Circle } from "lucide-react";
import type { DemoStep } from "@/lib/workflow/demo-steps";
import { demoSteps } from "@/lib/workflow/demo-steps";
import type { RiskCheckResult } from "@/lib/api/types";

interface WorkflowTimelineProps {
  riskResult: RiskCheckResult;
}

function resolveStepStatus(
  step: DemoStep,
  riskResult: RiskCheckResult
): DemoStep["status"] {
  if (step.id === "risk-check" && !riskResult.passed) {
    return "blocked";
  }
  return "completed";
}

export function WorkflowTimeline({ riskResult }: WorkflowTimelineProps) {
  const hasRiskFlagged = !riskResult.passed;

  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Agent Workflow
        </h2>
        {hasRiskFlagged ? (
          <StatusPill status="warning">
            <AlertTriangle className="h-3 w-3" />
            Risk flagged
          </StatusPill>
        ) : (
          <StatusPill status="success">
            <CheckCircle className="h-3 w-3" />
            All clear
          </StatusPill>
        )}
      </div>

      {/* Desktop: horizontal compact timeline */}
      <div className="hidden sm:flex items-start justify-between gap-2">
        {demoSteps.map((step, index) => {
          const status = resolveStepStatus(step, riskResult);
          const isLast = index === demoSteps.length - 1;

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center min-w-0">
              <div className="flex w-full items-center">
                <div className="flex-1 flex justify-end pr-1.5">
                  {!isLast && (
                    <div
                      className={`h-0.5 w-full rounded-full ${
                        status === "completed" ? "bg-emerald-500/30" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    status === "completed"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : status === "blocked"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-slate-700 bg-slate-800 text-slate-600"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : status === "blocked" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </motion.div>

                <div className="flex-1 flex justify-start pl-1.5">
                  {!isLast && (
                    <div
                      className={`h-0.5 w-full rounded-full ${
                        status === "completed" ? "bg-emerald-500/30" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              </div>

              <div className="mt-2 text-center">
                <p className="text-[11px] font-medium text-slate-300 truncate">{step.title}</p>
                <p className="text-[10px] text-slate-600 leading-tight mt-0.5 line-clamp-2">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden space-y-3">
        {demoSteps.map((step, index) => {
          const status = resolveStepStatus(step, riskResult);
          const isLast = index === demoSteps.length - 1;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                    status === "completed"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : status === "blocked"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-slate-700 bg-slate-800 text-slate-600"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : status === "blocked" ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                </div>
                {!isLast && <div className="mt-1 h-4 w-px bg-slate-700" />}
              </div>
              <div className="pb-2">
                <p className="text-xs font-medium text-slate-300">{step.title}</p>
                <p className="text-[10px] text-slate-600">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
