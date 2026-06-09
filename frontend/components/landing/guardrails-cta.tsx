"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, X } from "lucide-react";

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function GuardrailsCTA() {
  return (
    <section className="relative px-5 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#0a0a0a]">
          {/* Subtle gradient background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 20% 0%, rgba(255,79,0,0.08), transparent 60%), radial-gradient(ellipse 40% 40% at 90% 100%, rgba(255,79,0,0.04), transparent 60%)",
            }}
          />

          <div className="relative grid items-center gap-10 p-8 md:p-12 lg:grid-cols-[1.1fr,1fr] lg:gap-14 lg:p-16">
            {/* Left: copy + CTAs */}
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff4f00]"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                Move funds with confidence
              </span>
              <h2
                className="mt-3 font-medium leading-[1.08] text-white"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
                }}
              >
                Every payout is checked, approved, and reported.
              </h2>
              <p
                className="mt-5 max-w-xl text-sm leading-relaxed text-white/55 md:text-base"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AgentCFO turns messy contribution records into payout plans, blocks risky transfers,
                waits for human approval, and produces an audit-ready settlement report.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="group flex items-center gap-2 rounded-[10px] bg-[#ff4f00] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Run demo
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#audit-trail"
                  className="rounded-[10px] border border-white/15 px-5 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  View audit report
                </a>
              </div>

              <div
                className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-white/45"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <span>testnet-simulated</span>
                <span className="text-white/20">·</span>
                <span>no real funds</span>
                <span className="text-white/20">·</span>
                <span>deterministic demo</span>
              </div>
            </motion.div>

            {/* Right: blocked-payment cover card */}
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="relative"
            >
              <BlockedReportCard />
            </motion.div>
          </div>

          {/* Footer */}
          <div className="relative border-t border-white/5 px-8 py-6 lg:px-16">
            <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-white/40 sm:flex-row" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
              <p>AgentCFO · DAO AI Treasury Officer · Cobo Agentic Commerce · Mock demo, no real transactions</p>
              <p>v0.1 · 2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockedReportCard() {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10 text-red-400">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-white" style={{ fontFamily: "Inter, sans-serif" }}>
            Settlement report
          </span>
        </div>
        <span
          className="text-[10px] text-white/40"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          audit-2026-06-08
        </span>
      </div>

      <div className="p-5">
        {/* Blocked callout */}
        <div className="rounded-md border border-red-500/30 bg-red-500/[0.06] p-3.5">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <X className="h-3 w-3" />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-300" style={{ fontFamily: "Inter, sans-serif" }}>
                1 payment blocked
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-red-300/80" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                bob.eth — 15 USDC
                <br />
                <span className="text-red-300/55">
                  reason: recipient not in whitelist
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tx summary */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            <span className="text-white/40">tx</span>
            <span className="text-white/85">0xae3f...2c91</span>
            <span className="text-emerald-400">20 USDC ✓</span>
          </div>
          <div className="flex items-center justify-between text-[11px]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            <span className="text-white/40">tx</span>
            <span className="text-white/85">0x8b21...4ee0</span>
            <span className="text-emerald-400">10 USDC ✓</span>
          </div>
          <div className="flex items-center justify-between text-[11px]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            <span className="text-white/40">tx</span>
            <span className="text-white/85">0x4c7d...91b3</span>
            <span className="text-emerald-400">5 USDC ✓</span>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 border-t border-white/5 pt-3 text-[10px] text-white/35" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
          mock mode · testnet address · real tx hash appears after live CAW execution
        </div>
      </div>
    </div>
  );
}
