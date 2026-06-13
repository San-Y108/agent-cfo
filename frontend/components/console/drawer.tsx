"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FlaskConical,
  SlidersHorizontal,
  Wifi,
  AlertTriangle,
  Trash2,
  History,
  FileText,
  Send,
  Shield,
  Database,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/i18n/context";
import { localizeActivityMessage } from "@/lib/console/activity-messages";
import {
  useConsoleState,
  type ActivityEntry,
  type ActivityType,
  type DrawerTab,
} from "@/lib/console/console-state";
import { Scanline, CornerGlow } from "@/components/console/command-deck";

const DRAWER_TABS: { id: DrawerTab; labelZh: string; labelEn: string; icon: React.ElementType; color: string }[] = [
  { id: "sandbox", labelZh: "沙盒", labelEn: "Sandbox", icon: FlaskConical, color: "#5EEAD4" },
  { id: "rules", labelZh: "护栏", labelEn: "Rules", icon: SlidersHorizontal, color: "#FB7185" },
  { id: "activity", labelZh: "活动", labelEn: "Activity", icon: History, color: "#B5FF4D" },
];

const ACTIVITY_META: Record<
  ActivityType,
  { icon: React.ElementType; color: string; label: string }
> = {
  plan: { icon: FileText, color: "#5EEAD4", label: "PLAN" },
  execute: { icon: Send, color: "#B5FF4D", label: "EXEC" },
  rule: { icon: Shield, color: "#FB7185", label: "RULE" },
  records: { icon: Database, color: "#60A5FA", label: "DATA" },
  system: { icon: Terminal, color: "#C084FC", label: "SYS" },
};

