"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Wallet, Users, Shield, FileText } from "lucide-react";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import { GradientOrb } from "@/components/ui/aceternity/background";
import { useT } from "@/lib/i18n/context";
import type { DemoData } from "@/lib/demo/demo-data";

export function StepIntro({ data, onStart }: { data: DemoData; onStart: () => void }) {
  const t = useT();
  const contributors = data.request.contributions;
  const budget = data.request.budgetRule;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center py-16 text-center"
      >
        <GradientOrb color="lime" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <h2 className="relative z-10 text-3xl font-bold text-fg md:text-5xl">
          {t("demo.intro.title")}
        </h2>
        <p className="relative z-10 mt-4 max-w-xl text-fg-muted">
          {t("demo.intro.subtitle")}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative z-10 mt-10 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#B5FF4D] to-[#9ef916] px-8 py-4 text-lg font-semibold text-[#0D0D0D] shadow-lg shadow-[#B5FF4D]/20 transition-shadow hover:shadow-[#B5FF4D]/40"
        >
          <Play className="h-5 w-5" />
          {t("demo.intro.generate")}
        </motion.button>
      </motion.div>

      {/* Scene Summary Bento */}
      <BentoGrid>
        <BentoCard tone="lime">
          <Users className="h-6 w-6 text-[#5a9915] mb-3" />
          <BentoCardTitle>{t("demo.intro.contributors")}</BentoCardTitle>
          <BentoCardDescription>
            {contributors.length} {t("demo.intro.contributorsDesc")}
          </BentoCardDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            {contributors.map((c, i) => (
              <span key={i} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-fg-muted border border-border-token">
                {c.name} — {c.amount} {data.request.budgetRule.allowedToken}
              </span>
            ))}
          </div>
        </BentoCard>

        <BentoCard tone="emerald">
          <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
          <BentoCardTitle>{t("demo.intro.budgetRules")}</BentoCardTitle>
          <BentoCardDescription>
            {t("demo.intro.budgetRulesDesc")}
          </BentoCardDescription>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-surface-2 p-3 border border-border-token">
              <div className="text-xs text-fg-subtle">{t("demo.intro.monthlyBudget")}</div>
              <div className="text-lg font-bold text-fg">{budget.monthlyBudget} {budget.allowedToken}</div>
            </div>
            <div className="rounded-lg bg-surface-2 p-3 border border-border-token">
              <div className="text-xs text-fg-subtle">{t("demo.intro.singleLimit")}</div>
              <div className="text-lg font-bold text-fg">{budget.singlePaymentLimit} {budget.allowedToken}</div>
            </div>
          </div>
        </BentoCard>

        <BentoCard tone="blue">
          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-3" />
          <BentoCardTitle>{t("demo.intro.guardrails")}</BentoCardTitle>
          <BentoCardDescription>
            {t("demo.intro.guardrailsDesc")}
          </BentoCardDescription>
          <div className="mt-4 flex flex-col gap-1">
            {[t("demo.intro.guardBudget"), t("demo.intro.guardWhitelist"), t("demo.intro.guardLimit"), t("demo.intro.guardToken"), t("demo.intro.guardDuplicate")].map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs text-fg-muted">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                {r}
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard colSpan={2} tone="purple">
          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-3" />
          <BentoCardTitle>{t("demo.intro.expectedFlow")}</BentoCardTitle>
          <BentoCardDescription>
            {t("demo.intro.expectedFlowDesc")}
          </BentoCardDescription>
          <div className="mt-4 flex items-center gap-2 overflow-x-auto">
            {[
              t("demo.steps.plan"),
              t("demo.steps.risk"),
              t("demo.steps.approval"),
              t("demo.steps.execution"),
              t("demo.steps.audit"),
            ].map((s, i) => (
              <React.Fragment key={s}>
                <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs text-fg-muted border border-border-token whitespace-nowrap">
                  {s}
                </span>
                {i < 4 && <span className="text-fg-subtle">→</span>}
              </React.Fragment>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
