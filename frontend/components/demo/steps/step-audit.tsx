"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import { useT } from "@/lib/i18n/context";
import type { DemoData } from "@/lib/demo/demo-data";
import { FileText, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react";

export function StepAudit({
  data,
  onRestart,
}: {
  data: DemoData;
  onRestart: () => void;
}) {
  const t = useT();
  const report = data.auditReport;
  const approvedCount = report.paymentPlan.payments.filter((p) => p.status !== "Blocked").length;
  const blockedCount = report.paymentPlan.payments.filter((p) => p.status === "Blocked").length;

  return (
    <div className="flex flex-col gap-6">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-fg"
      >
        {t("demo.audit.title")}
      </motion.h3>

      <BentoGrid>
        <BentoCard tone="blue">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
          <BentoCardTitle>{t("demo.audit.reportId")}</BentoCardTitle>
          <BentoCardDescription className="font-mono text-xs">
            {report.auditReportId}
          </BentoCardDescription>
        </BentoCard>

        <BentoCard tone="emerald">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-2" />
          <BentoCardTitle>{t("demo.audit.approved")}</BentoCardTitle>
          <BentoCardDescription>
            {approvedCount} {t("demo.audit.approvedDesc")}
          </BentoCardDescription>
        </BentoCard>

        <BentoCard tone="red">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mb-2" />
          <BentoCardTitle>{t("demo.audit.blocked")}</BentoCardTitle>
          <BentoCardDescription>
            {blockedCount} {t("demo.audit.blockedDesc")}
          </BentoCardDescription>
        </BentoCard>

        <BentoCard colSpan={2}>
          <BentoCardTitle>{t("demo.audit.execSummary")}</BentoCardTitle>
          <BentoCardDescription>
            {t("demo.exec.mode")}: {report.execution.mode} · {t("demo.audit.remainingBudget")}: {report.remainingBudget} {report.paymentPlan.payments[0]?.token ?? "USDC"}
          </BentoCardDescription>
          <div className="mt-3 text-sm text-fg-muted">
            {t("demo.exec.agentWallet")}: {report.execution.agentWalletAddress}
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Restart CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center py-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="flex items-center gap-2 rounded-xl border border-border-token bg-surface-2 px-6 py-3 text-sm font-medium text-fg transition-colors hover:bg-surface-hover">
          <RotateCcw className="h-4 w-4" />
          {t("demo.audit.runAgain")}
        </motion.button>
      </motion.div>
    </div>
  );
}
