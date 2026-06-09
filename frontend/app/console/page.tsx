"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  FileSpreadsheet,
  ShieldAlert,
  CheckCircle,
  UserCheck,
  Wallet,
  ScrollText,
  RefreshCw,
  Send,
  Database,
  ArrowRight,
  Sparkles,
  XCircle,
  AlertCircle,
  Plus,
  Hash,
  Check,
  X,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { MOCK_RECORDS, MOCK_RULES } from "@/lib/demo/console-mock";
import { ContributorRecord, PaymentPlanItem } from "@/lib/types/console";

/* =============================================================================
 * STAGE DATA
 * ===========================================================================*/

interface StageDef {
  no: string;
  key: string;
  title: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
}

const STAGES: StageDef[] = [
  {
    no: "01",
    key: "records",
    title: "Records",
    accent: "#5EEAD4",
    accentSoft: "rgba(94,234,212,0.08)",
    accentBorder: "rgba(94,234,212,0.28)",
  },
  {
    no: "02",
    key: "risk",
    title: "Risk",
    accent: "#FB7185",
    accentSoft: "rgba(251,113,133,0.07)",
    accentBorder: "rgba(251,113,133,0.28)",
  },
  {
    no: "03",
    key: "approval",
    title: "Approval",
    accent: "#B5FF4D",
    accentSoft: "rgba(181,255,77,0.08)",
    accentBorder: "rgba(181,255,77,0.32)",
  },
  {
    no: "04",
    key: "execution",
    title: "Execution",
    accent: "#60A5FA",
    accentSoft: "rgba(96,165,250,0.07)",
    accentBorder: "rgba(96,165,250,0.28)",
  },
  {
    no: "05",
    key: "audit",
    title: "Audit",
    accent: "#C084FC",
    accentSoft: "rgba(192,132,252,0.07)",
    accentBorder: "rgba(192,132,252,0.28)",
  },
];

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
 * MAIN PAGE
 * ===========================================================================*/

