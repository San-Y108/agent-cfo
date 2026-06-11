"use client";

import React, { useState, useCallback } from "react";
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
  handle: string;
  contribZh: string;
  contribEn: string;
  accent: string;
  icon: React.ElementType;
  ringSpeed: number;
  avatar: string;
  isMentor?: boolean;
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
    avatar: "/team/avatar-san-y108.jpg",
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
    avatar: "/team/avatar-w5w8l9jlu.jpg",
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
    avatar: "/team/avatar-aafff623.jpg",
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
    avatar: "/team/avatar-gitgdut.jpg",
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
    avatar: "/team/avatar-eloise-qiu.jpg",
  },
];

const MENTOR: Member = {
  roleZh: "导师",
  roleEn: "Mentor",
  handle: "ZanyK",
  contribZh: "去年 Hackathon 参赛者，指导团队度过混沌",
  contribEn: "Last year's hackathon veteran, guiding the team through the chaos",
  accent: "#FFD700",
  icon: Crown,
  ringSpeed: 3,
  avatar: "/team/avatar-mentor-zanyk.jpg",
  isMentor: true,
};

/* Pentagon vertex coordinates (radius = 160, starting from top) */
const PENTAGON_R = 160;
const PENTAGON_COORDS = [
  { x: 0, y: -PENTAGON_R },           // Top: Cap (PM)
  { x: 152, y: -50 },                 // Top-right: Node (Backend)
  { x: 94, y: 130 },                  // Bottom-right: Pixel (Frontend)
  { x: -94, y: 130 },                 // Bottom-left: Vault (Contract)
  { x: -152, y: -50 },                // Top-left: Ink (Design)
];

/* ── Avatar with rotating ring ───────────────────────────────────────── */
function AvatarRing({
  accent,
  avatar,
  icon: Icon,
  speed,
  active,
  size = 56,
}: {
  accent: string;
  avatar: string;
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
          opacity: active ? 1 : 0.6,
        }}
      />
      {/* Avatar image */}
      <div
        className="relative z-10 overflow-hidden rounded-full"
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
      </div>
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
      viewBox="-220 -220 440 440"
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
            stroke={isActive ? member.accent : "rgba(255,255,255,0.04)"}
            strokeWidth={isActive ? 1.5 : 1}
            strokeDasharray={isActive ? "none" : "4 6"}
            opacity={isActive ? 0.7 : 0.3}
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

  const opacity = anyHovered ? (isHovered ? 1 : 0.35) : 1;
  const scale = isHovered ? 1.12 : 1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        marginLeft: -80,
        marginTop: -110,
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
        className="relative flex h-[220px] w-[160px] flex-col items-center overflow-hidden rounded-xl border p-4 text-center transition-all duration-500"
        style={{
          borderColor: isHovered ? `${member.accent}50` : "rgba(255,255,255,0.06)",
          background: isHovered
            ? `linear-gradient(135deg, ${member.accent}12, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.2))`
            : `linear-gradient(135deg, ${member.accent}08, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.1))`,
          boxShadow: isHovered
            ? `0 0 30px ${member.accent}25, inset 0 1px 0 ${member.accent}30`
            : "none",
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        {/* Avatar */}
        <AvatarRing
          accent={member.accent}
          avatar={member.avatar}
          icon={member.icon}
          speed={member.ringSpeed}
          active={isHovered}
          size={56}
        />

        {/* Role label */}
        <div
          className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            color: member.accent,
          }}
        >
          {_(member.roleZh, member.roleEn)}
        </div>

        {/* Handle */}
        <div className="mt-1.5 font-mono text-sm font-bold text-white">
          {member.handle}
        </div>

        {/* Divider */}
        <div
          className="mt-3 h-[2px] w-8 rounded-full transition-all duration-500"
          style={{
            backgroundColor: member.accent,
            opacity: isHovered ? 1 : 0.4,
            transform: isHovered ? "scaleX(1.5)" : "scaleX(1)",
          }}
        />

        {/* Description (visible on hover) */}
        <div
          className="mt-3 text-[10px] leading-relaxed text-white/50 transition-all duration-500"
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

  const opacity = anyHovered ? (isHovered ? 1 : 0.5) : 1;
  const scale = isHovered ? 1.08 : 1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        marginLeft: -100,
        marginTop: -140,
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
        className="relative flex h-[280px] w-[200px] flex-col items-center overflow-hidden rounded-xl border p-5 text-center transition-all duration-500"
        style={{
          borderColor: isHovered ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.08)",
          background: isHovered
            ? "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,255,255,0.03) 60%, rgba(0,0,0,0.25))"
            : "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.15))",
          boxShadow: isHovered
            ? "0 0 40px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,215,0,0.3)"
            : "0 0 20px rgba(255,215,0,0.05)",
        }}
      >
        {/* Mentor badge */}
        <div
          className="absolute top-3 right-3 text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
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
          icon={MENTOR.icon}
          speed={MENTOR.ringSpeed}
          active={isHovered}
          size={72}
        />

        {/* Handle */}
        <div className="mt-4 font-mono text-lg font-bold text-white">
          {MENTOR.handle}
        </div>

        {/* Divider */}
        <div
          className="mt-3 h-[2px] w-10 rounded-full transition-all duration-500"
          style={{
            backgroundColor: "#FFD700",
            opacity: isHovered ? 1 : 0.5,
            transform: isHovered ? "scaleX(1.8)" : "scaleX(1)",
          }}
        />

        {/* Description */}
        <p className="mt-3 text-[11px] leading-relaxed text-white/55">
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
        borderColor: member.isMentor ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)",
        background: member.isMentor
          ? "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,255,255,0.01))"
          : "rgba(255,255,255,0.02)",
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
        <div className="text-sm font-bold text-white">{member.handle}</div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mentorHovered, setMentorHovered] = useState(false);

  const anyHovered = hoveredIdx !== null || mentorHovered;

  return (
    <section
      id="team"
      className="relative w-full overflow-hidden px-6 py-16 lg:py-24"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Background grid */}
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
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-24"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {_("由这支团队打造", "Built by the team")}
          </h2>
          <p className="mt-4 text-sm text-white/50 md:text-base">
            {_("五个角色，一位导师，一条受控的资金流水线。", "Five roles, one mentor, one controlled money pipeline.")}
          </p>
        </motion.div>

        {/* ── Desktop: Constellation Pentagon ── */}
        <div className="hidden lg:block">
          <div
            className="relative mx-auto"
            style={{ width: 480, height: 480 }}
          >
            {/* Connection lines */}
            <ConnectionLines activeIndex={hoveredIdx} mentorActive={mentorHovered} />

            {/* Mentor (center) */}
            <MentorCard
              isHovered={mentorHovered}
              anyHovered={anyHovered}
              onHover={() => setMentorHovered(true)}
              onLeave={() => setMentorHovered(false)}
            />

            {/* 5 outer members */}
            {MEMBERS.map((m, i) => (
              <MemberCard
                key={m.handle}
                member={m}
                index={i}
                isHovered={hoveredIdx === i}
                anyHovered={anyHovered}
                onHover={() => setHoveredIdx(i)}
                onLeave={() => setHoveredIdx(null)}
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
            <MobileCard key={m.handle} member={m} index={i + 1} />
          ))}
        </div>

        {/* ── Mobile: Single column ── */}
        <div className="flex flex-col gap-3 md:hidden max-w-md mx-auto">
          <MobileCard member={MENTOR} index={0} />
          {MEMBERS.map((m, i) => (
            <MobileCard key={m.handle} member={m} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
