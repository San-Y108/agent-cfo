"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoCard, BentoCardTitle, BentoCardDescription } from "@/components/demo/bento-grid";
import { GradientOrb } from "@/components/ui/aceternity/background";
import { Sparkles } from "@/components/ui/aceternity/sparkles";
import type { DemoData } from "@/lib/demo/demo-data";
import { Zap, Wallet, Network, FileCheck } from "lucide-react";

export function StepExecution({ data }: { data: DemoData }) {
  const exec = data.execution;
  const firstPayment = exec.payments[0];
  const executedCount = exec.payments.filter((p) => p.status === "Executed").length;

  return (
    <div className="flex flex-col gap-6">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold text-white"
      >
        Executing via Cobo Agentic Wallet
      </motion.h3>

      {/* Execution Animation */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8">
        <GradientOrb color="blue" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
        {/* Beam effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              style={{ top: `${12 + i * 12}%` }}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2 + i * 0.4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.25,
              }}
            />
          ))}
        </div>
        {/* Sparkle particles */}
        <Sparkles count={20} color="bg-blue-300" />

        <div className="relative z-10 flex flex-col items-center gap-4 py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="h-12 w-12 text-blue-400" />
          </motion.div>
          <p className="text-lg font-semibold text-white">
            Processing Transactions...
          </p>
          <p className="text-sm text-neutral-400">
            Simulated execution on {firstPayment?.network ?? "mock-testnet"}
          </p>
        </div>
      </div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <BentoCard>
          <Wallet className="h-5 w-5 text-blue-400 mb-2" />
          <BentoCardTitle>Agent Wallet</BentoCardTitle>
          <BentoCardDescription>
            {exec.agentWalletAddress}
          </BentoCardDescription>
        </BentoCard>

        <BentoCard>
          <Network className="h-5 w-5 text-purple-400 mb-2" />
          <BentoCardTitle>Network</BentoCardTitle>
          <BentoCardDescription>
            {firstPayment?.network ?? "mock-testnet"}
          </BentoCardDescription>
        </BentoCard>

        <BentoCard>
          <FileCheck className="h-5 w-5 text-emerald-400 mb-2" />
          <BentoCardTitle>Status</BentoCardTitle>
          <BentoCardDescription>
            {executedCount} / {exec.payments.length} transactions executed
          </BentoCardDescription>
        </BentoCard>

        <BentoCard>
          <Zap className="h-5 w-5 text-amber-400 mb-2" />
          <BentoCardTitle>Request ID</BentoCardTitle>
          <BentoCardDescription className="font-mono text-xs">
            {firstPayment?.cawRequestId ?? "mock-req-id"}
          </BentoCardDescription>
        </BentoCard>
      </motion.div>
    </div>
  );
}