export default function TreasuryPage() {
  const { t, lang } = useApp();

  /* ─── business state ─── */
  const [records, setRecords] = useState<ContributorRecord[]>(MOCK_RECORDS);
  const [plan, setPlan] = useState<PaymentPlanItem[]>([]);
  const [step, setStep] = useState(1); // 1=records, 2=scanning, 3=risk, 4=approval, 5=exec, 6=audit
  const [isExecuting, setIsExecuting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newAmount, setNewAmount] = useState(10);
  const [newRole, setNewRole] = useState("Contributor");
  const [newTask, setNewTask] = useState("Completed milestone");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newWallet) return;
    setRecords([
      ...records,
      {
        id: `rec_${Date.now()}`,
        name: newName,
        role: newRole,
        task: newTask,
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
    setStep(2); // scanning
    setTimeout(() => {
      const p = records.map(evaluateItem);
      setPlan(p);
      setStep(3); // risk review
    }, 1200);
  };

  const handleExecute = () => {
    setStep(5); // executing
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
      setStep(6); // audit
    }, 2000);
  };

  const reset = () => {
    setStep(1);
    setPlan([]);
    setIsExecuting(false);
  };

  const totalExecuting = plan
    .filter((i) => i.status === "Ready")
    .reduce((a, c) => a + c.record.amount, 0);

  /* ─── GSAP refs ─── */
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;
      const panels = STAGES.length;
      gsap.to(trackRef.current, {
        xPercent: (-100 * (panels - 1)) / panels,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 0.35,
          fastScrollEnd: true,
          snap: {
            snapTo: 1 / (panels - 1),
            duration: { min: 0.05, max: 0.18 },
            delay: 0,
            ease: "power2.out",
          },
          end: () =>
            "+=" +
            (sectionRef.current?.offsetWidth ?? window.innerWidth) *
              (panels - 1) *
              0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const activeIdx = Math.min(
              panels - 1,
              Math.round(self.progress * (panels - 1))
            );
            if (counterRef.current) {
              counterRef.current.textContent = STAGES[activeIdx].no;
            }
            dotsRef.current.forEach((dot, i) => {
              if (!dot) return;
              if (i === activeIdx) {
                dot.style.width = "32px";
                dot.style.backgroundColor = STAGES[i].accent;
                dot.style.boxShadow = `0 0 14px ${STAGES[i].accent}`;
              } else {
                dot.style.width = "8px";
                dot.style.backgroundColor = "rgba(255,255,255,0.14)";
                dot.style.boxShadow = "none";
              }
            });
          },
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <div className="relative w-full">
      {/* ─── Intro headline ─── */}
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-24 text-center lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "#B5FF4D", fontFamily: "'Courier New', Courier, monospace" }}
          >
            {lang === "zh" ? "5 阶段执行管道" : "The 5-Stage Pipeline"}
          </span>
          <h2
            className="mt-5 font-medium leading-[1.05] text-fg"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              letterSpacing: "-0.025em",
            }}
          >
            {lang === "zh" ? "从贡献记录" : "From contribution"}
            <br />
            {lang === "zh" ? "到" : "to "}
            <span style={{ color: "#B5FF4D" }}>
              {lang === "zh" ? "审计追踪" : "audit trail"}
            </span>.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-fg-subtle md:text-lg">
            {lang === "zh"
              ? "五个阶段，一条可见的闭环。向下滚动——每个阶段水平滑入视野。"
              : "One visible loop, five stages. Scroll on — each stage pans into view."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {STAGES.map((s) => (
              <div
                key={s.key}
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em]"
                style={{
                  borderColor: s.accentBorder,
                  backgroundColor: s.accentSoft,
                  color: s.accent,
                }}
              >
                <span className="opacity-60">{s.no}</span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 text-fg-subtle/50">
            <span
              className="text-[10px] uppercase tracking-[0.25em]"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {lang === "zh" ? "向下滚动 — 阶段水平展开" : "scroll down — stages pan horizontally"}
            </span>
            <div className="h-6 w-px animate-pulse bg-gradient-to-b from-transparent via-fg-subtle/40 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* ─── Horizontal pin scroll ─── */}
      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Progress bar */}
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px] bg-white/[0.04]">
          <div
            ref={progressRef}
            className="h-full origin-left bg-gradient-to-r from-[#5EEAD4] via-[#B5FF4D] to-[#C084FC]"
            style={{ transform: "scaleX(0)", willChange: "transform" }}
          />
        </div>

        {/* Counter */}
        <div
          className="absolute right-6 top-6 z-30 flex items-baseline gap-1 text-fg-subtle/50 lg:right-10 lg:top-10"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          <span
            ref={counterRef}
            className="text-3xl font-bold text-fg lg:text-4xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            01
          </span>
          <span className="text-sm">/ 05</span>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${STAGES.length * 100}vw`, willChange: "transform" }}
        >
          {/* ── Panel 1: Records ── */}
          <Panel stage={STAGES[0]} index={0}>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-xl font-bold text-fg">
                {lang === "zh" ? "月度贡献记录" : "Monthly Contribution Records"}
              </h3>
              <p className="text-xs text-fg-subtle">
                {lang === "zh"
                  ? "添加团队交付物，配置钱包并实时观察边界重新计算。"
                  : "Add team deliverables, configure wallets and watch bounds re-calculate live."}
              </p>

              <div className="rounded-lg border border-border-token dark:border-white/[0.06] overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-surface-2 dark:bg-white/[0.03]">
                    <tr className="border-b border-border-token dark:border-white/[0.06] text-fg-muted font-mono uppercase text-[11px]">
                      <th className="py-2.5 px-3">{lang === "zh" ? "收款人" : "Recipient"}</th>
                      <th className="py-2.5 px-3">{lang === "zh" ? "任务" : "Task"}</th>
                      <th className="py-2.5 px-3 text-right">USDC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-token dark:divide-white/[0.04]">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-2/50 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-fg text-xs">{r.name}</div>
                          <div className="font-mono text-[10px] text-fg-subtle">
                            {r.wallet.substring(0, 8)}...{r.wallet.substring(r.wallet.length - 6)}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-fg-muted text-xs">{r.task}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-fg text-xs">
                          {r.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add form */}
              <form
                onSubmit={handleAdd}
                className="p-4 border border-dashed border-border-token dark:border-white/[0.08] rounded-xl space-y-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder={lang === "zh" ? "姓名" : "Name"}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-2 py-1.5 text-xs rounded border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] text-fg outline-none focus:border-[#5EEAD4]"
                  />
                  <input
                    placeholder={lang === "zh" ? "钱包地址" : "Wallet"}
                    value={newWallet}
                    onChange={(e) => setNewWallet(e.target.value)}
                    className="px-2 py-1.5 text-xs rounded border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] text-fg outline-none focus:border-[#5EEAD4]"
                  />
                  <input
                    type="number"
                    placeholder="USDC"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="px-2 py-1.5 text-xs rounded border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] text-fg outline-none focus:border-[#5EEAD4]"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-fg-muted font-mono uppercase">
                    {lang === "zh" ? "快速注入模拟交易" : "Quick inject mock transaction"}
                  </span>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold rounded border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] hover:bg-surface-hover text-fg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    {lang === "zh" ? "添加" : "Add"}
                  </button>
                </div>
              </form>

              <button
                onClick={handleGenerate}
                disabled={step === 2}
                className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-accent hover:brightness-95 text-accent-fg transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${step === 2 ? "animate-spin" : ""}`} />
                {step === 2
                  ? lang === "zh"
                    ? "AI 扫描中..."
                    : "Agent scanning..."
                  : lang === "zh"
                  ? "生成付款计划"
                  : "Generate Plan"}
              </button>
            </div>
          </Panel>

          {/* ── Panel 2: Risk ── */}
          <Panel stage={STAGES[1]} index={1}>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-xl font-bold text-fg">
                {lang === "zh" ? "风险检查结果" : "Risk Check Results"}
              </h3>
              <p className="text-xs text-fg-subtle">
                {lang === "zh"
                  ? "五道策略门在任何钱包调用前运行。被拦截的项目永远不会到达执行队列。"
                  : "Five policy gates run before any wallet call. Blocked items never reach the execution queue."}
              </p>

              {step < 3 ? (
                <div className="p-8 text-center text-fg-subtle text-sm">
                  {lang === "zh"
                    ? "点击 Records 面板的「生成付款计划」开始扫描"
                    : "Click 'Generate Plan' in the Records panel to start scanning"}
                </div>
              ) : (
                <div className="space-y-2">
                  {plan.map((item) => (
                    <motion.div
                      key={item.record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        item.status === "Blocked"
                          ? "bg-danger/5 border-danger/20"
                          : "bg-success/5 border-success/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === "Blocked"
                              ? "bg-danger/15 text-danger"
                              : "bg-success/15 text-success"
                          }`}
                        >
                          {item.status === "Blocked" ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-fg text-xs">{item.record.name}</div>
                          <div className="text-[10px] text-fg-subtle">
                            {item.status === "Blocked"
                              ? item.riskReason
                              : lang === "zh"
                              ? "通过所有检查"
                              : "All checks passed"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-fg text-xs">
                          {item.record.amount} USDC
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            item.status === "Blocked" ? "text-danger" : "text-success"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {plan.some((i) => i.status === "Blocked") && (
                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-amber-700 dark:text-amber-300">
                        {lang === "zh"
                          ? "存在规则排除项：至少一笔付款未通过安全检查。这些地址将被排除在加密批处理付款之外。"
                          : "Rule exclusions present: at least one payload failed safety checks. These will be excluded from batch payouts."}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* ── Panel 3: Approval ── */}
          <Panel stage={STAGES[2]} index={2}>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-xl font-bold text-fg">
                {lang === "zh" ? "人工批准" : "Human Approval"}
              </h3>
              <p className="text-xs text-fg-subtle">
                {lang === "zh"
                  ? "真人点击批准并执行。被拦截的项目保持拦截状态，原因一并保留。"
                  : "A real person clicks Approve & Execute. Blocked items stay blocked with reasons attached."}
              </p>

              {step < 4 ? (
                <>
                  <div className="space-y-2">
                    {plan.map((item) => (
                      <div
                        key={item.record.id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          item.status === "Blocked"
                            ? "opacity-50 border-border-token dark:border-white/[0.04]"
                            : "border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.status === "Blocked" ? "bg-danger" : "bg-success"
                            }`}
                          />
                          <span className="text-xs font-bold text-fg">{item.record.name}</span>
                        </div>
                        <span className="font-mono text-xs text-fg">
                          {item.record.amount} USDC
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] hover:bg-surface-hover text-fg transition-colors cursor-pointer"
                    >
                      {lang === "zh" ? "返回" : "Back"}
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={!plan.some((i) => i.status === "Ready")}
                      className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-accent hover:brightness-95 text-accent-fg transition-all cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5 inline mr-1" />
                      {lang === "zh" ? "批准并执行" : "Approve & Execute"} (
                      {totalExecuting} USDC)
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-fg font-bold">
                    {lang === "zh" ? "已批准执行" : "Approved for execution"}
                  </p>
                  <p className="text-xs text-fg-subtle mt-1">
                    {lang === "zh"
                      ? "准备通过 Cobo Agentic Wallet 执行..."
                      : "Preparing execution via Cobo Agentic Wallet..."}
                  </p>
                </div>
              )}
            </div>
          </Panel>

          {/* ── Panel 4: Execution ── */}
          <Panel stage={STAGES[3]} index={3}>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-xl font-bold text-fg">
                {lang === "zh" ? "CAW 执行" : "CAW Execution"}
              </h3>
              <p className="text-xs text-fg-subtle">
                {lang === "zh"
                  ? "AI 永不持有私钥。每笔转账通过配置的 Agent 钱包路由，返回真实 tx hash。"
                  : "AI never holds keys. Every transfer routes through a configured agent wallet and returns a real tx hash."}
              </p>

              {step < 5 ? (
                <div className="p-8 text-center text-fg-subtle text-sm">
                  {lang === "zh"
                    ? "在 Approval 面板中批准执行以查看签名过程"
                    : "Approve execution in the Approval panel to see the signing process"}
                </div>
              ) : isExecuting ? (
                <div className="py-12 flex flex-col items-center gap-4">
                  <div className="relative">
                    <Database className="w-10 h-10 text-fg relative z-10 animate-bounce" />
                    <div className="absolute inset-0 bg-[#60A5FA]/25 blur-lg rounded-full scale-150 animate-pulse" />
                  </div>
                  <p className="text-fg font-bold">
                    {lang === "zh" ? "加密核心广播中..." : "Cryptographic broadcast..."}
                  </p>
                  <p className="text-xs text-fg-subtle">
                    Cobo Agentic Wallet (Caw) is sealing execution frames...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plan
                    .filter((i) => i.status === "Executed")
                    .map((item) => (
                      <motion.div
                        key={item.record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg border border-success/20 bg-success/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-xs font-bold text-fg">{item.record.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-fg">
                            {item.record.amount} USDC
                          </span>
                          {item.txHash && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono border"
                              style={{
                                borderColor: `${STAGES[3].accent}40`,
                                backgroundColor: `${STAGES[3].accent}15`,
                                color: STAGES[3].accent,
                              }}
                            >
                              {item.txHash}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </Panel>

          {/* ── Panel 5: Audit ── */}
          <Panel stage={STAGES[4]} index={4}>
            <div className="space-y-4 max-w-lg">
              {step < 6 ? (
                <>
                  <h3 className="text-xl font-bold text-fg">
                    {lang === "zh" ? "审计报告" : "Audit Report"}
                  </h3>
                  <p className="text-xs text-fg-subtle">
                    {lang === "zh"
                      ? "完成执行后将生成可导出的结算报告。"
                      : "An exportable settlement report will be generated after execution completes."}
                  </p>
                  <div className="p-8 text-center text-fg-subtle text-sm">
                    {lang === "zh"
                      ? "在 Execution 面板中完成签名以查看审计报告"
                      : "Complete signing in the Execution panel to view the audit report"}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 rounded-xl border flex flex-col items-center text-center"
                    style={{
                      borderColor: STAGES[4].accentBorder,
                      backgroundColor: STAGES[4].accentSoft,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border"
                      style={{
                        backgroundColor: `${STAGES[4].accent}20`,
                        borderColor: `${STAGES[4].accent}40`,
                      }}
                    >
                      <CheckCircle className="w-7 h-7" style={{ color: STAGES[4].accent }} />
                    </div>
                    <h3
                      className="text-2xl font-bold tracking-tight mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${STAGES[4].accent} 0%, #E879F9 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {lang === "zh" ? "结算已封存" : "Settlement Sealed"}
                    </h3>
                    <p className="text-xs text-fg-subtle max-w-md">
                      {lang === "zh"
                        ? "付款已通过 Sepolia 测试网上的策略最终确定。交易记录已记录、验证并封存。"
                        : "Payments finalized through policies on Sepolia Testnet. Transaction records are logged, verified, and sealed."}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border-token dark:border-white/[0.06] overflow-hidden">
                    <table className="w-full text-left text-[12px]">
                      <thead className="bg-surface-2 dark:bg-white/[0.03]">
                        <tr className="border-b border-border-token dark:border-white/[0.06] text-fg-muted font-mono uppercase text-[11px]">
                          <th className="py-2.5 px-3">{lang === "zh" ? "实体" : "Entity"}</th>
                          <th className="py-2.5 px-3">{lang === "zh" ? "操作" : "Action"}</th>
                          <th className="py-2.5 px-3">Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-token dark:divide-white/[0.04]">
                        {plan.map((item) => (
                          <tr key={item.record.id}>
                            <td className="py-2.5 px-3 font-bold text-fg text-xs">{item.record.name}</td>
                            <td className="py-2.5 px-3">
                              {item.status === "Executed" ? (
                                <span className="text-success font-bold flex items-center gap-1 text-[11px]">
                                  <CheckCircle className="w-3 h-3" /> EXECUTED
                                </span>
                              ) : (
                                <span className="text-danger font-bold flex items-center gap-1 text-[11px]">
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

                  <button
                    onClick={reset}
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-accent hover:brightness-95 text-accent-fg transition-all cursor-pointer"
                  >
                    {lang === "zh" ? "处理下一周期" : "Process next cycle"}
                  </button>
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
          {STAGES.map((s, i) => (
            <div
              key={s.key}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === 0 ? "32px" : "8px",
                backgroundColor: i === 0 ? s.accent : "rgba(255,255,255,0.14)",
                boxShadow: i === 0 ? `0 0 14px ${s.accent}` : "none",
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* =============================================================================
 * PANEL COMPONENT
 * ===========================================================================*/

function Panel({
  stage,
  index,
  children,
}: {
  stage: StageDef;
  index: number;
  children: React.ReactNode;
}) {
  const isEven = index % 2 === 0;
  return (
    <div className="relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden px-6 lg:px-20"
    >
      {/* Giant ghost number */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none font-black leading-none"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "clamp(14rem, 36vw, 32rem)",
          color: stage.accent,
          opacity: 0.06,
          letterSpacing: "-0.08em",
          left: isEven ? "-6%" : "auto",
          right: isEven ? "auto" : "-6%",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {stage.no}
      </span>

      {/* Content */}
      <div className="relative w-full max-w-5xl">
        <div className="mb-4">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.2em]"
            style={{ color: stage.accent }}
          >
            Stage {stage.no} · {stage.title}
          </span>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {isEven ? (
            <>
              <div>{children}</div>
              <MockVisual stage={stage} />
            </>
          ) : (
            <>
              <MockVisual stage={stage} />
              <div>{children}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
 * MOCK VISUAL (decorative side panel)
 * ===========================================================================*/

function MockVisual({ stage }: { stage: StageDef }) {
  return (
    <div className="hidden lg:flex items-center justify-center"
    >
      <div
        className="relative w-64 h-64 rounded-2xl border flex items-center justify-center"
        style={{
          borderColor: stage.accentBorder,
          backgroundColor: stage.accentSoft,
        }}
      >
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin"
          style={{ animationDuration: "20s" }}
        >
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: stage.accent,
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateX(80px) translateY(-50%)`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Center icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `${stage.accent}20`,
            border: `2px solid ${stage.accent}40`,
          }}
        >
          <span className="text-3xl font-bold" style={{ color: stage.accent }}>
            {stage.no}
          </span>
        </div>
      </div>
    </div>
  );
}
