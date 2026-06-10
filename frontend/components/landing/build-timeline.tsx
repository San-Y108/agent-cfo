"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useApp } from "@/lib/i18n/context";

type Phase = {
  date: string;
  phase: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  accent: string;
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
  },
  {
    date: "2026-06-09",
    phase: "Phase 1",
    titleZh: "核心联调",
    titleEn: "Core Integration",
    descZh: "P0 API 前后端联调、CAW 测试网执行、Vercel 部署",
    descEn: "P0 API integration, CAW testnet execution, Vercel deploy",
    accent: "#60A5FA",
  },
  {
    date: "2026-06-10",
    phase: "Phase 2",
    titleZh: "打磨冲刺",
    titleEn: "Polish Sprint",
    descZh: "Landing 视觉优化、Console 组件打磨、Demo 彩排",
    descEn: "Landing visual polish, Console component refinement, demo rehearsal",
    accent: "#B5FF4D",
  },
  {
    date: "2026-06-12",
    phase: "Phase 3",
    titleZh: "冻结提交",
    titleEn: "Freeze & Submit",
    descZh: "功能冻结、最终彩排、提交材料整理",
    descEn: "Feature freeze, final rehearsal, submission package",
    accent: "#C084FC",
  },
];

export function BuildTimeline() {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full px-6 py-16 lg:py-24" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mx-auto max-w-5xl">
        {/* heading */}
        <div className="mb-12 text-center lg:mb-16">
          <h3 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            {_("构建时间线", "Build Timeline")}
          </h3>
          <p className="mt-3 text-sm text-white/50">
            {_("从启动到提交的完整旅程", "The full journey from kickoff to submission")}
          </p>
        </div>

        {/* desktop horizontal */}
        <div className="hidden md:block">
          <div className="relative flex items-start justify-between">
            {/* connecting line */}
            <div
              className="absolute left-0 right-0 top-[7px] h-px"
              style={{
                background: "linear-gradient(to right, #5EEAD4, #60A5FA, #B5FF4D, #C084FC)",
                opacity: 0.3,
              }}
            />

            {PHASES.map((p, i) => (
              <motion.div
                key={p.phase}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex w-[22%] flex-col items-center text-center"
              >
                {/* dot */}
                <div
                  className="mb-4 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: p.accent,
                    boxShadow: `0 0 12px ${p.accent}60`,
                  }}
                />
                {/* date */}
                <span
                  className="mb-1 text-[10px] font-mono font-bold uppercase tracking-[0.15em]"
                  style={{ color: p.accent }}
                >
                  {p.date}
                </span>
                {/* phase */}
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  {p.phase}
                </span>
                {/* title */}
                <h4 className="mt-2 text-base font-bold text-white">{_(p.titleZh, p.titleEn)}</h4>
                {/* desc */}
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
                  {_(p.descZh, p.descEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* mobile vertical stack */}
        <div className="flex flex-col gap-6 md:hidden">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.phase}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div
                className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: p.accent,
                  boxShadow: `0 0 10px ${p.accent}50`,
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-[0.12em]"
                    style={{ color: p.accent }}
                  >
                    {p.date}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
                    {p.phase}
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-bold text-white">{_(p.titleZh, p.titleEn)}</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                  {_(p.descZh, p.descEn)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
