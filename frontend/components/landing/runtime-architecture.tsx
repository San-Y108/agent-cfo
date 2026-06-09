"use client";

import React from "react";
import { motion } from "framer-motion";
import { GitBranch, FileSpreadsheet, NotebookPen, FileText, Wallet, Hash, FileBarChart, ClipboardList, Cpu, ShieldCheck, UserCheck } from "lucide-react";

const INPUTS = [
  { icon: <GitBranch className="h-4 w-4" />, name: "GitHub Issues" },
  { icon: <FileSpreadsheet className="h-4 w-4" />, name: "CSV records" },
  { icon: <NotebookPen className="h-4 w-4" />, name: "Contribution notes" },
  { icon: <FileText className="h-4 w-4" />, name: "Budget policy" },
];

const OUTPUTS = [
  { icon: <Wallet className="h-4 w-4" />, name: "Cobo Agentic Wallet" },
  { icon: <Hash className="h-4 w-4" />, name: "Testnet tx hash" },
  { icon: <FileBarChart className="h-4 w-4" />, name: "Settlement report" },
  { icon: <ClipboardList className="h-4 w-4" />, name: "Audit log" },
];

const RUNTIME_PARTS = [
  { icon: <Cpu className="h-3.5 w-3.5" />, label: "AI Plan" },
  { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Risk Engine" },
  { icon: <UserCheck className="h-3.5 w-3.5" />, label: "Approval Gate" },
];

const PRINCIPLES = [
  {
    title: "One wallet boundary",
    body: "AI never moves funds outside a configured agent wallet and policy limits.",
  },
  {
    title: "One audit trail",
    body: "Every decision, check, approval, and transfer is logged in a settlement report.",
  },
  {
    title: "One payout policy",
    body: "Budget caps, whitelist, token policy, and duplicate guard apply before execution.",
  },
  {
    title: "One controlled runtime",
    body: "Planning, checking, approval, and execution happen in one visible loop.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function RuntimeArchitecture() {
  return (
    <section className="relative px-5 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff4f00]"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            The runtime
          </span>
          <h2
            className="mt-3 font-medium leading-[1.1] text-white"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(1.85rem, 4.2vw, 2.85rem)",
            }}
          >
            One visible loop. From records to wallet, with policy in between.
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            AI never talks to the wallet directly. Every payment goes through one runtime that
            plans, checks, asks, and executes — and writes a settlement report for every run.
          </p>
        </motion.div>

        {/* Diagram */}
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-14 grid items-stretch gap-4 lg:grid-cols-[1fr,auto,1fr,auto,1fr]"
        >
          {/* Inputs */}
          <ColumnBox title="Contribution inputs" tone="dark" />
          {/* Arrow */}
          <Connector />
          {/* Runtime center */}
          <div className="flex flex-col items-stretch rounded-[14px] border border-[#ff4f00]/30 bg-[#ff4f00]/[0.04] p-5">
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff4f00]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              AgentCFO Runtime
            </div>
            <div
              className="mt-1 text-base font-semibold text-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              plan · check · approve
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {RUNTIME_PARTS.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/85"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                  <span className="text-[#ff4f00]">{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>
            <div
              className="mt-4 rounded-md bg-[#211817] px-3 py-2 text-[10px] text-white/55"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              visible in /demo console
            </div>
          </div>
          {/* Arrow */}
          <Connector />
          {/* Outputs */}
          <ColumnBox title="Wallet & audit outputs" tone="dark" outputs />
        </motion.div>

        {/* Principles grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.title}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
              className="rounded-[12px] border border-white/10 bg-white/[0.02] p-4"
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#ff4f00]"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                0{i + 1}
              </div>
              <h4
                className="mt-2 text-sm font-semibold text-white"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {p.title}
              </h4>
              <p
                className="mt-1.5 text-xs leading-relaxed text-white/55"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  function ColumnBox({
    title,
    tone,
    outputs,
  }: {
    title: string;
    tone: "dark" | "paper";
    outputs?: boolean;
  }) {
    const items = outputs ? OUTPUTS : INPUTS;
    return (
      <div className="flex flex-col items-stretch rounded-[14px] border border-white/10 bg-white/[0.02] p-5">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {title}
        </div>
        <div
          className="mt-1 text-base font-semibold text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {outputs ? "wallet + log" : "records + rules"}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {items.map((it) => (
            <div
              key={it.name}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/85"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <span className="text-white/55">{it.icon}</span>
              {it.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Connector() {
    return (
      <div className="hidden items-center justify-center lg:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#ff4f00]">
          <span style={{ fontFamily: "'Courier New', Courier, monospace" }} className="text-sm">
            →
          </span>
        </div>
      </div>
    );
  }
}
