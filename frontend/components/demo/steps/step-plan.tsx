"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import type { DemoData } from "@/lib/demo/demo-data";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function StepPlan({ data }: { data: DemoData }) {
  const payments = data.paymentPlan.payments;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col gap-6"
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-white"
      >
        AI Generated Payment Plan
      </motion.h3>

      <motion.div variants={container} initial="hidden" animate="show"
      >
        <BentoGrid>
          {payments.map((p, i) => {
            const isBlocked = p.status === "Blocked";
            return (
              <motion.div key={p.id} variants={item}
              >
                <BentoCard className={isBlocked ? "border-red-500/30" : "border-emerald-500/20"}
                >
                  <div className="flex items-start justify-between"
                  >
                    <div>
                      <BentoCardTitle>{p.recipient}</BentoCardTitle>
                      <BentoCardDescription>{p.task}</BentoCardDescription>
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isBlocked ? "bg-red-500/10" : "bg-emerald-500/10"
                    }`}
                    >
                      {isBlocked ? (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between"
                  >
                    <div className="text-2xl font-bold text-white"
                    >
                      {p.amount} <span className="text-sm font-normal text-neutral-500"
                      >USDC</span>
                    </div>
                    <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isBlocked
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                    >
                      {p.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-neutral-500 truncate"
                  >
                    {p.wallet}
                  </div>
                </BentoCard>
              </motion.div>
            );
          })}
        </BentoGrid>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
      >
        <div className="flex items-center justify-between text-sm"
        >
          <span className="text-neutral-400"
          >Total planned: <strong className="text-white"
          >{data.paymentPlan.totalAmount} USDC</strong></span>
          <span className="text-neutral-400"
          >{payments.filter((p) => p.status !== "Blocked").length} approved, {payments.filter((p) => p.status === "Blocked").length} blocked</span>
        </div>
      </motion.div>
    </div>
  );
}
