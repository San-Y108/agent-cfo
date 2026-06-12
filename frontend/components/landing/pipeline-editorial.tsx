"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "framer-motion";
import {
  FileSpreadsheet,
  GitBranch,
  NotebookPen,
  Wallet,
  UserCheck,
  ArrowRight,
  Coins,
  ShieldCheck,
  CheckCircle,
  Eye,
  ScrollText,
  Layers,
  FlaskConical,
  Settings,
  Link as LinkIcon,
  FileText,
  Download,
  Shield,
  GitCommit,
  type LucideIcon,
} from "lucide-react";
import { STAGES, type Stage, type Capability } from "./pipeline-stage-data";
import { DataSnippet } from "./pipeline-data-snippets";
import { DecodeHeadline } from "./decode-headline";

/* =============================================================================
 * ICON MAPPING
 * ===========================================================================*/

const ICON_MAP: Record<string, LucideIcon> = {
  FileSpreadsheet,
  GitBranch,
  NotebookPen,
  Wallet,
  UserCheck,
  ArrowRight,
  Coins,
  ShieldCheck,
  CheckCircle,
  Eye,
  ScrollText,
  Layers,
  TestTube: FlaskConical,
  FlaskConical,
  Settings,
  Link: LinkIcon,
  FileText,
  Download,
  Shield,
  GitCommit,
};

/* =============================================================================
 * CAPABILITY ITEM
 * ===========================================================================*/

