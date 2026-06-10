"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Rocket, Server, Layout, Wallet, Palette } from "lucide-react";
import { useApp } from "@/lib/i18n/context";

/* ========================================================================
 * TeamShowcase — "Built by" fan-card section (taste-skill polished)
 * ========================================================================
 * Good-idea 05a essence: directional fan-focus on hover.
 * taste-skill upgrades:
 *   - glassmorphism card shells with liquid-glass edge refraction
 *   - conic-gradient rotating avatar rings (each member gets a unique spin)
 *   - glowing connection lines between cards (team = connected)
 *   - text-scramble decode on handle reveal
 *   - dramatic stagger entrance from centre outward
 *   - hovered card flies forward; neighbours dim + recede
 */

type Member = {
  roleZh: string;
  roleEn: string;
  handle: string;
  contribZh: string;
  contribEn: string;
  accent: string;
  icon: React.ElementType;
  ringSpeed: number; // seconds per rotation (unique per card)
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
    ringSpeed: 4,
  },
  {
    roleZh: "后端 / Agent",
    roleEn: "Backend & Agent",
    handle: "W5W8L9jlu",
    contribZh: "FastAPI 付款计划与风险引擎",
    contribEn: "FastAPI payment plans and risk engine",
    accent: "#5EEAD4",
    icon: Server,
    ringSpeed: 5,
  },
  {
    roleZh: "前端",
    roleEn: "Frontend",
    handle: "Aafff623",
    contribZh: "产品界面与 Mock 演示模式",
    contribEn: "Product UI and mock demo mode",
    accent: "#60A5FA",
    icon: Layout,
    ringSpeed: 6,
  },
  {
    roleZh: "合约 / CAW",
    roleEn: "Contracts & CAW",
    handle: "gitgdut",
    contribZh: "Cobo Agentic Wallet 测试网执行",
    contribEn: "Cobo Agentic Wallet testnet execution",
    accent: "#C084FC",
    icon: Wallet,
    ringSpeed: 7,
  },
  {
    roleZh: "物料 / 设计",
    roleEn: "Design & Content",
    handle: "Eloise-qiu",
    contribZh: "PPT、视频与视觉物料",
    contribEn: "Slides, video and visual assets",
    accent: "#FB7185",
    icon: Palette,
    ringSpeed: 8,
  },
];

/* ── Text Scramble Hook ─────────────────────────────────────────────── */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

function useScramble(target: string, trigger: boolean, duration = 800) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!trigger) { setDisplay(target); return; }
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const revealed = Math.floor(progress * target.length);

      let s = "";
      for (let i = 0; i < target.length; i++) {
        if (i < revealed) {
          s += target[i];
        } else {
          s += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(s);

      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);

  return display;
}

/* ── Rotating Ring Avatar ───────────────────────────────────────────── */
function AvatarRing({
  accent,
  icon: Icon,
  speed,
  active,
}: {
  accent: string;
  icon: React.ElementType;
  speed: number;
  active: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center">
      {/* rotating conic ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: `conic-gradient(from 0deg, ${accent}00, ${accent}60, ${accent}, ${accent}60, ${accent}00)`,
          filter: active ? "blur(1px)" : "blur(0.5px)",
          opacity: active ? 1 : 0.5,
        }}
      />
      {/* inner glass disc */}
      <div
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`,
          backdropFilter: "blur(8px)",
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.1), 0 0 20px ${accent}30`,
        }}
      >
        <Icon className="h-6 w-6" style={{ color: accent }} strokeWidth={1.5} />
      </div>
    </div>
  );
}

