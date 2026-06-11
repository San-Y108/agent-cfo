"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  CheckCircle,
  Info,
  BarChart3,
  PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useApp } from "@/lib/i18n/context";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { GradientOrb } from "@/components/ui/aceternity/background";
import { GradientText } from "@/components/ui/aceternity/colourful-text";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";

const VIOLET = "#C084FC";
const VIOLET_LIGHT = "#A855F7";

/* ─── 5 stage colours for pie chart ─── */
const STAGE_COLORS = [
  "#5EEAD4", // cyan
  "#FB7185", // coral
  "#B5FF4D", // lime
  "#60A5FA", // blue
  "#C084FC", // violet
];

/* ─── Mock data (mirrors AI Studio shape) ─── */
const MONTHLY_VOLUME_DATA = [
  { month: "Jan", volume: 8400, gasSaved: 120, transactions: 14 },
  { month: "Feb", volume: 10200, gasSaved: 180, transactions: 19 },
  { month: "Mar", volume: 15600, gasSaved: 290, transactions: 26 },
  { month: "Apr", volume: 13200, gasSaved: 220, transactions: 22 },
  { month: "May", volume: 19800, gasSaved: 380, transactions: 34 },
  { month: "Jun", volume: 24500, gasSaved: 490, transactions: 41 },
];

const RECIPIENT_TYPE_DATA = [
  { name: "Core Contributors", value: 12500 },
  { name: "QA Testing", value: 5400 },
  { name: "Community Devs", value: 4300 },
  { name: "API Nodes", value: 2300 },
  { name: "Misc", value: 1200 },
];

const MONTH_NAMES_ZH: Record<string, string> = {
  Jan: "一月",
  Feb: "二月",
  Mar: "三月",
  Apr: "四月",
  May: "五月",
  Jun: "六月",
};

