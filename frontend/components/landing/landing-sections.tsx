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
import { useT } from "@/lib/i18n/context";
import type { DictKey } from "@/lib/i18n/dict";

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
      className="mx-auto max-w-3xl text-center"
    >
      <span
        className="text-xs uppercase tracking-[0.2em] text-fg-subtle"
        style={{ fontFamily: MONO }}
      >
        {eyebrow}
      </span>
      <h2
        className="mt-3 text-fg font-normal leading-[1.15]"
        style={{ fontFamily: INTER, fontSize: "clamp(1.75rem, 4.5vw, 2.6rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-4 text-fg-muted text-sm md:text-base leading-relaxed"
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
  const t = useT();
  const pains: { icon: React.ReactNode; title: DictKey; body: DictKey }[] = [
    { icon: <FileWarning className="h-5 w-5" />, title: "problem.1.title", body: "problem.1.body" },
    { icon: <Ban className="h-5 w-5" />, title: "problem.2.title", body: "problem.2.body" },
    { icon: <ScrollText className="h-5 w-5" />, title: "problem.3.title", body: "problem.3.body" },
  ];

  return (
    <section id="problem" className="relative px-5 py-28 lg:px-10">
      <SectionHeading eyebrow={t("problem.eyebrow")} title={t("problem.title")} subtitle={t("problem.subtitle")} />
      <div className="mx-auto mt-16 grid max-w-6xl gap-5 md:grid-cols-3">
        {pains.map((p, i) => (
          <motion.div
            key={p.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            className="rounded-2xl border border-white/10 bg-black p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-accent">
              {p.icon}
            </div>
            <h3 className="mt-4 text-fg text-lg font-medium" style={{ fontFamily: INTER }}>
              {t(p.title)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted" style={{ fontFamily: INTER }}>
              {t(p.body)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 2. Workflow */
function WorkflowSection() {
  const t = useT();
  const steps: { icon: React.ReactNode; title: DictKey; body: DictKey }[] = [
    { icon: <ListChecks className="h-5 w-5" />, title: "workflow.1.title", body: "workflow.1.body" },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "workflow.2.title", body: "workflow.2.body" },
    { icon: <Users className="h-5 w-5" />, title: "workflow.3.title", body: "workflow.3.body" },
    { icon: <Wallet className="h-5 w-5" />, title: "workflow.4.title", body: "workflow.4.body" },
    { icon: <ScrollText className="h-5 w-5" />, title: "workflow.5.title", body: "workflow.5.body" },
  ];

  return (
    <section id="workflow" className="relative px-5 py-28 lg:px-10">
      <SectionHeading eyebrow={t("workflow.eyebrow")} title={t("workflow.title")} subtitle={t("workflow.subtitle")} />
      <div className="mx-auto mt-16 max-w-6xl">
        <div className="grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="relative rounded-2xl border border-white/10 bg-black p-6"
            >
              <span className="absolute right-4 top-3 text-xs text-fg-subtle" style={{ fontFamily: MONO }}>
                0{i + 1}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-accent">
                {s.icon}
              </div>
              <h3 className="mt-4 text-base font-medium text-fg" style={{ fontFamily: INTER }}>
                {t(s.title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted" style={{ fontFamily: INTER }}>
                {t(s.body)}
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
  const t = useT();
  const guards: { icon: React.ReactNode; title: DictKey; body: DictKey }[] = [
    { icon: <Gauge className="h-5 w-5" />, title: "risk.1.title", body: "risk.1.body" },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "risk.2.title", body: "risk.2.body" },
    { icon: <Coins className="h-5 w-5" />, title: "risk.3.title", body: "risk.3.body" },
    { icon: <Wallet2 className="h-5 w-5" />, title: "risk.4.title", body: "risk.4.body" },
    { icon: <Repeat className="h-5 w-5" />, title: "risk.5.title", body: "risk.5.body" },
  ];

  return (
    <section id="risk-guardrails" className="relative px-5 py-28 lg:px-10">
      <SectionHeading eyebrow={t("risk.eyebrow")} title={t("risk.title")} subtitle={t("risk.subtitle")} />
      <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {guards.map((g, i) => (
          <motion.div
            key={g.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="rounded-2xl border border-white/10 bg-black p-6 text-center"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-success">
              {g.icon}
            </div>
            <h3 className="mt-4 text-base font-medium text-fg" style={{ fontFamily: INTER }}>
              {t(g.title)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted" style={{ fontFamily: INTER }}>
              {t(g.body)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 4. Wallet Execution */
function WalletExecutionSection() {
  const t = useT();
  const points: DictKey[] = ["wallet.1", "wallet.2", "wallet.3", "wallet.4"];

  return (
    <section id="wallet-execution" className="relative px-5 py-28 lg:px-10">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-fg-subtle" style={{ fontFamily: MONO }}>
            {t("wallet.eyebrow")}
          </span>
          <h2
            className="mt-3 text-fg font-normal leading-[1.15]"
            style={{ fontFamily: INTER, fontSize: "clamp(1.75rem, 4.5vw, 2.6rem)" }}
          >
            {t("wallet.title")}
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-accent">
                  <Wallet className="h-3 w-3" />
                </span>
                <span className="text-sm leading-relaxed text-fg-muted" style={{ fontFamily: INTER }}>
                  {t(p)}
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
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-6"
        >
          <div className="flex items-center gap-2 text-fg-muted">
            <Bot className="h-4 w-4" />
            <span className="text-xs" style={{ fontFamily: MONO }}>
              {t("wallet.mockLabel")}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-xs" style={{ fontFamily: MONO }}>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-fg-muted">
              <span>alice.eth</span>
              <span className="text-success">20 USDC ✓</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-fg-muted">
              <span>bob.eth</span>
              <span className="text-danger">{t("wallet.blocked")} ✕</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-fg-muted">
              <span>charlie.eth</span>
              <span className="text-success">10 USDC ✓</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-fg-muted">
              <span>data-api</span>
              <span className="text-success">5 USDC ✓</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* 5. Audit Trail + final CTA */
function AuditTrailSection() {
  const t = useT();
  return (
    <section id="audit-trail" className="relative px-5 py-28 lg:px-10">
      <SectionHeading eyebrow={t("audit.eyebrow")} title={t("audit.title")} subtitle={t("audit.subtitle")} />

      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto mt-16 flex max-w-2xl flex-col items-center rounded-3xl border border-white/10 bg-black px-6 py-14 text-center"
      >
        <h3 className="text-fg font-normal" style={{ fontFamily: INTER, fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)" }}>
          {t("audit.cta.title")}
        </h3>
        <p className="mt-4 text-sm text-fg-muted" style={{ fontFamily: MONO }}>
          {t("audit.cta.sub")}
        </p>
        <Link
          href="/demo"
          className="group mt-8 flex items-center gap-2.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-all duration-300 hover:opacity-85"
          style={{ fontFamily: INTER }}
        >
          {t("audit.cta.button")}
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      <footer className="mx-auto mt-20 max-w-6xl border-t border-white/10 pt-8 text-center">
        <p className="text-xs text-fg-subtle" style={{ fontFamily: MONO }}>
          {t("footer.tagline")}
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
