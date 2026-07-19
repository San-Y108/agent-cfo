"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Rocket, Server, Layout, Wallet, Palette, Crown } from "lucide-react";
import { useApp } from "@/lib/i18n/context";

/* ========================================================================
 * TeamShowcase — Constellation Pentagon Layout
 * ========================================================================
 * Design: 5 core members orbit around a central mentor card.
 * Metaphor: The mentor is the gravitational center; team members are
 * connected nodes forming a complete system.
 *
 * Layout:
 *   - Desktop (lg+): Pentagon constellation with SVG connection lines
 *   - Tablet (md): 3x2 grid, mentor spans 2 columns
 *   - Mobile (sm): Single column, mentor first
 */

type Member = {
  roleZh: string;
  roleEn: string;
  name: string;
  contribZh: string;
  contribEn: string;
  accent: string;
  icon: React.ElementType;
  ringSpeed: number;
  avatar: string;
  mascot: string;
  isMentor?: boolean;
};

const MEMBERS: Member[] = [
  {
    roleZh: "交付 / 总控",
    roleEn: "Delivery & Ops",
    name: "欢",
    contribZh: "项目统筹、路演与最终交付",
    contribEn: "Coordination, pitch and final delivery",
    accent: "#B5FF4D",
    icon: Rocket,
    ringSpeed: 4,
    avatar: "/team/avatar-san-y108.jpg",
    mascot: "/console/mascots/huan-mascot.png",
  },
  {
    roleZh: "后端 / Agent",
    roleEn: "Backend & Agent",
    name: "九九八乂",
    contribZh: "FastAPI 付款计划与风险引擎",
    contribEn: "FastAPI payment plans and risk engine",
    accent: "#5EEAD4",
    icon: Server,
    ringSpeed: 5,
    avatar: "/team/avatar-w5w8l9jlu.jpg",
    mascot: "/console/mascots/jiujiu-mascot.png",
  },
  {
    roleZh: "前端",
    roleEn: "Frontend",
    name: "threetwoa",
    contribZh: "产品界面与 Mock 演示模式",
    contribEn: "Product UI and mock demo mode",
    accent: "#60A5FA",
    icon: Layout,
    ringSpeed: 6,
    avatar: "/team/avatar-aafff623.jpg",
    mascot: "/console/mascots/threetwoa-mascot.png",
  },
  {
    roleZh: "合约 / CAW",
    roleEn: "Contracts & CAW",
    name: "purple sun",
    contribZh: "Cobo Agentic Wallet 测试网执行",
    contribEn: "Cobo Agentic Wallet testnet execution",
    accent: "#C084FC",
    icon: Wallet,
    ringSpeed: 7,
    avatar: "/team/avatar-gitgdut.jpg",
    mascot: "/console/mascots/purple-sun-mascot.png",
  },
  {
    roleZh: "物料 / 设计",
    roleEn: "Design & Content",
    name: "呱呱",
    contribZh: "PPT、视频与视觉物料",
    contribEn: "Slides, video and visual assets",
    accent: "#FB7185",
    icon: Palette,
    ringSpeed: 8,
    avatar: "/team/avatar-eloise-qiu.jpg",
    mascot: "/console/mascots/guagua-mascot.png",
  },
];

const MENTOR: Member = {
  roleZh: "导师",
  roleEn: "Mentor",
  name: "ZanyK",
  contribZh: "去年 Hackathon 参赛者，指导团队度过混沌",
  contribEn: "Last year's hackathon veteran, guiding the team through the chaos",
  accent: "#FFD700",
  icon: Crown,
  ringSpeed: 3,
  avatar: "/team/avatar-mentor-zanyk.jpg",
  mascot: "/console/mascots/zanyk-mascot.png",
  isMentor: true,
};

/* Letter colors for TEAM — each letter has its own identity */
const TEAM_LETTERS = [
  { char: "T", color: "#FB7185", glow: "rgba(251,113,133,0.6)" },
  { char: "E", color: "#5EEAD4", glow: "rgba(94,234,212,0.6)" },
  { char: "A", color: "#60A5FA", glow: "rgba(96,165,250,0.6)" },
  { char: "M", color: "#B5FF4D", glow: "rgba(181,255,77,0.6)" },
];

