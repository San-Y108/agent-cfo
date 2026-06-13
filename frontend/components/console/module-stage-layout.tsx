"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { HudLabel, StatusPulse } from "@/components/console/command-deck";
import type { HudColor } from "@/components/console/command-deck/hud-label";

export interface ModuleStageHeaderProps {
  moduleColor: HudColor;
  moduleLabel: string;
  title: string;
  subtitle?: string;
  statusPulse?: { color: HudColor; label: string };
  headerExtra?: React.ReactNode;
}

export function ModuleStageHeader({
  moduleColor,
  moduleLabel,
  title,
  subtitle,
  statusPulse,
  headerExtra,
}: ModuleStageHeaderProps) {
  return (
    <header className="console-module-header flex shrink-0 items-center justify-between gap-3 border-b border-border-token px-1 py-2.5 md:px-0 md:py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <HudLabel prefix="MODULE::" value={moduleLabel} color={moduleColor} size="sm" />
          <h1 className="text-[14px] font-bold tracking-tight text-fg">{title}</h1>
          {subtitle && (
            <span className="hidden text-[12px] text-fg-muted sm:inline">{subtitle}</span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-fg-muted sm:hidden">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {headerExtra}
        {statusPulse && (
          <StatusPulse color={statusPulse.color} label={statusPulse.label} size="sm" />
        )}
      </div>
    </header>
  );
}

export interface ModuleStageLayoutProps extends ModuleStageHeaderProps {
  leftRail?: React.ReactNode;
  leftRailLabel?: string;
  stage: React.ReactNode;
  rightRail?: React.ReactNode;
  rightRailLabel?: string;
  detail?: React.ReactNode;
  detailLabel?: string;
  /** Desktop defaults to expanded so DetailDeck is never an empty strip. */
  detailDefaultOpen?: boolean;
  /** Allow collapsing DetailDeck on mobile only. */
  detailCollapsible?: boolean;
  /** Unbounded mode: page-level scroll, no internal scrollbars. Used by Treasury. */
  unbounded?: boolean;
  className?: string;
}

function RailAccordion({
  label,
  children,
  defaultOpen = false,
  className,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("lg:hidden", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border-token bg-surface-2/50 px-3 py-2 text-left"
      >
        <span className="text-xs font-semibold text-fg">{label}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-fg-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-fg-muted" />
        )}
      </button>
      {open && <div className="mt-2 max-h-[38vh] min-h-0 overflow-y-auto">{children}</div>}
    </div>
  );
}

export function ModuleStageLayout({
  leftRail,
  leftRailLabel = "Panel",
  stage,
  rightRail,
  rightRailLabel = "Details",
  detail,
  detailLabel = "Details",
  detailDefaultOpen = true,
  detailCollapsible = true,
  unbounded = false,
  className,
  ...headerProps
}: ModuleStageLayoutProps) {
  const [detailOpen, setDetailOpen] = useState(detailDefaultOpen);

  useEffect(() => {
    setDetailOpen(detailDefaultOpen);
  }, [detailDefaultOpen]);

  const hasLeftRail = Boolean(leftRail);
  const hasRightRail = Boolean(rightRail);
  const hasSideRails = hasLeftRail || hasRightRail;

  const stageGridClass = (() => {
    const fillClass = unbounded ? "" : "min-h-0 flex-1";
    if (!hasSideRails) return cn("flex flex-col", fillClass);
    if (hasLeftRail && hasRightRail) {
      return cn(
        "grid grid-cols-1 gap-3 lg:grid-cols-[minmax(248px,268px)_minmax(0,1fr)_minmax(228px,248px)] lg:items-stretch lg:gap-3.5",
        fillClass
      );
    }
    if (hasLeftRail) {
      return cn(
        "grid grid-cols-1 gap-3 lg:grid-cols-[minmax(248px,268px)_minmax(0,1fr)] lg:items-stretch lg:gap-3.5",
        fillClass
      );
    }
    return cn(
      "grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(228px,248px)] lg:items-stretch lg:gap-3.5",
      fillClass
    );
  })();

  const showDetailBody = detailOpen || !detailCollapsible;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "console-stage-root flex w-full max-w-none flex-col px-3 py-3 md:px-5 md:py-3",
        unbounded ? "min-h-[calc(100dvh-4rem)] overflow-visible pt-0" : "h-full min-h-0 overflow-hidden",
        className
      )}
    >
      <ModuleStageHeader {...headerProps} />

      <div className={cn("console-stage-grid", stageGridClass)}>
        {leftRail && (
          <>
            <RailAccordion label={leftRailLabel} defaultOpen={false}>
              {leftRail}
            </RailAccordion>
            <div className={cn("hidden lg:block", unbounded ? "" : "h-full min-h-0 overflow-hidden")}>{leftRail}</div>
          </>
        )}

        <div className={cn("console-stage-hero", unbounded ? "" : "min-h-0 overflow-hidden")}>{stage}</div>

        {rightRail && (
          <>
            <RailAccordion label={rightRailLabel} defaultOpen={false}>
              {rightRail}
            </RailAccordion>
            <div className={cn("hidden lg:block", unbounded ? "" : "h-full min-h-0 overflow-hidden")}>{rightRail}</div>
          </>
        )}
      </div>

      {detail && (
        <div className={cn(
          "console-detail-deck mt-2 flex shrink-0 flex-col border-t border-border-token pt-2",
          unbounded ? "" : "max-h-[min(42vh,360px)] lg:max-h-[min(40vh,340px)]"
        )}>
          {detailCollapsible ? (
            <button
              type="button"
              onClick={() => setDetailOpen((v) => !v)}
              className="mb-1 flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-surface-hover lg:pointer-events-none lg:cursor-default"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">
                {detailLabel}
              </span>
              <span className="lg:hidden">
                {detailOpen ? (
                  <ChevronUp className="h-4 w-4 text-fg-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-fg-muted" />
                )}
              </span>
            </button>
          ) : (
            <div className="mb-1 px-2 py-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">
                {detailLabel}
              </span>
            </div>
          )}

          <div
            className={cn(
              "console-detail-scroll min-h-0 flex-1 overflow-y-auto px-0.5 pb-1",
              showDetailBody ? "block" : "hidden",
              "lg:!block"
            )}
          >
            {detail}
          </div>
        </div>
      )}
    </motion.div>
  );
}
