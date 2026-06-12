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
  img: string;
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
    img: "/timeline/phase-01-kickoff.png",
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
    img: "/timeline/phase-02-integration.png",
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
    img: "/timeline/phase-03-polish.png",
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
    img: "/timeline/phase-04-submit.png",
  },
];

/**
 * Cinematic film-grain overlay using SVG noise filter.
 * Applied to the filmstrip container for texture.
 */
function FilmGrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.05] z-10 mix-blend-overlay"
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
function SprocketStrip({ side = "left" }: { side?: "left" | "right" }) {
  return (
    <div
      className="absolute top-0 bottom-0 w-[26px] flex flex-col items-center py-3 gap-[13px]"
      style={{
        background: "linear-gradient(180deg, rgba(5,5,5,0.99) 0%, rgba(9,9,9,0.99) 100%)",
        borderRight: side === "left" ? "1px solid rgba(255,255,255,0.09)" : undefined,
        borderLeft: side === "right" ? "1px solid rgba(255,255,255,0.09)" : undefined,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="w-[8px] h-[11px]"
          style={{
            borderRadius: "9999px",
            backgroundColor: "rgba(0,0,0,0.97)",
            boxShadow:
              "0 0 0 1.5px rgba(255,255,255,0.24), inset 0 1px 3px rgba(0,0,0,1), inset 0 -1px 2px rgba(0,0,0,0.8)",
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

      const viewport = sectionRef.current?.querySelector(".timeline-viewport") as HTMLElement | null;
      if (!viewport) return;

      // Use yPercent (CSS translateY %) — avoids GSAP pixel-calc issues during hydration
      frames.forEach((frame, i) => {
        gsap.set(frame, {
          opacity: i === 0 ? 1 : 0,
          yPercent: i === 0 ? 0 : 110,
          rotateX: i === 0 ? 0 : -18,
          transformOrigin: "center bottom",
          filter: i === 0 ? "brightness(1) contrast(1)" : "brightness(0.6) contrast(1.1)",
        });
      });

      texts.forEach((text, i) => {
        gsap.set(text, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 20,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: viewport,
          scrub: 0.3,
          onLeave: () => {
            frames.forEach((f) => gsap.set(f, { opacity: 0 }));
            texts.forEach((t) => gsap.set(t, { opacity: 0 }));
          },
          onLeaveBack: () => {
            frames.forEach((f, i) =>
              gsap.set(f, {
                opacity: i === 0 ? 1 : 0,
                yPercent: i === 0 ? 0 : 110,
                rotateX: i === 0 ? 0 : -18,
              })
            );
            texts.forEach((t, i) =>
              gsap.set(t, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 })
            );
          },
          snap: {
            snapTo: 1 / (frames.length - 1),
            duration: { min: 0.15, max: 0.3 },
            delay: 0.05,
            ease: "power1.out",
          },
        },
      });

      for (let i = 0; i < frames.length - 1; i++) {
        const slot = (i + 1) / (frames.length - 1);

        // Frame roll-out: old frame rolls UP and away
        tl.to(
          frames[i],
          {
            yPercent: -110,
            rotateX: 18,
            transformOrigin: "center top",
            opacity: 0,
            filter: "brightness(0.5) contrast(1.1)",
            duration: 0.15,
            ease: "power2.in",
          },
          slot - 0.07
        );

        // Frame roll-in: new frame rolls UP from below
        tl.fromTo(
          frames[i + 1],
          {
            yPercent: 110,
            rotateX: -18,
            transformOrigin: "center bottom",
            opacity: 0,
            filter: "brightness(0.5) contrast(1.1)",
          },
          {
            yPercent: 0,
            rotateX: 0,
            transformOrigin: "center center",
            opacity: 1,
            filter: "brightness(1) contrast(1)",
            duration: 0.17,
            ease: "power2.out",
          },
          slot - 0.04
        );

        // Text transition
        tl.to(
          texts[i],
          { opacity: 0, y: -20, duration: 0.1, ease: "power1.in" },
          slot - 0.05
        );
        tl.fromTo(
          texts[i + 1],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.12, ease: "power1.out" },
          slot - 0.03
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
      {/* ─── Main cinematic viewport (pinned by ScrollTrigger) ───────── */}
      <div className="timeline-viewport h-screen w-full flex items-center justify-center px-6 md:px-12 lg:px-20">
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
                  className="mt-3 text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.1]"
                  style={{
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                    textShadow: `0 0 28px ${p.accent}50, 0 2px 12px rgba(0,0,0,0.5)`,
                  }}
                >
                  <span
                    style={{
                      background: `linear-gradient(135deg, #ffffff 0%, ${p.accent} 65%)`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {_(p.titleZh, p.titleEn)}
                  </span>
                </h4>

                {/* Description */}
                <p className="mt-4 text-sm md:text-[15px] leading-relaxed text-white/95 max-w-md">
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
            {/* Corner bracket decorations — projector frame feel */}
            {(["tl","tr","bl","br"] as const).map((pos) => (
              <div
                key={pos}
                className="absolute z-20 w-5 h-5 pointer-events-none"
                style={{
                  top: pos.startsWith("t") ? -3 : undefined,
                  bottom: pos.startsWith("b") ? -3 : undefined,
                  left: pos.endsWith("l") ? -3 : undefined,
                  right: pos.endsWith("r") ? -3 : undefined,
                  borderTop: pos.startsWith("t") ? "2px solid rgba(255,255,255,0.32)" : undefined,
                  borderBottom: pos.startsWith("b") ? "2px solid rgba(255,255,255,0.32)" : undefined,
                  borderLeft: pos.endsWith("l") ? "2px solid rgba(255,255,255,0.32)" : undefined,
                  borderRight: pos.endsWith("r") ? "2px solid rgba(255,255,255,0.32)" : undefined,
                }}
                aria-hidden="true"
              />
            ))}

            {/* Filmstrip container */}
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(10,10,10,0.99) 0%, rgba(16,16,16,0.99) 100%)",
                border: "1px solid rgba(255,255,255,0.17)",
                borderRadius: "2px",
                boxShadow: `
                  0 0 0 1px rgba(0,0,0,0.98),
                  0 0 80px rgba(0,0,0,0.7),
                  0 20px 60px rgba(0,0,0,0.5),
                  0 40px 120px rgba(0,0,0,0.35),
                  inset 0 0 80px rgba(0,0,0,0.45),
                  inset 0 1px 0 rgba(255,255,255,0.06)
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
                <SprocketStrip side="left" />
              </div>

              {/* Right sprocket strip */}
              <div className="absolute right-0 z-[6]">
                <SprocketStrip side="right" />
              </div>

              {/* Film frames — stacked absolutely, only active frame visible */}
              <div className="absolute inset-x-[28px] inset-y-3" style={{ perspective: 900, transformStyle: "preserve-3d" }}>
                {PHASES.map((p, i) => (
                  <div
                    key={p.phase}
                    ref={(el) => {
                      frameRefs.current[i] = el;
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
                    style={{
                      background: `
                        linear-gradient(135deg, ${p.accentMuted} 0%, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.15) 100%)
                      `,
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: "16px",
                      opacity: i === 0 ? 1 : 0,
                    }}
                  >
                    {/* Phase image — vivid, bright, high contrast */}
                    <img
                      src={p.img}
                      alt={_(p.titleZh, p.titleEn)}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        opacity: 1,
                        filter: "brightness(1.25) saturate(1.35) contrast(1.15)",
                        borderRadius: "16px",
                      }}
                      loading="eager"
                    />

                    {/* Outer edge vignette */}
                    <div
                      className="absolute inset-0 pointer-events-none z-[2]"
                      style={{
                        borderRadius: "16px",
                        background: `
                          radial-gradient(ellipse 70% 65% at 50% 50%, transparent 50%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.55) 100%)
                        `,
                      }}
                      aria-hidden="true"
                    />

                    {/* Light center haze */}
                    <div
                      className="absolute inset-0 pointer-events-none z-[3]"
                      style={{
                        borderRadius: "16px",
                        background: `
                          radial-gradient(ellipse 45% 40% at 50% 50%, rgba(0,0,0,0.15) 0%, transparent 65%)
                        `,
                      }}
                      aria-hidden="true"
                    />

                    {/* Accent edge glow */}
                    <div
                      className="absolute inset-0 pointer-events-none z-[4]"
                      style={{
                        borderRadius: "16px",
                        background: `
                          radial-gradient(ellipse 85% 75% at 50% 50%, transparent 60%, ${p.accent}22 78%, ${p.accent}0d 100%)
                        `,
                      }}
                      aria-hidden="true"
                    />

                    {/* Frame border glow */}
                    <div
                      className="absolute inset-0 pointer-events-none z-[5]"
                      style={{
                        borderRadius: "16px",
                        boxShadow: `inset 0 0 30px ${p.accent}20, inset 0 0 60px ${p.accent}10, 0 0 40px ${p.accent}08`,
                      }}
                      aria-hidden="true"
                    />

                    {/* Left edge label — moved from center to left of the film frame */}
                    <div className="absolute left-2 top-1/2 z-10 flex -translate-y-1/2 flex-col items-start gap-1">
                      {/* Phase number */}
                      <span
                        className="text-[32px] font-bold leading-none tracking-tighter md:text-[40px]"
                        style={{
                          color: p.accent,
                          textShadow: `0 0 20px ${p.accent}80, 0 0 40px ${p.accent}40`,
                          opacity: 1,
                        }}
                      >
                        {p.number}
                      </span>

                      {/* Phase label */}
                      <span
                        className="text-[9px] font-mono uppercase tracking-[0.2em]"
                        style={{
                          color: `${p.accent}DD`,
                          textShadow: `0 0 8px ${p.accent}60`,
                        }}
                      >
                        {p.phase}
                      </span>

                      {/* Phase title */}
                      <span
                        className="text-[13px] font-extrabold leading-tight"
                        style={{
                          background: `linear-gradient(135deg, #ffffff 0%, ${p.accent} 60%)`,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: `drop-shadow(0 0 8px ${p.accent}70)`,
                        }}
                      >
                        {_(p.titleZh, p.titleEn)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom film leader edge */}
            <div
              className="absolute -bottom-[2px] left-0 right-0 h-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.12) 50%, transparent 95%)",
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
                  border: "1px solid rgba(255,255,255,0.12)",
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

                <h4
                  className="text-lg font-bold mb-2"
                  style={{
                    background: `linear-gradient(135deg, #ffffff 30%, ${p.accent} 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {_(p.titleZh, p.titleEn)}
                </h4>

                <p className="text-[13px] leading-relaxed text-white/90 italic">
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
