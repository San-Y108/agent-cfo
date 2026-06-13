"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import {
  Zap,
  ArrowRight,
  PieChartIcon,
  TrendingUp,
  CheckCircle,
  BarChart3,
} from "lucide-react";

import { useApp } from "@/lib/i18n/context";
import { useConsoleState } from "@/lib/console/console-state";
import { useConsoleFlowHighlight } from "@/lib/console/use-console-flow-highlight";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
  ConsolePanelHeader,
  ConsoleGhostButton,
  StageCornerAccent,
  PreflightRow,
} from "@/components/console/command-deck";
import { ModuleStageLayout } from "@/components/console/module-stage-layout";
import { cn } from "@/lib/utils";
import type { HudColor } from "@/components/console/command-deck/hud-label";

const AreaChartCard = dynamic(
  () => import("@/components/console/charts/area-chart-card").then((m) => m.AreaChartCard),
  { ssr: false }
);

const PieChartCard = dynamic(
  () => import("@/components/console/charts/pie-chart-card").then((m) => m.PieChartCard),
  { ssr: false }
);

const VIOLET = "#C084FC";

const RANGE_DATA: Record<
  "30d" | "90d" | "1y",
  Array<{ month: string; volume: number; gasSaved: number; transactions: number }>
> = {
  "30d": [
    { month: "W1", volume: 4200, gasSaved: 60, transactions: 7 },
    { month: "W2", volume: 5100, gasSaved: 90, transactions: 10 },
    { month: "W3", volume: 7800, gasSaved: 145, transactions: 13 },
    { month: "W4", volume: 6600, gasSaved: 110, transactions: 11 },
  ],
  "90d": [
    { month: "Jan", volume: 8400, gasSaved: 120, transactions: 14 },
    { month: "Feb", volume: 10200, gasSaved: 180, transactions: 19 },
    { month: "Mar", volume: 15600, gasSaved: 290, transactions: 26 },
    { month: "Apr", volume: 13200, gasSaved: 220, transactions: 22 },
    { month: "May", volume: 19800, gasSaved: 380, transactions: 34 },
    { month: "Jun", volume: 24500, gasSaved: 490, transactions: 41 },
  ],
  "1y": [
    { month: "H1", volume: 28000, gasSaved: 520, transactions: 48 },
    { month: "H2", volume: 32000, gasSaved: 610, transactions: 56 },
  ],
};

