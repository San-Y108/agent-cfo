"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Rocket, Server, Layout, Wallet, Palette } from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * TeamShowcase — "Built by" fan-card section.
 * Mechanic borrowed from good-idea 05a (directional fan-hover): hovering a card
 * straightens + lifts it while neighbours tilt away. Re-themed to the AgentCFO
 * dark + lime language; original colors/photos discarded.
 *
 * Avatar slots are intentional placeholders — swap the icon block for a real
 * team photo when available (see AVATAR PLACEHOLDER below).
 */

type Member = {
  roleZh: string;
  roleEn: string;
  handle: string;
  contribZh: string;
  contribEn: string;
  accent: string;
  icon: React.ElementType;
};

const MEMBERS: Member[] = [
  {
    roleZh: "交付 / 总控",
    roleEn: "Delivery & Ops",
    handle: "San-Y108",
    contribZh: "项目统筹、路演与最终交付",
    contribEn: "Coordination, pitch and final delivery",
    accent: "#B5FF4D",
    icon: Rocket,
  },
  {
    roleZh: "后端 / Agent",
    roleEn: "Backend & Agent",
    handle: "W5W8L9jlu",
    contribZh: "FastAPI 付款计划与风险引擎",
    contribEn: "FastAPI payment plans and risk engine",
    accent: "#5EEAD4",
    icon: Server,
  },
  {
    roleZh: "前端",
    roleEn: "Frontend",
    handle: "Aafff623",
    contribZh: "产品界面与 Mock 演示模式",
    contribEn: "Product UI and mock demo mode",
    accent: "#60A5FA",
    icon: Layout,
  },
  {
    roleZh: "合约 / CAW",
    roleEn: "Contracts & CAW",
    handle: "gitgdut",
    contribZh: "Cobo Agentic Wallet 测试网执行",
    contribEn: "Cobo Agentic Wallet testnet execution",
    accent: "#C084FC",
    icon: Wallet,
  },
  {
    roleZh: "物料 / 设计",
    roleEn: "Design & Content",
    handle: "Eloise-qiu",
    contribZh: "PPT、视频与视觉物料",
    contribEn: "Slides, video and visual assets",
    accent: "#FB7185",
    icon: Palette,
  },
];

export function TeamShowcase() {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  // 05a essence: hovered card straightens, earlier cards tilt one way,
  // later cards tilt the other. Flat row when nothing is focused.
  const rotationFor = (i: number) => {
    if (reduce || hovered === null) return 0;
    if (i === hovered) return 0;
    return i < hovered ? 16 : -16;
  };

  return (
    <section
      className="relative w-full px-6 py-24 lg:py-32"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading (no eyebrow — page already carries enough) */}
        <div className="mx-auto mb-14 max-w-2xl text-center lg:mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {_("由这支团队打造", "Built by the team")}
          </h2>
          <p className="mt-4 text-sm text-white/50 md:text-base">
            {_(
              "五个角色，一条受控的资金流水线。把贡献记录变成可审计的链上结算。",
              "Five roles, one controlled money pipeline. From contribution records to auditable settlement."
            )}
          </p>
        </div>

        {/* ── Desktop fan row ── */}
        <div
          className="hidden md:flex md:items-stretch md:justify-center md:gap-4"
          style={{ perspective: 1400 }}
          onMouseLeave={() => setHovered(null)}
        >
          {MEMBERS.map((m, i) => {
            const active = hovered === i;
            return (
              <motion.article
                key={m.handle}
                onMouseEnter={() => setHovered(i)}
                animate={{
                  rotateY: rotationFor(i),
                  scale: active ? 1.07 : 1,
                  z: active ? 80 : 0,
                }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                className={cn(
                  "relative flex h-[340px] w-[200px] flex-col overflow-hidden rounded-2xl border p-5 text-left transition-colors duration-300",
                  active
                    ? "border-transparent bg-surface"
                    : "border-white/[0.06] bg-white/[0.02]"
                )}
              >
                {/* active glow ring in the role accent */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                  style={{
                    opacity: active ? 1 : 0,
                    boxShadow: `inset 0 0 0 1px ${m.accent}66, 0 18px 50px -12px ${m.accent}40`,
                  }}
                />
                {/* corner accent wash */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300"
                  style={{ backgroundColor: m.accent, opacity: active ? 0.14 : 0.05 }}
                />

                {/* AVATAR PLACEHOLDER — swap this block for a real team photo */}
                <div className="relative">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-2"
                    style={{ boxShadow: `inset 0 0 0 1px ${m.accent}40` }}
                  >
                    <m.icon className="h-6 w-6" style={{ color: m.accent }} strokeWidth={1.5} />
                  </div>
                  {/* TODO: replace icon avatar with <img> of the real teammate */}
                </div>

                {/* Role + handle */}
                <div className="mt-5">
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.16em]"
                    style={{ fontFamily: "'Courier New', Courier, monospace", color: m.accent }}
                  >
                    {_(m.roleZh, m.roleEn)}
                  </div>
                  <div className="mt-1.5 text-base font-semibold text-white">{m.handle}</div>
                </div>

                {/* Contribution — emphasised on hover */}
                <div className="mt-auto">
                  <motion.div
                    aria-hidden={!active}
                    animate={{ opacity: active ? 1 : 0.4, y: active ? 0 : 6 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span
                      className="mb-2 block h-px w-8 origin-left transition-transform duration-300"
                      style={{ backgroundColor: m.accent, transform: active ? "scaleX(2.2)" : "scaleX(1)" }}
                    />
                    <p className="text-[12px] leading-relaxed text-white/60">
                      {_(m.contribZh, m.contribEn)}
                    </p>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ── Mobile stacked cards (no 3D) ── */}
        <div className="flex flex-col gap-3 md:hidden">
          {MEMBERS.map((m) => (
            <article
              key={m.handle}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              {/* AVATAR PLACEHOLDER — swap for real photo */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2"
                style={{ boxShadow: `inset 0 0 0 1px ${m.accent}40` }}
              >
                <m.icon className="h-5 w-5" style={{ color: m.accent }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ fontFamily: "'Courier New', Courier, monospace", color: m.accent }}
                >
                  {_(m.roleZh, m.roleEn)}
                </div>
                <div className="text-sm font-semibold text-white">{m.handle}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                  {_(m.contribZh, m.contribEn)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
