"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, FileSpreadsheet, NotebookPen, FileText, Wallet, ArrowRight } from "lucide-react";

const TABS = [
  { key: "records", label: "Records" },
  { key: "risk", label: "Risk" },
  { key: "wallet", label: "Wallet" },
  { key: "audit", label: "Audit" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const INPUTS_BY_TAB: Record<TabKey, { icon: React.ReactNode; name: string; meta: string }[]> = {
  records: [
    { icon: <GitBranch className="h-4 w-4" />, name: "GitHub Issues", meta: "PR / issue auto-payouts" },
    { icon: <FileSpreadsheet className="h-4 w-4" />, name: "CSV records", meta: "Drop a monthly contribution sheet" },
    { icon: <NotebookPen className="h-4 w-4" />, name: "Notion database", meta: "Sync contributor rows" },
    { icon: <FileText className="h-4 w-4" />, name: "Manual request", meta: "One-off grant / bounty" },
  ],
  risk: [
    { icon: <FileText className="h-4 w-4" />, name: "Budget cap", meta: "Monthly + per-payment ceilings" },
    { icon: <FileText className="h-4 w-4" />, name: "Whitelist", meta: "Approved recipient addresses" },
    { icon: <FileText className="h-4 w-4" />, name: "Token policy", meta: "USDC only, on supported testnet" },
    { icon: <FileText className="h-4 w-4" />, name: "Duplicate guard", meta: "Block repeated payouts to same task" },
  ],
  wallet: [
    { icon: <Wallet className="h-4 w-4" />, name: "Cobo Agentic Wallet", meta: "Testnet agent boundary" },
    { icon: <Wallet className="h-4 w-4" />, name: "Agent Wallet address", meta: "tx hash + request id returned" },
    { icon: <Wallet className="h-4 w-4" />, name: "Policy constraints", meta: "No private keys exposed" },
    { icon: <Wallet className="h-4 w-4" />, name: "Settlement confirmation", meta: "Mock mode by default" },
  ],
  audit: [
    { icon: <FileText className="h-4 w-4" />, name: "Settlement report", meta: "Every decision in one report" },
    { icon: <FileText className="h-4 w-4" />, name: "Reason for every block", meta: "Why Bob was blocked" },
    { icon: <FileText className="h-4 w-4" />, name: "Risk result per item", meta: "Pass / blocked at item level" },
    { icon: <FileText className="h-4 w-4" />, name: "Approver trail", meta: "Human-in-the-loop evidence" },
  ],
};

export function OperatorStartCard() {
  const [active, setActive] = useState<TabKey>("records");
  const items = INPUTS_BY_TAB[active];

  return (
    <section className="relative px-5 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-10 lg:grid-cols-[280px,1fr]">
          {/* Left: eyebrow + title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff4f00]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              For DAO Operators
            </span>
            <h3
              className="mt-3 font-medium leading-[1.1] text-white"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)",
              }}
            >
              Run payout operations in minutes
            </h3>
            <p
              className="mt-3 text-sm leading-relaxed text-white/55"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              No spreadsheets, no chat approvals, no out-of-band transfers.
              Bring your contributor data — AgentCFO handles the rest.
            </p>
          </motion.div>

          {/* Right: paper card with tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="rounded-[14px] border border-[rgba(33,24,23,0.12)] p-1.5 shadow-2xl"
            style={{ backgroundColor: "#fff8f0" }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-[10px] bg-white/60 p-1">
              {TABS.map((tab) => {
                const isActive = active === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActive(tab.key)}
                    className={`relative flex-1 rounded-[8px] px-3 py-2 text-xs font-semibold transition-colors ${
                      isActive ? "text-white" : "text-[#211817]/60 hover:text-[#211817]"
                    }`}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      backgroundColor: isActive ? "#ff4f00" : "transparent",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Card grid */}
            <div className="mt-2 grid gap-2 p-1 sm:grid-cols-2">
              {items.map((it, i) => (
                <motion.div
                  key={`${active}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="group flex items-center gap-3 rounded-[10px] border border-[rgba(33,24,23,0.08)] bg-white px-3 py-2.5 transition-colors hover:border-[#ff4f00]/40"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#ff4f00]/10 text-[#ff4f00]">
                    {it.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-sm font-medium text-[#211817]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {it.name}
                    </div>
                    <div
                      className="truncate text-[11px] text-[#8a7f76]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {it.meta}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA row inside paper card */}
            <div className="mt-2 flex items-center justify-between rounded-[10px] bg-[#211817] px-4 py-3">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/55"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {active === "records" && "Pipe in once"}
                {active === "risk" && "Edit anytime"}
                {active === "wallet" && "No key custody"}
                {active === "audit" && "Always exported"}
              </span>
              <a
                href="/demo"
                className="flex items-center gap-1.5 text-xs font-semibold text-white"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Try with demo data
                <ArrowRight size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
