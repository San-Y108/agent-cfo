"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { MOCK_RECORDS, MOCK_RULES } from "@/lib/demo/console-mock";
import { ContributorRecord, PaymentPlanItem } from "@/lib/types/console";

/* =============================================================================
 * BUSINESS LOGIC HELPERS
 * ===========================================================================*/

function evaluateItem(record: ContributorRecord): PaymentPlanItem {
  const isWhitelisted = MOCK_RULES.whitelist.some(
    (w) => w.toLowerCase() === record.wallet.toLowerCase()
  );
  if (!isWhitelisted) {
    return { record, status: "Blocked", riskReason: "Address not whitelisted" };
  }
  if (record.amount > MOCK_RULES.singlePaymentLimit) {
    return {
      record,
      status: "Blocked",
      riskReason: `Over limit of ${MOCK_RULES.singlePaymentLimit} USDC`,
    };
  }
  return { record, status: "Ready" };
}

/* =============================================================================
 * MAIN PAGE — Payment Execution Control Center
 * ===========================================================================*/

export default function TreasuryPage() {
  const { t, lang } = useApp();

  /* ─── business state ─── */
  const [records, setRecords] = useState<ContributorRecord[]>(MOCK_RECORDS);
  const [plan, setPlan] = useState<PaymentPlanItem[]>([]);
  const [step, setStep] = useState(0); // 0=idle, 1=scanning, 2=review, 3=executing, 4=done
  const [isExecuting, setIsExecuting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newAmount, setNewAmount] = useState(10);

  /* ─── derived metrics ─── */
  const totalBudget = MOCK_RULES.monthlyBudget;
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
    setRecords([
      ...records,
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

  const handleGenerate = () => {
    setStep(1); // scanning
    setTimeout(() => {
      const p = records.map(evaluateItem);
      setPlan(p);
      setStep(2); // review
    }, 1200);
  };

  const handleExecute = () => {
    setStep(3); // executing
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      const executed = plan.map((item) =>
        item.status === "Ready"
          ? {
              ...item,
              status: "Executed" as const,
              txHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
            }
          : item
      );
      setPlan(executed);
      setStep(4); // done
    }, 2000);
  };

  const reset = () => {
    setStep(0);
    setPlan([]);
    setIsExecuting(false);
    setRecords(MOCK_RECORDS);
  };

  /* ─── i18n helpers ─── */
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

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
            <div className="w-8 h-8 rounded-lg bg-[#B5FF4D]/10 border border-[#B5FF4D]/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#B5FF4D]" />
            </div>
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5FF4D]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {_("付款执行中心", "Payment Execution Center")}
            </span>
          </div>
          <h1
            className="text-2xl font-semibold text-fg leading-tight tracking-tight"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {_("统筹月度贡献结算", "Monthly Contribution Settlement")}
          </h1>
          <p className="mt-2 text-sm text-fg-subtle max-w-xl">
            {_(
              "管理贡献记录、运行风险检查、批准执行付款，并在 Sepolia 测试网上完成可审计的结算闭环。",
              "Manage contribution records, run risk checks, approve and execute payouts, and complete auditable settlement on Sepolia testnet."
            )}
          </p>
        </motion.div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="px-6 lg:px-10 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label={_("本月预算", "Monthly Budget")}
            value={`${totalBudget} USDC`}
            icon={<Wallet className="w-4 h-4" />}
            accent="#60A5FA"
            delay={0}
          />
          <KpiCard
            label={_("待付款", "Pending")}
            value={`${totalPending} USDC`}
            icon={<Clock className="w-4 h-4" />}
            accent="#5EEAD4"
            delay={0.05}
          />
          <KpiCard
            label={_("已拦截", "Blocked")}
            value={`${totalBlocked} USDC`}
            icon={<ShieldAlert className="w-4 h-4" />}
            accent="#FB7185"
            delay={0.1}
          />
          <KpiCard
            label={_("预算剩余", "Remaining")}
            value={`${budgetRemaining} USDC`}
            icon={<TrendingUp className="w-4 h-4" />}
            accent="#B5FF4D"
            delay={0.15}
          />
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="px-6 lg:px-10 pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: Records Table */}
          <motion.div
            className="xl:col-span-3 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.02] overflow-hidden">
              {/* Table header */}
              <div className="px-5 py-4 border-b border-border-token dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-fg-muted" />
                  <span className="text-sm font-semibold text-fg">
                    {_("贡献记录", "Contribution Records")}
                  </span>
                  <span className="text-[11px] text-fg-subtle font-mono px-2 py-0.5 rounded-full bg-surface-2 dark:bg-white/[0.04]">
                    {records.length}
                  </span>
                </div>
                <button
                  onClick={reset}
                  className="text-[11px] text-fg-subtle hover:text-fg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {_("重置", "Reset")}
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-surface-2 dark:bg-white/[0.03]">
                    <tr className="border-b border-border-token dark:border-white/[0.06] text-fg-muted font-mono uppercase text-[11px]">
                      <th className="py-3 px-5">{_("收款人", "Recipient")}</th>
                      <th className="py-3 px-5">{_("任务", "Task")}</th>
                      <th className="py-3 px-5 text-right">USDC</th>
                      <th className="py-3 px-5 text-center">{_("状态", "Status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-token dark:divide-white/[0.04]">
                    {records.map((r) => {
                      const planItem = plan.find((p) => p.record.id === r.id);
                      const status = planItem?.status;
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-surface-2/50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-5">
                            <div className="font-medium text-fg text-[13px]">{r.name}</div>
                            <div className="font-mono text-[11px] text-fg-subtle">
                              {r.wallet.substring(0, 8)}...{r.wallet.substring(r.wallet.length - 6)}
                            </div>
                          </td>
                          <td className="py-3 px-5 text-fg-muted text-[13px]">{r.task}</td>
                          <td className="py-3 px-5 text-right font-mono font-semibold text-fg text-[13px]">
                            {r.amount}
                          </td>
                          <td className="py-3 px-5 text-center">
                            {status ? (
                              <StatusBadge status={status} riskReason={planItem?.riskReason} />
                            ) : (
                              <span className="text-[11px] text-fg-subtle">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add form */}
              <div className="px-5 py-4 border-t border-border-token dark:border-white/[0.06] bg-surface-2/30 dark:bg-white/[0.01]">
                <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] text-fg-subtle font-mono uppercase mb-1">
                      {_("姓名", "Name")}
                    </label>
                    <input
                      placeholder={_("例如 Alice", "e.g. Alice")}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] text-fg outline-none focus:border-[#B5FF4D] transition-colors"
                    />
                  </div>
                  <div className="flex-[2] min-w-[180px]">
                    <label className="block text-[10px] text-fg-subtle font-mono uppercase mb-1">
                      {_("钱包地址", "Wallet")}
                    </label>
                    <input
                      placeholder="0x..."
                      value={newWallet}
                      onChange={(e) => setNewWallet(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] text-fg outline-none focus:border-[#B5FF4D] transition-colors"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] text-fg-subtle font-mono uppercase mb-1">
                      USDC
                    </label>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] text-fg outline-none focus:border-[#B5FF4D] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-[13px] font-semibold rounded-lg border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] hover:bg-surface-hover text-fg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {_("添加", "Add")}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right: Action Panel */}
          <motion.div
            className="xl:col-span-2 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ActionPanel
              step={step}
              plan={plan}
              records={records}
              totalReady={totalReady}
              totalBlocked={totalBlocked}
              isExecuting={isExecuting}
              onGenerate={handleGenerate}
              onExecute={handleExecute}
              onReset={reset}
              lang={lang}
              _={_}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
 * KPI CARD
 * ===========================================================================*/

function KpiCard({
  label,
  value,
  icon,
  accent,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.02] p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-fg-subtle font-mono uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${accent}15`,
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        className="text-xl font-bold tracking-tight"
        style={{ color: accent, fontFamily: "Inter, sans-serif" }}
      >
        {value}
      </div>
    </motion.div>
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
  totalReady,
  totalBlocked,
  isExecuting,
  onGenerate,
  onExecute,
  onReset,
  lang,
  _,
}: {
  step: number;
  plan: PaymentPlanItem[];
  records: ContributorRecord[];
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
  const executedCount = plan.filter((i) => i.status === "Executed").length;

  return (
    <div className="rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.02] overflow-hidden">
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-border-token dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B5FF4D]" />
          <span className="text-sm font-semibold text-fg">
            {_("执行操作", "Actions")}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Step 0: Generate Plan */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg border border-dashed border-border-token dark:border-white/[0.08] bg-surface-2/30 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 flex items-center justify-center text-[#5EEAD4] text-xs font-bold">
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

            <button
              onClick={onGenerate}
              className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#B5FF4D] hover:brightness-95 text-[#0D0D0D] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              {_("生成付款计划", "Generate Plan")}
            </button>

            <div className="text-[11px] text-fg-subtle space-y-1">
              <div className="flex justify-between">
                <span>{_("当前记录数", "Records")}</span>
                <span className="font-mono">{records.length}</span>
              </div>
              <div className="flex justify-between">
                <span>{_("月度预算", "Budget")}</span>
                <span className="font-mono">{MOCK_RULES.monthlyBudget} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>{_("单笔限额", "Limit")}</span>
                <span className="font-mono">{MOCK_RULES.singlePaymentLimit} USDC</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Scanning */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 flex flex-col items-center gap-4 text-center"
          >
            <div className="relative">
              <RefreshCw className="w-10 h-10 text-[#5EEAD4] animate-spin" />
              <div
                className="absolute inset-0 blur-xl rounded-full scale-150"
                style={{ backgroundColor: "rgba(94,234,212,0.2)" }}
              />
            </div>
            <div>
              <p className="text-fg font-semibold">
                {_("AI 扫描中...", "Agent scanning...")}
              </p>
              <p className="text-xs text-fg-subtle mt-1">
                {_("正在评估白名单、预算边界和单笔限额", "Evaluating whitelist, budget bounds and single-payment limits")}
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Review Results */}
        {step >= 2 && step < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg border border-success/20 bg-success/5 text-center">
                <div className="text-lg font-bold text-success">{readyCount}</div>
                <div className="text-[10px] text-fg-subtle uppercase">{_("通过", "Passed")}</div>
              </div>
              <div className="p-3 rounded-lg border border-[#FB7185]/20 bg-[#FB7185]/5 text-center">
                <div className="text-lg font-bold" style={{ color: "#FB7185" }}>{blockedCount}</div>
                <div className="text-[10px] text-fg-subtle uppercase">{_("拦截", "Blocked")}</div>
              </div>
            </div>

            {/* Plan items */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {plan.map((item, i) => (
                <motion.div
                  key={item.record.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    item.status === "Blocked"
                      ? "bg-[#FB7185]/5 border-[#FB7185]/15"
                      : "bg-success/5 border-success/15"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.status === "Blocked" ? (
                      <ShieldAlert className="w-4 h-4 text-[#FB7185]" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    <div>
                      <div className="text-[13px] font-medium text-fg">{item.record.name}</div>
                      <div className="text-[10px] text-fg-subtle">
                        {item.status === "Blocked"
                          ? item.riskReason
                          : _("通过所有检查", "All checks passed")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-mono font-semibold text-fg">
                      {item.record.amount} USDC
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Risk warning */}
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

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onReset}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] hover:bg-surface-hover text-fg transition-colors cursor-pointer"
              >
                {_("返回", "Back")}
              </button>
              <button
                onClick={onExecute}
                disabled={readyCount === 0}
                className="flex-[2] py-2.5 rounded-lg text-xs font-bold bg-[#B5FF4D] hover:brightness-95 text-[#0D0D0D] transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {_("批准并执行", "Approve & Execute")} ({totalReady} USDC)
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Executing */}
        {step === 3 && isExecuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 flex flex-col items-center gap-4 text-center"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#60A5FA]/30 border-t-[#60A5FA] animate-spin" />
              <div
                className="absolute inset-0 blur-xl rounded-full"
                style={{ backgroundColor: "rgba(96,165,250,0.15)" }}
              />
            </div>
            <div>
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
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Success banner */}
            <div className="p-5 rounded-xl border text-center"
              style={{
                borderColor: "rgba(192,132,252,0.2)",
                backgroundColor: "rgba(192,132,252,0.05)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border"
                style={{
                  backgroundColor: "rgba(192,132,252,0.15)",
                  borderColor: "rgba(192,132,252,0.3)",
                }}
              >
                <CheckCheck className="w-6 h-6" style={{ color: "#C084FC" }} />
              </div>
              <h3
                className="text-lg font-bold tracking-tight mb-1"
                style={{
                  background: "linear-gradient(135deg, #C084FC 0%, #E879F9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {_("结算已封存", "Settlement Sealed")}
              </h3>
              <p className="text-xs text-fg-subtle">
                {_(
                  "付款已通过 Sepolia 测试网上的策略最终确定。",
                  "Payments finalized through policies on Sepolia Testnet."
                )}
              </p>
            </div>

            {/* Result table */}
            <div className="rounded-lg border border-border-token dark:border-white/[0.06] overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-surface-2 dark:bg-white/[0.03]">
                  <tr className="border-b border-border-token dark:border-white/[0.06] text-fg-muted font-mono uppercase text-[11px]">
                    <th className="py-2.5 px-3">{_("实体", "Entity")}</th>
                    <th className="py-2.5 px-3">{_("操作", "Action")}</th>
                    <th className="py-2.5 px-3">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-token dark:divide-white/[0.04]">
                  {plan.map((item) => (
                    <tr key={item.record.id}>
                      <td className="py-2.5 px-3 font-medium text-fg text-[12px]">{item.record.name}</td>
                      <td className="py-2.5 px-3">
                        {item.status === "Executed" ? (
                          <span className="text-success font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3 h-3" /> EXECUTED
                          </span>
                        ) : (
                          <span className="text-[#FB7185] font-bold flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3 h-3" /> BLOCKED
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-fg-subtle">
                        {item.txHash || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-surface-2 dark:bg-white/[0.03]">
                <div className="text-sm font-bold text-success">{executedCount}</div>
                <div className="text-[10px] text-fg-subtle">{_("已执行", "Executed")}</div>
              </div>
              <div className="p-2 rounded-lg bg-surface-2 dark:bg-white/[0.03]">
                <div className="text-sm font-bold text-[#FB7185]">{blockedCount}</div>
                <div className="text-[10px] text-fg-subtle">{_("已拦截", "Blocked")}</div>
              </div>
              <div className="p-2 rounded-lg bg-surface-2 dark:bg-white/[0.03]">
                <div className="text-sm font-bold text-[#B5FF4D]">{totalReady + totalBlocked} USDC</div>
                <div className="text-[10px] text-fg-subtle">{_("总计", "Total")}</div>
              </div>
            </div>

            <button
              onClick={onReset}
              className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#B5FF4D] hover:brightness-95 text-[#0D0D0D] transition-all cursor-pointer"
            >
              {_("处理下一周期", "Process next cycle")}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