function AnimatedTeamWord() {
  return (
    <span className="inline-flex items-baseline">
      {TEAM_LETTERS.map((l, i) => (
        <span
          key={i}
          className="inline-block animate-team-letter"
          style={{
            background: `linear-gradient(90deg, #ffffff, ${l.color}, #ffffff, ${l.color})`,
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 22px ${l.glow}) drop-shadow(0 0 42px ${l.glow})`,
            animationDelay: `${i * 0.18}s`,
          }}
        >
          {l.char}
        </span>
      ))}
      <span className="text-white/90">.</span>
    </span>
  );
}

/* Which side panel shows detail for each member index (left=opposite of member's position) */
const DETAIL_SIDE: ("left" | "right")[] = ["right", "left", "left", "right", "right"];

/* Pentagon vertex coordinates (radius = 270, starting from top) */
const PENTAGON_R = 270;
const PENTAGON_COORDS = [
  { x: 0, y: -PENTAGON_R },           // Top
  { x: 257, y: -84 },                 // Top-right
  { x: 158, y: 219 },                 // Bottom-right
  { x: -158, y: 219 },                // Bottom-left
  { x: -257, y: -84 },                // Top-left
];

/* ── Avatar with rotating ring + mascot reveal ─────────────────────────── */
function AvatarRing({
  accent,
  avatar,
  mascot,
  icon: Icon,
  speed,
  active,
  size = 56,
}: {
  accent: string;
  avatar: string;
  mascot?: string;
  icon: React.ElementType;
  speed: number;
  active: boolean;
  size?: number;
}) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Rotating conic ring */}
      <motion.div
        className="absolute inset-[-3px] rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{
          background: `conic-gradient(from 0deg, ${accent}00, ${accent}70, ${accent}, ${accent}70, ${accent}00)`,
          filter: active ? "blur(1.5px)" : "blur(0.8px)",
          opacity: active ? 1 : 0.78,
        }}
      />

      {/* Mascot — hidden by default, revealed on hover */}
      {mascot && (
        <motion.img
          src={mascot}
          alt=""
          className="absolute z-30 h-full w-full object-contain p-1"
          initial={false}
          animate={
            active
              ? { opacity: 1, scale: 1.1, y: -6 }
              : { opacity: 0, scale: 0.6, y: 8 }
          }
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          style={{
            filter: active ? `drop-shadow(0 0 16px ${accent}90)` : "none",
          }}
        />
      )}

      {/* Avatar image */}
      <motion.div
        className="relative z-20 overflow-hidden rounded-full"
        initial={false}
        animate={active ? { opacity: 0, scale: 0.7 } : { opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={{
          width: size,
          height: size,
          boxShadow: `inset 0 1px 2px rgba(255,255,255,0.15), 0 0 16px ${accent}40`,
        }}
      >
        <img
          src={avatar}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to icon if image fails
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement("div");
              fallback.className = "h-full w-full flex items-center justify-center";
              fallback.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`;
              parent.appendChild(fallback);
            }
          }}
        />
      </motion.div>
    </div>
  );
}

/* ── Connection Lines (SVG) ─────────────────────────────────────────── */
function ConnectionLines({
  activeIndex,
  mentorActive,
}: {
  activeIndex: number | null;
  mentorActive: boolean;
}) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", zIndex: 1 }}
      viewBox="-280 -280 560 560"
      preserveAspectRatio="xMidYMid meet"
    >
      {PENTAGON_COORDS.map((coord, i) => {
        const isActive = mentorActive || activeIndex === i;
        const member = MEMBERS[i];
        return (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={coord.x}
            y2={coord.y}
            stroke={isActive ? member.accent : "rgba(255,255,255,0.18)"}
            strokeWidth={isActive ? 1.5 : 1}
            strokeDasharray={isActive ? "none" : "4 6"}
            opacity={isActive ? 0.7 : 0.45}
            style={{ transition: "all 0.4s ease" }}
          />
        );
      })}
    </svg>
  );
}

