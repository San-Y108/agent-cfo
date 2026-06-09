"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  FileSpreadsheet,
  GitBranch,
  NotebookPen,
  UserCheck,
  Wallet,
  ScrollText,
  Check,
  X,
  ArrowRight,
  Sparkles,
  FileDown,
  Hash,
} from "lucide-react";

/* =============================================================================
 * STAGE DATA
 * ===========================================================================*/

type StageKey = "records" | "risk" | "approval" | "wallet" | "audit";

type Stage = {
  no: string;
  key: StageKey;
  title: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
};

const STAGES: Stage[] = [
  {
    no: "01",
    key: "records",
    title: "Records",
    accent: "#5EEAD4",
    accentSoft: "rgba(94,234,212,0.08)",
    accentBorder: "rgba(94,234,212,0.28)",
    eyebrow: "Stage 01 · Records",
    headline: (
      <>
        Contribution records become<br />
        <span style={{ color: "#5EEAD4" }}>payout plans</span>.
      </>
    ),
    body: "Drop a CSV, sync GitHub issues, or paste Notion contributor rows. AgentCFO turns raw signals into a structured payment plan — every line tagged with a reason.",
  },
  {
    no: "02",
    key: "risk",
    title: "Risk",
    accent: "#FB7185",
    accentSoft: "rgba(251,113,133,0.07)",
    accentBorder: "rgba(251,113,133,0.28)",
    eyebrow: "Stage 02 · Risk",
    headline: (
      <>
        Five policy gates run<br />
        <span style={{ color: "#FB7185" }}>before any wallet call</span>.
      </>
    ),
    body: "Budget cap, whitelist, single-payment limit, token policy, duplicate guard. Blocked items never reach the execution queue. Reasons are kept, not hidden.",
  },
  {
    no: "03",
    key: "approval",
    title: "Approval",
    accent: "#B5FF4D",
    accentSoft: "rgba(181,255,77,0.08)",
    accentBorder: "rgba(181,255,77,0.32)",
    eyebrow: "Stage 03 · Approval",
    headline: (
      <>
        A human approves<br />
        the <span style={{ color: "#B5FF4D" }}>final move</span>. Always.
      </>
    ),
    body: "No autonomous transfers, ever. A real person clicks Approve & Execute on the cleared queue — and blocked items stay blocked with their reasons attached.",
  },
  {
    no: "04",
    key: "wallet",
    title: "Wallet",
    accent: "#60A5FA",
    accentSoft: "rgba(96,165,250,0.07)",
    accentBorder: "rgba(96,165,250,0.28)",
    eyebrow: "Stage 04 · Wallet",
    headline: (
      <>
        Cobo Agentic Wallet,<br />
        inside a <span style={{ color: "#60A5FA" }}>policy boundary</span>.
      </>
    ),
    body: "AI never holds keys. Every transfer routes through a configured agent wallet, returns a real tx hash, and runs on testnet — no real funds at risk in the demo.",
  },
  {
    no: "05",
    key: "audit",
    title: "Audit",
    accent: "#C084FC",
    accentSoft: "rgba(192,132,252,0.07)",
    accentBorder: "rgba(192,132,252,0.28)",
    eyebrow: "Stage 05 · Audit",
    headline: (
      <>
        Every run writes a<br />
        <span style={{ color: "#C084FC" }}>settlement report</span>.
      </>
    ),
    body: "tx hash, recipient, risk result, approver, blocked reasons — one exportable settlement report per run. Audit-grade by default, not a feature toggle.",
  },
];

/* =============================================================================
 * PUBLIC EXPORT — Intro + GSAP horizontal pin scroll
 * ===========================================================================*/

