/** @deprecated Superseded by app/console/analytics/page.tsx — migrate to stages/ */
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

const AreaChartCard = dynamic(
  () => import("@/components/console/charts/area-chart-card").then((m) => m.AreaChartCard),
  { ssr: false }
);

const PieChartCard = dynamic(
  () => import("@/components/console/charts/pie-chart-card").then((m) => m.PieChartCard),
  { ssr: false }
);

const VIOLET = "#C084FC";

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

function RangePills({
  active,
  onChange,
}: {
  active: "30d" | "90d" | "1y";
  onChange: (r: "30d" | "90d" | "1y") => void;
}) {
  const ranges: ("30d" | "90d" | "1y")[] = ["30d", "90d", "1y"];
  return (
    <div className="flex border rounded-lg p-1 bg-white/[0.03] border-white/[0.06]">
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
              layoutId="analytics-range-pill-module"
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

export function AnalyticsModule() {
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
  const displayVolume = totalVolume || 91700;
  const displayGasSaved = totalGasSaved || 1580;
  const displayTxCount = totalTxCount || 156;

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
    <div className="space-y-4">
      {/* ─── KPI grid ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
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

      {/* ─── Area Chart Hero ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <FrostedPanel
          glowColor="violet"
          scanline
          sheen
          className="relative p-5"
        >
          <CornerGlow color="violet" className="-top-24 -right-24" intensity={0.2} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <HudLabel prefix="METRIC::" value="LIVING VOLUME" color="violet" size="md" />
              <h2 className="mt-1 text-base font-semibold text-fg">
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

          <div className="relative z-10 mt-4 flex justify-end">
            <RangePills active={activeRange} onChange={setActiveRange} />
          </div>
        </FrostedPanel>
      </motion.div>

      {/* ─── Pie Chart satellite ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <FrostedPanel glowColor="violet" sheen className="p-4">
          <PieChartCard
            embedded
            lang={lang}
            title={t("console.analytics.pieTitle" as any)}
            description={t("console.analytics.pieDesc" as any)}
            totalLabel={lang === "zh" ? "总计" : "Total"}
          />
        </FrostedPanel>
      </motion.div>

      {/* ─── Comparison Matrix strip ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <FrostedPanel glowColor="violet" sheen className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4" style={{ color: VIOLET }} />
            <span className="text-sm font-semibold text-fg">
              {t("console.analytics.optimalTitle" as any)}
            </span>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => {
              const isWinning = i === 1 || i === 3;
              return (
                <BentoCard
                  key={i}
                  index={i}
                  glowColor={VIOLET}
                  title={t(`console.analytics.compare${i}Title` as any) as string}
                  className="text-xs"
                >
                  <div className="relative space-y-1.5 pt-1">
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
                  <p className="relative z-10 text-[10px] italic border-t border-white/[0.06] pt-1.5 mt-2 text-fg-subtle">
                    {t(`console.analytics.compare${i}Note` as any)}
                  </p>
                </BentoCard>
              );
            })}
          </div>
        </FrostedPanel>
      </motion.div>
    </div>
  );
}
