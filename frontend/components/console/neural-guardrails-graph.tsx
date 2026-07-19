"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Bot, Wallet, FileCheck, AlertTriangle, Orbit, ChevronRight } from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const CORAL = "#FB7185";

type RuleDef = {
  id: string;
  titleKey: string;
  color: string;
  icon: React.ElementType;
  tier: 1 | 2 | 3;
};

const RULES: RuleDef[] = [
  { id: "0x3C", titleKey: "risk.1.title", color: "#4d7c0f", icon: FileCheck, tier: 1 },
  { id: "0x2B", titleKey: "risk.3.title", color: "#be123c", icon: Wallet, tier: 1 },
  { id: "0x1A", titleKey: "risk.2.title", color: "#0e7490", icon: Shield, tier: 2 },
  { id: "0x5E", titleKey: "risk.4.title", color: "#6d28d9", icon: AlertTriangle, tier: 2 },
  { id: "0x4D", titleKey: "risk.5.title", color: "#1d4ed8", icon: Bot, tier: 3 },
];

const DARK_COLORS: Record<string, string> = {
  "0x3C": "#B5FF4D",
  "0x2B": "#FB7185",
  "0x1A": "#5EEAD4",
  "0x5E": "#C084FC",
  "0x4D": "#60A5FA",
};

const TIER_META = [
  { tier: 1, zh: "第一道", en: "Tier 1", subZh: "额度约束", subEn: "Spending" },
  { tier: 2, zh: "第二道", en: "Tier 2", subZh: "准入校验", subEn: "Access" },
  { tier: 3, zh: "第三道", en: "Tier 3", subZh: "执行护栏", subEn: "Execution" },
] as const;

const CLOUD_SPOTS = [
  { x: "4%", y: "18%", w: 100, h: 70 },
  { x: "38%", y: "8%", w: 110, h: 65 },
  { x: "62%", y: "55%", w: 90, h: 60 },
  { x: "82%", y: "22%", w: 80, h: 55 },
];

interface NeuralGuardrailsGraphProps {
  activeRuleId?: string | null;
  onRuleHover?: (id: string | null) => void;
  className?: string;
}

function RuleNode({
  rule,
  title,
  isActive,
  isDark,
  onHover,
  reduce,
}: {
  rule: RuleDef;
  title: string;
  isActive: boolean;
  isDark: boolean;
  onHover: (id: string | null) => void;
  reduce: boolean;
}) {
  const Icon = rule.icon;
  const accent = isDark ? DARK_COLORS[rule.id] : rule.color;

  /* Per-rule micro-twist on hover so each node feels distinct. */
  const twist = {
    "0x3C": -8,
    "0x2B": 7,
    "0x1A": -6,
    "0x5E": 8,
    "0x4D": -10,
  }[rule.id] ?? 0;

  return (
    <motion.button
      type="button"
      onMouseEnter={() => onHover(rule.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(rule.id)}
      onBlur={() => onHover(null)}
      className={cn(
        "relative flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-colors",
        isActive
          ? "border-border-strong bg-surface shadow-md"
          : "border-border-token bg-surface/95 hover:border-border-strong hover:bg-surface"
      )}
      style={{
        boxShadow: isActive ? `0 0 16px -4px ${accent}55` : undefined,
        borderColor: isActive ? `${accent}66` : undefined,
      }}
      initial="rest"
      animate={isActive ? "active" : "rest"}
      whileHover={reduce ? undefined : "hover"}
      variants={{
        rest: { scale: 1, y: 0, boxShadow: "0 0 0px transparent" },
        active: { scale: 1.02, y: 0 },
        hover: {
          scale: 1.03,
          y: -2,
          boxShadow: `0 10px 24px -12px ${accent}55`,
          transition: { type: "spring", stiffness: 360, damping: 18 },
        },
      }}
    >
      {/* Shimmer sweep on hover */}
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `linear-gradient(105deg, transparent 35%, ${accent}22 50%, transparent 65%)`,
          }}
          variants={{
            rest: { x: "-100%", opacity: 0 },
            hover: {
              x: "100%",
              opacity: 1,
              transition: { duration: 0.65, ease: "easeInOut" },
            },
          }}
        />
      )}

      <motion.span
        className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border sm:h-7 sm:w-7"
        style={{ borderColor: `${accent}44`, background: `${accent}14` }}
        variants={{
          rest: { scale: 1, rotate: 0 },
          hover: {
            scale: 1.15,
            rotate: twist,
            transition: { type: "spring", stiffness: 320, damping: 14 },
          },
        }}
      >
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: accent }} strokeWidth={1.75} />
      </motion.span>

      <span className="relative z-10 flex min-w-0 flex-col">
        <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-fg-muted">
          {rule.id}
        </span>
        <span className="truncate text-[10px] font-semibold leading-tight text-fg">{title}</span>
      </span>
    </motion.button>
  );
}

