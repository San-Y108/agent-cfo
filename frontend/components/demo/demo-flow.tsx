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
import { DemoBackdrop } from "@/components/ui/aceternity/background";
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
        advance();
      }, delays[step]);
      return () => clearTimeout(timer);
    }
  }, [step, isRunning, advance]);

  // KPI stats — compact inline badges
  const approvedCount = data.paymentPlan.payments.filter(
    (p) => p.status !== "Blocked"
  ).length;
  const blockedCount = data.paymentPlan.payments.filter(
    (p) => p.status === "Blocked"
  ).length;

  const stats = [
    {
      label: "Budget",
      value: data.request.budgetRule.monthlyBudget,
      suffix: " USDC",
      tone: "neutral" as const,
    },
    {
      label: "Planned",
      value: data.paymentPlan.totalAmount,
      suffix: " USDC",
      tone: "amber" as const,
    },
    {
      label: "Approved",
      value: approvedCount,
      suffix: " items",
      tone: "emerald" as const,
    },
    {
      label: "Blocked",
      value: blockedCount,
      suffix: " items",
      tone: "red" as const,
    },
    {
      label: "Mode",
      value: 0,
      prefix: "Mock",
      tone: "blue" as const,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030712] flex flex-col">
      <DemoBackdrop />

      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl z-50 flex-shrink-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">AgentCFO</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Command Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex">
              <StatsStrip stats={stats} />
            </div>
            <a href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors hidden sm:inline">
              ← Back
            </a>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="relative z-10 flex flex-1 min-h-0">
        <DemoSidebar activeIndex={step} onNavigate={(idx) => goToStep(idx as DemoStep)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Step Progress */}
          <StepProgress current={step} revealed={revealedSteps} onStepClick={goToStep} />

          {/* KPI badges — shown here on smaller screens (hidden in header < lg) */}
          <div className="mt-4 flex lg:hidden">
            <StatsStrip stats={stats} />
          </div>

          {/* Content */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
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
        </main>
      </div>
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
  const maxRevealed = Math.max(...revealed);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:gap-0">
      {stepLabels.map((label, idx) => {
        const isRevealed = revealed.has(idx);
        const isActive = current === idx;
        const isDone = idx < maxRevealed && !isActive;
        const isLast = idx === stepLabels.length - 1;

        return (
          <React.Fragment key={idx}>
            <button
              onClick={() => isRevealed && onStepClick(idx as DemoStep)}
              disabled={!isRevealed}
              className="group flex flex-shrink-0 items-center gap-2 px-1"
            >
              {/* Circle */}
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "border-amber-500 bg-amber-500/20 text-amber-400 shadow-[0_0_12px_-2px_rgba(245,158,11,0.5)]"
                    : isDone
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : isRevealed
                    ? "border-neutral-600 bg-neutral-800 text-neutral-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-600"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </span>
              {/* Label */}
              <span
                className={`whitespace-nowrap text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-amber-400"
                    : isDone
                    ? "text-neutral-300"
                    : isRevealed
                    ? "text-neutral-400 group-hover:text-neutral-200"
                    : "text-neutral-600"
                }`}
              >
                {label}
              </span>
            </button>

            {/* Connector */}
            {!isLast && (
              <span
                className={`mx-1 hidden h-px w-6 flex-shrink-0 sm:block ${
                  idx < maxRevealed ? "bg-emerald-500/30" : "bg-neutral-800"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
