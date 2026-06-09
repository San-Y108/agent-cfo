"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ListChecks, ShieldCheck, UserCheck, Wallet, ScrollText, Check, X } from "lucide-react";

type TabKey = "plan" | "risk" | "approval" | "wallet" | "audit";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "plan", label: "Payment Plan", icon: <ListChecks className="h-3.5 w-3.5" /> },
  { key: "risk", label: "Risk Checks", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { key: "approval", label: "Approval", icon: <UserCheck className="h-3.5 w-3.5" /> },
  { key: "wallet", label: "Wallet Execution", icon: <Wallet className="h-3.5 w-3.5" /> },
  { key: "audit", label: "Audit Report", icon: <ScrollText className="h-3.5 w-3.5" /> },
];

export function ToolkitShowcase() {
  const [active, setActive] = useState<TabKey>("plan");

  return (
    <section className="relative px-5 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5FF4D]"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            The toolkit
          </span>
          <h2
            className="mt-3 font-medium leading-[1.1] text-white"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(1.85rem, 4.2vw, 2.85rem)",
            }}
          >
            Your complete AI payout toolkit
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Records, risk checks, approval, wallet execution, and audit reports — five surfaces, one runtime.
          </p>
        </motion.div>

        {/* Tabs row */}
        <div className="mt-10 overflow-x-auto">
          <div className="mx-auto flex w-max min-w-full items-center gap-1 rounded-[12px] border border-white/10 bg-white/[0.02] p-1">
            {TABS.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#B5FF4D] text-[#0D0D0D]"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product frame */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative mt-6 overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#0a0a0a] px-4 py-2.5">
            <div className="flex h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="flex h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="flex h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="ml-3 flex-1 truncate rounded-md bg-white/5 px-2.5 py-0.5 text-[10px] text-white/40" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
              agentcfo-frontend.vercel.app/demo · {active}
            </div>
          </div>

          {/* Content area — renders the active tab mock */}
          <div className="p-6 md:p-8">
            <MockByTab tab={active} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MockByTab({ tab }: { tab: TabKey }) {
  if (tab === "plan") return <PlanMock />;
  if (tab === "risk") return <RiskMock />;
  if (tab === "approval") return <ApprovalMock />;
  if (tab === "wallet") return <WalletMock />;
  return <AuditMock />;
}

function PlanMock() {
  const rows = [
    { name: "alice.eth", task: "Wrote event recap", amount: "20 USDC", state: "Approved" },
    { name: "bob.eth", task: "Designed poster", amount: "15 USDC", state: "Blocked" },
    { name: "charlie.eth", task: "Hosted community AMA", amount: "10 USDC", state: "Approved" },
    { name: "data-api", task: "Subscription · 2026-06", amount: "5 USDC", state: "Approved" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <HeaderRow>AI generated payment plan</HeaderRow>
      <div className="overflow-hidden rounded-[10px] border border-white/10">
        {rows.map((r, i) => (
          <div
            key={r.name}
            className={`flex items-center justify-between px-4 py-2.5 text-xs ${
              i !== rows.length - 1 ? "border-b border-white/5" : ""
            }`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-white/85">{r.name}</span>
              <span className="text-white/40">— {r.task}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/85">{r.amount}</span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                  r.state === "Approved"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {r.state}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskMock() {
  const rows = [
    { name: "Budget cap", state: "Pass" },
    { name: "Whitelist", state: "Pass" },
    { name: "Single limit", state: "Pass" },
    { name: "Token policy", state: "Pass" },
    { name: "Duplicate guard", state: "Block" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <HeaderRow>5 risk checks · 4 pass · 1 block</HeaderRow>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <span className="text-white/85">{r.name}</span>
            <span
              className={`flex items-center gap-1 ${
                r.state === "Pass" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {r.state === "Pass" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {r.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalMock() {
  return (
    <div className="flex flex-col gap-3">
      <HeaderRow>Human approval · awaiting confirmation</HeaderRow>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-400" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            Approved queue
          </div>
          <div className="mt-2 text-xs text-white/85" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            3 payments · 35 USDC total
          </div>
        </div>
        <div className="rounded-md border border-red-500/20 bg-red-500/[0.04] p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-red-400" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            Blocked queue
          </div>
          <div className="mt-2 text-xs text-white/85" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            1 payment · bob.eth — not whitelisted
          </div>
        </div>
      </div>
      <button
        className="self-start rounded-md bg-[#B5FF4D] px-4 py-2 text-xs font-semibold text-[#0D0D0D]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Approve &amp; Execute
      </button>
    </div>
  );
}

function WalletMock() {
  const txs = [
    { id: "0xae3f...2c91", recipient: "alice.eth", amount: "20 USDC" },
    { id: "0x8b21...4ee0", recipient: "charlie.eth", amount: "10 USDC" },
    { id: "0x4c7d...91b3", recipient: "data-api", amount: "5 USDC" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <HeaderRow>Cobo Agentic Wallet · testnet-simulated</HeaderRow>
      <div className="overflow-hidden rounded-[10px] border border-white/10">
        {txs.map((t, i) => (
          <div
            key={t.id}
            className={`flex items-center justify-between px-4 py-2.5 text-xs ${
              i !== txs.length - 1 ? "border-b border-white/5" : ""
            }`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <span className="text-white/40">tx</span>
            <span className="flex-1 truncate px-2 text-white/85">{t.id}</span>
            <span className="text-white/60">{t.recipient}</span>
            <span className="ml-3 text-emerald-400">{t.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditMock() {
  return (
    <div className="flex flex-col gap-3">
      <HeaderRow>Settlement report · audit-2026-06-08</HeaderRow>
      <div className="grid gap-2 sm:grid-cols-2">
        <KV k="Approved" v="3 payments · 35 USDC" tone="emerald" />
        <KV k="Blocked" v="1 payment · bob.eth" tone="red" />
        <KV k="Risk result" v="4 pass · 1 block" />
        <KV k="Approver" v="human confirmed" />
      </div>
    </div>
  );
}

function HeaderRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45"
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      {children}
    </div>
  );
}

function KV({ k, v, tone }: { k: string; v: string; tone?: "emerald" | "red" }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
      <span className="text-white/55" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        {k}
      </span>
      <span
        className={`font-medium ${
          tone === "emerald"
            ? "text-emerald-400"
            : tone === "red"
              ? "text-red-400"
              : "text-white"
        }`}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {v}
      </span>
    </div>
  );
}
