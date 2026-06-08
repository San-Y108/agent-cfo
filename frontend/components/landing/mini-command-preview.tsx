"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Shield, Wallet, FileCheck, AlertTriangle } from "lucide-react";

export function MiniCommandPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-md"
    >
      {/* Glow behind */}
      <div className="absolute -inset-4 rounded-3xl bg-amber-500/5 blur-2xl" />

      <GlassPanel className="p-4">
        {/* Mini header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <Wallet className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-300">AgentCFO</span>
          </div>
          <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Simulated
          </span>
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Planned</p>
            <p className="text-sm font-bold text-slate-200 font-mono-numbers">50 USDC</p>
          </div>
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2 text-center">
            <p className="text-[10px] text-emerald-500/70 uppercase tracking-wider">Approved</p>
            <p className="text-sm font-bold text-emerald-400 font-mono-numbers">3</p>
          </div>
          <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-2 text-center">
            <p className="text-[10px] text-red-500/70 uppercase tracking-wider">Blocked</p>
            <p className="text-sm font-bold text-red-400 font-mono-numbers">1</p>
          </div>
        </div>

        {/* Mini Payment List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-2 border-l-2 border-l-emerald-500/50">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] text-slate-300">Alice</span>
            </div>
            <span className="text-[11px] font-mono-numbers text-emerald-400">20 USDC</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-2 border-l-2 border-l-red-500/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <span className="text-[11px] text-slate-300">Bob</span>
            </div>
            <span className="text-[11px] font-mono-numbers text-red-400">15 USDC</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-2 border-l-2 border-l-emerald-500/50">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] text-slate-300">Charlie</span>
            </div>
            <span className="text-[11px] font-mono-numbers text-emerald-400">10 USDC</span>
          </div>
        </div>

        {/* Mini workflow */}
        <div className="mt-4 flex items-center gap-1.5">
          {["Plan", "Risk", "Approve", "Execute", "Audit"].map((step, i) => (
            <div key={step} className="flex-1 flex items-center gap-1">
              <div className={`
                h-1.5 flex-1 rounded-full
                ${i < 4 ? "bg-emerald-500/40" : i === 4 ? "bg-amber-500/40" : "bg-slate-700"}
              `} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-600">Workflow: Risk flagged · 1 check failed</p>
      </GlassPanel>
    </motion.div>
  );
}