/* ── Member Card (outer pentagon) ───────────────────────────────────── */
function MemberCard({
  member,
  index,
  isHovered,
  anyHovered,
  onHover,
  onLeave,
}: {
  member: Member;
  index: number;
  isHovered: boolean;
  anyHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const coord = PENTAGON_COORDS[index];

  const distFromCenter = Math.sqrt(coord.x ** 2 + coord.y ** 2) / PENTAGON_R;
  const baseOpacity = 1 - distFromCenter * 0.14;
  const opacity = anyHovered ? (isHovered ? 1 : 0.68) : Math.max(baseOpacity, 0.82);
  const scale = isHovered ? 1.05 : 1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        marginLeft: -90,
        marginTop: -130,
        zIndex: isHovered ? 50 : 10,
      }}
      initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
      animate={{ opacity, scale, x: coord.x, y: coord.y }}
      transition={{
        duration: 0.8,
        delay: 0.3 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className="relative flex h-[260px] w-[180px] flex-col items-center overflow-hidden rounded-xl border p-5 text-center transition-all duration-500"
        style={{
          borderColor: isHovered ? `${member.accent}55` : `${member.accent}24`,
          background: isHovered
            ? `linear-gradient(135deg, ${member.accent}18, rgba(255,255,255,0.04) 60%, rgba(0,0,0,0.12))`
            : `linear-gradient(135deg, ${member.accent}0e, rgba(255,255,255,0.025) 60%, rgba(0,0,0,0.08))`,
          boxShadow: isHovered
            ? `0 0 30px ${member.accent}30, inset 0 1px 0 ${member.accent}35`
            : `0 0 12px ${member.accent}0c, inset 0 1px 0 rgba(255,255,255,0.06)`,
          transform: `scale(${scale})`,
        }}
      >
        {/* Role badge — top-right pill */}
        <div
          className="absolute top-2 right-3 text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full z-20"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            backgroundColor: `${member.accent}18`,
            color: member.accent,
            border: `1px solid ${member.accent}30`,
          }}
        >
          {_(member.roleZh, member.roleEn)}
        </div>

        {/* Avatar */}
        <div className="mt-6">
          <AvatarRing
            accent={member.accent}
            avatar={member.avatar}
            mascot={member.mascot}
            icon={member.icon}
            speed={member.ringSpeed}
            active={isHovered}
            size={72}
          />
        </div>

        {/* Name */}
        <div className="mt-2 font-mono text-base font-bold text-white">
          {member.name}
        </div>

        {/* Divider */}
        <div
          className="mt-4 h-[2px] w-10 rounded-full transition-all duration-500"
          style={{
            backgroundColor: member.accent,
            opacity: isHovered ? 1 : 0.58,
            transform: isHovered ? "scaleX(1.5)" : "scaleX(1)",
          }}
        />

        {/* Description (visible on hover) */}
        <div
          className="mt-4 text-[11px] leading-relaxed text-white/90 transition-all duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(6px)",
          }}
        >
          {_(member.contribZh, member.contribEn)}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Mentor Card (center) ───────────────────────────────────────────── */
