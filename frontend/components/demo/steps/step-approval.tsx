"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import type { DemoData } from "@/lib/demo/demo-data";
import { CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export function StepApproval({
  data,
  onApprove,
}: {
  data: DemoData;
  onApprove: () => void;
}) {
  const approved = data.paymentPlan.payments.filter(
    (p) => p.status !== "Blocked"
  );
  const blocked = data.paymentPlan.payments.filter(
    (p) => p.status === "Blocked"
  );

  return (
    <div className="flex flex-col gap-6">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-white"
      >
        Human Approval Required
      </motion.h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved Queue */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BentoCard className="border-emerald-500/20 h-full">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <BentoCardTitle>Approved for Execution</BentoCardTitle>
            </div>
            <div className="flex flex-col gap-2">
              {approved.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium text-white">
                      {p.recipient}
                    </div>
                    <div className="text-xs text-neutral-500">{p.task}</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    {p.amount} USDC
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </motion.div>

        {/* Blocked Queue */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BentoCard className="border-red-500/20 h-full">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <BentoCardTitle>Blocked — Cannot Execute</BentoCardTitle>
            </div>
            <div className="flex flex-col gap-2">
              {blocked.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium text-white">
                      {p.recipient}
                    </div>
                    <div className="text-xs text-neutral-500">{p.task}</div>
                  </div>
                  <div className="text-sm font-bold text-red-400">
                    {p.amount} USDC
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <ShieldCheck className="h-4 w-4" />
          <span>
            {approved.length} payments will be executed via Cobo Agentic Wallet
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onApprove}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 transition-shadow hover:shadow-emerald-500/40"
        >
          <CheckCircle className="h-5 w-5" />
          Approve & Execute
        </motion.button>
      </motion.div>
    </div>
  );
}
