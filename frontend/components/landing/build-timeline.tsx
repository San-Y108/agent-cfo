"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useApp } from "@/lib/i18n/context";
import { Rocket, Plug, Sparkles, Flag } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type Phase = {
  date: string;
  phase: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  accent: string;
  icon: React.ElementType;
};

const PHASES: Phase[] = [
  {
    date: "2026-06-08",
    phase: "Phase 0",
    titleZh: "启动对齐",
    titleEn: "Kickoff",
    descZh: "仓库创建、团队分工、后端 P0 API 与前端脚手架",
    descEn: "Repo created, team roles, backend P0 APIs and frontend scaffold",
    accent: "#5EEAD4",
    icon: Rocket,
  },
  {
    date: "2026-06-09",
    phase: "Phase 1",
    titleZh: "核心联调",
    titleEn: "Core Integration",
    descZh: "P0 API 前后端联调、CAW 测试网执行、Vercel 部署",
    descEn: "P0 API integration, CAW testnet execution, Vercel deploy",
    accent: "#60A5FA",
    icon: Plug,
  },
  {
    date: "2026-06-10",
    phase: "Phase 2",
    titleZh: "打磨冲刺",
    titleEn: "Polish Sprint",
    descZh: "Landing 视觉优化、Console 组件打磨、Demo 彩排",
    descEn: "Landing visual polish, Console component refinement, demo rehearsal",
    accent: "#B5FF4D",
    icon: Sparkles,
  },
  {
    date: "2026-06-12",
    phase: "Phase 3",
    titleZh: "冻结提交",
    titleEn: "Freeze & Submit",
    descZh: "功能冻结、最终彩排、提交材料整理",
    descEn: "Feature freeze, final rehearsal, submission package",
    accent: "#C084FC",
    icon: Flag,
  },
];

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

      // Initial states
      frames.forEach((frame, i) => {
        gsap.set(frame, {
          scale: i === 0 ? 1 : 0.85,
          opacity: i === 0 ? 1 : 0.35,
          filter: i === 0 ? "brightness(1)" : "brightness(0.5)",
        });
      });

      texts.forEach((text, i) => {
        gsap.set(text, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 24,
        });
      });

      // Build transitions for each phase switch
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${frames.length * 80}%`,
          pin: true,
          scrub: 0.6,
          snap: {
            snapTo: 1 / (frames.length - 1),
            duration: { min: 0.15, max: 0.35 },
            delay: 0,
            ease: "power1.inOut",
          },
        },
      });

      for (let i = 0; i < frames.length - 1; i++) {
        const slot = (i + 1) / (frames.length - 1);

        // deactivate current frame
        tl.to(
          frames[i],
          {
            scale: 0.85,
            opacity: 0.35,
            filter: "brightness(0.5)",
            duration: 0.25,
            ease: "power2.inOut",
          },
          slot - 0.12
        );

        // activate next frame
        tl.to(
          frames[i + 1],
          {
            scale: 1,
            opacity: 1,
            filter: "brightness(1)",
            duration: 0.25,
            ease: "power2.inOut",
          },
          slot - 0.12
        );

        // hide current text
        tl.to(
          texts[i],
          {
            opacity: 0,
            y: -18,
            duration: 0.2,
            ease: "power2.in",
          },
          slot - 0.12
        );

        // show next text
        tl.fromTo(
          texts[i + 1],
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
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
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 w-full max-w-5xl">
          {/* Left text area */}
          <div className="relative w-full lg:w-[420px] h-[160px] lg:h-[180px]">
            {PHASES.map((p, i) => (
              <div
                key={p.phase}
                ref={(el) => {
                  textRefs.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-center text-center lg:text-left"
              >
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-[0.15em]"
                  style={{ color: p.accent }}
                >
                  {p.date} · {p.phase}
                </span>
                <h4 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  {_(p.titleZh, p.titleEn)}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {_(p.descZh, p.descEn)}
                </p>
              </div>
            ))}
          </div>

          {/* Film strip */}
          <div
            className="relative w-[260px] h-[380px] md:w-[280px] md:h-[420px] rounded-xl overflow-hidden"
            style={{
              background: `
                repeating-linear-gradient(
                  to bottom,
                  transparent 0px,
                  transparent 10px,
                  #0D0D0D 10px,
                  #0D0D0D 18px
                ) left / 18px 100% no-repeat,
                repeating-linear-gradient(
                  to bottom,
                  transparent 0px,
                  transparent 10px,
                  #0D0D0D 10px,
                  #0D0D0D 18px
                ) right / 18px 100% no-repeat,
                rgba(255,255,255,0.03)
              `,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute inset-x-5 inset-y-4 flex flex-col gap-3">
              {PHASES.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.phase}
                    ref={(el) => {
                      frameRefs.current[i] = el;
                    }}
                    className="relative flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center p-4"
                  >
                    <div
                      className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3"
                      style={{
                        backgroundColor: `${p.accent}12`,
                        boxShadow: `0 0 20px ${p.accent}18`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: p.accent }} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {p.phase}
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5">
                      {_(p.titleZh, p.titleEn)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reduced motion fallback: show static layout */}
      {reduce && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl px-6">
            {PHASES.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.phase}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <Icon className="w-5 h-5 mb-3" style={{ color: p.accent }} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    {p.date}
                  </span>
                  <h4 className="mt-1 text-base font-bold text-white">
                    {_(p.titleZh, p.titleEn)}
                  </h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                    {_(p.descZh, p.descEn)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