function RangePills({
  active,
  onChange,
}: {
  active: "30d" | "90d" | "1y";
  onChange: (r: "30d" | "90d" | "1y") => void;
}) {
  const ranges: ("30d" | "90d" | "1y")[] = ["30d", "90d", "1y"];
  return (
    <div className="flex rounded-lg border border-border-token bg-surface-2 p-0.5">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "relative cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all",
            active === r ? "text-accent-fg" : "text-fg-muted hover:text-fg"
          )}
        >
          {active === r && (
            <motion.div
              layoutId="analytics-range-pill"
              className="absolute inset-0 rounded-md bg-accent"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{r.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

function MiniProgressBar({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="block text-[9px] tabular-nums text-fg-subtle">{label} · {pct}%</span>
    </div>
  );
}

function StepDots({ activeCount, color }: { activeCount: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {["Plan", "Risk", "Approve", "Execute"].map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div
            className={cn("h-2 w-2 rounded-full transition-colors", i < activeCount ? "" : "bg-surface-hover")}
            style={{ backgroundColor: i < activeCount ? color : undefined }}
          />
          {i < 3 && <div className="h-px w-2 bg-surface-hover" />}
        </div>
      ))}
    </div>
  );
}

function StackedBar({
  segments,
  labels,
}: {
  segments: { value: number; color: string }[];
  labels: string[];
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div className="space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <div
            key={i}
            className="h-full transition-all duration-500"
            style={{ width: total > 0 ? `${(s.value / total) * 100}%` : "0%", backgroundColor: s.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
        {segments.map((s, i) => (
          <span key={i} className="text-[9px] tabular-nums text-fg-subtle">
            <span className="mr-1 inline-block h-1 w-1 rounded-full" style={{ backgroundColor: s.color }} />
            {labels[i]} {s.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function KpiTiltCard({
  children,
  glowColor,
}: {
  children: React.ReactNode;
  glowColor: HudColor;
}) {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 260, damping: 24 });
  const springY = useSpring(rawY, { stiffness: 260, damping: 24 });
  const rotateX = useTransform(springY, (v) => (reduce ? 0 : -v / 24));
  const rotateY = useTransform(springX, (v) => (reduce ? 0 : v / 24));
  const glareX = useTransform(springX, (v) => 50 + v / 4);
  const glareY = useTransform(springY, (v) => 50 + v / 4);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - box.left) / box.width - 0.5) * 100);
    rawY.set(((e.clientY - box.top) / box.height - 0.5) * 100);
  };

  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      className="relative min-h-0"
      style={{ perspective: 900, rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={reduce ? undefined : { scale: 1.015, z: 8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <FrostedPanel glowColor={glowColor} sheen className="h-full flex-col rounded-card p-3">
        {children}
      </FrostedPanel>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-300"
        style={{
          opacity: reduce ? 0 : undefined,
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.09), transparent 40%)`
          ),
        }}
        whileHover={{ opacity: 1 }}
      />
    </motion.div>
  );
}

function AnalyticsKpiLeftRail({
  lang,
  displayVolume,
  totalBlocked,
  displayTxCount,
  recordsCount,
  readyCount,
  blockedCount,
  executedCount,
  hasExecuted,
}: {
  lang: "en" | "zh";
  displayVolume: number;
  totalBlocked: number;
  displayTxCount: number;
  recordsCount: number;
  readyCount: number;
  blockedCount: number;
  executedCount: number;
  hasExecuted: boolean;
}) {
  const COLOR = {
    violet: "#C084FC",
    coral: "#FB7185",
    lime: "#B5FF4D",
    blue: "#60A5FA",
  } as const;

  const totalFlowAmount = displayVolume + totalBlocked || 1;
  const activeSteps = hasExecuted ? 4 : displayTxCount > 0 ? 3 : 0;

  const kpis = [
    {
      prefix: "VOLUME::",
      value: <AnimatedNumber value={displayVolume} />,
      sub: lang === "zh" ? "已执行总金额 (USDC)" : "Total executed (USDC)",
      footer: hasExecuted
        ? (lang === "zh" ? "实时数据 · Treasury 已执行" : "Live data · Treasury executed")
        : (lang === "zh" ? "Demo 基线 · 执行后切换" : "Demo baseline · switches after execution"),
      color: "violet" as HudColor,
      icon: TrendingUp,
      viz: (
        <MiniProgressBar
          value={displayVolume}
          max={totalFlowAmount}
          color={COLOR.violet}
          label={lang === "zh" ? "执行占比" : "Executed share"}
        />
      ),
    },
    {
      prefix: "BLOCKED::",
      value: <AnimatedNumber value={totalBlocked} />,
      sub: lang === "zh" ? "被拦截金额 (USDC)" : "Blocked amount (USDC)",
      footer: `${blockedCount} ${lang === "zh" ? "笔被拦截" : "blocked payments"}`,
      color: "coral" as HudColor,
      icon: Zap,
      viz: (
        <MiniProgressBar
          value={totalBlocked}
          max={totalFlowAmount}
          color={COLOR.coral}
          label={lang === "zh" ? "拦截占比" : "Blocked share"}
        />
      ),
    },
    {
      prefix: "CYCLES::",
      value: displayTxCount,
      sub: lang === "zh" ? "执行笔数" : "Executed payments",
      footer: `${executedCount} ${lang === "zh" ? "笔已结算" : "settled"}`,
      color: "lime" as HudColor,
      icon: CheckCircle,
      viz: <StepDots activeCount={activeSteps} color={COLOR.lime} />,
    },
    {
      prefix: "RECORDS::",
      value: recordsCount,
      sub: lang === "zh" ? "待处理记录" : "Pending records",
      footer: `${readyCount} ${lang === "zh" ? "就绪" : "ready"} · ${blockedCount} ${lang === "zh" ? "拦截" : "blocked"}`,
      color: "blue" as HudColor,
      icon: BarChart3,
      viz: (
        <StackedBar
          segments={[
            { value: executedCount, color: COLOR.lime },
            { value: readyCount, color: COLOR.blue },
            { value: blockedCount, color: COLOR.coral },
          ]}
          labels={[
            lang === "zh" ? "已执行" : "Executed",
            lang === "zh" ? "就绪" : "Ready",
            lang === "zh" ? "拦截" : "Blocked",
          ]}
        />
      ),
    },
  ];

  return (
    <div className="grid h-full min-h-0 grid-cols-1 grid-rows-4 gap-2">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <KpiTiltCard key={kpi.prefix} glowColor={kpi.color}>
            <HudLabel prefix={kpi.prefix} value={kpi.value} color={kpi.color} size="sm" />
            <div className="my-2 min-h-0 flex-1">{kpi.viz}</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", `text-hud-${kpi.color}`)} />
                <span className="truncate text-fg-muted">{kpi.sub}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border-token pt-1.5">
                <span className="truncate text-[10px] text-fg-subtle">{kpi.footer}</span>
              </div>
            </div>
          </KpiTiltCard>
        );
      })}
    </div>
  );
}

function AnalyticsMascotCorner() {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 24 });
  const rotateY = useTransform(springX, (v) => (reduce ? 0 : v / 22));
  const rotateX = useTransform(springY, (v) => (reduce ? 0 : -v / 22));

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - box.left - box.width / 2);
    rawY.set(e.clientY - box.top - box.height / 2);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      className="pointer-events-auto absolute -bottom-2 -right-2 z-20 h-40 w-40 overflow-hidden rounded-br-card"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Ambient violet glow that matches the mascot's own background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 70%, rgba(192,132,252,0.35) 0%, rgba(192,132,252,0.12) 45%, transparent 70%)",
        }}
      />

      {/* Lavender base to blend the image's solid background into the card */}
      <div
        className="pointer-events-none absolute inset-x-2 bottom-2 top-4 z-0 rounded-[40%_60%_50%_50%_/_30%_30%_70%_70%] opacity-40 blur-md"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 55%, rgba(216,180,254,0.45) 0%, rgba(216,180,254,0.12) 55%, transparent 85%)",
        }}
      />

      {/* Scaled-up figure: edges cropped so the background矩形 is hidden */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="/console/mascots/modules/analytics-module.png"
          alt="Analytics mascot"
          className="h-[150%] w-[150%] max-w-none max-h-none select-none object-contain"
          draggable={false}
          style={{
            filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.45))",
          }}
        />
      </motion.div>

      {/* Bottom fade to melt into card surface */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[60%]"
        style={{
          background:
            "linear-gradient(to top, var(--surface) 0%, color-mix(in srgb, var(--surface) 65%, transparent) 40%, transparent 100%)",
        }}
      />

      {/* Edge mask: stronger vignette to hide the remaining image rectangle */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 72% 62% at 50% 52%, transparent 42%, var(--surface) 92%)",
        }}
      />
    </div>
  );
}

function PayoutBreakdownRail({
  lang,
  t,
}: {
  lang: "en" | "zh";
  t: (key: string) => string;
}) {
  return (
    <FrostedPanel
      glowColor="violet"
      sheen
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-card p-2"
    >
      {/* Diffuse ambient glow: large + soft so it doesn't feel cut off */}
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 z-0 h-[110%] w-56 opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse 100% 90% at 100% 100%, rgba(192,132,252,0.55) 0%, rgba(216,180,254,0.22) 30%, rgba(216,180,254,0.08) 55%, transparent 80%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -right-6 z-0 h-[75%] w-44 opacity-40 blur-xl"
        style={{
          background:
            "radial-gradient(ellipse 90% 100% at 90% 100%, rgba(192,132,252,0.4) 0%, rgba(216,180,254,0.12) 40%, transparent 75%)",
        }}
      />

      <AnalyticsMascotCorner />
      <div className="mb-1.5 flex shrink-0 items-center gap-1.5 border-b border-border-token pb-1.5">
        <PieChartIcon className="h-4 w-4 shrink-0" style={{ color: VIOLET }} />
        <p className="truncate text-[12px] font-bold text-fg">
          {t("console.analytics.pieTitle" as any) as string}
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <PieChartCard
          embedded
          variant="rail"
          lang={lang}
          title={t("console.analytics.pieTitle" as any) as string}
          description={t("console.analytics.pieDesc" as any) as string}
          totalLabel={lang === "zh" ? "总计" : "Total"}
        />
      </div>
    </FrostedPanel>
  );
}

function CompareStrip({ lang, t }: { lang: "en" | "zh"; t: (key: string) => string }) {
  const cards = [1, 2, 3] as const;

  return (
    <div className="shrink-0 border-t border-border-token bg-surface-2/40 px-3 py-3 md:px-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Zap className="h-4 w-4" style={{ color: VIOLET }} />
        <p className="text-[12px] font-bold uppercase tracking-wider text-fg-muted">
          {lang === "zh" ? "效率对比" : "Efficiency compare"}
        </p>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {cards.map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border-token bg-surface-2/40 px-3 py-2.5"
          >
            <p className="mb-1.5 truncate text-[11px] font-semibold text-fg">
              {t(`console.analytics.compare${i}Title`)}
            </p>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between gap-2 text-fg-muted">
                <span className="truncate">{t(`console.analytics.compare${i}Row1`)}</span>
                <span className="shrink-0">
                  {i === 1 ? "0.05 ETH" : i === 2 ? "~3h" : lang === "zh" ? "无" : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2 font-bold">
                <span className="truncate text-fg-muted">{t(`console.analytics.compare${i}Row2`)}</span>
                <span
                  className={cn(
                    "shrink-0",
                    i === 2 ? "text-hud-violet" : "text-success"
                  )}
                >
                  {i === 1
                    ? "0.008 ETH"
                    : i === 2
                    ? lang === "zh"
                      ? "即时"
                      : "Instant"
                    : "100%"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 grid gap-1 sm:grid-cols-3">
        <PreflightRow label="CAW" value={lang === "zh" ? "开启" : "ON"} status="ok" />
        <PreflightRow
          label={lang === "zh" ? "策略" : "Policy"}
          value={lang === "zh" ? "生效" : "ACTIVE"}
          status="ok"
        />
        <PreflightRow
          label={lang === "zh" ? "数据源" : "Source"}
          value={lang === "zh" ? "演示" : "DEMO"}
          status="idle"
        />
      </div>
    </div>
  );
}

export function AnalyticsStage() {
  const { t, lang } = useApp();
  const { plan, records } = useConsoleState();
  const { hasExecuted } = useConsoleFlowHighlight();
  const [activeRange, setActiveRange] = useState<"30d" | "90d" | "1y">("90d");
  const [rangeJustChanged, setRangeJustChanged] = useState(false);

  const handleRangeChange = (r: "30d" | "90d" | "1y") => {
    if (r === activeRange) return;
    setActiveRange(r);
    setRangeJustChanged(true);
    setTimeout(() => setRangeJustChanged(false), 1200);
  };

  const showScanline = hasExecuted || rangeJustChanged;

  const executedItems = plan.filter((i) => i.status === "Executed");
  const blockedItems = plan.filter((i) => i.status === "Blocked");
  const readyItems = plan.filter((i) => i.status === "Ready");
  const totalVolume = executedItems.reduce((a, c) => a + c.record.amount, 0);
  const totalBlocked = blockedItems.reduce((a, c) => a + c.record.amount, 0);
  const totalTxCount = executedItems.length;
  const displayVolume = totalVolume || 91700;
  const displayTxCount = totalTxCount || 156;
  const readyCount = readyItems.length;
  const blockedCount = blockedItems.length;
  const executedCount = executedItems.length;

  return (
    <ModuleStageLayout
      moduleColor="violet"
      moduleLabel={lang === "zh" ? "数据分析" : "Analytics"}
      title={t("console.analytics.title" as any) as string}
      subtitle={t("console.analytics.desc" as any) as string}
      headerExtra={<RangePills active={activeRange} onChange={handleRangeChange} />}
      statusPulse={{
        color: "violet",
        label: hasExecuted ? "LIVE" : activeRange.toUpperCase(),
      }}
      leftRailLabel={lang === "zh" ? "核心指标" : "Core metrics"}
      leftRail={
        <AnalyticsKpiLeftRail
          lang={lang}
          displayVolume={displayVolume}
          totalBlocked={totalBlocked}
          displayTxCount={displayTxCount}
          recordsCount={records.length}
          readyCount={readyCount}
          blockedCount={blockedCount}
          executedCount={executedCount}
          hasExecuted={hasExecuted}
        />
      }
      rightRailLabel={lang === "zh" ? "支出分布" : "Payout breakdown"}
      rightRail={<PayoutBreakdownRail lang={lang} t={(k) => t(k as any) as string} />}
      stage={
        <FrostedPanel
          glowColor="violet"
          scanline={showScanline}
          sheen
          className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-card"
        >
          <CornerGlow color="violet" className="-top-24 -right-24" intensity={0.2} />
          <StageCornerAccent color="violet" />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <ConsolePanelHeader
              title={t("console.analytics.payoutChart" as any) as string}
              hudPrefix="METRIC::"
              hudValue={hasExecuted ? (lang === "zh" ? "实时流量" : "LIVING VOLUME") : (lang === "zh" ? "演示数据" : "DEMO DATA")}
              hudColor="violet"
              trailing={<StatusPulse color="violet" label={activeRange.toUpperCase()} size="sm" />}
            />

            {!hasExecuted && (
              <div className="mx-4 mb-2 flex shrink-0 items-center justify-between gap-3 rounded-lg border border-hud-violet/25 bg-hud-violet/10 px-3 py-2">
                <p className="text-[11px] text-fg-muted">
                  {lang === "zh"
                    ? "Demo 曲线 · 完成 Treasury 付款后切换为实时数据"
                    : "Demo curve · run Treasury for live volume"}
                </p>
                <Link href="/console/treasury">
                  <ConsoleGhostButton accentHover="violet" className="gap-1.5 text-[11px]">
                    {lang === "zh" ? "前往金库" : "Treasury"}
                    <ArrowRight className="h-3 w-3" />
                  </ConsoleGhostButton>
                </Link>
              </div>
            )}

            {showScanline && <Scanline color="violet" className="relative z-10 shrink-0" />}

            <div className="min-h-0 flex-1 px-3 pb-2 pt-0 md:px-4">
              <AreaChartCard
                embedded
                lang={lang}
                title={t("console.analytics.payoutChart" as any)}
                hint={t("console.analytics.chartHover" as any)}
                description={t("console.analytics.chartDesc" as any)}
                data={RANGE_DATA[activeRange]}
              />
            </div>
          </div>

          <CompareStrip lang={lang} t={(k) => t(k as any) as string} />
        </FrostedPanel>
      }
    />
  );
}