function CapabilityItem({ cap, accent }: { cap: Capability; accent: string }) {
  const Icon = ICON_MAP[cap.icon] || FileText;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3.5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${accent}15` }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div>
        <div className="text-sm font-medium text-white/90">{cap.label}</div>
        <div className="mt-0.5 text-xs text-white/50">{cap.desc}</div>
      </div>
    </div>
  );
}

/* =============================================================================
 * PIPELINE STAGE — one stage block (not full-screen)
 * ===========================================================================*/

function PipelineStage({
  stage,
  index,
  isActive,
}: {
  stage: Stage;
  index: number;
  isActive: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || prefersReducedMotion) return;
      const els = sectionRef.current.querySelectorAll(".animate-in");
      gsap.fromTo(
        els,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      id={`stage-${stage.key}`}
      className="relative scroll-mt-28"
    >
      {/* Ghost number — sticky within the stage, stays visible while scrolling */}
      <div className="pointer-events-none absolute right-0 top-0 select-none font-black leading-none lg:-right-8"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "clamp(6rem, 15vw, 12rem)",
          color: stage.accent,
          opacity: 0.06,
          letterSpacing: "-0.08em",
          zIndex: 0,
        }}
      >
        {stage.no}
      </div>

      <div className="relative z-10">
        {/* Eyebrow */}
        <div className="animate-in">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
            style={{
              borderColor: stage.accentBorder,
              backgroundColor: stage.accentSoft,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: stage.accent,
                boxShadow: `0 0 8px ${stage.accent}`,
              }}
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{
                color: stage.accent,
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              {stage.eyebrow}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="animate-in mt-5">
          <DecodeHeadline
            text={stage.headline}
            accent={stage.accent}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          />
        </div>

        {/* Divider */}
        <div
          className="animate-in mt-5 h-px w-20"
          style={{ backgroundColor: stage.accent, opacity: 0.4 }}
        />

        {/* Lead */}
        <div
          className="animate-in mt-6 text-lg leading-[1.7] text-white/85 sm:text-xl"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {stage.lead}
        </div>

        {/* Paragraphs */}
        {stage.paragraphs.map((para, i) => (
          <div
            key={i}
            className="animate-in mt-5 text-base leading-[1.8] text-white/55 sm:text-lg italic"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {para}
          </div>
        ))}

        {/* Capabilities — single column masonry-like stack */}
        <div className="animate-in mt-8 grid gap-4">
          {stage.capabilities.map((cap, i) => (
            <CapabilityItem key={i} cap={cap} accent={stage.accent} />
          ))}
        </div>

        {/* Data Snippet */}
        <div className="animate-in mt-6">
          <DataSnippet stage={stage} />
        </div>
      </div>

      {/* Separator between stages (except last) — visible only on mobile */}
      {index < STAGES.length - 1 && (
        <div className="mt-16 mb-4 flex items-center gap-4 lg:hidden">
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
          <span
            className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30"
          >
            Next stage
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
        </div>
      )}
    </section>
  );
}

/* =============================================================================
 * SIDE NAV — vertical timeline with large current number
 * Glassmorphism card on the right edge. Current stage shows a giant number
 * like a magazine page marker. Connecting line shows scroll progress.
 * ===========================================================================*/

function StageSideNav({
  activeIndex,
  onTabClick,
  visible,
}: {
  activeIndex: number;
  onTabClick: (idx: number) => void;
  visible: boolean;
}) {
  const activeStage = STAGES[activeIndex];
  const progressPercent =
    activeIndex === 0 ? 0 : (activeIndex / (STAGES.length - 1)) * 100;

  return (
    <div
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 transition-all duration-500 lg:block"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Glassmorphism card */}
      <div
        className="flex flex-col items-center gap-5 rounded-2xl border px-5 py-6"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "rgba(13,13,13,0.65)",
          backdropFilter: "blur(20px) saturate(1.3)",
          WebkitBackdropFilter: "blur(20px) saturate(1.3)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Giant current number — like a magazine page marker */}
        <div className="relative flex flex-col items-center">
          <span
            className="font-black leading-none"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "3.2rem",
              color: activeStage.accent,
              letterSpacing: "-0.05em",
              textShadow: `0 0 30px ${activeStage.accent}40, 0 0 60px ${activeStage.accent}20`,
              transition: "color 0.4s ease, text-shadow 0.4s ease",
            }}
          >
            {activeStage.no}
          </span>
          <span
            className="mt-1 text-[9px] font-mono font-semibold uppercase tracking-[0.2em]"
            style={{
              color: activeStage.accent,
              opacity: 0.7,
              transition: "color 0.4s ease",
            }}
          >
            {activeStage.title}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px w-10" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        {/* Vertical timeline */}
        <div className="relative flex flex-col items-center gap-0">
          {/* Background track */}
          <div className="absolute top-2 bottom-2 w-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

          {/* Active progress fill */}
          <div
            className="absolute top-2 w-[2px] transition-all duration-500"
            style={{
              height: `calc(${progressPercent}% )`,
              background: `linear-gradient(to bottom, ${STAGES[0].accent}, ${activeStage.accent})`,
              opacity: 0.6,
            }}
          />

          {STAGES.map((s, i) => {
            const isActive = i === activeIndex;
            const isVisited = i < activeIndex;

            return (
              <button
                key={s.key}
                onClick={() => onTabClick(i)}
                className="group relative z-10 flex items-center justify-center py-2.5"
                style={{ pointerEvents: isActive ? "none" : "auto" }}
              >
                <div className="relative flex items-center justify-center">
                  {isActive ? (
                    <>
                      {/* Active node — glowing ring */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          width: "20px",
                          height: "20px",
                          margin: "-2px",
                          border: `2px solid ${s.accent}`,
                          boxShadow: `0 0 10px ${s.accent}50, 0 0 20px ${s.accent}25`,
                        }}
                      />
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.accent }}
                      />
                    </>
                  ) : isVisited ? (
                    <div
                      className="h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-125"
                      style={{ backgroundColor: `${s.accent}70` }}
                    />
                  ) : (
                    <div
                      className="h-2 w-2 rounded-full border transition-all duration-300 group-hover:border-white/40"
                      style={{ borderColor: "rgba(255,255,255,0.15)" }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mini stage list — only show non-active stages */}
        <div className="flex flex-col items-center gap-1.5">
          {STAGES.map((s, i) => {
            if (i === activeIndex) return null;
            return (
              <button
                key={s.key}
                onClick={() => onTabClick(i)}
                className="text-[9px] font-mono uppercase tracking-[0.12em] transition-all duration-300 hover:text-white/60"
                style={{
                  color:
                    i < activeIndex
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(255,255,255,0.18)",
                }}
              >
                {s.no} {s.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
 * INTRO
 * ===========================================================================*/

function PipelineIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion) return;
      gsap.fromTo(
        ref.current.querySelectorAll(".intro-animate"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: ref, dependencies: [prefersReducedMotion] }
  );

  return (
    <div ref={ref} className="relative w-full pb-16 pt-32 lg:pb-20 lg:pt-40">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <span
          className="intro-animate inline-block text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            color: "#B5FF4D",
            opacity: prefersReducedMotion ? 1 : 0,
          }}
        >
          The 5-Stage Pipeline
        </span>

        <h2
          className="intro-animate mt-5 font-medium leading-[1.05] text-white"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(2.5rem, 5.6vw, 4.25rem)",
            letterSpacing: "-0.025em",
            opacity: prefersReducedMotion ? 1 : 0,
          }}
        >
          From contribution
          <br />
          to <span className="text-[#B5FF4D]">audit trail</span>.
        </h2>

        <p
          className="intro-animate mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          style={{
            fontFamily: "Inter, sans-serif",
            opacity: prefersReducedMotion ? 1 : 0,
          }}
        >
          One visible loop, five stages. Each one tells a story — from raw
          signal to on-chain proof.
        </p>

        <div
          className="intro-animate mt-10 flex flex-wrap items-center justify-center gap-2"
          style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
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
      </div>
    </div>
  );
}

/* =============================================================================
 * PUBLIC EXPORT
 * ===========================================================================*/

export function PipelineEditorial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sideNavVisible, setSideNavVisible] = useState(false);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── ScrollSpy: detect which stage is in viewport ── */
  useEffect(() => {
    const onScroll = () => {
      const offset = window.innerHeight * 0.35;
      let bestIdx = 0;
      let bestTop = -Infinity;

      stageRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const top = rect.top;
        if (top <= offset && top > bestTop) {
          bestTop = top;
          bestIdx = i;
        }
      });

      setActiveIndex((prev) => (prev !== bestIdx ? bestIdx : prev));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── IntersectionObserver: show/hide side nav based on #workflow visibility ── */
  useEffect(() => {
    const el = document.getElementById("workflow");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSideNavVisible(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "-10% 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Click tab → scroll to stage ── */
  const scrollToStage = (idx: number) => {
    const el = stageRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="workflow">
      {/* Non-pinned marker for nav IntersectionObserver */}
      <div id="workflow-marker" className="h-px w-full" aria-hidden="true" />

      {/* Side nav — fixed left/right, toggles visibility */}
      <StageSideNav
        activeIndex={activeIndex}
        onTabClick={scrollToStage}
        visible={sideNavVisible}
      />

      {/* Intro */}
      <PipelineIntro />

      {/* 5 Stages — two-column masonry on desktop, single column on mobile */}
      <div className="relative mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-x-12 gap-y-0 lg:grid-cols-2">
          {STAGES.map((stage, i) => (
            <div
              key={stage.key}
              ref={(el) => {
                stageRefs.current[i] = el;
              }}
              className={
                i % 2 === 1
                  ? "lg:mt-40"
                  : i === STAGES.length - 1
                    ? "lg:col-span-2 lg:max-w-2xl lg:mx-auto"
                    : ""
              }
            >
              <PipelineStage
                stage={stage}
                index={i}
                isActive={i === activeIndex}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
