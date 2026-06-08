"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  FileWarning,
  Bot,
  ShieldCheck,
  Wallet,
  ScrollText,
  Wallet2,
  ListChecks,
  Users,
  Ban,
  Coins,
  Repeat,
  Gauge,
} from "lucide-react";

const INTER = "Inter, sans-serif";
const MONO = "'Courier New', Courier, monospace";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-2xl text-center"
    >
      <span
        className="text-xs uppercase tracking-[0.2em] text-white/40"
        style={{ fontFamily: MONO }}
      >
        {eyebrow}
      </span>
      <h2
        className="mt-3 text-white font-normal leading-[1.15]"
        style={{ fontFamily: INTER, fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-4 text-white/50 text-sm md:text-base leading-relaxed"
          style={{ fontFamily: MONO }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* 1. Problem */
function ProblemSection() {
  const pains = [
    {
      icon: <FileWarning className="h-5 w-5" />,
      title: "Manual payouts don't scale",
      body: "DAO contributors grow, spreadsheets break. Reconciling who gets paid what becomes a monthly fire drill.",
    },
    {
      icon: <Ban className="h-5 w-5" />,
      title: "No guardrails on spend",
      body: "Without enforced budget caps and whitelists, a single mistake can drain treasury funds irreversibly.",
    },
    {
      icon: <ScrollText className="h-5 w-5" />,
      title: "Audit is an afterthought",
      body: "Decisions live in chat logs. When someone asks 'why was this paid?', there's no clean trail.",
    },
  ];

  return (
    <section id="problem" className="relative px-5 py-24 lg:px-10">
      <SectionHeading
        eyebrow="The Problem"
        title="DAO treasuries run on trust and spreadsheets"
        subtitle="manual, error-prone, and impossible to audit at scale"
      />
      <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
        {pains.map((p, i) => (
          <motion.div
            key={p.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] text-white/70">
              {p.icon}
            </div>
            <h3 className="mt-4 text-white text-base font-medium" style={{ fontFamily: INTER }}>
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/45" style={{ fontFamily: INTER }}>
              {p.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 2. Workflow */
function WorkflowSection() {
  const steps = [
    { icon: <ListChecks className="h-5 w-5" />, title: "Payment Plan", body: "AI reads contribution records and generates a payout plan with reasons." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Risk Check", body: "Budget, whitelist, limit, token and duplicate checks run automatically." },
    { icon: <Users className="h-5 w-5" />, title: "Human Approval", body: "A human confirms. Blocked items are excluded — no autonomous transfers." },
    { icon: <Wallet className="h-5 w-5" />, title: "CAW Execution", body: "Cobo Agentic Wallet executes approved payouts under policy constraints." },
    { icon: <ScrollText className="h-5 w-5" />, title: "Audit Report", body: "Every decision is recorded into an auditable settlement report." },
  ];

  return (
    <section id="workflow" className="relative px-5 py-24 lg:px-10 bg-white/[0.015]">
      <SectionHeading
        eyebrow="The Workflow"
        title="From records to execution, one controlled loop"
        subtitle="think → check → approve → execute → audit"
      />
      <div className="mx-auto mt-14 max-w-5xl">
        <div className="grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="relative rounded-2xl border border-white/[0.08] bg-black/40 p-5"
            >
              <span
                className="absolute right-4 top-3 text-xs text-white/20"
                style={{ fontFamily: MONO }}
              >
                0{i + 1}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-white/70">
                {s.icon}
              </div>
              <h3 className="mt-4 text-sm font-medium text-white" style={{ fontFamily: INTER }}>
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45" style={{ fontFamily: INTER }}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 3. Risk Guardrails */
function RiskGuardrailsSection() {
  const guards = [
    { icon: <Gauge className="h-5 w-5" />, title: "Budget Cap", body: "Monthly treasury budget is never exceeded." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Whitelist", body: "Only approved recipient wallets can receive funds." },
    { icon: <Coins className="h-5 w-5" />, title: "Single Limit", body: "Per-payment ceiling blocks oversized transfers." },
    { icon: <Wallet2 className="h-5 w-5" />, title: "Token Policy", body: "Only the allowed settlement token is used." },
    { icon: <Repeat className="h-5 w-5" />, title: "Duplicate Guard", body: "Repeated payouts to the same task are flagged." },
  ];

  return (
    <section id="risk-guardrails" className="relative px-5 py-24 lg:px-10">
      <SectionHeading
        eyebrow="Risk Guardrails"
        title="Five checks before a single token moves"
        subtitle="blocked items can never be auto-executed"
      />
      <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {guards.map((g, i) => (
          <motion.div
            key={g.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              {g.icon}
            </div>
            <h3 className="mt-4 text-sm font-medium text-white" style={{ fontFamily: INTER }}>
              {g.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-white/45" style={{ fontFamily: INTER }}>
              {g.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 4. Wallet Execution */
function WalletExecutionSection() {
  const points = [
    "Agent operates inside a Cobo Agentic Wallet permission boundary",
    "No private keys exposed — execution is policy-gated",
    "Testnet-simulated in demo, production-ready integration path",
    "Every transfer ties back to an approved payment item",
  ];

  return (
    <section id="wallet-execution" className="relative px-5 py-24 lg:px-10 bg-white/[0.015]">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: MONO }}>
            Wallet Execution
          </span>
          <h2
            className="mt-3 text-white font-normal leading-[1.15]"
            style={{ fontFamily: INTER, fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
          >
            Funds move only under a controlled wallet
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70">
                  <Wallet className="h-3 w-3" />
                </span>
                <span className="text-sm leading-relaxed text-white/55" style={{ fontFamily: INTER }}>
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 p-6"
        >
          <div className="flex items-center gap-2 text-white/50">
            <Bot className="h-4 w-4" />
            <span className="text-xs" style={{ fontFamily: MONO }}>
              agent-wallet · policy-gated
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2 font-mono text-xs text-white/60" style={{ fontFamily: MONO }}>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>alice.eth</span>
              <span className="text-emerald-400">20 USDC ✓</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>bob.eth</span>
              <span className="text-red-400">blocked ✕</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>charlie.eth</span>
              <span className="text-emerald-400">10 USDC ✓</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>data-api</span>
              <span className="text-emerald-400">5 USDC ✓</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* 5. Audit Trail + final CTA */
function AuditTrailSection() {
  return (
    <section id="audit-trail" className="relative px-5 py-24 lg:px-10">
      <SectionHeading
        eyebrow="Audit Trail"
        title="Every decision, permanently accountable"
        subtitle="approved · blocked · executed — all in one settlement report"
      />

      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto mt-14 flex max-w-2xl flex-col items-center rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center"
      >
        <h3
          className="text-white font-normal"
          style={{ fontFamily: INTER, fontSize: "clamp(1.4rem, 3.5vw, 2rem)" }}
        >
          Give every DAO an AI CFO with a controlled wallet
        </h3>
        <p className="mt-4 text-sm text-white/50" style={{ fontFamily: MONO }}>
          see the full payout flow, end to end
        </p>
        <Link
          href="/demo"
          className="group mt-8 flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:opacity-80"
          style={{ fontFamily: INTER }}
        >
          Open Demo
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      <footer className="mx-auto mt-20 max-w-5xl border-t border-white/[0.06] pt-8 text-center">
        <p className="text-xs text-white/30" style={{ fontFamily: MONO }}>
          AgentCFO · DAO AI Treasury Officer · Cobo Agentic Commerce · Mock demo, no real transactions
        </p>
      </footer>
    </section>
  );
}

export function LandingSections() {
  return (
    <div className="relative w-full bg-black" style={{ fontFamily: INTER }}>
      <ProblemSection />
      <WorkflowSection />
      <RiskGuardrailsSection />
      <WalletExecutionSection />
      <AuditTrailSection />
    </div>
  );
}
