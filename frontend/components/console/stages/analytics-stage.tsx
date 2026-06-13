"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Zap, ArrowRight, PieChartIcon } from "lucide-react";

import { useApp } from "@/lib/i18n/context";
import { useConsoleState } from "@/lib/console/console-state";
import { useConsoleFlowHighlight } from "@/lib/console/use-console-flow-highlight";
import { ScrambleValue } from "@/components/ui/gsap-text-effects";
import {
  StatusPulse,
  CornerGlow,
  FrostedPanel,
  ConsolePanelHeader,
  ConsoleGhostButton,
  StageCornerAccent,
  PreflightRow,
} from "@/components/console/command-deck";
import { ModuleStageLayout } from "@/components/console/module-stage-layout";
import { cn } from "@/lib/utils";

const AreaChartCard = dynamic(
  () => import("@/components/console/charts/area-chart-card").then((m) => m.AreaChartCard),
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

const PAYOUT_MIX = [
  { name: "Core Contributors", value: 12500, color: "#5EEAD4" },
  { name: "QA Testing", value: 5400, color: "#FB7185" },
  { name: "Community Devs", value: 4300, color: "#B5FF4D" },
  { name: "API Nodes", value: 2300, color: "#60A5FA" },
  { name: "Misc", value: 1200, color: "#C084FC" },
];

const PAYOUT_MIX_TOTAL = PAYOUT_MIX.reduce((a, d) => a + d.value, 0);

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

function PayoutMixRail({ lang }: { lang: "en" | "zh" }) {
  const max = Math.max(...PAYOUT_MIX.map((d) => d.value));
  const zhNames: Record<string, string> = {
    "Core Contributors": "核心贡献者",
    "QA Testing": "QA 测试",
    "Community Devs": "社区开发",
    "API Nodes": "API 节点",
    Misc: "其他",
  };

  return (
    <FrostedPanel
      glowColor="violet"
      sheen
      className="flex h-full min-h-0 flex-col rounded-card p-2.5 lg:p-3"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-border-token pb-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <PieChartIcon className="h-4 w-4 shrink-0" style={{ color: VIOLET }} />
          <p className="truncate text-[12px] font-bold uppercase tracking-wider text-fg">
            {lang === "zh" ? "支出分布" : "Payout mix"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[11px] font-bold text-hud-violet">
          ${(PAYOUT_MIX_TOTAL / 1000).toFixed(1)}k
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2">
        {PAYOUT_MIX.map((row) => {
          const label = lang === "zh" ? zhNames[row.name] ?? row.name : row.name;
          const pct = Math.round((row.value / PAYOUT_MIX_TOTAL) * 100);
          return (
            <div key={row.name} className="space-y-1">
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className="truncate text-fg-muted">{label}</span>
                <span className="shrink-0 font-mono font-semibold text-fg/90">
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.value / max) * 100}%`,
                    backgroundColor: row.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </FrostedPanel>
  );
}

function TrendGhostPreview({ data }: { data: Array<{ month: string; volume: number }> }) {
  const max = Math.max(...data.map((d) => d.volume));
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 top-14 opacity-[0.22]">
      <div className="flex h-full items-end gap-1.5">
        {data.map((d) => (
          <div key={d.month} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t-sm bg-hud-violet/80"
              style={{ height: `${(d.volume / max) * 100}%`, minHeight: 8 }}
            />
            <span className="font-mono text-[8px] text-fg-subtle">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
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
                  {i === 1 ? "0.05" : i === 2 ? "3h" : lang === "zh" ? "无" : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2 font-bold">
                <span className="truncate text-fg-muted">{t(`console.analytics.compare${i}Row2`)}</span>
                <span
                  className="shrink-0"
                  style={{ color: i === 1 ? "#34d399" : i === 2 ? VIOLET : "#34d399" }}
                >
                  {i === 1 ? "0.008" : i === 2 ? (lang === "zh" ? "即时" : "Instant") : "100%"}
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

function AnalyticsKpiRail({
  items,
  lang,
}: {
  items: Array<{ label: string; value: React.ReactNode; accent: string }>;
  lang: "en" | "zh";
}) {
  return (
    <FrostedPanel
      glowColor="violet"
      sheen
      className="flex h-full min-h-0 flex-col rounded-card p-3"
    >
      <p className="mb-2.5 text-[12px] font-medium text-fg-muted">
        {lang === "zh" ? "关键指标" : "Key metrics"}
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-2 rounded-lg border border-border-token bg-surface-2/50 px-3 py-2.5"
          >
            <span className="text-[11px] font-mono font-medium uppercase tracking-[0.08em] text-fg-muted">
              {item.label}
            </span>
            <span
              className="font-mono text-[15px] font-bold tabular-nums leading-none"
              style={{ color: item.accent }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </FrostedPanel>
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
  const displayVolume = totalVolume || RANGE_DATA[activeRange].reduce((a, d) => a + d.volume, 0);
  const displayTxCount =
    totalTxCount || RANGE_DATA[activeRange].reduce((a, d) => a + d.transactions, 0);

  const kpiItems = [
    {
      label: lang === "zh" ? "已执行" : "VOLUME",
      value: (
        <ScrambleValue
          key={`vol-${activeRange}-${displayVolume}`}
          value={displayVolume}
          duration={0.75}
        />
      ),
      accent: VIOLET,
    },
    {
      label: lang === "zh" ? "拦截" : "BLOCKED",
      value: (
        <ScrambleValue key={`blk-${totalBlocked}`} value={totalBlocked} duration={0.75} />
      ),
      accent: "#FB7185",
    },
    {
      label: lang === "zh" ? "笔数" : "CYCLES",
      value: displayTxCount,
      accent: "#B5FF4D",
    },
    {
      label: lang === "zh" ? "记录" : "RECORDS",
      value: records.length,
      accent: "#60A5FA",
    },
  ];

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
      leftRailLabel={lang === "zh" ? "支出分布" : "Payout mix"}
      leftRail={<PayoutMixRail lang={lang} />}
      rightRailLabel={lang === "zh" ? "关键指标" : "Key metrics"}
      rightRail={<AnalyticsKpiRail items={kpiItems} lang={lang} />}
      stage={
        <FrostedPanel
          glowColor="violet"
          sheen
          className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-card"
        >
          <CornerGlow color="violet" className="-top-24 -right-24" intensity={0.18} />
          <StageCornerAccent color="violet" />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            {!hasExecuted ? (
              <div className="relative flex min-h-0 flex-1 flex-col">
                <ConsolePanelHeader
                  title={lang === "zh" ? "趋势预览" : "Trend preview"}
                  hudPrefix="METRIC::"
                  hudValue={lang === "zh" ? "演示数据" : "DEMO DATA"}
                  hudColor="violet"
                  trailing={<StatusPulse color="violet" label={activeRange.toUpperCase()} size="sm" />}
                />
                <TrendGhostPreview data={RANGE_DATA[activeRange]} />
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 px-6 py-4 text-center">
                  <p className="text-[14px] font-bold text-fg">
                    {lang === "zh" ? "尚无执行数据" : "No execution data yet"}
                  </p>
                  <p className="max-w-sm text-[12px] leading-relaxed text-fg-muted">
                    {lang === "zh"
                      ? "背景为 Demo 趋势占位。完成 Treasury 付款后切换为实时曲线。"
                      : "Ghost trend behind — run Treasury demo for live volume chart."}
                  </p>
                  <Link href="/console/treasury">
                    <ConsoleGhostButton accentHover="violet" className="gap-2 text-xs">
                      {lang === "zh" ? "前往金库" : "Open Treasury"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </ConsoleGhostButton>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ConsolePanelHeader
                  title={t("console.analytics.payoutChart" as any) as string}
                  hudPrefix="METRIC::"
                  hudValue={lang === "zh" ? "实时流量" : "LIVING VOLUME"}
                  hudColor="violet"
                  trailing={
                    <StatusPulse color="violet" label={activeRange.toUpperCase()} size="sm" />
                  }
                />
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
              </>
            )}
          </div>

          <CompareStrip lang={lang} t={(k) => t(k as any) as string} />
        </FrostedPanel>
      }
    />
  );
}
