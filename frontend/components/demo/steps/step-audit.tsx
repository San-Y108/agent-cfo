"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import type { DemoData } from "@/lib/demo/demo-data";
import { FileText, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react";

export function StepAudit({
  data,
  onRestart,
}: {
  data: DemoData;
  onRestart: () => void;
}) {
  const report = data.auditReport;
  const approvedCount = report.paymentPlan.payments.filter((p) => p.status !== "Blocked").length;
  const blockedCount = report.paymentPlan.payments.filter((p) => p.status === "Blocked").length;

  return (
    <div className="flex flex-col gap-6">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-white"
      >
        Audit Report
      </motion.h3>

      <BentoGrid>
        <BentoCard>
          <FileText className="h-5 w-5 text-blue-400 mb-2" />
          <BentoCardTitle>Report ID</BentoCardTitle>
          <BentoCardDescription className="font-mono text-xs">
            {report.auditReportId}
          </BentoCardDescription>
        </BentoCard>

        <BentoCard>
          <CheckCircle className="h-5 w-5 text-emerald-400 mb-2" />
          <BentoCardTitle>Approved</BentoCardTitle>
          <BentoCardDescription>
            {approvedCount} payments executed
          </BentoCardDescription>
        </BentoCard>

        <BentoCard>
          <AlertTriangle className="h-5 w-5 text-red-400 mb-2" />
          <BentoCardTitle>Blocked</BentoCardTitle>
          <BentoCardDescription>
            {blockedCount} payments rejected
          </BentoCardDescription>
        </BentoCard>

        <BentoCard colSpan={2}>
          <BentoCardTitle>Execution Summary</BentoCardTitle>
          <BentoCardDescription>
            Mode: {report.execution.mode} · Remaining Budget: {report.remainingBudget} {report.paymentPlan.payments[0]?.token ?? "USDC"}
          </BentoCardDescription>
          <div className="mt-3 text-sm text-neutral-300">
            Agent Wallet: {report.execution.agentWalletAddress}
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
          className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700">
          <RotateCcw className="h-4 w-4" />
          Run Again
        </motion.button>
      </motion.div>
    </div>
  );
}
