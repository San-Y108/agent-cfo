"use client";

import React, { useEffect, useRef, useState } from "react";
import { PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie as RePie,
  Sector,
  Cell,
} from "recharts";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
import { useApp } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const VIOLET = "#C084FC";

/** Neon palette — dark console */
const SLICE_COLORS_DARK = [
  "#5EEAD4",
  "#FB7185",
  "#B5FF4D",
  "#60A5FA",
  "#C084FC",
];

/** Saturated palette — light console (readable on white) */
const SLICE_COLORS_LIGHT = [
  "#0e7490",
  "#be123c",
  "#4d7c0f",
  "#1d4ed8",
  "#6d28d9",
];

const RECIPIENT_TYPE_DATA = [
  { name: "Core Contributors", value: 12500 },
  { name: "QA Testing", value: 5400 },
  { name: "Community Devs", value: 4300 },
  { name: "API Nodes", value: 2300 },
  { name: "Misc", value: 1200 },
];

const PieAny = RePie as any;

function sliceColors(isDark: boolean) {
  return isDark ? SLICE_COLORS_DARK : SLICE_COLORS_LIGHT;
}

export interface PieChartCardProps {
  lang: "en" | "zh";
  title: string;
  description: string;
  totalLabel: string;
  embedded?: boolean;
  variant?: "full" | "compact" | "rail";
}

export function PieChartCard({
  lang,
  title,
  description,
  totalLabel,
  embedded = false,
  variant = "full",
}: PieChartCardProps) {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const colors = sliceColors(isDark);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const totalPieValue = RECIPIENT_TYPE_DATA.reduce((a, d) => a + d.value, 0);

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

  const zhNames: Record<string, string> = {
    "Core Contributors": "核心贡献者 / Core Contributors",
    "QA Testing": "QA 交付物 / QA Testing",
    "Community Devs": "社区开发者 / Community Devs",
    "API Nodes": "索引与 Web3 API 节点 / API Nodes",
    Misc: "其他 / Misc",
  };

  const isCompact = variant === "compact";
  const isRail = variant === "rail";
  const innerR = isRail ? 30 : isCompact ? 34 : 50;
  const outerR = isRail ? 44 : isCompact ? 48 : 70;

  const chartBlock = (
    <div
      ref={wrapperRef}
      className={cn(
        "relative flex justify-center",
        isRail ? "min-h-[72px] flex-1" : isCompact ? "h-28" : "h-40"
      )}
    >
        {size ? (
          <ResponsiveContainer width={size.width} height={size.height}>
            <PieChart>
              <PieAny
                data={RECIPIENT_TYPE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={innerR}
                outerRadius={outerR}
                paddingAngle={5}
                dataKey="value"
                stroke="var(--surface)"
                strokeWidth={2}
                shape={(props: any) => {
                  const { index, outerRadius, ...rest } = props;
                  const isActive = activePieIndex === index;
                  const fill = colors[index % colors.length];
                  return (
                    <Sector
                      {...rest}
                      index={index}
                      fill={fill}
                      outerRadius={isActive ? (outerRadius as number) + 8 : outerRadius}
                      stroke={isActive ? "var(--surface)" : "var(--surface)"}
                      strokeWidth={2}
                      style={{
                        filter: isActive ? `drop-shadow(0 0 10px ${fill})` : undefined,
                        transition: "all 0.2s ease",
                      }}
                    />
                  );
                }}
                onMouseEnter={(_data: any, index: number) => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(null)}
              >
                {RECIPIENT_TYPE_DATA.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} stroke="var(--surface)" />
                ))}
              </PieAny>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-lg bg-surface-2/40 animate-pulse" />
        )}

        {/* Center total — AnimatedNumber */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-[9px] font-mono uppercase text-fg-subtle tracking-wider">
              {totalLabel}
            </div>
            <div className={cn("font-extrabold text-fg tabular-nums", isRail ? "text-sm" : isCompact ? "text-sm" : "text-lg")}>
              $<AnimatedNumber value={totalPieValue} />
            </div>
          </div>
        </div>
      </div>
  );

  const legendBlock = (
      <div className={cn("space-y-2", isCompact && "space-y-1 text-[11px]", isRail && "min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5")}>
        {RECIPIENT_TYPE_DATA.map((entry, idx) => {
          const displayLabel = lang === "zh" ? zhNames[entry.name] || entry.name : entry.name;
          const isActive = activePieIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                "flex justify-between items-center text-xs rounded-lg px-2 transition-colors cursor-default hover:bg-surface-2/40",
                isRail ? "py-0" : "py-1"
              )}
              onMouseEnter={() => setActivePieIndex(idx)}
              onMouseLeave={() => setActivePieIndex(null)}
            >
              <div className="flex items-center gap-1.5 truncate mr-1">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                  style={{
                    backgroundColor: colors[idx % colors.length],
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                    boxShadow: isActive ? `0 0 8px ${colors[idx % colors.length]}` : undefined,
                  }}
                />
                <span className={`font-medium truncate ${isActive ? "text-fg" : "text-fg-muted"}`}>
                  {displayLabel}
                </span>
              </div>
              <span className="font-mono font-bold shrink-0 text-fg">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
  );

  const content = (
    <>
      {!embedded && (
        <div className="border-b border-border-token pb-3">
          <h3 className="text-sm font-bold text-fg flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" style={{ color: VIOLET }} />
            {title}
          </h3>
          <p className="text-[11px] mt-0.5 text-fg-subtle">{description}</p>
        </div>
      )}

      {isCompact ? (
        <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
          {chartBlock}
          {legendBlock}
        </div>
      ) : isRail ? (
        <div className="flex min-h-0 flex-1 flex-col gap-1">
          {chartBlock}
          {legendBlock}
        </div>
      ) : (
        <>
          {chartBlock}
          {legendBlock}
        </>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className={cn("flex h-full min-h-0 flex-col", isRail ? "gap-0" : "space-y-4")}>
        {content}
      </div>
    );
  }

  return (
    <BentoCard
      index={1}
      glowColor={VIOLET}
      className="p-6 flex flex-col justify-between space-y-4"
    >
      {content}
    </BentoCard>
  );
}
