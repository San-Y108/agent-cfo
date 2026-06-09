"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, ShieldCheck, UserCheck, ScrollText, Check, X } from "lucide-react";

const FEATURES = [
  {
    icon: <FileSpreadsheet className="h-5 w-5" />,
    title: "Contribution records become payout plans",
    body: "Drop a CSV, sync GitHub issues, or paste contributor notes. AgentCFO turns them into a structured plan with reasons.",
    visual: <RecordsVisual />,
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "AI CFO checks before funds move",
    body: "Five risk gates run automatically — budget, whitelist, limit, token, duplicate. Blocked items never auto-execute.",
    visual: <RiskChecksVisual />,
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: "Humans approve the final action",
    body: "A real person confirms the queue. Blocked items are excluded. No autonomous transfers, ever.",
    visual: <ApprovalVisual />,
  },
  {
    icon: <ScrollText className="h-5 w-5" />,
    title: "Every transfer has an audit trail",
    body: "tx hash, recipient, reason, risk result, approver — one settlement report per run, exportable.",
    visual: <AuditVisual />,
  },
] as const;

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function SystemFeatureGrid() {
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
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5FF4D]"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            The system
          </span>
          <h2
            className="mt-3 font-medium leading-[1.1] text-white"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(1.85rem, 4.2vw, 2.85rem)",
            }}
          >
            Every DAO has contributors. Now they need a payout system.
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Spreadsheets, chat approvals, and wallet transfers work alone. The risk starts when they don&apos;t
            work together — safely, visibly, and auditable.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-[14px] border border-white/[0.08]"
              style={{ backgroundColor: "#141414" }}
            >
              {/* Visual cover area */}
              <div className="relative h-44 overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-[#141414] to-[#0d0d0d]">
                {f.visual}
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#B5FF4D]/10 text-[#B5FF4D]">
                    {f.icon}
                  </div>
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40"
                    style={{ fontFamily: "'Courier New', Courier, monospace" }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <h3
                  className="mt-3 text-lg font-medium text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {f.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-white/50"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {f.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Per-card visual mocks --- */

function RecordsVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 p-6">
      <div className="flex flex-col gap-1.5 rounded-md border border-white/[0.08] bg-[#1a1a1a] px-3 py-2 text-[10px] text-white shadow-sm" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        <div className="font-semibold">contributions.csv</div>
        <div className="text-white/40">alice, 20</div>
        <div className="text-white/40">bob, 15</div>
        <div className="text-white/40">charlie, 10</div>
      </div>
      <div className="text-[#B5FF4D]">→</div>
      <div className="flex flex-col gap-1.5 rounded-md bg-[#0D0D0D] px-3 py-2 text-[10px] text-white shadow-md" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        <div className="font-semibold text-[#B5FF4D]">payment plan</div>
        <div>3 approved</div>
        <div>1 blocked</div>
      </div>
    </div>
  );
}

function RiskChecksVisual() {
  const checks = [
    { name: "Budget cap", pass: true },
    { name: "Whitelist", pass: true },
    { name: "Single limit", pass: true },
    { name: "Token policy", pass: true },
    { name: "Duplicate guard", pass: false },
  ];
  return (
    <div className="absolute inset-0 flex flex-col items-stretch justify-center gap-1.5 p-6">
      {checks.map((c) => (
        <div
          key={c.name}
          className="flex items-center justify-between rounded-md border border-white/[0.06] bg-[#1a1a1a] px-3 py-1.5 text-[10px]"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          <span className="text-white">{c.name}</span>
          <span className={c.pass ? "text-emerald-400" : "text-red-400"}>
            {c.pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          </span>
        </div>
      ))}
    </div>
  );
}

function ApprovalVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2 p-6">
      <div className="flex flex-col gap-1.5 rounded-md border border-white/[0.06] bg-[#1a1a1a] px-3 py-2 text-[10px] shadow-sm" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        <div className="font-semibold text-emerald-400">3 approved</div>
        <div className="text-white/40">alice, charlie, data-api</div>
      </div>
      <div className="flex flex-col gap-1.5 rounded-md border border-white/[0.06] bg-[#B5FF4D]/5 px-3 py-2 text-[10px] shadow-sm" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        <div className="font-semibold text-[#B5FF4D]">1 blocked</div>
        <div className="text-white/40">bob — not whitelisted</div>
      </div>
    </div>
  );
}

function AuditVisual() {
  return (
    <div className="absolute inset-0 flex flex-col items-stretch justify-center gap-1.5 p-6 text-[10px]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <div className="rounded-md border border-white/[0.06] bg-[#1a1a1a] px-3 py-1.5 text-white">
        <span className="text-white/40">tx</span> 0xae3f...2c91
      </div>
      <div className="rounded-md border border-white/[0.06] bg-[#1a1a1a] px-3 py-1.5 text-white">
        <span className="text-white/40">risk</span> 4 pass · 1 block
      </div>
      <div className="rounded-md border border-white/[0.06] bg-[#1a1a1a] px-3 py-1.5 text-white">
        <span className="text-white/40">approver</span> human
      </div>
    </div>
  );
}