export function ConsoleDrawer() {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const { budgetRule, activityLog, drawerOpen, drawerTab, openDrawer, closeDrawer } =
    useConsoleState();

  // Sandbox state
  const [latency, setLatency] = useState(0);
  const [simulateError, setSimulateError] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[sandbox] init · latency 0ms",
    "[sandbox] ready",
  ]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleLatencyChange = (v: number) => {
    setLatency(v);
    addLog(`latency set to ${v}ms`);
  };

  const handleSimErrorToggle = (v: boolean) => {
    setSimulateError(v);
    addLog(v ? "simulate error ENABLED" : "simulate error disabled");
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-fg/25 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "104%" }}
            animate={{ x: 0 }}
            exit={{ x: "104%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-[60] flex h-[100dvh] w-[min(460px,94vw)] flex-col overflow-hidden border-l border-border-token bg-surface/95 shadow-2xl backdrop-blur-2xl"
          >
            {/* ambient glows — softened so controls stay legible */}
            <CornerGlow color="cyan" className="-top-28 -right-28" intensity={0.09} />
            <CornerGlow color="lime" className="-bottom-32 -left-32" intensity={0.05} />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-hud-cyan/20 via-border-strong/30 to-transparent" />

            {/* Header — slightly denser backdrop for tab + close contrast */}
            <div className="relative z-10 flex items-center justify-between border-b border-border-token bg-surface/90 px-5 py-4 backdrop-blur-md">
              <div className="flex gap-1 rounded-xl border border-border-token bg-surface-2/80 p-1">
                {DRAWER_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = drawerTab === tab.id;
                  const label = _(tab.labelZh, tab.labelEn);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => openDrawer(tab.id)}
                      className={cn(
                        "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        active ? "text-fg" : "text-fg-muted hover:text-fg"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="drawer-tab-pill"
                          className="absolute inset-0 rounded-lg border border-border-token bg-surface"
                          transition={{ type: "spring", stiffness: 480, damping: 36 }}
                        />
                      )}
                      <Icon
                        size={13}
                        className="relative z-10"
                        style={{ color: active ? tab.color : undefined }}
                      />
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={closeDrawer}
                aria-label={_("关闭", "Close drawer")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-token bg-surface text-fg shadow-sm transition-colors hover:border-border-strong hover:bg-surface-hover"
              >
                <X size={17} strokeWidth={2.25} />
              </button>
            </div>

            <Scanline
              color={drawerTab === "rules" ? "coral" : drawerTab === "activity" ? "lime" : "cyan"}
              className="relative z-10 opacity-25"
            />

            {/* Content */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5">
              {drawerTab === "sandbox" && (
                <div className="space-y-6">
                  {/* Latency slider */}
                  <div className="rounded-xl border border-border-token bg-surface-2/70 p-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-fg">
                      <Wifi size={13} className="text-hud-cyan" />
                      {_("网络延迟", "Network Latency")}
                      <span className="ml-auto font-mono text-[12px] font-bold tabular-nums text-hud-cyan">
                        {latency}ms
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={5000}
                      step={100}
                      value={latency}
                      onChange={(e) => handleLatencyChange(Number(e.target.value))}
                      className="hud-range mt-3 w-full"
                      style={
                        {
                          "--range-fill": "#5EEAD4",
                          "--range-pct": `${(latency / 5000) * 100}%`,
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  {/* Error toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-border-token bg-surface-2/70 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-hud-coral" />
                      <span className="text-xs font-medium text-fg">{_("模拟错误", "Simulate Error")}</span>
                    </div>
                    <button
                      onClick={() => handleSimErrorToggle(!simulateError)}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        simulateError ? "bg-hud-coral" : "bg-surface-hover"
                      )}
                    >
                      <span
                        className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                        style={{
                          transform: simulateError ? "translateX(16px)" : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Terminal logs */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-fg">{_("实时日志", "Live Logs")}</span>
                      <button
                        onClick={() => setLogs(["[sandbox] cleared"])}
                        className="flex items-center gap-1 rounded-md border border-border-token bg-surface-2 px-2 py-1 text-[10px] font-medium text-fg-muted transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-fg"
                      >
                        <Trash2 size={10} />
                        {_("清空", "Clear")}
                      </button>
                    </div>
                    <div className="rounded-xl border border-border-token bg-surface-2 p-3">
                      <div className="h-52 overflow-y-auto font-mono text-[11px] leading-relaxed text-fg-muted">
                        {logs.map((log, i) => (
                          <div key={i} className="py-0.5">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === "rules" && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-border-token bg-surface-2/50 p-4">
                    <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
                      {_("生效护栏", "Active Guardrails")}
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: _("月预算", "Monthly Budget"), value: `${budgetRule.monthlyBudget} USDC`, color: "#B5FF4D" },
                        { label: _("单笔限额", "Single Payment Limit"), value: `${budgetRule.singlePaymentLimit} USDC`, color: "#60A5FA" },
                        { label: _("允许代币", "Allowed Token"), value: budgetRule.allowedToken, color: "#5EEAD4" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-xs text-fg-muted">{row.label}</span>
                          <span
                            className="font-mono text-sm font-semibold"
                            style={{ color: row.color }}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
                      {_("白名单", "Whitelist")} ({budgetRule.whitelist.length})
                    </div>
                    <ul className="mt-2.5 space-y-1.5">
                      {budgetRule.whitelist.map((addr) => (
                        <li
                          key={addr}
                          className="flex items-center rounded-lg border border-border-token bg-surface-2/50 px-3 py-2"
                        >
                          <span className="truncate font-mono text-[10px] text-fg-muted">
                            {addr.slice(0, 16)}...{addr.slice(-8)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {budgetRule.whitelist.length === 0 && (
                      <p className="mt-2 text-[10px] text-fg-subtle">
                        {_("暂无白名单地址。", "No addresses whitelisted.")}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-hud-coral/15 bg-hud-coral/[0.04] p-3.5">
                    <p className="text-[11px] leading-relaxed text-fg-muted">
                      {_(
                        "规则在 Policy 页编辑，此处为只读视图，与 Treasury / Agent 实时同步。",
                        "Rules are edited on the Policy page. This is a read-only view, synced live with Treasury and the Agent."
                      )}
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === "activity" && (
                <div>
                  {activityLog.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <History size={22} className="text-fg-subtle" />
                      <p className="text-xs text-fg-muted">
                        {_("暂无执行记录", "No activity recorded yet")}
                      </p>
                    </div>
                  ) : (
                    <ol className="relative space-y-0">
                      {activityLog.map((entry, i) => (
                        <ActivityRow
                          key={entry.id}
                          entry={entry}
                          isLast={i === activityLog.length - 1}
                        />
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ActivityRow({ entry, isLast }: { entry: ActivityEntry; isLast: boolean }) {
  const { lang } = useApp();
  const meta = ACTIVITY_META[entry.type];
  const Icon = meta.icon;
  const time = new Date(entry.ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <li className="relative flex gap-3 pb-5">
      {!isLast && (
        <span
          className="absolute left-[13px] top-7 bottom-0 w-px bg-border-token"
          aria-hidden
        />
      )}
      <span
        className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
        style={{
          borderColor: `${meta.color}33`,
          backgroundColor: `${meta.color}0D`,
        }}
      >
        <Icon size={12} style={{ color: meta.color }} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="font-mono text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="shrink-0 font-mono text-[10px] font-medium tabular-nums text-fg-muted">
            {time}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-fg">
          {localizeActivityMessage(entry.message, lang)}
        </p>
      </div>
    </li>
  );
}
