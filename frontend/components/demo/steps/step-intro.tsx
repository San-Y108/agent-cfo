"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Wallet, Users, Shield, FileText } from "lucide-react";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import { GradientOrb } from "@/components/ui/aceternity/background";
import type { DemoData } from "@/lib/demo/demo-data";

export function StepIntro({ data, onStart }: { data: DemoData; onStart: () => void }) {
  const contributors = data.request.contributions;
  const budget = data.request.budgetRule;

  return (
    <div className="flex flex-col gap-8"
    >
      {/* Hero CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center py-16 text-center"
      >
        <GradientOrb color="amber" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <h2 className="relative z-10 text-3xl font-bold text-white md:text-5xl"
        >
          AI Treasury Agent
        </h2>
        <p className="relative z-10 mt-4 max-w-xl text-neutral-400"
        >
          Watch AgentCFO analyze contribution records, generate a payment plan,
          check risks, and execute payouts — all under human approval.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative z-10 mt-10 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-amber-500/20 transition-shadow hover:shadow-amber-500/40"
        >
          <Play className="h-5 w-5" />
          Generate Plan
        </motion.button>
      </motion.div>

      {/* Scene Summary Bento */}
      <BentoGrid>
        <BentoCard>
          <Users className="h-6 w-6 text-amber-400 mb-3" />
          <BentoCardTitle>Contributors</BentoCardTitle>
          <BentoCardDescription>
            {contributors.length} contributors with verified records
          </BentoCardDescription>
          <div className="mt-4 flex flex-wrap gap-2"
          >
            {contributors.map((c, i) => (
              <span key={i} className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300 border border-neutral-700"
              >
                {c.name} — {c.amount} USDC
              </span>
            ))}
          </div>
        </BentoCard>

        <BentoCard>
          <Wallet className="h-6 w-6 text-emerald-400 mb-3" />
          <BentoCardTitle>Budget Rules</BentoCardTitle>
          <BentoCardDescription>
            Monthly cap and single-payment limit enforced
          </BentoCardDescription>
          <div className="mt-4 grid grid-cols-2 gap-2"
          >
            <div className="rounded-lg bg-neutral-800 p-3 border border-neutral-700"
            >
              <div className="text-xs text-neutral-500"
              >Monthly Budget</div>
              <div className="text-lg font-bold text-white"
              >{budget.monthlyBudget} USDC</div>
            </div>
            <div className="rounded-lg bg-neutral-800 p-3 border border-neutral-700"
            >
              <div className="text-xs text-neutral-500"
              >Single Limit</div>
              <div className="text-lg font-bold text-white"
              >{budget.singlePaymentLimit} USDC</div>
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <Shield className="h-6 w-6 text-blue-400 mb-3" />
          <BentoCardTitle>Risk Guardrails</BentoCardTitle>
          <BentoCardDescription>
            5-layer risk check before any execution
          </BentoCardDescription>
          <div className="mt-4 flex flex-col gap-1"
          >
            {["Budget", "Whitelist", "Limit", "Token", "Duplicate"].map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs text-neutral-400"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {r}
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard colSpan={2}>
          <FileText className="h-6 w-6 text-purple-400 mb-3" />
          <BentoCardTitle>Expected Flow</BentoCardTitle>
          <BentoCardDescription>
            AI generates plan → Risk check → Human approval → CAW execution → Audit report
          </BentoCardDescription>
          <div className="mt-4 flex items-center gap-2 overflow-x-auto"
          >
            {["Plan", "Risk", "Approve", "Execute", "Audit"].map((s, i) => (
              <React.Fragment key={s}>
                <span className="rounded-full bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 border border-neutral-700 whitespace-nowrap"
                >
                  {s}
                </span>
                {i < 4 && <span className="text-neutral-600"
                >→</span>}
              </React.Fragment>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
