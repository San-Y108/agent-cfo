"use client";

import React, { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useApp, useT } from "@/lib/i18n/context";

// ── Demo video slot ──
// Plan: docs/plans/demo-video-landing-integration-plan.md
// Team asset (drop here): assets/video/agentcfo-demo.mp4
// Auto-synced to public/video/ via scripts/sync-demo-video.mjs on pnpm dev/build
const DEMO_VIDEO_SRC = "";
const DEMO_VIDEO_POSTER = "";

// ── Direction-aware light helper ──

type Dir = "top" | "right" | "bottom" | "left";

const DIR_ENTER: Record<Dir, string> = {
  top: "translateY(-101%)", right: "translateX(101%)", bottom: "translateY(101%)", left: "translateX(-101%)",
};
const DIR_GRAD: Record<Dir, string> = {
  top: "linear-gradient(to bottom, rgba(181,255,77,0.18), transparent)",
  right: "linear-gradient(to left, rgba(181,255,77,0.18), transparent)",
  bottom: "linear-gradient(to top, rgba(181,255,77,0.18), transparent)",
  left: "linear-gradient(to right, rgba(181,255,77,0.18), transparent)",
};

function getDir(e: React.MouseEvent<HTMLElement>): Dir {
  const r = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const d: [Dir, number][] = [["top", y], ["right", r.width - x], ["bottom", r.height - y], ["left", x]];
  return d.reduce((a, b) => (a[1] < b[1] ? a : b))[0];
}

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function GuardrailsCTA() {
  const { lang } = useApp();
  const t = useT();
  const sep = lang === "zh" ? "、" : ", ";
  const lastSep = lang === "zh" ? "与" : ", and ";

  return (
    <section className="relative px-5 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[18px] border border-white/18 bg-[#0a0a0a]">
          {/* Subtle gradient background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 20% 0%, rgba(181,255,77,0.08), transparent 60%), radial-gradient(ellipse 40% 40% at 90% 100%, rgba(181,255,77,0.04), transparent 60%)",
            }}
          />

          <div className="relative grid items-center gap-10 p-8 md:p-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:p-16">
            {/* Left: copy + CTAs */}
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5FF4D]"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {t("guardrails.eyebrow")}
              </span>
              <h2
                className="mt-3 font-black leading-[1.05]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(2.1rem, 4.6vw, 3.5rem)",
                  letterSpacing: "-0.025em",
                  color: "rgba(255, 255, 255, 0.88)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {t("guardrails.headlinePrefix")}{" "}
                <span
                  className="inline-block animate-guard-word"
                  style={{
                    background: "linear-gradient(90deg, #B5FF4D, #00E5B0, #CCFF00, #B5FF4D)",
                    backgroundSize: "300% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t("guardrails.checked")}
                </span>
                {sep}
                <span
                  className="inline-block animate-guard-word"
                  style={{
                    background: "linear-gradient(90deg, #5EEAD4, #60A5FA, #00FFD1, #5EEAD4)",
                    backgroundSize: "300% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animationDelay: "0.6s",
                  }}
                >
                  {t("guardrails.approved")}
                </span>
                {lastSep}
                <span
                  className="inline-block animate-guard-word"
                  style={{
                    background: "linear-gradient(90deg, #C084FC, #F472B6, #A855F7, #C084FC)",
                    backgroundSize: "300% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animationDelay: "1.2s",
                  }}
                >
                  {t("guardrails.reported")}
                </span>
                .
              </h2>

              <style jsx>{
                `
                @keyframes guard-word {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                }
                .animate-guard-word {
                  animation: guard-word 4s ease-in-out infinite;
                }
                `
              }</style>
              <p
                className="mt-5 max-w-xl text-sm italic leading-relaxed text-white/80 md:text-base"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {t("guardrails.subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {/* Primary CTA now lives in the navbar; keep a calm secondary action here */}
                <DirectionAwareLink
                  href="#workflow"
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/25 hover:text-white hover:shadow-[0_0_20px_rgba(181,255,77,0.08)]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {t("guardrails.cta")}
                </DirectionAwareLink>
              </div>

              <div
                className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-white/70"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <span>{t("guardrails.badge.testnet")}</span>
                <span className="text-white/40">·</span>
                <span>{t("guardrails.badge.noFunds")}</span>
                <span className="text-white/40">·</span>
                <span>{t("guardrails.badge.deterministic")}</span>
              </div>
            </motion.div>

            {/* Right: demo video (terminal-framed; audit story lives on as floating chips) */}
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="relative"
            >
              <DemoVideoCard />
            </motion.div>
          </div>

          {/* Footer */}
          <div className="relative border-t border-white/12 px-8 py-6 lg:px-16">
            <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-white/85 sm:flex-row" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
              <p>{t("guardrails.cardFooter")}</p>
              <p>v0.1 · 2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoVideoCard() {
  const t = useT();
  const hasVideo = DEMO_VIDEO_SRC.length > 0;

  return (
    <div className="relative">
      {/* Terminal window frame */}
      <div className="relative overflow-hidden rounded-[14px] border border-white/18 bg-[#0d0d0d] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/12 bg-[#0a0a0a] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FB7185]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#B5FF4D]/70" />
            </span>
            <span
              className="ml-2 text-[10px] text-white/70"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              agentcfo — demo.mp4
            </span>
          </div>
          <span
            className="flex items-center gap-1.5 text-[10px] text-red-400/80"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            REC
          </span>
        </div>

        {/* Video viewport — 16:9 */}
        <div className="relative aspect-video bg-[#0a0a0a]">
          {hasVideo ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={DEMO_VIDEO_SRC}
              poster={DEMO_VIDEO_POSTER || undefined}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <>
              {/* Placeholder grid backdrop */}
              <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(181,255,77,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(181,255,77,0.05) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              {/* Sweeping scanline */}
              <div
                className="pointer-events-none absolute inset-x-0 h-16"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(181,255,77,0.06), transparent)",
                  animation: "demoScan 4.5s ease-in-out infinite",
                }}
              />
              {/* Center play affordance */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#B5FF4D]/10" style={{ animationDuration: "2.4s" }} />
                  <span className="absolute inset-1.5 rounded-full border border-[#B5FF4D]/25" />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#B5FF4D] text-[#0D0D0D] shadow-[0_0_32px_rgba(181,255,77,0.35)]">
                    <Play className="ml-0.5 h-4.5 w-4.5 fill-current" size={18} />
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/85" style={{ fontFamily: "Inter, sans-serif" }}>
                    {t("guardrails.demo.title")}
                  </p>
                  <p
                    className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/60"
                    style={{ fontFamily: "'Courier New', Courier, monospace" }}
                  >
                    {t("guardrails.demo.subtitle")}
                  </p>
                </div>
              </div>
              <style>{`
                @keyframes demoScan {
                  0%, 100% { transform: translateY(-4rem); }
                  50% { transform: translateY(calc(100% + 4rem)); }
                }
              `}</style>
            </>
          )}
        </div>

        {/* Status ribbon — chain of stage pills */}
        <div
          className="flex items-center justify-center gap-1 sm:gap-2 border-t border-white/12 bg-[#0a0a0a] px-4 py-3"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {[
            { label: "records", accent: "#5EEAD4" },
            { label: "plan", accent: "#60A5FA" },
            { label: "risk", accent: "#FB7185" },
            { label: "approve", accent: "#C084FC" },
            { label: "execute", accent: "#B5FF4D" },
            { label: "audit", accent: "#E2E8F0" },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] sm:text-[10px] font-mono uppercase tracking-wider"
                style={{
                  borderColor: `${step.accent}25`,
                  background: `${step.accent}08`,
                  color: step.accent,
                  transform: `translateY(${i % 2 === 0 ? -2 : 2}px)`,
                }}
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: step.accent, opacity: 0.8 }}
                />
                {step.label}
              </div>
              {i < arr.length - 1 && (
                <div
                  className="text-white/20 -mx-0.5"
                  style={{ transform: `translateY(${i % 2 === 0 ? 2 : -2}px)` }}
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="opacity-50">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
          <span className="ml-auto text-[9px] text-white/40 hidden sm:inline">{t("guardrails.mockTestnet")}</span>
        </div>
      </div>

      {/* Floating audit chips — the guardrails story, hovering over the video */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
        className="absolute -right-3 -top-3 lg:-right-6"
        style={{ animation: "chipFloatA 5s ease-in-out infinite" }}
      >
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-[#140b0d]/95 px-3 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <X className="h-3 w-3" />
          </span>
          <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            <div className="text-[10px] font-semibold text-red-300">{t("guardrails.chip.blocked")}</div>
            <div className="text-[9px] text-red-300/60">{t("guardrails.chip.blockedDetail")}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        className="absolute -bottom-3 -left-3 lg:-left-6"
        style={{ animation: "chipFloatB 6s ease-in-out infinite" }}
      >
        <div
          className="flex items-center gap-2 rounded-lg border border-[#B5FF4D]/25 bg-[#0e130a]/95 px-3 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          <span className="text-[#B5FF4D]">✓</span>
          <span className="text-[10px] text-[#B5FF4D]/90">{t("guardrails.chip.executed")}</span>
        </div>
      </motion.div>

      <style>{`
        @keyframes chipFloatA {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes chipFloatB {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </div>
  );
}

// ── Direction-aware link (secondary CTA) ──

function DirectionAwareLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  const handleEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const dir = getDir(e);
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = DIR_ENTER[dir];
    el.style.background = DIR_GRAD[dir];
    requestAnimationFrame(() => {
      el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "translate(0, 0)";
    });
  }, []);

  const handleLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const dir = getDir(e);
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = DIR_ENTER[dir];
  }, []);

  return (
    <a
      href={href}
      className={`group relative overflow-hidden ${className ?? ""}`}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ transform: DIR_ENTER.top, background: DIR_GRAD.top }}
      />
      <span className="relative z-10">{children}</span>
    </a>
  );
}
