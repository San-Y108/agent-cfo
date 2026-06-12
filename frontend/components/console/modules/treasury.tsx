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
import { useConsoleState, FlowStep } from "@/lib/console/console-state";
import type { ContributorRecord, PaymentPlanItem, BudgetRules } from "@/lib/types/console";
import type { CawStatus } from "@/lib/api/types";
import { RecordsImport } from "@/components/console/records-import";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { GradientText, ColourfulText } from "@/components/ui/aceternity/colourful-text";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import { GridBackground } from "@/components/ui/aceternity/background";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
import { HolographicButton } from "@/components/ui/holographic-button";
import { FlowTimeline } from "@/components/console/flow-timeline";
import { RiskGateAnimation } from "@/components/console/risk-gate-anim";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
} from "@/components/console/command-deck";

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
    cawStatuses,
    addRecords,
    resetFlow,
    generatePlan,
    executePlan,
    refreshCawStatus,
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

  return (
    <div className="space-y-4">
      {/* ─── KPI grid ─── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            prefix: "BUDGET::",
            value: <AnimatedNumber value={totalBudget} />,
            subtext: "USDC",
            color: "lime" as const,
          },
          {
            prefix: "PENDING::",
            value: <AnimatedNumber value={totalPending} />,
            subtext: "USDC",
            color: "cyan" as const,
          },
          {
            prefix: "BLOCKED::",
            value: <AnimatedNumber value={totalBlocked} />,
            subtext: "USDC",
            color: "coral" as const,
          },
          {
            prefix: "REMAIN::",
            value: <AnimatedNumber value={budgetRemaining} />,
            subtext: "USDC",
            color: "blue" as const,
          },
        ].map((card, i) => (
          <motion.div
            key={card.prefix}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <FrostedPanel glowColor={card.color} sheen className="p-4">
              <HudLabel prefix={card.prefix} value={card.value} color={card.color} size="sm" />
              <div className="mt-1 text-[10px] text-fg-subtle font-mono">{card.subtext}</div>
            </FrostedPanel>
          </motion.div>
        ))}
      </div>

      {/* ─── Payment Pipeline Hero ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <FrostedPanel
          glowColor="lime"
          scanline
          sheen
          className="relative p-5"
        >
          <CornerGlow color="lime" className="-top-24 -right-24" intensity={0.2} />

          <div className="relative z-10 flex items-start justify-between mb-4">
            <div>
              <HudLabel
                prefix="PIPELINE::"
                value={
                  [
                    _("待机", "IDLE"),
                    _("扫描", "SCAN"),
                    _("审核", "REVIEW"),
                    _("执行", "EXEC"),
                    _("完成", "DONE"),
                  ][step]
                }
                color="lime"
                size="md"
              />
              <h2 className="mt-1 text-base font-semibold text-fg">
                {_("付款执行管道", "Payment Execution Pipeline")}
              </h2>
            </div>
            <StatusPulse
              color={step === FlowStep.Executing ? "coral" : step === FlowStep.Done ? "cyan" : "lime"}
              label={
                ["STANDBY", "SCANNING", "REVIEW", "EXECUTING", "AUDIT"][step]
              }
              size="sm"
            />
          </div>

          <Scanline color="lime" className="relative z-10 mb-4" />

          <div className="relative z-10 mb-4">
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

          <div className="relative z-10">
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
              cawStatuses={cawStatuses}
              cawRefreshing={cawRefreshing}
              onRefreshCaw={handleRefreshCawStatus}
              lang={lang}
              _={_}
            />
          </div>
        </FrostedPanel>
      </motion.div>

      {/* ─── Records satellite ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
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
      </motion.div>

      {/* ─── Risk Gate floating satellite ─── */}
      <AnimatePresence>
        {totalBlocked > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
          >
            <FrostedPanel glowColor="coral" scanline className="p-4">
              <RiskGateAnimation
                isBlocked={true}
                reason={_(
                  `${blockedItems.length} 笔付款被拦截（共 ${totalBlocked} USDC）：${blockedItems[0]?.riskReason}`,
                  `${blockedItems.length} payment(s) blocked (${totalBlocked} USDC): ${blockedItems[0]?.riskReason}`
                )}
              />
            </FrostedPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Batch import modal ─── */}
      <RecordsImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportRecords}
      />
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
    <FrostedPanel glowColor="cyan" sheen className="flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-hud-cyan" />
          <span className="text-sm font-semibold text-fg">
            {_("贡献记录", "Records")}
          </span>
          <span className="text-[10px] text-fg-subtle font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04]">
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

      <div className="max-h-[260px] overflow-y-auto p-2 space-y-1">
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
                "p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors",
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

      <div className="p-3 border-t border-white/[0.06] bg-white/[0.02]">
        <form onSubmit={onAdd} className="space-y-2">
          <input
            placeholder={_("姓名", "Name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[12px] rounded-field border border-white/[0.08] bg-surface/50 text-fg outline-none focus:border-hud-cyan transition-colors"
          />
          <input
            placeholder="0x..."
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[12px] rounded-field border border-white/[0.08] bg-surface/50 text-fg outline-none focus:border-hud-cyan transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(Number(e.target.value))}
              className="flex-1 px-2.5 py-1.5 text-[12px] rounded-field border border-white/[0.08] bg-surface/50 text-fg outline-none focus:border-hud-cyan transition-colors"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-[12px] font-semibold rounded-field border border-white/[0.08] bg-surface hover:bg-surface-hover text-fg transition-colors flex items-center gap-1"
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
  cawStatuses,
  cawRefreshing,
  onRefreshCaw,
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
  cawStatuses: CawStatus[];
  cawRefreshing: boolean;
  onRefreshCaw: () => void;
  lang: string;
  _: (zh: string, en: string) => string;
}) {
  const readyCount = plan.filter((i) => i.status === "Ready").length;
  const blockedCount = plan.filter((i) => i.status === "Blocked").length;
  const executedCount = plan.filter((i) => i.status === "Executed").length;

  return (
    <div className="space-y-4">
      {/* Step 0: Generate Plan */}
      {step === FlowStep.Idle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01]">
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
              count={12}
              className="absolute -inset-4 pointer-events-none"
              color="#B5FF4D"
            />
            <HolographicButton
              onClick={onGenerate}
              variant="lime"
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

          <motion.div layout className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
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
              variant="lime"
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

          <div className="relative z-10 w-full max-w-[200px] h-1 rounded-full bg-white/[0.06] overflow-hidden">
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

      {/* Step 4: Done / Audit */}
      {step === FlowStep.Done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-hud-violet" />
              <span className="text-sm font-semibold text-fg">{_("审计报告快照", "Audit Report Snapshot")}</span>
              <span className="text-[10px] text-fg-subtle font-mono px-2 py-0.5 rounded-full bg-hud-violet/10">IMMUTABLE</span>
            </div>
            <p className="text-[11px] text-fg-subtle mb-3">
              {_(
                "执行时的不可变快照。txHash 为 null 不代表最终没有 txHash，只代表执行当时尚未获取。",
                "Immutable snapshot at execution time. txHash=null does not mean no final txHash, only that it was not yet available."
              )}
            </p>
            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-white/[0.03]">
                  <tr className="border-b border-white/[0.06] text-fg-muted font-mono uppercase text-[11px]">
                    <th className="py-2 px-2">{_("实体", "Entity")}</th>
                    <th className="py-2 px-2">{_("状态", "Status")}</th>
                    <th className="py-2 px-2">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {plan.map((item) => (
                    <tr key={item.record.id}>
                      <td className="py-2 px-2 font-medium text-fg text-[12px]">{item.record.name}</td>
                      <td className="py-2 px-2">
                        {item.status === "Executed" ? (
                          <span className="text-success font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3 h-3" /> EXECUTED
                          </span>
                        ) : (
                          <span className="text-hud-coral font-bold flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3 h-3" /> BLOCKED
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 font-mono text-[10px]">
                        {item.txHash ? (
                          <GradientText>{item.txHash}</GradientText>
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

          <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className={cn("w-4 h-4 text-hud-blue", cawRefreshing && "animate-spin")} />
                <span className="text-sm font-semibold text-fg">{_("最新 CAW 状态", "Latest CAW Status")}</span>
              </div>
              <button
                onClick={onRefreshCaw}
                disabled={cawRefreshing}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-fg transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className={cn("w-3 h-3", cawRefreshing && "animate-spin")} />
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
                    className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.01]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-fg">{status.paymentItemId}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                        status.normalizedStatus === "Executed"
                          ? "bg-success/10 text-success"
                          : status.normalizedStatus === "Failed"
                          ? "bg-hud-coral/10 text-hud-coral"
                          : "bg-amber-500/10 text-amber-500"
                      )}>
                        {status.normalizedStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                      <div className="text-fg-subtle">Provider: <span className="text-fg font-mono">{status.providerStatus}</span></div>
                      <div className="text-fg-subtle">Network: <span className="text-fg font-mono">{status.network}</span></div>
                      <div className="text-fg-subtle col-span-2">
                        txHash:{" "}
                        {status.txHash ? (
                          <GradientText className="font-mono">{status.txHash}</GradientText>
                        ) : (
                          <span className="text-fg-subtle">{_("等待刷新...", "Pending refresh...")}</span>
                        )}
                      </div>
                      <div className="text-fg-subtle col-span-2">Last checked: <span className="text-fg">{new Date(status.lastCheckedAt).toLocaleString()}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/[0.03]">
              <div className="text-sm font-bold text-success">{executedCount}</div>
              <div className="text-[10px] text-fg-subtle">{_("已执行", "Executed")}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03]">
              <div className="text-sm font-bold text-hud-coral">{blockedCount}</div>
              <div className="text-[10px] text-fg-subtle">{_("已拦截", "Blocked")}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03]">
              <div className="text-sm font-bold text-hud-lime">{totalReady + totalBlocked} USDC</div>
              <div className="text-[10px] text-fg-subtle">{_("总计", "Total")}</div>
            </div>
          </div>

          <HolographicButton
            onClick={onReset}
            variant="lime"
            size="lg"
            className="w-full"
          >
            {_("处理下一周期", "Process next cycle")}
          </HolographicButton>
        </motion.div>
      )}
    </div>
  );
}
