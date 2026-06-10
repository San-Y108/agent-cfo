"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useApp } from "@/lib/i18n/context";

gsap.registerPlugin(ScrollTrigger);

type Phase = {
  date: string;
  phase: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  accent: string;
  accentMuted: string;
  number: string;
};

const PHASES: Phase[] = [
  {
    date: "2026-06-08",
    phase: "Phase 0",
    titleZh: "启动对齐",
    titleEn: "Kickoff",
    descZh: "仓库创建、团队分工、后端 P0 API 与前端脚手架",
    descEn: "Repo created, team roles, backend P0 APIs and frontend scaffold",
    accent: "#4A9B8E",
    accentMuted: "rgba(74,155,142,0.15)",
    number: "01",
  },
  {
    date: "2026-06-09",
    phase: "Phase 1",
    titleZh: "核心联调",
    titleEn: "Core Integration",
    descZh: "P0 API 前后端联调、CAW 测试网执行、Vercel 部署",
    descEn: "P0 API integration, CAW testnet execution, Vercel deploy",
    accent: "#5A8FC4",
    accentMuted: "rgba(90,143,196,0.15)",
    number: "02",
  },
  {
    date: "2026-06-10",
    phase: "Phase 2",
    titleZh: "打磨冲刺",
    titleEn: "Polish Sprint",
    descZh: "Landing 视觉优化、Console 组件打磨、Demo 彩排",
    descEn: "Landing visual polish, Console component refinement, demo rehearsal",
    accent: "#8BA85C",
    accentMuted: "rgba(139,168,92,0.15)",
    number: "03",
  },
  {
    date: "2026-06-12",
    phase: "Phase 3",
    titleZh: "冻结提交",
    titleEn: "Freeze & Submit",
    descZh: "功能冻结、最终彩排、提交材料整理",
    descEn: "Feature freeze, final rehearsal, submission package",
    accent: "#9B7BB8",
    accentMuted: "rgba(155,123,184,0.15)",
    number: "04",
  },
];

/**
 * Cinematic film-grain overlay using SVG noise filter.
 * Applied to the filmstrip container for texture.
 */
function FilmGrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.035] z-10 mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Sprocket holes strip for the filmstrip edges.
 */
function SprocketStrip() {
  return (
    <div
      className="absolute top-0 bottom-0 w-[22px] flex flex-col items-center py-3 gap-[14px]"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="w-[7px] h-[9px] rounded-[1px]"
          style={{
            backgroundColor: "rgba(0,0,0,0.65)",
            boxShadow: "inset 0 0 2px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        />
      ))}
    </div>
  );
}

