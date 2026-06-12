"use client";

import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, Info } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
import { GridBackground } from "@/components/ui/aceternity/background";

const VIOLET = "#C084FC";

const MONTHLY_VOLUME_DATA = [
  { month: "Jan", volume: 8400, gasSaved: 120, transactions: 14 },
  { month: "Feb", volume: 10200, gasSaved: 180, transactions: 19 },
  { month: "Mar", volume: 15600, gasSaved: 290, transactions: 26 },
  { month: "Apr", volume: 13200, gasSaved: 220, transactions: 22 },
  { month: "May", volume: 19800, gasSaved: 380, transactions: 34 },
  { month: "Jun", volume: 24500, gasSaved: 490, transactions: 41 },
];

const MONTH_NAMES_ZH: Record<string, string> = {
  Jan: "一月",
  Feb: "二月",
  Mar: "三月",
  Apr: "四月",
  May: "五月",
  Jun: "六月",
};

export interface AreaChartCardProps {
  lang: "en" | "zh";
  title: string;
  hint: string;
  description: string;
  embedded?: boolean;
  data?: Array<{ month: string; volume: number; gasSaved: number; transactions: number }>;
}

export function AreaChartCard({ lang, title, hint, description, embedded = false, data = MONTHLY_VOLUME_DATA }: AreaChartCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };

    update();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, []);

  const content = (
    <>
      {!embedded && (
        <div className="flex justify-between items-center border-b border-border-token dark:border-white/[0.06] pb-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-fg">
            <TrendingUp className="w-4 h-4" style={{ color: VIOLET }} />
            {title}
          </h3>
          <span className="text-xs font-mono text-fg-subtle">{hint}</span>
        </div>
      )}

      <div ref={wrapperRef} className="relative h-72 w-full">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <GridBackground />
        </div>
        {size ? (
          <ResponsiveContainer width={size.width} height={size.height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={VIOLET} stopOpacity="0.4" />
                  <stop offset="95%" stopColor={VIOLET} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke={VIOLET}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                className="text-fg-subtle"
                style={{ filter: `drop-shadow(0 0 4px ${VIOLET}40)` }}
              />
              <YAxis
                stroke={VIOLET}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                className="text-fg-subtle"
                style={{ filter: `drop-shadow(0 0 4px ${VIOLET}40)` }}
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
                animationDuration={1500}
                animationBegin={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-lg bg-white/[0.03] animate-pulse" />
        )}
      </div>

      <p className="text-[11px] flex items-start gap-1.5 p-3 rounded-lg border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.02] text-fg-subtle">
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: VIOLET }} />
        <span>{description}</span>
      </p>
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        {content}
      </div>
    );
  }

  return (
    <BentoCard index={0} glowColor={VIOLET} className="lg:col-span-2 p-6 space-y-4">
      {content}
    </BentoCard>
  );
}