/* ─── KPI card component ─── */
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-5 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.03] space-y-2"
    >
      <span className="text-[10px] font-mono font-bold uppercase text-fg-muted tracking-wider">
        {label}
      </span>
      <div
        className="text-3xl font-extrabold tracking-tight tabular-nums"
        style={{
          background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_LIGHT} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-success font-semibold font-mono">
        <Icon className="w-3.5 h-3.5" />
        {sub}
      </div>
    </motion.div>
  );
}

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
  const [activeRange, setActiveRange] = useState<"30d" | "90d" | "1y">("90d");

  const totalVolume = MONTHLY_VOLUME_DATA.reduce((a, d) => a + d.volume, 0);
  const totalGasSaved = MONTHLY_VOLUME_DATA.reduce((a, d) => a + d.gasSaved, 0);
  const totalTxCount = MONTHLY_VOLUME_DATA.reduce((a, d) => a + d.transactions, 0);

  return (
    <div className="p-6 space-y-6 relative">
      {/* ─── Ambient orb: Analytics = violet ─── */}
      <GradientOrb color="violet" className="-top-32 -right-32" />

      {/* ── Header + range toggle ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.03]"
      >
        <div>
          <div className="relative inline-block">
            <GradientText className="text-xl font-bold tracking-tight">
              {t("console.analytics.title" as any)}
            </GradientText>
            <SparklesFX
              count={6}
              className="absolute -right-6 -top-1 w-12 h-12"
              color="#C084FC"
            />
          </div>
          <p className="text-xs mt-1 text-fg-subtle">
            {t("console.analytics.desc" as any)}
          </p>
        </div>
        <RangePills active={activeRange} onChange={setActiveRange} />
      </motion.div>

      {/* ── KPI banner ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t("console.analytics.conducted" as any)}
          value={<AnimatedNumber value={totalVolume} />}
          sub={lang === "zh" ? "较上期 +24%" : "+24% vs last period"}
          icon={TrendingUp}
          delay={0.05}
        />
        <KpiCard
          label={t("console.analytics.gasSavedTitle" as any)}
          value={`$${totalGasSaved.toLocaleString()}`}
          sub={
            lang === "zh"
              ? `通过批处理节省了 ${totalGasSaved * 4} gwei`
              : `Saved ${totalGasSaved * 4} gwei via batching`
          }
          icon={Zap}
          delay={0.1}
        />
        <KpiCard
          label={t("console.analytics.scheduled" as any)}
          value={`${totalTxCount} ${lang === "zh" ? "个周期" : "Cycles"}`}
          sub={lang === "zh" ? "100% 规则合规率" : "100% compliance rate"}
          icon={CheckCircle}
          delay={0.15}
        />
        <KpiCard
          label={t("console.analytics.latency" as any)}
          value="1.8s"
          sub={lang === "zh" ? "底层 API 区块同步活跃" : "API block sync active"}
          icon={BarChart3}
          delay={0.2}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.03] p-6 space-y-4"
        >
          <div className="flex justify-between items-center border-b border-border-token dark:border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-fg">
              <TrendingUp className="w-4 h-4" style={{ color: VIOLET }} />
              {t("console.analytics.payoutChart" as any)}
            </h3>
            <span className="text-xs font-mono text-fg-subtle">
              {t("console.analytics.chartHover" as any)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_VOLUME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VIOLET} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={VIOLET} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-fg-subtle"
                />
                <YAxis
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-fg-subtle"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as any;
                      const monthName =
                        lang === "zh"
                          ? MONTH_NAMES_ZH[data.month] || data.month
                          : `${data.month} Payouts`;
                      return (
                        <div className="p-3 border rounded-lg shadow-xl text-[11px] font-mono space-y-1 bg-surface dark:bg-[#0b1120] border-border-token dark:border-white/[0.08] text-fg">
                          <div className="font-bold border-b border-border-token dark:border-white/[0.08] pb-1 mb-1">
                            {monthName}
                          </div>
                          <div>
                            {lang === "zh" ? "交易额" : "Volume"}:{" "}
                            <span style={{ color: VIOLET }} className="font-bold">
                              ${data.volume} USDC
                            </span>
                          </div>
                          <div>
                            {lang === "zh" ? "交易笔数" : "Transactions"}: <span>{data.transactions}</span>
                          </div>
                          <div>
                            {lang === "zh" ? "节省 Gas" : "Gas saved"}:{" "}
                            <span className="text-success font-bold">${data.gasSaved}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke={VIOLET}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] flex items-start gap-1.5 p-3 rounded-lg border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.02] text-fg-subtle">
            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: VIOLET }} />
            <span>{t("console.analytics.chartDesc" as any)}</span>
          </p>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.03] p-6 flex flex-col justify-between space-y-4"
        >
          <div className="border-b border-border-token dark:border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" style={{ color: VIOLET }} />
              {t("console.analytics.pieTitle" as any)}
            </h3>
            <p className="text-[11px] mt-0.5 text-fg-subtle">
              {t("console.analytics.pieDesc" as any)}
            </p>
          </div>

          <div className="flex justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RECIPIENT_TYPE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {RECIPIENT_TYPE_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {RECIPIENT_TYPE_DATA.map((entry, idx) => {
              const zhNames: Record<string, string> = {
                "Core Contributors": "核心贡献者 / Core Contributors",
                "QA Testing": "QA 交付物 / QA Testing",
                "Community Devs": "社区开发者 / Community Devs",
                "API Nodes": "索引与 Web3 API 节点 / API Nodes",
                Misc: "其他 / Misc",
              };
              const displayLabel = lang === "zh" ? zhNames[entry.name] || entry.name : entry.name;
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 truncate mr-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length] }}
                    />
                    <span className="font-medium truncate text-fg-muted">{displayLabel}</span>
                  </div>
                  <span className="font-mono font-bold shrink-0 text-fg">
                    ${entry.value.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Comparison matrix ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-xl border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.03] p-6"
      >
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-fg">
          <Zap className="w-4 h-4" style={{ color: VIOLET }} />
          {t("console.analytics.optimalTitle" as any)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.03] space-y-2"
            >
              <span className="text-[10px] font-mono uppercase text-fg-muted tracking-wider">
                {t(`console.analytics.compare${i}Title` as any)}
              </span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between font-mono">
                  <span className="text-fg-subtle">{t(`console.analytics.compare${i}Row1` as any)}</span>
                  <span className="text-fg">
                    {i === 1 ? "0.05 ETH" : i === 2 ? "~3 Hours" : lang === "zh" ? "无风控约束" : "No compliance"}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-fg">{t(`console.analytics.compare${i}Row2` as any)}</span>
                  <span
                    className="font-bold"
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
                  </span>
                </div>
              </div>
              <p className="text-[10px] italic border-t border-border-token dark:border-white/[0.06] pt-1.5 mt-2 text-fg-subtle">
                {t(`console.analytics.compare${i}Note` as any)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
