"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  CheckCircle,
  BarChart3,
} from "lucide-react";

import { useApp } from "@/lib/i18n/context";
import { useConsoleState } from "@/lib/console/console-state";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { GradientText } from "@/components/ui/aceternity/colourful-text";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
import { GridBackground } from "@/components/ui/aceternity/background";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
} from "@/components/console/command-deck";

// Client-only Recharts wrappers — avoids SSR container-size warnings.
const AreaChartCard = dynamic(
  () => import("@/components/console/charts/area-chart-card").then((m) => m.AreaChartCard),
  { ssr: false }
);

const PieChartCard = dynamic(
  () => import("@/components/console/charts/pie-chart-card").then((m) => m.PieChartCard),
  { ssr: false }
);

const VIOLET = "#C084FC";

/* ─── Mock range data for chart toggles ─── */
const RANGE_DATA: Record<"30d" | "90d" | "1y", Array<{ month: string; volume: number; gasSaved: number; transactions: number }>> = {
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

/* ─── Time-range pill toggle ─── */
function RangePills({
  active,
  onChange,
}: {
  active: "30d" | "90d" | "1y";
  onChange: (r: "30d" | "90d" | "1y") => void;
}) {
  const ranges: ("30d" | "90d" | "1y")[] = ["30d", "90d", "1y"];
  return (
    <div className="flex border rounded-lg p-1 bg-surface-2 dark:bg-white/[0.03] border-border-token dark:border-white/[0.06]">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`relative px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            active === r
              ? "text-accent-fg"
              : "text-fg-muted hover:text-fg"
          }`}
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

/* ─── Page ─── */
export default function AnalyticsPage() {
  const { t, lang } = useApp();
  const { plan, records } = useConsoleState();
  const [activeRange, setActiveRange] = useState<"30d" | "90d" | "1y">("90d");

  /* ─── derive KPIs from global execution state ─── */
  const executedItems = plan.filter((i) => i.status === "Executed");
  const blockedItems = plan.filter((i) => i.status === "Blocked");
  const totalVolume = executedItems.reduce((a, c) => a + c.record.amount, 0);
  const totalBlocked = blockedItems.reduce((a, c) => a + c.record.amount, 0);
  const totalTxCount = executedItems.length;
  const gasPerTx = 5;
  const totalGasSaved = totalTxCount * gasPerTx;

  /* Fallback to mock headline numbers before any plan exists. */
  const displayVolume = totalVolume || RANGE_DATA[activeRange].reduce((a, d) => a + d.volume, 0);
  const displayGasSaved = totalGasSaved || RANGE_DATA[activeRange].reduce((a, d) => a + d.gasSaved, 0);
  const displayTxCount = totalTxCount || RANGE_DATA[activeRange].reduce((a, d) => a + d.transactions, 0);

  const kpis = [
    {
      prefix: "VOLUME::",
      value: <AnimatedNumber value={displayVolume} />,
      sub: lang === "zh" ? "已执行总金额 (USDC)" : "Total executed (USDC)",
      color: "violet" as const,
      icon: TrendingUp,
    },
    {
      prefix: "BLOCKED::",
      value: <AnimatedNumber value={totalBlocked} />,
      sub: lang === "zh" ? "被拦截金额 (USDC)" : "Blocked amount (USDC)",
      color: "coral" as const,
      icon: Zap,
    },
    {
      prefix: "CYCLES::",
      value: `${displayTxCount}`,
      sub: lang === "zh" ? "执行笔数" : "Executed payments",
      color: "lime" as const,
      icon: CheckCircle,
    },
    {
      prefix: "RECORDS::",
      value: `${records.length}`,
      sub: lang === "zh" ? "待处理记录" : "Pending records",
      color: "blue" as const,
      icon: BarChart3,
    },
  ];

  return (
    <div className="relative w-full min-h-full">
      {/* ─── Header ─── */}
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#C084FC]/10 border border-[#C084FC]/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#C084FC]" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C084FC] font-mono">
              Performance & Gas
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="relative inline-block">
              <GradientText className="text-2xl font-semibold leading-tight tracking-tight">
                {t("console.analytics.title" as any)}
              </GradientText>
              <SparklesFX
                count={8}
                className="absolute -right-8 -top-2 w-16 h-16"
                color="#C084FC"
              />
            </div>
            <RangePills active={activeRange} onChange={setActiveRange} />
          </div>
          <p className="mt-2 text-sm text-fg-subtle max-w-xl">
            {t("console.analytics.desc" as any)}
          </p>
        </motion.div>
      </div>

      {/* ─── Command Deck Layout ─── */}
      <div className="px-6 lg:px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: KPI satellite column */}
          <motion.div
            className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-3 content-start"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.prefix}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <FrostedPanel glowColor={kpi.color} sheen className="p-4">
                  <HudLabel prefix={kpi.prefix} value={kpi.value} color={kpi.color} size="sm" />
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold font-mono text-success">
                    <kpi.icon className="w-3 h-3" />
                    {kpi.sub}
                  </div>
                </FrostedPanel>
              </motion.div>
            ))}
          </motion.div>

          {/* Center: Area Chart Hero */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FrostedPanel
              glowColor="violet"
              scanline
              sheen
              className="relative min-h-[520px] p-6"
            >
              <CornerGlow color="violet" className="-top-24 -right-24" intensity={0.2} />

              <div className="relative z-10 flex items-start justify-between mb-4">
                <div>
                  <HudLabel prefix="METRIC::" value="LIVING VOLUME" color="violet" size="md" />
                  <h2 className="mt-1 text-lg font-semibold text-fg">
                    {t("console.analytics.payoutChart" as any)}
                  </h2>
                </div>
                <StatusPulse color="violet" label={activeRange.toUpperCase()} size="sm" />
              </div>

              <Scanline color="violet" className="relative z-10 mb-4" />

              <div className="relative z-10">
                <AreaChartCard
                  embedded
                  lang={lang}
                  title={t("console.analytics.payoutChart" as any)}
                  hint={t("console.analytics.chartHover" as any)}
                  description={t("console.analytics.chartDesc" as any)}
                  data={RANGE_DATA[activeRange]}
                />
              </div>
            </FrostedPanel>
          </motion.div>

          {/* Right: Pie Chart satellite */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FrostedPanel glowColor="violet" sheen className="h-full p-4">
              <PieChartCard
                embedded
                lang={lang}
                title={t("console.analytics.pieTitle" as any)}
                description={t("console.analytics.pieDesc" as any)}
                totalLabel={lang === "zh" ? "总计" : "Total"}
              />
            </FrostedPanel>
          </motion.div>
        </div>

        {/* Bottom: Comparison Matrix strip */}
        <div className="mt-6">
          <FrostedPanel glowColor="violet" sheen className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" style={{ color: VIOLET }} />
              <span className="text-sm font-semibold text-fg">
                {t("console.analytics.optimalTitle" as any)}
              </span>
            </div>

            <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory md:overflow-visible md:snap-none pb-1">
              {[1, 2, 3].map((i) => {
                const isWinning = i === 1 || i === 3;
                return (
                  <BentoCard
                    key={i}
                    index={i}
                    glowColor={VIOLET}
                    title={t(`console.analytics.compare${i}Title` as any) as string}
                    className="snap-start min-w-[280px] md:min-w-0 text-xs"
                  >
                    <div className="relative space-y-1.5 pt-1">
                      {/* Subtle grid backdrop on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <GridBackground />
                      </div>
                      <div className="relative z-10 flex justify-between font-mono">
                        <span className="text-fg-subtle">{t(`console.analytics.compare${i}Row1` as any)}</span>
                        <span className="text-fg">
                          {i === 1 ? "0.05 ETH" : i === 2 ? "~3 Hours" : lang === "zh" ? "无风控约束" : "No compliance"}
                        </span>
                      </div>
                      <div className="relative z-10 flex justify-between font-mono">
                        <span className="text-fg">{t(`console.analytics.compare${i}Row2` as any)}</span>
                        <span
                          className="relative font-bold inline-block"
                          style={{ color: i === 1 ? "#34d399" : i === 2 ? VIOLET : "#34d399" }}
                        >
                          {i === 1
                            ? "0.008 ETH"
                            : i === 2
                            ? lang === "zh"
                              ? "即时签发 (毫秒级)"
                              : "Instant (Seconds)"
                            : lang === "zh"
                            ? "100% 策略验证"
                            : "100% Guard enforcement"}
                          {isWinning && (
                            <SparklesFX
                              count={4}
                              color="#34d399"
                              className="absolute -inset-1"
                            />
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="relative z-10 text-[10px] italic border-t border-border-token dark:border-white/[0.06] pt-1.5 mt-2 text-fg-subtle">
                      {t(`console.analytics.compare${i}Note` as any)}
                    </p>
                  </BentoCard>
                );
              })}
            </div>
          </FrostedPanel>
        </div>
      </div>
    </div>
  );
}