function FlowArrow({ isDark, reduce }: { isDark: boolean; reduce: boolean }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center px-0.5 sm:px-1">
      <div
        className="hidden h-px w-3 sm:block sm:w-4"
        style={{
          background: `linear-gradient(90deg, ${CORAL}22, ${CORAL}${isDark ? "66" : "44"})`,
        }}
      />
      <ChevronRight
        className="h-3 w-3 sm:h-4 sm:w-4"
        style={{ color: isDark ? "#FB7185" : "#e11d48" }}
        strokeWidth={2}
      />
      {!reduce && (
        <motion.span
          className="mt-0.5 block h-1 w-1 rounded-full"
          style={{ background: CORAL }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

function TierColumn({
  meta,
  rules,
  lang,
  t,
  activeRuleId,
  isDark,
  onRuleHover,
  reduce,
}: {
  meta: (typeof TIER_META)[number];
  rules: RuleDef[];
  lang: string;
  t: (key: Parameters<ReturnType<typeof useApp>["t"]>[0]) => string;
  activeRuleId?: string | null;
  isDark: boolean;
  onRuleHover?: (id: string | null) => void;
  reduce: boolean;
}) {
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col rounded-xl border p-1 sm:p-1.5",
        isDark ? "border-border-token bg-[#0b1120]/40" : "border-border-token bg-surface/80"
      )}
      style={{
        boxShadow: isDark ? undefined : "inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <div className="mb-1 shrink-0 truncate border-b border-border-token pb-1 text-center font-mono text-[9px] font-bold uppercase tracking-wide text-fg-muted">
        {_(meta.zh, meta.en)} · <span className="text-fg">{_(meta.subZh, meta.subEn)}</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1">
        {rules.map((rule) => (
          <RuleNode
            key={rule.id}
            rule={rule}
            title={t(rule.titleKey as Parameters<typeof t>[0])}
            isActive={activeRuleId === rule.id}
            isDark={isDark}
            onHover={(id) => onRuleHover?.(id)}
            reduce={reduce}
          />
        ))}
      </div>
    </div>
  );
}

function CawHub({ lang, isDark, reduce }: { lang: string; isDark: boolean; reduce: boolean }) {
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

  return (
    <motion.div
      className={cn(
        "flex w-[60px] shrink-0 flex-col items-center justify-center rounded-xl border px-1 py-1.5 sm:w-[72px] sm:px-1.5 sm:py-2.5",
        isDark ? "border-border-token bg-[#0b1120]/50" : "border-border-token bg-surface/90"
      )}
      initial="rest"
      whileHover={reduce ? undefined : "hover"}
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.05, transition: { type: "spring", stiffness: 320, damping: 16 } },
      }}
    >
      <motion.div
        className="flex flex-col items-center"
        animate={reduce ? {} : { scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className={cn(
            "flex h-10 w-10 flex-col items-center justify-center rounded-full border sm:h-12 sm:w-12",
            isDark ? "bg-[#0b1120]" : "bg-surface"
          )}
          style={{
            borderColor: `${CORAL}55`,
            boxShadow: `0 0 20px -6px ${CORAL}44`,
          }}
          variants={{
            rest: { boxShadow: `0 0 20px -6px ${CORAL}44` },
            hover: {
              boxShadow: `0 0 30px -4px ${CORAL}77`,
              transition: { duration: 0.3 },
            },
          }}
        >
          <motion.div
            variants={{
              rest: { rotate: 0 },
              hover: { rotate: 180, transition: { duration: 0.75, ease: "easeInOut" } },
            }}
          >
            <Orbit className="h-4 w-4" style={{ color: isDark ? "#FB7185" : "#be123c" }} />
          </motion.div>
          <span className="mt-0.5 font-mono text-[8px] font-bold uppercase text-fg">CAW</span>
        </motion.div>
      </motion.div>
      <p className="mt-2 text-center font-mono text-[9px] font-semibold uppercase leading-tight text-fg-muted">
        {_("核心", "Core")}
      </p>
    </motion.div>
  );
}

/**
 * Tri-Line Guard — horizontal left-to-right: Tier 1 → Tier 2 → Tier 3 → CAW.
 * Each tier lives in its own bordered column; no overlapping absolute layers.
 */
export function NeuralGuardrailsGraph({
  activeRuleId,
  onRuleHover,
  className,
}: NeuralGuardrailsGraphProps) {
  const { lang, theme, t } = useApp();
  const isDark = theme === "dark";
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative w-full", className)}>
      {/* 白云斑 backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        {CLOUD_SPOTS.map((spot, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              left: spot.x,
              top: spot.y,
              width: spot.w,
              height: spot.h,
              opacity: isDark ? 0.2 : 0.5,
              background: isDark
                ? "radial-gradient(circle, rgba(251,113,133,0.15) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.35) 60%, transparent 75%)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full min-h-0 w-full min-w-0 items-stretch gap-0 py-0.5">
        {TIER_META.map((meta, idx) => (
          <React.Fragment key={meta.tier}>
            {idx > 0 && <FlowArrow isDark={isDark} reduce={!!reduce} />}
            <TierColumn
              meta={meta}
              rules={RULES.filter((r) => r.tier === meta.tier)}
              lang={lang}
              t={t}
              activeRuleId={activeRuleId}
              isDark={isDark}
              onRuleHover={onRuleHover}
              reduce={!!reduce}
            />
          </React.Fragment>
        ))}
        <FlowArrow isDark={isDark} reduce={!!reduce} />
        <CawHub lang={lang} isDark={isDark} reduce={!!reduce} />
      </div>
    </div>
  );
}