export function BuildTimeline() {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (reduce) return;

      const frames = frameRefs.current.filter(Boolean) as HTMLDivElement[];
      const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
      if (frames.length === 0 || texts.length === 0) return;

      // Initial states — first frame active, rest dimmed
      frames.forEach((frame, i) => {
        gsap.set(frame, {
          scale: i === 0 ? 1 : 0.88,
          opacity: i === 0 ? 1 : 0.3,
          filter: i === 0 ? "brightness(1) contrast(1)" : "brightness(0.45) contrast(1.1)",
        });
      });

      texts.forEach((text, i) => {
        gsap.set(text, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 32,
        });
      });

      // Build scroll-driven timeline with cinematic easing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${frames.length * 85}%`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            // Force correct visibility states when ScrollTrigger refreshes
            const progress = self.progress;
            const activeIdx = Math.min(
              frames.length - 1,
              Math.floor(progress * (frames.length - 1) + 0.5)
            );
            frames.forEach((f, i) => {
              gsap.set(f, {
                opacity: i === activeIdx ? 1 : 0,
                scale: i === activeIdx ? 1 : 0.88,
                filter:
                  i === activeIdx
                    ? "brightness(1) contrast(1)"
                    : "brightness(0.45) contrast(1.1)",
              });
            });
            texts.forEach((t, i) => {
              gsap.set(t, {
                opacity: i === activeIdx ? 1 : 0,
                y: i === activeIdx ? 0 : i < activeIdx ? -24 : 32,
              });
            });
          },
          snap: {
            snapTo: 1 / (frames.length - 1),
            duration: { min: 0.2, max: 0.45 },
            delay: 0,
            ease: "power2.out",
          },
        },
      });

      for (let i = 0; i < frames.length - 1; i++) {
        const slot = (i + 1) / (frames.length - 1);

        // Deactivate current frame
        tl.to(
          frames[i],
          {
            scale: 0.88,
            opacity: 0.3,
            filter: "brightness(0.45) contrast(1.1)",
            duration: 0.3,
            ease: "power2.out",
          },
          slot - 0.14
        );

        // Activate next frame
        tl.to(
          frames[i + 1],
          {
            scale: 1,
            opacity: 1,
            filter: "brightness(1) contrast(1)",
            duration: 0.3,
            ease: "power2.out",
          },
          slot - 0.14
        );

        // Hide current text
        tl.to(
          texts[i],
          {
            opacity: 0,
            y: -24,
            duration: 0.22,
            ease: "power2.in",
          },
          slot - 0.12
        );

        // Show next text
        tl.fromTo(
          texts[i + 1],
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            ease: "power2.out",
          },
          slot - 0.08
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="relative w-full"
      style={{ height: `${PHASES.length * 100}vh`, fontFamily: "Inter, sans-serif" }}
    >
      {/* ─── Main cinematic viewport (sticky) ─────────────────────────── */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 xl:gap-32 w-full max-w-7xl">
          {/* ─── Left: Editorial copy ─────────────────────────────────── */}
          <div className="relative w-full lg:w-[440px] xl:w-[480px] h-[200px] lg:h-[260px]">
            {PHASES.map((p, i) => (
              <div
                key={p.phase}
                ref={(el) => {
                  textRefs.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-center text-center lg:text-left"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {/* Phase label */}
                <span
                  className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em]"
                  style={{ color: p.accent }}
                >
                  {p.date} · {p.phase}
                </span>

                {/* Large editorial title */}
                <h4
                  className="mt-3 text-3xl md:text-4xl lg:text-[42px] font-bold text-white leading-[1.1] tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {_(p.titleZh, p.titleEn)}
                </h4>

                {/* Description */}
                <p className="mt-4 text-sm md:text-[15px] leading-relaxed text-white/50 max-w-md">
                  {_(p.descZh, p.descEn)}
                </p>

                {/* Accent divider line */}
                <div
                  className="mt-5 h-[2px] w-12 rounded-full hidden lg:block"
                  style={{ backgroundColor: p.accent }}
                />
              </div>
            ))}
          </div>

          {/* ─── Right: Cinematic filmstrip ───────────────────────────── */}
          <div
            className="relative"
            style={{
              width: "clamp(300px, 36vw, 480px)",
              height: "clamp(480px, 64vh, 680px)",
            }}
          >
            {/* Filmstrip container */}
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                background: `
                  linear-gradient(180deg, rgba(13,13,13,0.98) 0%, rgba(18,18,18,0.98) 100%)
                `,
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "2px",
                boxShadow: `
                  0 0 80px rgba(0,0,0,0.6),
                  0 20px 60px rgba(0,0,0,0.4),
                  inset 0 0 100px rgba(0,0,0,0.5)
                `,
              }}
            >
              {/* Vignette overlay */}
              <div
                className="absolute inset-0 pointer-events-none z-[5]"
                style={{
                  background: `
                    radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)
                  `,
                }}
                aria-hidden="true"
              />

              {/* Film grain */}
              <FilmGrainOverlay />

              {/* Left sprocket strip */}
              <div className="absolute left-0 z-[6]">
                <SprocketStrip />
              </div>

              {/* Right sprocket strip */}
              <div className="absolute right-0 z-[6]">
                <SprocketStrip />
              </div>

              {/* Film frames */}
              <div className="absolute inset-x-[28px] inset-y-3 flex flex-col gap-2">
                {PHASES.map((p, i) => (
                  <div
                    key={p.phase}
                    ref={(el) => {
                      frameRefs.current[i] = el;
                    }}
                    className="relative flex-1 flex flex-col items-center justify-center"
                    style={{
                      background: `
                        linear-gradient(135deg, ${p.accentMuted} 0%, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.15) 100%)
                      `,
                      border: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: "1px",
                      opacity: i === 0 ? 1 : 0,
                    }}
                  >
                    {/* Subtle inner glow at top */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[1px]"
                      style={{
                        background: `linear-gradient(90deg, transparent 10%, ${p.accent}40 50%, transparent 90%)`,
                      }}
                      aria-hidden="true"
                    />

                    {/* Large phase number */}
                    <span
                      className="text-[56px] md:text-[64px] font-bold leading-none tracking-tighter"
                      style={{
                        color: "transparent",
                        WebkitTextStroke: `1px ${p.accent}50`,
                        opacity: 0.6,
                      }}
                    >
                      {p.number}
                    </span>

                    {/* Phase label */}
                    <span
                      className="mt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30"
                    >
                      {p.phase}
                    </span>

                    {/* Phase title */}
                    <span
                      className="mt-1 text-sm font-semibold text-white/70"
                    >
                      {_(p.titleZh, p.titleEn)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom film leader edge */}
            <div
              className="absolute -bottom-[2px] left-0 right-0 h-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.06) 50%, transparent 95%)",
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* ─── Reduced motion fallback ──────────────────────────────────── */}
      {reduce && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl px-6">
            {PHASES.map((p) => (
              <motion.div
                key={p.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${p.accentMuted} 0%, rgba(255,255,255,0.01) 100%)`,
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "2px",
                  padding: "28px 24px",
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{
                    background: `linear-gradient(90deg, transparent 10%, ${p.accent}60 50%, transparent 90%)`,
                  }}
                />

                <span
                  className="text-[42px] font-bold leading-none tracking-tighter block mb-4"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: `1px ${p.accent}40`,
                  }}
                >
                  {p.number}
                </span>

                <span
                  className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-2"
                  style={{ color: p.accent }}
                >
                  {p.date} · {p.phase}
                </span>

                <h4 className="text-lg font-bold text-white mb-2">
                  {_(p.titleZh, p.titleEn)}
                </h4>

                <p className="text-[13px] leading-relaxed text-white/50">
                  {_(p.descZh, p.descEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