function MentorCard({
  isHovered,
  anyHovered,
  onHover,
  onLeave,
}: {
  isHovered: boolean;
  anyHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

  const opacity = anyHovered ? (isHovered ? 1 : 0.58) : 1;
  const scale = isHovered ? 1.05 : 1.02;

  return (
    <motion.div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        marginLeft: -115,
        marginTop: -160,
        zIndex: isHovered ? 60 : 20,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity, scale: scale }}
      transition={{
        duration: 0.9,
        delay: 0.1,
        ease: [0.34, 1.56, 0.64, 1], // Spring-like
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className="relative flex h-[320px] w-[230px] flex-col items-center overflow-hidden rounded-xl border p-6 text-center transition-all duration-500"
        style={{
          borderColor: isHovered ? "rgba(255,215,0,0.55)" : "rgba(255,215,0,0.28)",
          background: isHovered
            ? "linear-gradient(135deg, rgba(255,215,0,0.14), rgba(255,255,255,0.04) 60%, rgba(0,0,0,0.12))"
            : "linear-gradient(135deg, rgba(255,215,0,0.09), rgba(255,255,255,0.025) 60%, rgba(0,0,0,0.1))",
          boxShadow: isHovered
            ? "0 0 44px rgba(255,215,0,0.24), inset 0 1px 0 rgba(255,215,0,0.35)"
            : "0 0 28px rgba(255,215,0,0.14), 0 0 60px rgba(255,215,0,0.06), inset 0 1px 0 rgba(255,215,0,0.18)",
        }}
      >
        {/* Mentor badge */}
        <div
          className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(255,215,0,0.15)",
            color: "#FFD700",
            border: "1px solid rgba(255,215,0,0.3)",
          }}
        >
          ✦ {_(MENTOR.roleZh, MENTOR.roleEn)}
        </div>

        {/* Avatar */}
        <AvatarRing
          accent={MENTOR.accent}
          avatar={MENTOR.avatar}
          mascot={MENTOR.mascot}
          icon={MENTOR.icon}
          speed={MENTOR.ringSpeed}
          active={isHovered}
          size={92}
        />

        {/* Handle */}
        <div className="mt-5 font-mono text-xl font-bold text-white">
          {MENTOR.name}
        </div>

        {/* Divider */}
        <div
          className="mt-4 h-[2px] w-12 rounded-full transition-all duration-500"
          style={{
            backgroundColor: "#FFD700",
            opacity: isHovered ? 1 : 0.5,
            transform: isHovered ? "scaleX(1.8)" : "scaleX(1)",
          }}
        />

        {/* Description */}
        <p className="mt-4 text-[12px] leading-relaxed text-white/80">
          {_(MENTOR.contribZh, MENTOR.contribEn)}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Mobile Grid Card ───────────────────────────────────────────────── */
function MobileCard({
  member,
  index,
}: {
  member: Member;
  index: number;
}) {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex items-center gap-4 rounded-xl border p-4"
      style={{
        borderColor: member.isMentor ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.18)",
        background: member.isMentor
          ? "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,255,255,0.01))"
          : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0" style={{ width: 48, height: 48 }}>
        <div
          className="absolute inset-[-2px] rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${member.accent}00, ${member.accent}60, ${member.accent}, ${member.accent}60, ${member.accent}00)`,
            opacity: 0.7,
          }}
        />
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <img src={member.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <img
          src={member.mascot}
          alt=""
          className="absolute -bottom-1 -right-2 h-7 w-7 object-contain rounded-full"
          style={{ filter: `drop-shadow(0 0 4px ${member.accent}60)` }}
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              color: member.accent,
            }}
          >
            {_(member.roleZh, member.roleEn)}
          </div>
          {member.isMentor && (
            <span
              className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(255,215,0,0.15)",
                color: "#FFD700",
              }}
            >
              ✦
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-white">{member.name}</div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/75">
          {_(member.contribZh, member.contribEn)}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export function TeamShowcase() {
  const { lang } = useApp();
  const _ = useCallback((zh: string, en: string) => (lang === "zh" ? zh : en), [lang]);
  const reduce = useReducedMotion();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [mentorSelected, setMentorSelected] = useState(false);

  const anySelected = selectedIdx !== null || mentorSelected;

  // Close panels on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIdx(null);
        setMentorSelected(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden px-6 py-16 lg:py-24"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          className="mx-auto mb-16 max-w-3xl text-center lg:mb-24"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className="text-4xl font-black md:text-5xl lg:text-6xl whitespace-nowrap"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.0 }}
          >
            {lang === "zh" ? (
              <span
                style={{
                  background: "linear-gradient(135deg, #ffffff 15%, #B5FF4D 55%, #5EEAD4 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 48px rgba(181,255,77,0.55)) drop-shadow(0 0 96px rgba(181,255,77,0.3))",
                }}
              >
                由这支团队打造
              </span>
            ) : (
              <span
                className="inline-flex flex-wrap items-baseline justify-center gap-x-3"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                <span
                  style={{
                    fontSize: "0.55em",
                    fontWeight: 400,
                    letterSpacing: "0.04em",
                    color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Built by the
                </span>
                <AnimatedTeamWord />
              </span>
            )}
          </h2>
          <p className="mt-4 text-sm italic text-white/80 md:text-base">
            {_("五个角色，一位导师，一条受控的资金流水线。", "Five roles, one mentor, one controlled money pipeline.")}
          </p>
        </motion.div>

        {/* ── Desktop: Constellation Pentagon ── */}
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          {/* Pentagon */}
          <div
            className="relative shrink-0 mx-auto"
            style={{ width: 720, height: 720 }}
          >
            {/* Connection lines */}
            <ConnectionLines activeIndex={selectedIdx} mentorActive={mentorSelected} />

            {/* Mentor (center) */}
            <MentorCard
              isHovered={mentorSelected}
              anyHovered={anySelected}
              onHover={() => setMentorSelected(true)}
              onLeave={() => setMentorSelected(false)}
            />

            {/* 5 outer members */}
            {MEMBERS.map((m, i) => (
              <MemberCard
                key={m.name}
                member={m}
                index={i}
                isHovered={selectedIdx === i}
                anyHovered={anySelected}
                onHover={() => setSelectedIdx(i)}
                onLeave={() => setSelectedIdx(null)}
              />
            ))}
          </div>
        </div>

        {/* ── Tablet: 3x2 Grid ── */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-4 lg:hidden max-w-3xl mx-auto">
          {/* Mentor spans 2 columns in center */}
          <div className="col-span-3 flex justify-center mb-4">
            <MobileCard member={MENTOR} index={0} />
          </div>
          {MEMBERS.map((m, i) => (
            <MobileCard key={m.name} member={m} index={i + 1} />
          ))}
        </div>

        {/* ── Mobile: Single column ── */}
        <div className="flex flex-col gap-3 md:hidden max-w-md mx-auto">
          <MobileCard member={MENTOR} index={0} />
          {MEMBERS.map((m, i) => (
            <MobileCard key={m.name} member={m} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
