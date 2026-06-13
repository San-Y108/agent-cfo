"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  ShieldAlert,
  CheckCircle,
  Send,
  RefreshCw,
  Plus,
  Hash,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCheck,
  ArrowRight,
  XCircle,
  Sparkles,
  Clock,
  Users,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { localizeActivityMessage } from "@/lib/console/activity-messages";
import { useConsoleState, FlowStep } from "@/lib/console/console-state";
import type { ContributorRecord, PaymentPlanItem, BudgetRules } from "@/lib/types/console";
import type { CawStatus } from "@/lib/api/types";
import type { ActivityEntry } from "@/lib/console/console-state";
import { RecordsImport } from "@/components/console/records-import";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { ColourfulText } from "@/components/ui/aceternity/colourful-text";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import { GridBackground } from "@/components/ui/aceternity/background";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
import { HolographicButton } from "@/components/ui/holographic-button";
import { FlowTimeline } from "@/components/console/flow-timeline";
import { RiskGateAnimation } from "@/components/console/risk-gate-anim";
import { ModuleStageLayout } from "@/components/console/module-stage-layout";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
  ConsoleTelemetryGrid,
  ConsolePanelHeader,
  StageCornerAccent,
  BeamBurst,
  DetailDeckShell,
  PreflightRow,
} from "@/components/console/command-deck";
import { ScrambleValue } from "@/components/ui/gsap-text-effects";
import { isMockMode } from "@/lib/api/client";

/* =============================================================================
 * BUSINESS LOGIC HELPERS
 * ===========================================================================*/

/* =============================================================================
 * TREASURY MODULE — Payment execution workspace inside the side panel.
 * ===========================================================================*/