export function PipelineShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;
      const panels = STAGES.length;

      gsap.to(trackRef.current, {
        xPercent: (-100 * (panels - 1)) / panels,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 0.35,
          // Velocity > 2500 px/s → instantly complete animation and release pin.
          // Lets users quickly traverse this section to reach top/bottom of page.
          fastScrollEnd: true,
          snap: {
            snapTo: 1 / (panels - 1),
            // GSAP picks min when scroll velocity is high, max when low.
            // Fast scrolls feel near-instant, slow browsing keeps a soft snap.
            duration: { min: 0.05, max: 0.18 },
            delay: 0,
            ease: "power2.out",
          },
          // 0.65× of original (panels - 1) screens.
          // Shortens total wheel distance to cross all 5 stages by ~35%.
          end: () =>
            "+=" +
            (sectionRef.current?.offsetWidth ?? window.innerWidth) *
              (panels - 1) *
              0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Progress bar (top)
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }
            // Stage counter (top right)
            const activeIdx = Math.min(
              panels - 1,
              Math.round(self.progress * (panels - 1)),
            );
            if (counterRef.current) {
              counterRef.current.textContent = STAGES[activeIdx].no;
            }
            // Dots
            dotsRef.current.forEach((dot, i) => {
              if (!dot) return;
              if (i === activeIdx) {
                dot.style.width = "32px";
                dot.style.backgroundColor = STAGES[i].accent;
                dot.style.boxShadow = `0 0 14px ${STAGES[i].accent}`;
              } else {
                dot.style.width = "8px";
                dot.style.backgroundColor = "rgba(255,255,255,0.14)";
                dot.style.boxShadow = "none";
              }
            });
          },
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <div id="workflow" className="relative w-full">
      {/* ─── Intro headline (vertical scroll-in) ────────────────────────── */}
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-32 text-center lg:px-10 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5FF4D]"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            The 5-Stage Pipeline
          </span>
          <h2
            className="mt-5 font-medium leading-[1.05] text-white"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(2.5rem, 5.6vw, 4.25rem)",
              letterSpacing: "-0.025em",
            }}
          >
            From contribution
            <br />
            to <span className="text-[#B5FF4D]">audit trail</span>.
          </h2>
          <p
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            One visible loop, five stages. Scroll on — each stage pans into view.
          </p>

          {/* Stage chip row (visual map, not nav links anymore) */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {STAGES.map((s) => (
              <div
                key={s.key}
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em]"
                style={{
                  borderColor: s.accentBorder,
                  backgroundColor: s.accentSoft,
                  color: s.accent,
                }}
              >
                <span className="opacity-60">{s.no}</span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>

          {/* Scroll cue */}
          <div className="mt-10 flex flex-col items-center gap-2 text-white/35">
            <span
              className="text-[10px] uppercase tracking-[0.25em]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              scroll down — stages pan horizontally
            </span>
            <div className="h-6 w-px animate-pulse bg-gradient-to-b from-transparent via-white/40 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* ─── Horizontal pin scroll ──────────────────────────────────────── */}
      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Progress bar (top, full width) */}
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px] bg-white/[0.04]">
          <div
            ref={progressBarRef}
            className="h-full origin-left bg-gradient-to-r from-[#5EEAD4] via-[#B5FF4D] to-[#C084FC]"
            style={{ transform: "scaleX(0)", willChange: "transform" }}
          />
        </div>

        {/* Stage counter (top right) */}
        <div
          className="absolute right-6 top-6 z-30 flex items-baseline gap-1 text-white/50 lg:right-10 lg:top-10"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          <span
            ref={counterRef}
            className="text-3xl font-bold text-white lg:text-4xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            01
          </span>
          <span className="text-sm">/ 05</span>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${STAGES.length * 100}vw`, willChange: "transform" }}
        >
          {STAGES.map((stage, i) => (
            <Panel key={stage.key} stage={stage} index={i} />
          ))}
        </div>

        {/* Dots indicator (bottom center) */}
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
          {STAGES.map((s, i) => (
            <div
              key={s.key}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === 0 ? "32px" : "8px",
                backgroundColor: i === 0 ? s.accent : "rgba(255,255,255,0.14)",
                boxShadow: i === 0 ? `0 0 14px ${s.accent}` : "none",
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* =============================================================================
 * PANEL LAYOUT (single stage, screen-wide)
 * ===========================================================================*/

function Panel({ stage, index }: { stage: Stage; index: number }) {
  const isEven = index % 2 === 0;
  return (
    <div className="relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden px-6 lg:px-20">
      {/* Giant ghost number, drifts opposite side based on parity */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none font-black leading-none"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "clamp(14rem, 36vw, 32rem)",
          color: stage.accent,
          opacity: 0.06,
          letterSpacing: "-0.08em",
          left: isEven ? "-6%" : "auto",
          right: isEven ? "auto" : "-6%",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {stage.no}
      </span>

      {/* Content */}
      <div className="relative grid w-full max-w-6xl items-center gap-10 lg:gap-20 lg:grid-cols-[1.05fr_1fr]">
        {isEven ? (
          <>
            <TextBlock stage={stage} />
            <MockBlock stage={stage} />
          </>
        ) : (
          <>
            <MockBlock stage={stage} />
            <TextBlock stage={stage} />
          </>
        )}
      </div>
    </div>
  );
}

function TextBlock({ stage }: { stage: Stage }) {
  return (
    <div>
      <div
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
        style={{ borderColor: stage.accentBorder, backgroundColor: stage.accentSoft }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: stage.accent, boxShadow: `0 0 8px ${stage.accent}` }}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: stage.accent, fontFamily: "'Courier New', Courier, monospace" }}
        >
          {stage.eyebrow}
        </span>
      </div>

      <h3
        className="mt-6 font-medium text-white"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
          letterSpacing: "-0.022em",
          lineHeight: 1.06,
        }}
      >
        {stage.headline}
      </h3>

      <p
        className="mt-6 max-w-md text-sm leading-relaxed text-white/55 md:text-base"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {stage.body}
      </p>
    </div>
  );
}

function MockBlock({ stage }: { stage: Stage }) {
  return (
    <div className="relative">
      {stage.key === "records" && <RecordsMock stage={stage} />}
      {stage.key === "risk" && <RiskMock stage={stage} />}
      {stage.key === "approval" && <ApprovalMock stage={stage} />}
      {stage.key === "wallet" && <WalletMock stage={stage} />}
      {stage.key === "audit" && <AuditMock stage={stage} />}
    </div>
  );
}

/* =============================================================================
 * MOCK 01 — RECORDS
 * ===========================================================================*/

function RecordsMock({ stage }: { stage: Stage }) {
  const inputSources = [
    { icon: <FileSpreadsheet className="h-3.5 w-3.5" />, name: "contributions.csv" },
    { icon: <GitBranch className="h-3.5 w-3.5" />, name: "GitHub Issues" },
    { icon: <NotebookPen className="h-3.5 w-3.5" />, name: "Notion db" },
  ];
  const planRows = [
    { name: "alice.eth", reason: "wrote event recap", amount: "20 USDC" },
    { name: "bob.eth", reason: "designed poster", amount: "15 USDC" },
    { name: "charlie.eth", reason: "hosted AMA", amount: "10 USDC" },
    { name: "data-api", reason: "subscription · jun", amount: "5 USDC" },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-2">
        {inputSources.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-2 rounded-[10px] border bg-[#141414] px-2.5 py-2 text-[10px]"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: stage.accent }}>{s.icon}</span>
            <span className="truncate text-white/80">{s.name}</span>
          </div>
        ))}
      </div>

      <div
        className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: "'Courier New', Courier, monospace", color: stage.accent }}
      >
        <span className="h-px flex-1" style={{ backgroundColor: stage.accentBorder }} />
        <Sparkles className="h-3 w-3" />
        ai parse
        <span className="h-px flex-1" style={{ backgroundColor: stage.accentBorder }} />
      </div>

      <div
        className="overflow-hidden rounded-[12px] border bg-[#0d0d0d] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
        style={{ borderColor: stage.accentBorder }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-2.5"
          style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: stage.accentSoft }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ fontFamily: "'Courier New', Courier, monospace", color: stage.accent }}
          >
            Payment plan · 4 entries
          </span>
          <span
            className="text-[10px] text-white/40"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            50 USDC budget
          </span>
        </div>
        {planRows.map((r, i) => (
          <div
            key={r.name}
            className={`flex items-center justify-between px-4 py-2.5 text-xs ${
              i !== planRows.length - 1 ? "border-b border-white/[0.04]" : ""
            }`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <div className="min-w-0 flex-1 truncate">
              <span className="text-white/85">{r.name}</span>
              <span className="text-white/35"> — {r.reason}</span>
            </div>
            <span className="ml-3 font-semibold" style={{ color: stage.accent }}>
              {r.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =============================================================================
 * MOCK 02 — RISK
 * ===========================================================================*/

function RiskMock({ stage }: { stage: Stage }) {
  const gates = [
    { name: "Budget cap", detail: "50 USDC monthly · 50 used", pass: true },
    { name: "Whitelist", detail: "alice / charlie / data-api ✓", pass: true },
    { name: "Single limit", detail: "≤ 25 USDC · max 20", pass: true },
    { name: "Token policy", detail: "USDC · sepolia testnet", pass: true },
    { name: "Duplicate guard", detail: "bob.eth not in whitelist", pass: false },
  ];

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          5 gates · 4 pass · 1 block
        </div>
        <div
          className="rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            borderColor: stage.accentBorder,
            backgroundColor: stage.accentSoft,
            color: stage.accent,
          }}
        >
          1 blocked
        </div>
      </div>

      <div className="grid gap-2">
        {gates.map((g) => {
          const blocked = !g.pass;
          return (
            <div
              key={g.name}
              className="flex items-center justify-between rounded-[10px] border px-3.5 py-2.5"
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                backgroundColor: blocked ? stage.accentSoft : "#141414",
                borderColor: blocked ? stage.accentBorder : "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex flex-col">
                <span
                  className="text-xs font-semibold"
                  style={{ color: blocked ? stage.accent : "rgba(255,255,255,0.9)" }}
                >
                  {g.name}
                </span>
                <span className="text-[10px] text-white/40">{g.detail}</span>
              </div>
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  backgroundColor: blocked ? stage.accentSoft : "rgba(94,234,212,0.08)",
                  color: blocked ? stage.accent : "#5EEAD4",
                }}
              >
                {blocked ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =============================================================================
 * MOCK 03 — APPROVAL
 * ===========================================================================*/

function ApprovalMock({ stage }: { stage: Stage }) {
  const approvedQueue = [
    { name: "alice.eth", amount: "20 USDC" },
    { name: "charlie.eth", amount: "10 USDC" },
    { name: "data-api", amount: "5 USDC" },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-[12px] border p-4"
          style={{ backgroundColor: stage.accentSoft, borderColor: stage.accentBorder }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ fontFamily: "'Courier New', Courier, monospace", color: stage.accent }}
            >
              Approved · 3
            </span>
            <UserCheck className="h-3.5 w-3.5" style={{ color: stage.accent }} />
          </div>
          <div className="mt-3 space-y-1.5">
            {approvedQueue.map((q) => (
              <div
                key={q.name}
                className="flex items-center justify-between text-[11px]"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <span className="text-white/85">{q.name}</span>
                <span className="text-white/55">{q.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[12px] border bg-[#141414] p-4"
          style={{ borderColor: "rgba(251,113,133,0.22)" }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ fontFamily: "'Courier New', Courier, monospace", color: "#FB7185" }}
            >
              Blocked · 1
            </span>
            <X className="h-3.5 w-3.5" style={{ color: "#FB7185" }} />
          </div>
          <div className="mt-3">
            <div
              className="flex items-center justify-between text-[11px]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <span className="text-white/85">bob.eth</span>
              <span className="text-white/55">15 USDC</span>
            </div>
            <div
              className="mt-1 text-[10px] text-white/35"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              reason: not in whitelist
            </div>
          </div>
        </div>
      </div>

      <button
        className="group flex items-center justify-between rounded-[12px] px-5 py-4 transition-opacity hover:opacity-90"
        style={{ backgroundColor: stage.accent, color: "#0D0D0D", fontFamily: "Inter, sans-serif" }}
      >
        <span className="text-sm font-bold tracking-tight">
          Approve & execute · 3 payments
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold">
          35 USDC
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>

      <p
        className="text-center text-[10px] text-white/35"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        human-in-the-loop · no autonomous transfers
      </p>
    </div>
  );
}

/* =============================================================================
 * MOCK 04 — WALLET
 * ===========================================================================*/

function WalletMock({ stage }: { stage: Stage }) {
  const txs = [
    { hash: "0xae3f...2c91", to: "alice.eth", amount: "20 USDC" },
    { hash: "0x8b21...4ee0", to: "charlie.eth", amount: "10 USDC" },
    { hash: "0x4c7d...91b3", to: "data-api", amount: "5 USDC" },
  ];

  return (
    <div
      className="overflow-hidden rounded-[14px] border shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
      style={{ backgroundColor: "#0a0a0a", borderColor: stage.accentBorder }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: stage.accentSoft }}
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" style={{ color: stage.accent }} />
          <span className="text-xs font-bold text-white" style={{ fontFamily: "Inter, sans-serif" }}>
            Cobo Agentic Wallet
          </span>
        </div>
        <span
          className="rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            borderColor: stage.accentBorder,
            color: stage.accent,
            backgroundColor: "rgba(96,165,250,0.06)",
          }}
        >
          testnet-simulated
        </span>
      </div>

      <div>
        {txs.map((t, i) => (
          <div
            key={t.hash}
            className={`flex items-center justify-between px-5 py-3 ${
              i !== txs.length - 1 ? "border-b border-white/[0.04]" : ""
            }`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <div className="flex items-center gap-3">
              <Hash className="h-3 w-3 text-white/35" />
              <span className="text-xs font-semibold text-white/90">{t.hash}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/45">→ {t.to}</span>
              <span
                className="rounded-md border px-2 py-0.5 text-[10px] font-bold"
                style={{
                  borderColor: stage.accentBorder,
                  color: stage.accent,
                  backgroundColor: stage.accentSoft,
                }}
              >
                {t.amount} ✓
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="border-t border-white/[0.04] px-5 py-2.5 text-center text-[9px] text-white/35"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        AI does not hold keys · policy boundary enforced by Cobo CAW
      </div>
    </div>
  );
}

/* =============================================================================
 * MOCK 05 — AUDIT
 * ===========================================================================*/

function AuditMock({ stage }: { stage: Stage }) {
  return (
    <div
      className="overflow-hidden rounded-[14px] border bg-[#0a0a0a] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
      style={{ borderColor: stage.accentBorder }}
    >
      <div
        className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3"
        style={{ backgroundColor: stage.accentSoft }}
      >
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4" style={{ color: stage.accent }} />
          <span className="text-xs font-bold text-white" style={{ fontFamily: "Inter, sans-serif" }}>
            Settlement Report
          </span>
        </div>
        <span
          className="text-[10px] text-white/40"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          audit-2026-06-09
        </span>
      </div>

      <div className="grid gap-3 p-5">
        <div className="grid grid-cols-3 gap-2">
          <KPI label="Approved" value="3" color="#5EEAD4" />
          <KPI label="Blocked" value="1" color="#FB7185" />
          <KPI label="Settled" value="35 USDC" color={stage.accent} />
        </div>

        <div className="rounded-[10px] border border-white/[0.06] bg-[#141414]">
          <div
            className="border-b border-white/[0.05] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            On-chain proof
          </div>
          <div className="px-3.5 py-2.5">
            {["0xae3f...2c91", "0x8b21...4ee0", "0x4c7d...91b3"].map((h) => (
              <div
                key={h}
                className="flex items-center justify-between py-1 text-[11px]"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <span className="text-white/75">{h}</span>
                <span style={{ color: "#5EEAD4" }}>✓</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
          <div className="rounded-md border border-white/[0.06] bg-[#141414] px-3 py-2">
            <span className="text-white/40">risk </span>
            <span className="text-white/90">4 pass · 1 block</span>
          </div>
          <div className="rounded-md border border-white/[0.06] bg-[#141414] px-3 py-2">
            <span className="text-white/40">approver </span>
            <span className="text-white/90">human</span>
          </div>
        </div>

        <button
          className="mt-1 flex items-center justify-center gap-2 rounded-[10px] border px-4 py-2.5 text-xs font-bold transition-opacity hover:opacity-90"
          style={{
            borderColor: stage.accentBorder,
            backgroundColor: stage.accentSoft,
            color: stage.accent,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <FileDown className="h-3.5 w-3.5" />
          Export settlement.pdf
        </button>
      </div>
    </div>
  );
}

function KPI({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-[#141414] px-3 py-2.5">
      <div
        className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-base font-bold"
        style={{ fontFamily: "Inter, sans-serif", color }}
      >
        {value}
      </div>
    </div>
  );
}
