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

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
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
 * METRICS RAIL — Right-side 2×2 live KPIs
 * ===========================================================================*/

function TreasuryMetricsRail({
  totalBudget,
  totalPending,
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
  return (
    <FrostedPanel glowColor="cyan" sheen className="flex h-full flex-col rounded-card p-4">
      <p className="mb-2.5 text-[12px] font-medium text-fg-muted">
        {_("实时指标", "Live metrics")}
      </p>
      <ConsoleTelemetryGrid
        columns={1}
        items={[
          {
            label: "BUDGET",
            value: <AnimatedNumber value={totalBudget} />,
            unit: "USDC",
            accent: "lime",
          },
          {
            label: "PENDING",
            value: <AnimatedNumber value={totalPending} />,
            unit: "USDC",
            accent: "cyan",
          },
          {
            label: "BLOCKED",
            value: <AnimatedNumber value={totalBlocked} />,
            unit: "USDC",
            accent: "coral",
          },
          {
            label: "REMAIN",
            value: <AnimatedNumber value={budgetRemaining} />,
            unit: "USDC",
            accent: "blue",
          },
        ]}
      />
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
  const auditTrailLabel =
    step === FlowStep.Idle
      ? _("等待生成计划", "Awaiting plan")
      : step === FlowStep.Scanning
      ? _("扫描中…", "Scanning…")
      : step === FlowStep.Done
      ? _("已封存", "Sealed")
      : _("实时更新", "Live");

  return (
    <div className="space-y-3">
      {step !== FlowStep.Done && (
        <DetailDeckShell glowColor="cyan">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                {_("风控预检", "Risk preflight")}
              </p>
              <PreflightRow
                label={_("贡献记录", "Contribution records")}
                value={`${records.length}`}
                status="ok"
              />
              <PreflightRow
                label={_("月预算 / 单笔限额", "Budget / single limit")}
                value={`${budgetRule.monthlyBudget} / ${budgetRule.singlePaymentLimit} USDC`}
                status="ok"
              />
              <PreflightRow
                label={_("Bob 白名单", "Bob whitelist")}
                value={_("未列入 · 预计拦截", "Not listed · expect block")}
                status="warn"
              />
              <PreflightRow
                label={_("审计轨迹", "Audit trail")}
                value={auditTrailLabel}
                status={step >= FlowStep.Review ? "ok" : "idle"}
              />
              {plan.length > 0 && (
                <>
                  <PreflightRow
                    label={_("就绪 / 拦截", "Ready / blocked")}
                    value={`${readyCount} / ${blockedCount}`}
                    status={blockedCount > 0 ? "warn" : "ok"}
                  />
                  <PreflightRow
                    label={_("可执行金额", "Executable volume")}
                    value={`${totalReady} USDC`}
                    status={totalReady > 0 ? "ok" : "idle"}
                  />
                </>
              )}
            </div>
            <div className="min-h-0">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                {_("活动日志", "Activity log")}
              </p>
              <div className="max-h-[88px] space-y-1 overflow-y-auto rounded-lg border border-border-token bg-surface-2/80 px-2 py-1.5">
                {activityLog.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-2 font-mono text-[10px] leading-snug text-fg-subtle"
                  >
                    <span className="shrink-0 uppercase text-hud-cyan/80">{entry.type}</span>
                    <span className="min-w-0 truncate">
                      {localizeActivityMessage(entry.message, lang)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-fg-subtle">
                {step === FlowStep.Idle
                  ? _("点击「生成计划」后，此处将写入风险检查与审计条目。", "After Generate Plan, risk checks and audit entries appear here.")
                  : _("生成计划后日志会持续追加。", "Log entries append as the pipeline runs.")}
              </p>
            </div>
          </div>
        </DetailDeckShell>
      )}

      {totalBlocked > 0 && step !== FlowStep.Idle && step !== FlowStep.Scanning && (
        <FrostedPanel glowColor="coral" scanline className="p-4">
          <RiskGateAnimation
            isBlocked
            reason={_(
              `${blockedItems.length} 笔付款被拦截（共 ${totalBlocked} USDC）：${blockedItems[0]?.riskReason}`,
              `${blockedItems.length} payment(s) blocked (${totalBlocked} USDC): ${blockedItems[0]?.riskReason}`
            )}
          />
        </FrostedPanel>
      )}

      {step === FlowStep.Done && (
        <>
          <div className="rounded-xl border border-border-token bg-surface-2/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-hud-violet" />
              <span className="text-sm font-semibold text-fg">
                {_("审计报告快照", "Audit Report Snapshot")}
              </span>
              <span className="rounded-full bg-hud-violet/10 px-2 py-0.5 font-mono text-[10px] text-fg-subtle">
                IMMUTABLE
              </span>
              {auditReportId && !isMockMode() && (
                <span className="ml-auto truncate font-mono text-[10px] text-fg-muted">
                  {auditReportId.slice(0, 12)}…
                </span>
              )}
            </div>
            <div className="overflow-hidden rounded-lg border border-border-token">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-surface-2/60">
                  <tr className="border-b border-border-token font-mono text-[11px] uppercase text-fg-muted">
                    <th className="px-2 py-2">{_("实体", "Entity")}</th>
                    <th className="px-2 py-2">{_("状态", "Status")}</th>
                    <th className="px-2 py-2">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {plan.map((item) => (
                    <tr key={item.record.id}>
                      <td className="px-2 py-2 text-[12px] font-medium text-fg">
                        {item.record.name}
                      </td>
                      <td className="px-2 py-2">
                        {item.status === "Executed" ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-success">
                            <CheckCircle className="h-3 w-3" /> EXECUTED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-hud-coral">
                            <XCircle className="h-3 w-3" /> BLOCKED
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 font-mono text-[10px]">
                        {item.txHash ? (
                          <ScrambleValue
                            value={item.txHash.slice(0, 10) + "…"}
                            className="font-mono text-[11px] text-hud-cyan"
                          />
                        ) : (
                          <span className="text-fg-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border-token bg-surface-2/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={cn("h-4 w-4 text-hud-blue", cawRefreshing && "animate-spin")} />
                <span className="text-sm font-semibold text-fg">
                  {_("最新 CAW 状态", "Latest CAW Status")}
                </span>
              </div>
              <button
                type="button"
                onClick={onRefreshCaw}
                disabled={cawRefreshing}
                className="flex items-center gap-1 rounded-lg border border-border-token bg-surface-2/60 px-3 py-1.5 text-[11px] text-fg transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3 w-3", cawRefreshing && "animate-spin")} />
                {cawRefreshing ? _("刷新中...", "Refreshing...") : _("刷新", "Refresh")}
              </button>
            </div>
            {cawStatuses.length === 0 ? (
              <p className="text-[11px] text-fg-subtle">{_("暂无 CAW 状态", "No CAW status available")}</p>
            ) : (
              <div className="space-y-2">
                {cawStatuses.map((status) => (
                  <div
                    key={status.cawRequestId}
                    className="rounded-lg border border-border-token bg-surface-2/40 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12px] font-medium text-fg">{status.paymentItemId}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                      <div className="text-fg-subtle">
                        Provider: <span className="font-mono text-fg">{status.providerStatus}</span>
                      </div>
                      <div className="text-fg-subtle">
                        Network: <span className="font-mono text-fg">{status.network}</span>
                      </div>
                      <div className="col-span-2 text-fg-subtle">
                        txHash:{" "}
                        {status.txHash ? (
                          <ScrambleValue
                            value={status.txHash.slice(0, 14) + "…"}
                            className="font-mono text-[11px] text-hud-cyan"
                          />
                        ) : (
                          <span>{_("等待刷新...", "Pending refresh...")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-surface-2/60 p-2">
              <div className="text-sm font-bold text-success">{executedCount}</div>
              <div className="text-[10px] text-fg-subtle">{_("已执行", "Executed")}</div>
            </div>
            <div className="rounded-lg bg-surface-2/60 p-2">
              <div className="text-sm font-bold text-hud-coral">{blockedCount}</div>
              <div className="text-[10px] text-fg-subtle">{_("已拦截", "Blocked")}</div>
            </div>
            <div className="rounded-lg bg-surface-2/60 p-2">
              <div className="text-sm font-bold text-hud-lime">{totalReady + totalBlocked} USDC</div>
              <div className="text-[10px] text-fg-subtle">{_("总计", "Total")}</div>
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

      <div className="p-3 border-t border-border-token bg-surface-2/50">
        <form onSubmit={onAdd} className="space-y-2">
          <input
            placeholder={_("姓名", "Name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[12px] rounded-field border border-border-token bg-surface/50 text-fg outline-none focus:border-hud-cyan transition-colors"
          />
          <input
            placeholder="0x..."
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[12px] rounded-field border border-border-token bg-surface/50 text-fg outline-none focus:border-hud-cyan transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(Number(e.target.value))}
              className="flex-1 px-2.5 py-1.5 text-[12px] rounded-field border border-border-token bg-surface/50 text-fg outline-none focus:border-hud-cyan transition-colors"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-[12px] font-semibold rounded-field border border-border-token bg-surface hover:bg-surface-hover text-fg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </FrostedPanel>
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
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
      {/* Step 0: Generate Plan */}
      {step === FlowStep.Idle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
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
          className="py-8 flex flex-col items-center gap-4 text-center relative overflow-hidden rounded-xl"
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
      {(step === FlowStep.Review || step === FlowStep.Executing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-2">
            <BentoCard index={0} padding="sm" glowColor="#34d399" className="text-center">
              <div className="text-lg font-bold text-success">{readyCount}</div>
              <div className="text-[10px] text-fg-subtle uppercase">{_("通过", "Passed")}</div>
            </BentoCard>
            <BentoCard index={1} padding="sm" glowColor="#FB7185" className="text-center">
              <div className="text-lg font-bold" style={{ color: "#FB7185" }}>{blockedCount}</div>
              <div className="text-[10px] text-fg-subtle uppercase">{_("拦截", "Blocked")}</div>
            </BentoCard>
          </div>

          <motion.div layout className="space-y-2">
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

          {blockedCount > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                {_(
                  "存在规则排除项：至少一笔付款未通过安全检查。这些地址将被排除在批处理付款之外。",
                  "Rule exclusions present: at least one payload failed safety checks. These will be excluded from batch payouts."
                )}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
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
        </motion.div>
      )}

      {/* Step 3: Executing */}
      {step === FlowStep.Executing && isExecuting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-10 flex flex-col items-center gap-5 text-center relative overflow-hidden rounded-xl"
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
          className="space-y-4"
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