export function TreasuryModule() {
  const { t, lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

  /* ─── global console state ─── */
  const {
    budgetRule,
    records,
    plan,
    step,
    isExecuting,
    flowError,
    auditReportId,
    cawStatuses,
    addRecords,
    resetFlow,
    generatePlan,
    executePlan,
    refreshCawStatus,
    clearFlowError,
    activityLog,
  } = useConsoleState();
  const [cawRefreshing, setCawRefreshing] = useState(false);

  const [newName, setNewName] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newAmount, setNewAmount] = useState(10);
  const [importOpen, setImportOpen] = useState(false);

  /* ─── derived metrics ─── */
  const totalBudget = budgetRule.monthlyBudget;
  const totalPending = records.reduce((a, c) => a + c.amount, 0);
  const readyItems = plan.filter((i) => i.status === "Ready");
  const blockedItems = plan.filter((i) => i.status === "Blocked");
  const executedItems = plan.filter((i) => i.status === "Executed");
  const totalReady = readyItems.reduce((a, c) => a + c.record.amount, 0);
  const totalBlocked = blockedItems.reduce((a, c) => a + c.record.amount, 0);
  const totalExecuted = executedItems.reduce((a, c) => a + c.record.amount, 0);
  const budgetRemaining = totalBudget - totalExecuted;

  /* ─── handlers ─── */
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newWallet) return;
    addRecords([
      {
        id: `rec_${Date.now()}`,
        name: newName,
        role: "Contributor",
        task: "Completed milestone",
        wallet: newWallet,
        amount: Number(newAmount),
        token: "USDC",
      },
    ]);
    setNewName("");
    setNewWallet("");
    setNewAmount(10);
  };

  const handleImportRecords = (imported: ContributorRecord[]) => {
    addRecords(imported);
  };

  const handleGenerate = () => {
    generatePlan();
  };

  const handleExecute = () => {
    executePlan();
  };

  const handleRefreshCawStatus = async () => {
    setCawRefreshing(true);
    await refreshCawStatus();
    setCawRefreshing(false);
  };

  const reset = () => {
    resetFlow();
  };

  const stepLabels = ["STANDBY", "SCANNING", "REVIEW", "EXECUTING", "AUDIT"];
  const stepPulseColor =
    step === FlowStep.Executing ? "coral" : step === FlowStep.Done ? "cyan" : "cyan";
  const stageBusy = step === FlowStep.Scanning || step === FlowStep.Executing;

  const pipelineHudValue = [
    _("待机", "IDLE"),
    _("扫描", "SCAN"),
    _("审核", "REVIEW"),
    _("执行", "EXEC"),
    _("完成", "DONE"),
  ][step];

  const detailDefaultOpen = true;

  return (
    <>
      <ModuleStageLayout
        moduleColor="cyan"
        moduleLabel="Treasury"
        title={_("金库工作台", "Treasury Workspace")}
        subtitle={_(
          "生成付款计划 → 风险检查 → 人工确认 → CAW 受控执行",
          "Generate plan, run risk checks, approve, then execute within CAW guardrails."
        )}
        statusPulse={{ color: stepPulseColor, label: stepLabels[step] }}
        leftRailLabel={_("贡献记录", "Records")}
        leftRail={
          <RecordsSatellite
            records={records}
            plan={plan}
            onImport={() => setImportOpen(true)}
            onReset={reset}
            onAdd={handleAdd}
            newName={newName}
            setNewName={setNewName}
            newWallet={newWallet}
            setNewWallet={setNewWallet}
            newAmount={newAmount}
            setNewAmount={setNewAmount}
            _={_}
          />
        }
        rightRailLabel={_("实时指标", "Live Metrics")}
        rightRail={
          <TreasuryMetricsRail
            totalBudget={totalBudget}
            totalPending={totalPending}
            totalBlocked={totalBlocked}
            budgetRemaining={budgetRemaining}
            _={_}
          />
        }
        stage={
          <FrostedPanel
            glowColor="cyan"
            scanline={stageBusy}
            sheen
            className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-card"
          >
            <CornerGlow color="cyan" className="-top-24 -right-24" intensity={0.2} />
            <StageCornerAccent color="cyan" />

            <ConsolePanelHeader
              title={_("付款执行管道", "Payment Execution Pipeline")}
              hudPrefix="PIPELINE::"
              hudValue={pipelineHudValue}
              hudColor="cyan"
              trailing={<StatusPulse color={stepPulseColor} label={stepLabels[step]} size="sm" />}
            />

            {stageBusy && <Scanline color="cyan" className="relative z-10 shrink-0" />}

            <AnimatePresence>
              {flowError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="relative z-10 mx-4 mt-2 md:mx-5"
                >
                  <div className="flex items-start gap-2 rounded-xl border border-hud-coral/30 bg-hud-coral/10 px-3 py-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-hud-coral" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-hud-coral">
                        {_("API 请求失败", "API request failed")}
                      </p>
                      <p className="mt-0.5 break-all font-mono text-[10px] text-fg-muted">
                        {flowError}
                      </p>
                      {!isMockMode() && (
                        <p className="mt-1 text-[10px] text-fg-muted">
                          {_("确认后端已启动且 CORS 允许 localhost:3100", "Ensure backend is up and CORS allows localhost:3100")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearFlowError}
                      className="shrink-0 text-fg-muted hover:text-fg"
                      aria-label="Dismiss"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 flex min-h-0 flex-1 flex-col p-4 md:p-5">
              <div className="mb-3 shrink-0">
                <FlowTimeline
                  currentStep={step}
                  steps={[
                    { label: _("生成计划", "Generate Plan"), icon: <Sparkles className="w-4 h-4" /> },
                    { label: _("风险检查", "Risk Check"), icon: <ShieldAlert className="w-4 h-4" /> },
                    { label: _("人工确认", "Approval"), icon: <CheckCircle className="w-4 h-4" /> },
                    { label: _("执行付款", "Execution"), icon: <Send className="w-4 h-4" /> },
                    { label: _("审计报告", "Audit"), icon: <FileSpreadsheet className="w-4 h-4" /> },
                  ]}
                />
              </div>

              <ActionPanel
                step={step}
                plan={plan}
                records={records}
                budgetRule={budgetRule}
                totalReady={totalReady}
                totalBlocked={totalBlocked}
                isExecuting={isExecuting}
                onGenerate={handleGenerate}
                onExecute={handleExecute}
                onReset={reset}
                lang={lang}
                _={_}
              />
            </div>
          </FrostedPanel>
        }
        detailLabel={
          step === FlowStep.Done
            ? _("审计与 CAW", "Audit & CAW")
            : _("风险与审计", "Risk & Audit")
        }
        detailDefaultOpen={detailDefaultOpen}
        detail={
          <TreasuryDetailDeck
            step={step}
            plan={plan}
            records={records}
            budgetRule={budgetRule}
            activityLog={activityLog}
            totalBlocked={totalBlocked}
            blockedItems={blockedItems}
            totalReady={totalReady}
            cawStatuses={cawStatuses}
            cawRefreshing={cawRefreshing}
            auditReportId={auditReportId}
            onRefreshCaw={handleRefreshCawStatus}
            _={_}
          />
        }
      />

      <RecordsImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportRecords}
      />
    </>
  );
}

/* =============================================================================
 * METRICS RAIL — Right-side risk overview card with embedded mascot
 * Ref: inbox/console-references/ref-agent-treasury-hub-source.png
 * Pattern: single card, data on the left, mascot anchored bottom-right.
 * ===========================================================================*/

function TreasuryMetricsRail({
  totalBudget,
  totalBlocked,
  budgetRemaining,
  _,
}: {
  totalBudget: number;
  totalPending: number;
  totalBlocked: number;
  budgetRemaining: number;
  _: (zh: string, en: string) => string;
}) {
  const { plan, records } = useConsoleState();
  const checks = records.length;
  const passed = plan.filter((i) => i.status === "Ready" || i.status === "Executed").length;
  const blocked = plan.filter((i) => i.status === "Blocked").length;
  const warnings = 0; // reserved for future soft-risk tier
  const hasChecks = checks > 0;
  const riskScore = hasChecks ? Math.round(((passed + warnings) / checks) * 100) : 0;
  const riskLabel = !hasChecks
    ? _("未检查", "Not checked")
    : riskScore >= 70
      ? _("低风险", "Low Risk")
      : _("中风险", "Medium Risk");
  const riskColor = !hasChecks ? "text-fg-muted" : riskScore >= 70 ? "text-hud-lime" : "text-hud-amber";
  const ringColor = !hasChecks ? "text-fg-subtle/20" : riskScore >= 70 ? "text-hud-lime" : "text-hud-amber";

  return (
    <FrostedPanel glowColor="cyan" sheen className="flex flex-col gap-4 rounded-card p-4">
      <p className="text-[12px] font-medium text-fg-muted">
        {_("风险概览", "Risk Overview")}
      </p>

      {/* Score: large gauge + label side-by-side */}
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <path
              className="text-fg-subtle/20"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={ringColor}
              strokeDasharray={`${riskScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[17px] font-bold leading-none text-fg">
              {hasChecks ? riskScore : "--"}
            </span>
            <span className="text-[8px] font-medium text-fg-muted">/100</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-fg-muted">{_("风险评分", "Risk Score")}</p>
          <p className={cn("text-[15px] font-semibold", riskColor)}>
            {riskLabel}
          </p>
        </div>
      </div>

      {/* Metrics: 2x2 grid for even breathing room */}
      <div className="grid grid-cols-2 gap-2">
        <MetricBox label={_("检查", "Chk")} value={checks} />
        <MetricBox label={_("通过", "Pass")} value={passed} tone="lime" />
        <MetricBox label={_("警告", "Warn")} value={warnings} tone="amber" />
        <MetricBox label={_("拦截", "Block")} value={blocked} tone="coral" />
      </div>

      {/* Budget / remain */}
      <div className="flex items-center justify-between border-t border-border-token pt-3">
        <div>
          <p className="text-[8px] uppercase tracking-wider text-fg-muted">{_("预算", "Budget")}</p>
          <p className="text-[13px] font-semibold text-fg">{totalBudget} USDC</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] uppercase tracking-wider text-fg-muted">{_("剩余", "Remain")}</p>
          <p className="text-[13px] font-semibold text-fg">{budgetRemaining} USDC</p>
        </div>
      </div>
    </FrostedPanel>
  );
}

/* =============================================================================
 * DETAIL DECK — Audit, CAW, risk gate
 * ===========================================================================*/

function TreasuryDetailDeck({
  step,
  plan,
  records,
  budgetRule,
  activityLog,
  totalBlocked,
  blockedItems,
  totalReady,
  cawStatuses,
  cawRefreshing,
  auditReportId,
  onRefreshCaw,
  _,
}: {
  step: FlowStep;
  plan: PaymentPlanItem[];
  records: ContributorRecord[];
  budgetRule: BudgetRules;
  activityLog: ActivityEntry[];
  totalBlocked: number;
  blockedItems: PaymentPlanItem[];
  totalReady: number;
  cawStatuses: CawStatus[];
  cawRefreshing: boolean;
  auditReportId: string | null;
  onRefreshCaw: () => void;
  _: (zh: string, en: string) => string;
}) {
  const { lang } = useApp();
  const blockedCount = plan.filter((i) => i.status === "Blocked").length;
  const executedCount = plan.filter((i) => i.status === "Executed").length;
  const readyCount = plan.filter((i) => i.status === "Ready").length;

  return (
    <div className="space-y-2">
      {step !== FlowStep.Done && (
        <DetailDeckShell glowColor="cyan" className="!p-3">
          <RiskHudPanel
            step={step}
            records={records}
            plan={plan}
            budgetRule={budgetRule}
            totalReady={totalReady}
            activityLog={activityLog}
            _={_}
          />
        </DetailDeckShell>
      )}

      {totalBlocked > 0 && step !== FlowStep.Idle && step !== FlowStep.Scanning && (
        <FrostedPanel glowColor="coral" scanline className="p-3">
          <RiskGateAnimation
            isBlocked
            reason={_(
              `${blockedItems.length} 笔被拦截（${totalBlocked} USDC）：${blockedItems[0]?.riskReason}`,
              `${blockedItems.length} blocked (${totalBlocked} USDC): ${blockedItems[0]?.riskReason}`
            )}
          />
        </FrostedPanel>
      )}

      {step === FlowStep.Done && (
        <>
          {/* Compact audit list */}
          <div className="rounded-xl border border-border-token bg-surface-2/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-hud-violet" />
              <span className="text-xs font-bold text-fg">{_("审计快照", "Audit Snapshot")}</span>
              <span className="rounded-full bg-hud-violet/10 px-1.5 py-0.5 font-mono text-[8px] text-fg-subtle">
                IMMUTABLE
              </span>
              {auditReportId && !isMockMode() && (
                <span className="ml-auto truncate font-mono text-[8px] text-fg-muted">
                  {auditReportId.slice(0, 10)}…
                </span>
              )}
            </div>
            <div className="space-y-1">
              {plan.map((item) => (
                <div
                  key={item.record.id}
                  className="flex items-center justify-between rounded-lg border border-border-token/50 bg-surface-2/40 px-2 py-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-fg">{item.record.name}</p>
                    <p className="truncate font-mono text-[9px] text-fg-subtle">
                      {item.txHash ? item.txHash.slice(0, 16) + "…" : "—"}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    {item.status === "Executed" ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                        <CheckCircle className="h-3 w-3" /> EXEC
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-hud-coral">
                        <XCircle className="h-3 w-3" /> BLOCK
                      </span>
                    )}
                    <p className="text-[9px] text-fg-subtle">{item.record.amount} USDC</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact CAW status */}
          <div className="rounded-xl border border-border-token bg-surface-2/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={cn("h-3.5 w-3.5 text-hud-blue", cawRefreshing && "animate-spin")} />
                <span className="text-xs font-bold text-fg">{_("CAW 状态", "CAW Status")}</span>
              </div>
              <button
                type="button"
                onClick={onRefreshCaw}
                disabled={cawRefreshing}
                className="flex items-center gap-1 rounded-md border border-border-token bg-surface-2/60 px-2 py-1 text-[10px] text-fg transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3 w-3", cawRefreshing && "animate-spin")} />
                {cawRefreshing ? _("…", "…") : _("刷新", "Refresh")}
              </button>
            </div>
            {cawStatuses.length === 0 ? (
              <p className="text-[10px] text-fg-subtle">{_("暂无 CAW 状态", "No CAW status")}</p>
            ) : (
              <div className="space-y-1">
                {cawStatuses.map((status) => (
                  <div
                    key={status.cawRequestId}
                    className="flex items-center justify-between rounded-lg border border-border-token/50 bg-surface-2/40 px-2 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-fg">{status.paymentItemId}</p>
                      <p className="truncate font-mono text-[9px] text-fg-subtle">
                        {status.txHash ? status.txHash.slice(0, 18) + "…" : _("等待刷新…", "Pending refresh…")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "ml-2 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                        status.normalizedStatus === "Executed"
                          ? "bg-success/10 text-success"
                          : status.normalizedStatus === "Failed"
                          ? "bg-hud-coral/10 text-hud-coral"
                          : "bg-amber-500/10 text-amber-500"
                      )}
                    >
                      {status.normalizedStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline summary stats */}
          <div className="flex items-center justify-between rounded-lg border border-border-token bg-surface-2/50 px-3 py-2">
            <div className="text-center">
              <div className="text-sm font-bold text-success">{executedCount}</div>
              <div className="text-[9px] text-fg-subtle">{_("已执行", "Executed")}</div>
            </div>
            <div className="h-6 w-px bg-border-token" />
            <div className="text-center">
              <div className="text-sm font-bold text-hud-coral">{blockedCount}</div>
              <div className="text-[9px] text-fg-subtle">{_("已拦截", "Blocked")}</div>
            </div>
            <div className="h-6 w-px bg-border-token" />
            <div className="text-center">
              <div className="text-sm font-bold text-hud-lime">{totalReady + totalBlocked} USDC</div>
              <div className="text-[9px] text-fg-subtle">{_("总计", "Total")}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* =============================================================================
 * RECORDS SATELLITE — Compact record list for the module panel.
 * ===========================================================================*/

function RecordsSatellite({
  records,
  plan,
  onImport,
  onReset,
  onAdd,
  newName,
  setNewName,
  newWallet,
  setNewWallet,
  newAmount,
  setNewAmount,
  _,
}: {
  records: ContributorRecord[];
  plan: PaymentPlanItem[];
  onImport: () => void;
  onReset: () => void;
  onAdd: (e: React.FormEvent) => void;
  newName: string;
  setNewName: (v: string) => void;
  newWallet: string;
  setNewWallet: (v: string) => void;
  newAmount: number;
  setNewAmount: (v: number) => void;
  _: (zh: string, en: string) => string;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const displayRecords = expanded ? records : records.slice(0, 3);

  return (
    <FrostedPanel glowColor="cyan" sheen className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border-token flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-hud-cyan" />
          <span className="text-sm font-semibold text-fg">
            {_("贡献记录", "Records")}
          </span>
          <span className="text-[10px] text-fg-subtle font-mono px-1.5 py-0.5 rounded-full bg-surface-2/70">
            {records.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onImport}
            className="text-[10px] text-fg-subtle hover:text-fg transition-colors"
            title={_("批量导入", "Import")}
          >
            <Upload className="w-3 h-3" />
          </button>
          <button
            onClick={onReset}
            className="text-[10px] text-fg-subtle hover:text-fg transition-colors"
            title={_("重置", "Reset")}
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {displayRecords.map((r, i) => {
          const planItem = plan.find((p) => p.record.id === r.id);
          const status = planItem?.status;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={cn(
                "p-2.5 rounded-lg border border-border-token bg-surface-2/50 hover:bg-surface-2/70 transition-colors",
                status === "Blocked" && "border-hud-coral/20 bg-hud-coral/[0.03]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-fg truncate">{r.name}</span>
                <span className="text-[12px] font-mono font-semibold text-fg">{r.amount}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-mono text-fg-subtle truncate max-w-[120px]">
                  {r.wallet.substring(0, 6)}...{r.wallet.substring(r.wallet.length - 4)}
                </span>
                {status ? (
                  <StatusBadge status={status} riskReason={planItem?.riskReason} />
                ) : (
                  <span className="text-[10px] text-fg-subtle">—</span>
                )}
              </div>
            </motion.div>
          );
        })}

        {records.length > 3 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full py-2 text-[10px] text-fg-subtle hover:text-fg transition-colors flex items-center justify-center gap-1"
          >
            {expanded ? (
              <>{_("收起", "Collapse")} <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>{_("查看全部", "View All")} ({records.length - 3}) <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </div>

      <div className="border-t border-border-token bg-surface-2/50 p-2.5">
        <div className="flex gap-2">
          <form onSubmit={onAdd} className="min-w-0 flex-1 space-y-1.5">
            <input
              placeholder={_("姓名", "Name")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-field border border-border-token bg-surface/50 px-2 py-1 text-[11px] text-fg outline-none transition-colors focus:border-hud-cyan"
            />
            <input
              placeholder="0x..."
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              className="w-full rounded-field border border-border-token bg-surface/50 px-2 py-1 text-[11px] text-fg outline-none transition-colors focus:border-hud-cyan"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
                className="flex-1 rounded-field border border-border-token bg-surface/50 px-2 py-1 text-[11px] text-fg outline-none transition-colors focus:border-hud-cyan"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-field border border-border-token bg-surface px-2.5 py-1 text-[11px] font-semibold text-fg transition-colors hover:bg-surface-hover"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </form>

          {/* Records card mascot — Treasury guardian */}
          <div className="relative z-0 w-[110px] shrink-0">
            <div
              className="pointer-events-none absolute inset-x-[-30%] bottom-0 h-[95%]"
              style={{
                background:
                  "radial-gradient(ellipse 95% 90% at 55% 100%, rgba(94,234,212,0.45) 0%, rgba(94,234,212,0.14) 35%, transparent 72%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-[-8px] h-[55%]"
              style={{
                background:
                  "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(94,234,212,0.35) 0%, transparent 70%)",
                filter: "blur(14px)",
              }}
            />
            <img
              src="/console/mascots/modules/treasury-module.png"
              alt="Treasury guardian"
              className="pointer-events-none absolute bottom-[-6px] left-1/2 h-[160px] w-auto max-w-none -translate-x-1/2 select-none object-cover object-[center_22%]"
              draggable={false}
              style={{
                filter:
                  "drop-shadow(0 12px 22px rgba(94,234,212,0.26)) drop-shadow(0 0 12px rgba(94,234,212,0.42))",
              }}
            />
          </div>
        </div>
      </div>
    </FrostedPanel>
  );
}

/* =============================================================================
 * RISK HUD PANEL — console-style risk gauge + check indicators + activity timeline
 * Non-rectangular layout: semi-circle gauge, dot indicators, vertical timeline.
 * ===========================================================================*/

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

function RiskHudPanel({
  step,
  records,
  plan,
  budgetRule,
  totalReady,
  activityLog,
  _,
}: {
  step: FlowStep;
  records: ContributorRecord[];
  plan: PaymentPlanItem[];
  budgetRule: BudgetRules;
  totalReady: number;
  activityLog: ActivityEntry[];
  _: (zh: string, en: string) => string;
}) {
  const { lang } = useApp();
  const readyCount = plan.filter((i) => i.status === "Ready" || i.status === "Executed").length;
  const blockedCount = plan.filter((i) => i.status === "Blocked").length;
  const checks = records.length;
  const score = checks === 0 ? 0 : Math.round((readyCount / checks) * 100);
  const hasPlan = plan.length > 0;
  const latest = activityLog.slice(0, 2);

  const indicators = [
    {
      label: _("记录", "Records"),
      value: `${records.length}`,
      status: records.length > 0 ? ("ok" as const) : ("idle" as const),
      angle: -90,
    },
    {
      label: _("审计", "Audit"),
      value: step >= FlowStep.Review ? _("就绪", "Ready") : _("等待", "Wait"),
      status: step >= FlowStep.Review ? ("ok" as const) : ("idle" as const),
      angle: 0,
    },
    {
      label: _("可执行", "Exec"),
      value: hasPlan ? `${totalReady} USDC` : _("—", "—"),
      status: hasPlan && totalReady > 0 ? ("ok" as const) : ("idle" as const),
      angle: 90,
    },
    {
      label: _("Bob", "Bob"),
      value: _("拦截", "Block"),
      status: "warn" as const,
      angle: 180,
    },
  ] as const;

  const radius = 66;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
      {/* Honeycomb HUD — left side */}
      <div className="relative mx-auto h-[210px] w-full max-w-[280px] shrink-0 md:mx-0">
        {/* Dashed connectors */}
        <svg viewBox="0 0 280 210" className="absolute inset-0 h-full w-full pointer-events-none">
          {indicators.map((item) => {
            const p = polar(item.angle, radius);
            return (
              <line
                key={item.label}
                x1="140"
                y1="105"
                x2={140 + p.x}
                y2={105 + p.y}
                stroke="var(--border-token)"
                strokeOpacity="0.45"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}
        </svg>

        {/* Center score hex */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <HexCell
            main={checks === 0 ? "--" : String(score)}
            sub={checks === 0 ? "N/A" : score >= 70 ? _("低", "Low") : _("中", "Mid")}
            size="md"
            accent
          />
        </div>

        {/* Peripheral indicator hexes */}
        {indicators.map((item) => {
          const p = polar(item.angle, radius);
          return (
            <div
              key={item.label}
              className="absolute"
              style={{
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <HexCell label={item.label} value={item.value} status={item.status} size="sm" />
            </div>
          );
        })}
      </div>

      {/* Latest activity — right side, no scroll */}
      <div className="flex flex-1 flex-col justify-center rounded-lg border border-border-token/50 bg-surface-2/30 p-2">
        <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-fg-muted">
          {_("最新活动", "Latest")}
        </p>
        {latest.length === 0 ? (
          <p className="text-[10px] text-fg-subtle">
            {step === FlowStep.Idle
              ? _("点击「生成计划」开始记录。", "Generate plan to start logging.")
              : _("暂无活动记录。", "No activity yet.")}
          </p>
        ) : (
          <div className="space-y-1">
            {latest.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2">
                <span
                  className="mt-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-surface"
                  style={{
                    backgroundColor:
                      entry.type === "plan"
                        ? "var(--hud-cyan)"
                        : entry.type === "execute"
                        ? "var(--hud-lime)"
                        : entry.type === "rule"
                        ? "var(--hud-coral)"
                        : "var(--fg-subtle)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-fg-muted">
                      {entry.type}
                    </span>
                    <span
                      className="shrink-0 text-[8px] tabular-nums text-fg-subtle"
                      suppressHydrationWarning
                    >
                      {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <p className="truncate text-[10px] leading-tight text-fg-subtle">
                    {localizeActivityMessage(entry.message, lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HexCell({
  label,
  value,
  main,
  sub,
  status,
  size,
  accent,
}: {
  label?: string;
  value?: string;
  main?: string;
  sub?: string;
  status?: "ok" | "warn" | "idle";
  size: "sm" | "md";
  accent?: boolean;
}) {
  const isMd = size === "md";
  const statusDot = {
    ok: "bg-hud-lime",
    warn: "bg-hud-coral",
    idle: "bg-fg-subtle/60",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        isMd ? "h-[76px] w-[66px]" : "h-[58px] w-[50px]",
        accent ? "bg-hud-cyan/40" : "bg-border-token"
      )}
      style={{ clipPath: HEX_CLIP }}
    >
      <div
        className={cn(
          "absolute inset-[1px] flex flex-col items-center justify-center text-center",
          accent ? "bg-surface-2/95" : "bg-surface-2/90"
        )}
        style={{ clipPath: HEX_CLIP }}
      >
        {main ? (
          <>
            <span className={cn("font-bold leading-none text-fg", isMd ? "text-xl" : "text-base")}>
              {main}
            </span>
            {sub && (
              <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-fg-muted">
                {sub}
              </span>
            )}
          </>
        ) : (
          <>
            <span className={cn("h-1.5 w-1.5 rounded-full", status && statusDot[status])} />
            {label && (
              <span className="mt-1 text-[8px] font-medium leading-none text-fg-muted">{label}</span>
            )}
            {value && (
              <span className="mt-0.5 max-w-[44px] truncate text-[9px] font-semibold leading-none text-fg">
                {value}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =============================================================================
 * STATUS BADGE
 * ===========================================================================*/

function StatusBadge({
  status,
  riskReason,
}: {
  status: string;
  riskReason?: string;
}) {
  if (status === "Ready") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success/10 text-success border border-success/20">
        <CheckCircle className="w-3 h-3" />
        Ready
      </span>
    );
  }
  if (status === "Blocked") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
        style={{
          backgroundColor: "rgba(251,113,133,0.1)",
          color: "#FB7185",
          borderColor: "rgba(251,113,133,0.2)",
        }}
        title={riskReason}
      >
        <ShieldAlert className="w-3 h-3" />
        Blocked
      </span>
    );
  }
  if (status === "Executed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success/10 text-success border border-success/20">
        <CheckCheck className="w-3 h-3" />
        Executed
      </span>
    );
  }
  return <span className="text-[11px] text-fg-subtle">—</span>;
}

/* =============================================================================
 * ACTION PANEL
 * ===========================================================================*/

function ActionPanel({
  step,
  plan,
  records,
  budgetRule,
  totalReady,
  totalBlocked,
  isExecuting,
  onGenerate,
  onExecute,
  onReset,
  lang,
  _,
}: {
  step: FlowStep;
  plan: PaymentPlanItem[];
  records: ContributorRecord[];
  budgetRule: BudgetRules;
  totalReady: number;
  totalBlocked: number;
  isExecuting: boolean;
  onGenerate: () => void;
  onExecute: () => void;
  onReset: () => void;
  lang: string;
  _: (zh: string, en: string) => string;
}) {
  const readyCount = plan.filter((i) => i.status === "Ready").length;
  const blockedCount = plan.filter((i) => i.status === "Blocked").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
      {/* Step 0: Generate Plan */}
      {step === FlowStep.Idle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
        >
          <div className="p-4 rounded-lg border border-dashed border-border-token bg-surface-2/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-hud-cyan/10 border border-hud-cyan/20 flex items-center justify-center text-hud-cyan text-xs font-bold">
                1
              </div>
              <div>
                <div className="text-sm font-medium text-fg">
                  {_("生成付款计划", "Generate Payment Plan")}
                </div>
                <div className="text-[11px] text-fg-subtle">
                  {_("AI 将扫描所有记录并运行风险检查", "AI will scan all records and run risk checks")}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <SparklesFX
              count={6}
              className="absolute -inset-4 pointer-events-none"
              color="#5EEAD4"
            />
            <HolographicButton
              onClick={onGenerate}
              variant="cyan"
              size="lg"
              icon={<RefreshCw className="w-4 h-4" />}
              className="w-full relative z-10"
            >
              {_("生成付款计划", "Generate Plan")}
            </HolographicButton>
          </div>

          <div className="text-[11px] text-fg-subtle space-y-1">
            <div className="flex justify-between">
              <span>{_("当前记录数", "Records")}</span>
              <span className="font-mono">{records.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{_("月度预算", "Budget")}</span>
              <span className="font-mono">{budgetRule.monthlyBudget} USDC</span>
            </div>
            <div className="flex justify-between">
              <span>{_("单笔限额", "Limit")}</span>
              <span className="font-mono">{budgetRule.singlePaymentLimit} USDC</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 1: Scanning */}
      {step === FlowStep.Scanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl py-8 text-center"
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <GridBackground />
          </div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none"
            style={{ backgroundColor: "rgba(94,234,212,0.12)" }}
          />

          <div className="relative z-10">
            <RefreshCw className="w-10 h-10 text-hud-cyan animate-spin mx-auto" />
            <div
              className="absolute inset-0 blur-xl rounded-full scale-150 pointer-events-none"
              style={{ backgroundColor: "rgba(94,234,212,0.2)" }}
            />
          </div>
          <div className="relative z-10">
            <ColourfulText
              text={_("AI 扫描中...", "Agent scanning...")}
              className="text-fg font-semibold"
              interval={2000}
            />
            <p className="text-xs text-fg-subtle mt-1">
              {_("正在评估白名单、预算边界和单笔限额", "Evaluating whitelist, budget bounds and single-payment limits")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Step 2: Review Results */}
      {step === FlowStep.Review && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
        >
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <BentoCard index={0} padding="sm" glowColor="#34d399" className="text-center">
              <div className="text-lg font-bold text-success">{readyCount}</div>
              <div className="text-[10px] text-fg-subtle uppercase">{_("通过", "Passed")}</div>
            </BentoCard>
            <BentoCard index={1} padding="sm" glowColor="#FB7185" className="text-center">
              <div className="text-lg font-bold" style={{ color: "#FB7185" }}>{blockedCount}</div>
              <div className="text-[10px] text-fg-subtle uppercase">{_("拦截", "Blocked")}</div>
            </BentoCard>
          </div>

          <motion.div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {[...plan]
              .sort((a, b) => (a.status === "Blocked" ? 0 : 1) - (b.status === "Blocked" ? 0 : 1))
              .map((item, i) => {
                const isBlocked = item.status === "Blocked";
                return (
                  <motion.div
                    layout
                    key={item.record.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={
                      isBlocked
                        ? { opacity: 1, x: [-8, 0, -3, 3, -3, 0] }
                        : { opacity: 1, x: 0 }
                    }
                    transition={{
                      delay: i * 0.05,
                      x: isBlocked
                        ? { delay: i * 0.05 + 0.15, duration: 0.4 }
                        : { delay: i * 0.05 },
                      layout: { type: "spring", stiffness: 420, damping: 32 },
                    }}
                    className={cn(
                      "p-3 rounded-field border flex items-center justify-between",
                      isBlocked
                        ? "bg-hud-coral/5 border-hud-coral/15"
                        : "bg-success/5 border-success/15"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isBlocked ? (
                        <ShieldAlert className="w-4 h-4 text-hud-coral shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-fg truncate">{item.record.name}</div>
                        <div className="text-[10px] text-fg-subtle truncate">
                          {isBlocked
                            ? item.riskReason
                            : _("通过所有检查", "All checks passed")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-[13px] font-mono font-semibold text-fg">
                        {item.record.amount} USDC
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>

          <div className="mt-auto flex shrink-0 flex-col gap-3">
            {blockedCount > 0 && (
              <div className="flex shrink-0 items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-amber-700 dark:text-amber-300">
                  {_(
                    "存在规则排除项：至少一笔付款未通过安全检查。这些地址将被排除在批处理付款之外。",
                    "Rule exclusions present: at least one payload failed safety checks. These will be excluded from batch payouts."
                  )}
                </span>
              </div>
            )}

            <div className="flex shrink-0 gap-2">
              <HolographicButton
                onClick={onReset}
                variant="cyan"
                size="sm"
                className="flex-1"
              >
                {_("返回", "Back")}
              </HolographicButton>
              <HolographicButton
                onClick={onExecute}
                disabled={readyCount === 0}
                variant="cyan"
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
                className="flex-[2]"
              >
                {_("批准并执行", "Approve & Execute")} ({totalReady} USDC)
              </HolographicButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Executing */}
      {step === FlowStep.Executing && isExecuting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-hidden rounded-xl py-10 text-center"
        >
          <BeamBurst color="#5EEAD4" />
          <SparklesFX count={4} color="#5EEAD4" className="absolute inset-0 pointer-events-none opacity-45" />
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <GridBackground />
          </div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
            style={{ backgroundColor: "rgba(96,165,250,0.15)" }}
          />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-hud-blue/20 border-t-hud-blue border-r-hud-blue/50 animate-spin" />
            <div
              className="absolute inset-2 rounded-full border border-[#B5FF4D]/20 border-b-hud-lime animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-[200px] h-1 rounded-full bg-surface-hover overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-hud-lime/60 to-transparent animate-shimmer"
              style={{ backgroundSize: "200% 100%" }}
            />
          </div>

          <div className="relative z-10">
            <p className="text-fg font-semibold">
              {_("加密核心广播中...", "Cryptographic broadcast...")}
            </p>
            <p className="text-xs text-fg-subtle mt-1">
              Cobo Agentic Wallet (CAW) is sealing execution frames...
            </p>
          </div>
        </motion.div>
      )}

      {/* Step 4: Done / Audit — compact; full tables in DetailDeck */}
      {step === FlowStep.Done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-0 flex-1 flex-col justify-center gap-4 overflow-y-auto"
        >
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 text-center">
            <CheckCheck className="mx-auto mb-2 h-8 w-8 text-success" />
            <p className="text-sm font-semibold text-fg">
              {_("周期执行完成", "Cycle execution complete")}
            </p>
            <p className="mt-1 text-xs text-fg-subtle">
              {_("展开下方面板查看审计报告与 CAW 状态", "Expand the panel below for audit report and CAW status")}
            </p>
          </div>

          <HolographicButton
            onClick={onReset}
            variant="cyan"
            size="lg"
            className="w-full"
          >
            {_("处理下一周期", "Process next cycle")}
          </HolographicButton>
        </motion.div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =============================================================================
 * METRIC BOX — compact KPI cell for the metrics rail
 * ===========================================================================*/

function MetricBox({ label, value, tone }: { label: string; value: number; tone?: "fg" | "lime" | "coral" | "amber" }) {
  const toneClass =
    tone === "lime" ? "text-hud-lime" : tone === "coral" ? "text-hud-coral" : tone === "amber" ? "text-hud-amber" : "text-fg";
  return (
    <div className="rounded-lg border border-border-token/60 bg-surface-2/40 p-2 text-center">
      <p className="text-[10px] font-medium text-fg-muted truncate">{label}</p>
      <p className={cn("text-[15px] font-bold leading-tight", toneClass)}>{value}</p>
    </div>
  );
}