/* ── Connection Line between cards ──────────────────────────────────── */
function ConnectionLine({
  active,
  accent,
}: {
  active: boolean;
  accent: string;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[60px] h-px w-8 -translate-x-1/2"
      style={{
        background: active
          ? `linear-gradient(90deg, transparent, ${accent}, transparent)`
          : `linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)`,
      }}
      animate={{ opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.4 }}
    />
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export function TeamShowcase() {
  const { lang } = useApp();
  const _ = useCallback(
    (zh: string, en: string) => (lang === "zh" ? zh : en),
    [lang]
  );
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  // Default fan spread: cards open like a hand fan
  //   outer → inner: 22° → 10° → 0° → -10° → -22°
  const DEFAULT_ROTATIONS = [22, 10, 0, -10, -22];

  const rotationFor = (i: number) => {
    if (reduce) return 0;
    if (hovered === null) return DEFAULT_ROTATIONS[i] ?? 0;
    if (i === hovered) return 0;
    return i < hovered ? 12 : -12;
  };

  const translateZFor = (i: number) => {
    if (reduce || hovered === null) return 0;
    if (i === hovered) return 100;
    return -40;
  };

  const opacityFor = (i: number) => {
    if (reduce || hovered === null) return 1;
    if (i === hovered) return 1;
    return 0.45;
  };

  return (
    <section
      className="relative w-full overflow-hidden px-6 py-16 lg:py-20"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* subtle background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {_("由这支团队打造", "Built by the team")}
          </h2>
          <p className="mt-4 text-sm text-white/50 md:text-base">
            {_(
              "五个角色，一条受控的资金流水线。",
              "Five roles, one controlled money pipeline."
            )}
          </p>
        </motion.div>

        {/* ── Desktop Fan Row ── */}
        <div
          className="hidden md:flex md:items-stretch md:justify-center md:gap-5"
          style={{ perspective: 1600 }}
          onMouseLeave={() => setHovered(null)}
        >
          {MEMBERS.map((m, i) => {
            const active = hovered === i;
            const scrambleHandle = useScramble(m.handle, active);

            return (
              <motion.article
                key={m.handle}
                onMouseEnter={() => setHovered(i)}
                initial={reduce ? false : { opacity: 0, y: 50, rotateY: DEFAULT_ROTATIONS[i] * 1.5 }}
                whileInView={{ opacity: 1, y: 0, rotateY: DEFAULT_ROTATIONS[i] }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                animate={{
                  rotateY: rotationFor(i),
                  scale: active ? 1.08 : 1,
                  z: translateZFor(i),
                  opacity: opacityFor(i),
                }}
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
                className="relative flex h-[380px] w-[190px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left"
              >
                {/* liquid-glass edge refraction */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background: active
                      ? `linear-gradient(135deg, ${m.accent}08, transparent 60%)`
                      : "transparent",
                    boxShadow: active
                      ? `inset 0 1px 0 ${m.accent}40, inset 0 -1px 0 ${m.accent}15, 0 20px 60px -15px ${m.accent}35`
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />

                {/* connection line to next card */}
                {i < MEMBERS.length - 1 && (
                  <ConnectionLine active={active} accent={m.accent} />
                )}

                {/* Avatar with rotating ring */}
                <div className="relative z-10">
                  <AvatarRing
                    accent={m.accent}
                    icon={m.icon}
                    speed={m.ringSpeed}
                    active={active}
                  />
                </div>

                {/* Role + Handle (scrambled on hover) */}
                <div className="relative z-10 mt-6">
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      color: m.accent,
                    }}
                  >
                    {_(m.roleZh, m.roleEn)}
                  </div>
                  <div
                    className="mt-2 font-mono text-base font-bold text-white"
                    style={{ minHeight: "1.5rem" }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={active ? "scramble" : "plain"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {active ? scrambleHandle : m.handle}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Contribution — slides up on hover */}
                <div className="relative z-10 mt-auto">
                  <motion.div
                    animate={{
                      opacity: active ? 1 : 0.35,
                      y: active ? 0 : 10,
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span
                      className="mb-2 block h-px w-10 origin-left"
                      style={{
                        backgroundColor: m.accent,
                        transform: active ? "scaleX(2.5)" : "scaleX(1)",
                        transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                    <p className="text-[11px] leading-relaxed text-white/60">
                      {_(m.contribZh, m.contribEn)}
                    </p>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ── Mobile Stacked ── */}
        <div className="flex flex-col gap-3 md:hidden">
          {MEMBERS.map((m, i) => (
            <motion.article
              key={m.handle}
              initial={reduce ? false : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, ${m.accent}00, ${m.accent}50, ${m.accent}, ${m.accent}50, ${m.accent}00)`,
                    opacity: 0.6,
                  }}
                />
                <div
                  className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`,
                  }}
                >
                  <m.icon
                    className="h-5 w-5"
                    style={{ color: m.accent }}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    color: m.accent,
                  }}
                >
                  {_(m.roleZh, m.roleEn)}
                </div>
                <div className="text-sm font-bold text-white">{m.handle}</div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/55">
                  {_(m.contribZh, m.contribEn)}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
