"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import type { DemoData } from "@/lib/demo/demo-data";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export function StepRisk({ data }: { data: DemoData }) {
  const payments = data.riskResult.payments;
  const blockedPayments = payments.filter((p) => p.status === "Blocked");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-white"
      >
        Risk Check Results
      </motion.h3>

      {/* Payment-level Risk Items */}
      <motion.div variants={container} initial="hidden" animate="show">
        <BentoGrid>
          {payments.map((payment, i) => {
            const isBlocked = payment.status === "Blocked";
            const hasRisks = payment.risks.length > 0;
            return (
              <motion.div key={payment.id} variants={item}>
                <BentoCard
                  className={
                    isBlocked
                      ? "border-red-500/40 bg-red-500/5"
                      : hasRisks
                      ? "border-amber-500/30"
                      : "border-emerald-500/20"
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isBlocked
                          ? "bg-red-500/10"
                          : hasRisks
                          ? "bg-amber-500/10"
                          : "bg-emerald-500/10"
                      }`}
                    >
                      {isBlocked ? (
                        <XCircle className="h-5 w-5 text-red-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <BentoCardTitle>{payment.recipient}</BentoCardTitle>
                      <BentoCardDescription>{payment.task}</BentoCardDescription>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {payment.risks.map((risk, ri) => (
                      <span
                        key={ri}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isBlocked
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {risk}
                      </span>
                    ))}
                    {payment.risks.length === 0 && (
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        All Clear
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm font-bold text-white">
                    {payment.amount} {payment.token}
                  </div>
                </BentoCard>
              </motion.div>
            );
          })}
        </BentoGrid>
      </motion.div>

      {/* Bob Drama */}
      {blockedPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </motion.div>
            <h4 className="text-lg font-bold text-red-400">
              Payment Blocked
            </h4>
          </div>
          <p className="text-sm text-neutral-300">
            {blockedPayments.map((p) => p.recipient).join(", ")} was
            blocked due to risk check failures. These payments require
            manual review and cannot be auto-approved.
          </p>
        </motion.div>
      )}
    </div>
  );
}
