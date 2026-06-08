"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DemoSidebar } from "./demo-sidebar";
import { StatsStrip } from "./stats-strip";
import { StepIntro } from "./steps/step-intro";
import { StepPlan } from "./steps/step-plan";
import { StepRisk } from "./steps/step-risk";
import { StepApproval } from "./steps/step-approval";
import { StepExecution } from "./steps/step-execution";
import { StepAudit } from "./steps/step-audit";
import { GridBackground } from "@/components/ui/aceternity/background";
import type { DemoData } from "@/lib/demo/demo-data";

export type DemoStep = 0 | 1 | 2 | 3 | 4 | 5;

const stepLabels = [
  "Introduction",
  "Payment Plan",
  "Risk Check",
  "Approval",
  "Execution",
  "Audit",
];

interface DemoFlowProps {
  data: DemoData;
}

export function DemoFlow({ data }: DemoFlowProps) {
  const [step, setStep] = useState<DemoStep>(0);
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set([0]));
  const [isRunning, setIsRunning] = useState(false);

  const goToStep = useCallback(
    (target: DemoStep) => {
      if (target <= Math.max(...revealedSteps)) {
        setStep(target);
      }
    },
    [revealedSteps]
  );

  const advance = useCallback(() => {
    setStep((prev) => {
      const next = Math.min(prev + 1, 5) as DemoStep;
      setRevealedSteps((s) => new Set([...s, next]));
      return next;
    });
  }, []);

  const startDemo = useCallback(() => {
    setIsRunning(true);
    advance();
  }, [advance]);

  const approveAndExecute = useCallback(() => {
    advance();
  }, [advance]);

  // Auto-advance logic
  useEffect(() => {
    if (!isRunning) return;

    const delays: Record<number, number> = {
      1: 2000, // Plan → Risk
      2: 1500, // Risk → Approval
      4: 2500, // Execution → Audit
    };

    if (delays[step]) {
      const timer = setTimeout(() => {
        if (step === 4) {
          // Execution to Audit needs manual trigger? No, auto after delay
          advance();
        } else {
          advance();
        }
      }, delays[step]);
      return () => clearTimeout(timer);
    }
  }, [step, isRunning, advance]);

  const stats = [
    { label: "Monthly Budget", value: 50, prefix: "", suffix: " USDC" },
    { label: "Single Limit", value: 25, prefix: "", suffix: " USDC" },
    { label: "Planned", value: data.paymentPlan.totalAmount, prefix: "", suffix: " USDC" },
    {
      label: "Approved",
      value: data.paymentPlan.payments.filter((p) => p.status !== "Blocked").length,
      prefix: "",
      suffix: " items",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] relative flex flex-col">
      <GridBackground />

      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">AgentCFO</h1>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Command Center
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 border border-neutral-800 bg-neutral-900/50 px-2 py-1 rounded-full">
                Step {step + 1} / 6: {stepLabels[step]}
              </span>
              <a href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors hidden sm:inline">
                ← Back
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <StatsStrip stats={stats} className="relative z-10" />

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <DemoSidebar>
          <div className="flex flex-1 flex-col gap-6">
            {/* Step Progress */}
            <StepProgress current={step} revealed={revealedSteps} onStepClick={goToStep} />

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex-1"
              >
                {step === 0 && <StepIntro data={data} onStart={startDemo} />}
                {step === 1 && <StepPlan data={data} />}
                {step === 2 && <StepRisk data={data} />}
                {step === 3 && <StepApproval data={data} onApprove={approveAndExecute} />}
                {step === 4 && <StepExecution data={data} />}
                {step === 5 && <StepAudit data={data} onRestart={() => { setStep(0); setIsRunning(false); setRevealedSteps(new Set([0])); }} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </DemoSidebar>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#030712]/50 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[11px] text-neutral-700">
            AgentCFO · Mock-only demo for hackathon · No real blockchain transactions
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepProgress({
  current,
  revealed,
  onStepClick,
}: {
  current: number;
  revealed: Set<number>;
  onStepClick: (step: DemoStep) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {stepLabels.map((label, idx) => {
        const isRevealed = revealed.has(idx);
        const isActive = current === idx;
        return (
          <button
            key={idx}
            onClick={() => isRevealed && onStepClick(idx as DemoStep)}
            disabled={!isRevealed}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : isRevealed
                ? "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                : "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed"
            }`}
          >
            {idx + 1}. {label}
          </button>
        );
      })}
    </div>
  );
}
