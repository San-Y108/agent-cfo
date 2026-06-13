"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
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

function AnalyticsKpiLeftRail({
  lang,
  displayVolume,
  totalBlocked,
  displayTxCount,
  recordsCount,
}: {
  lang: "en" | "zh";
  displayVolume: number;
  totalBlocked: number;
  displayTxCount: number;
  recordsCount: number;
}) {
  const kpis: Array<{
    prefix: string;
    value: React.ReactNode;
    sub: string;
    color: HudColor;
    icon: React.ElementType;
  }> = [
    {
      prefix: "VOLUME::",
      value: <AnimatedNumber value={displayVolume} />,
      sub: lang === "zh" ? "已执行总金额 (USDC)" : "Total executed (USDC)",
      color: "violet",
      icon: TrendingUp,
    },
    {
      prefix: "BLOCKED::",
      value: <AnimatedNumber value={totalBlocked} />,
      sub: lang === "zh" ? "被拦截金额 (USDC)" : "Blocked amount (USDC)",
      color: "coral",
      icon: Zap,
    },
    {
      prefix: "CYCLES::",
      value: displayTxCount,
      sub: lang === "zh" ? "执行笔数" : "Executed payments",
      color: "lime",
      icon: CheckCircle,
    },
    {
      prefix: "RECORDS::",
      value: recordsCount,
      sub: lang === "zh" ? "待处理记录" : "Pending records",
      color: "blue",
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid h-full min-h-0 grid-rows-4 gap-2">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <FrostedPanel
            key={kpi.prefix}
            glowColor={kpi.color}
            sheen
            className="flex min-h-0 flex-col justify-center rounded-card px-3 py-2.5"
          >
            <HudLabel prefix={kpi.prefix} value={kpi.value} color={kpi.color} size="sm" />
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-success">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-fg-muted">{kpi.sub}</span>
            </div>
          </FrostedPanel>
        );
      })}
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
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-card p-3"
    >
      <div className="mb-2 flex shrink-0 items-center gap-1.5 border-b border-border-token pb-2">
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
              <div className="flex justify-between gap-2 text-fg-subtle">
                <span className="truncate">{t(`console.analytics.compare${i}Row1`)}</span>
                <span className="shrink-0">
                  {i === 1 ? "0.05 ETH" : i === 2 ? "~3h" : lang === "zh" ? "无" : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2 font-bold">
                <span className="truncate text-fg-muted">{t(`console.analytics.compare${i}Row2`)}</span>
                <span
                  className="shrink-0"
                  style={{ color: i === 1 ? "#34d399" : i === 2 ? VIOLET : "#34d399" }}
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

  const executedItems = plan.filter((i) => i.status === "Executed");
  const blockedItems = plan.filter((i) => i.status === "Blocked");
  const totalVolume = executedItems.reduce((a, c) => a + c.record.amount, 0);
  const totalBlocked = blockedItems.reduce((a, c) => a + c.record.amount, 0);
  const totalTxCount = executedItems.length;
  const displayVolume = totalVolume || 91700;
  const displayTxCount = totalTxCount || 156;

  return (
    <ModuleStageLayout
      moduleColor="violet"
      moduleLabel={lang === "zh" ? "数据分析" : "Analytics"}
      title={t("console.analytics.title" as any) as string}
      subtitle={t("console.analytics.desc" as any) as string}
      headerExtra={<RangePills active={activeRange} onChange={setActiveRange} />}
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
        />
      }
      rightRailLabel={lang === "zh" ? "支出分布" : "Payout breakdown"}
      rightRail={<PayoutBreakdownRail lang={lang} t={(k) => t(k as any) as string} />}
      stage={
        <FrostedPanel
          glowColor="violet"
          scanline
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

            <Scanline color="violet" className="relative z-10 shrink-0" />

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
