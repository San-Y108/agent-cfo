"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import type { DemoData } from "@/lib/demo/demo-data";
import { CheckCircle, AlertTriangle, ShieldCheck, X } from "lucide-react";

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

  const [acknowledged, setAcknowledged] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const approvedTotal = approved.reduce((sum, p) => sum + p.amount, 0);

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
        {/* Policy acknowledgement */}
        <label className="flex max-w-md cursor-pointer items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-emerald-500"
          />
          <span className="text-neutral-300">
            I confirm that I have reviewed the payment plan and risk check.{" "}
            <strong className="text-white">{blocked.length} blocked</strong>{" "}
            payment(s) will be excluded; only{" "}
            <strong className="text-emerald-400">{approved.length} approved</strong>{" "}
            payment(s) ({approvedTotal} USDC) will be executed.
          </span>
        </label>

        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <ShieldCheck className="h-4 w-4" />
          <span>Execution is performed under Cobo Agentic Wallet policy constraints</span>
        </div>

        <motion.button
          whileHover={acknowledged ? { scale: 1.05 } : {}}
          whileTap={acknowledged ? { scale: 0.95 } : {}}
          onClick={() => acknowledged && setShowConfirm(true)}
          disabled={!acknowledged}
          className={`flex items-center gap-3 rounded-xl px-10 py-4 text-lg font-semibold transition-all duration-200 ${
            acknowledged
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              : "cursor-not-allowed bg-neutral-800 text-neutral-500"
          }`}
        >
          <CheckCircle className="h-5 w-5" />
          Approve &amp; Execute
        </motion.button>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowConfirm(false)}
                className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>

              <h4 className="mt-4 text-lg font-bold text-white">Confirm Execution</h4>
              <p className="mt-2 text-sm text-neutral-400">
                You are about to authorize the Cobo Agentic Wallet to execute{" "}
                <strong className="text-emerald-400">{approved.length} payment(s)</strong>{" "}
                totaling <strong className="text-white">{approvedTotal} USDC</strong>.
                This action is simulated in mock mode.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    onApprove();
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-shadow hover:shadow-emerald-500/40"
                >
                  Confirm &amp; Execute
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
