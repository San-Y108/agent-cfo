"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  FileText,
  TrendingUp,
  User,
  Zap,
  History,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { useConsoleState } from "@/lib/console/console-state";
import type { PaymentPlanItem, BudgetRules } from "@/lib/types/console";
import type { CawStatus } from "@/lib/api/types";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
} from "@/components/console/command-deck";

const LIME = "#B5FF4D";
const CYAN = "#5EEAD4";

interface ChatMessage {
  role: "agent" | "user";
  text: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    role: "agent",
    text: "Hello! I'm AgentCFO, your DAO treasury assistant.",
  },
  {
    role: "user",
    text: "Generate a payment plan for this month's contributors.",
  },
  {
    role: "agent",
    text:
      "I've analyzed 4 records. 3 passed risk checks, 1 blocked (Bob - not whitelisted).",
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-fg-subtle"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.5,
            delay: i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function TypewriterBubble({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const timer = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, 22);
    return () => clearInterval(timer);
  }, [text, onDone]);

  return <span>{displayed}</span>;
}

function AgentBubble({ text, isLatest }: { text: string; isLatest: boolean }) {
  const [done, setDone] = useState(!isLatest);

  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-hud-lime/15 bg-hud-lime/[0.04] px-4 py-3 text-[13.5px] leading-relaxed text-fg shadow-[0_0_24px_-12px_var(--glow-lime)]">
      {isLatest && !done ? (
        <TypewriterBubble text={text} onDone={() => setDone(true)} />
      ) : (
        <SemanticText text={text} />
      )}
    </div>
  );
}

function SemanticText({ text }: { text: string }) {
  const tokens = React.useMemo(() => {
    const parts: { text: string; type: "amount" | "risk" | "normal" }[] = [];
    const amountRegex = /(\$?\d+(?:\.\d+)?(?:\s*\/\s*\$?\d+(?:\.\d+)?)?\s*(?:USDC|USD|ETH|gwei|txns?))/gi;
    const riskRegex = /\b(blocked|risk|拦截|风险|警告|warning|danger|failed|失败)\b/gi;

    const pushSegment = (seg: string) => {
      if (!seg) return;
      let riskLast = 0;
      let riskMatch;
      while ((riskMatch = riskRegex.exec(seg)) !== null) {
        if (riskMatch.index > riskLast) {
          parts.push({ text: seg.slice(riskLast, riskMatch.index), type: "normal" });
        }
        parts.push({ text: riskMatch[0], type: "risk" });
        riskLast = riskMatch.index + riskMatch[0].length;
      }
      if (riskLast < seg.length) {
        parts.push({ text: seg.slice(riskLast), type: "normal" });
      }
      riskRegex.lastIndex = 0;
    };

    let lastIndex = 0;
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        pushSegment(text.slice(lastIndex, match.index));
      }
      parts.push({ text: match[0], type: "amount" });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      pushSegment(text.slice(lastIndex));
    }
    return parts;
  }, [text]);

  return (
    <>
      {tokens.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.type === "amount"
              ? "text-hud-lime font-semibold"
              : part.type === "risk"
              ? "text-hud-coral font-semibold"
              : undefined
          )}
        >
          {part.text}
        </span>
      ))}
    </>
  );
}

/* =============================================================================
 * AGENT ORB — compact breathing avatar (sidebar scale)
 * ===========================================================================*/

function AgentOrb({
  size = 120,
  analyzing,
}: {
  size?: number;
  analyzing: boolean;
}) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={analyzing ? { scale: [1, 1.03, 1] } : { scale: [1, 1.02, 1] }}
      transition={{
        duration: analyzing ? 1.2 : 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* halo (kept tight so it never washes out nearby text) */}
      <div
        className="absolute inset-[-30%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(181,255,77,0.16) 0%, rgba(94,234,212,0.06) 45%, transparent 68%)",
          filter: "blur(18px)",
        }}
      />
      {/* rotating orbit ring */}
      <motion.div
        className="absolute inset-1 rounded-full"
        style={{
          border: "1px solid rgba(94,234,212,0.3)",
          boxShadow:
            "0 0 18px rgba(94,234,212,0.16), inset 0 0 14px rgba(94,234,212,0.08)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <span
          className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: CYAN, boxShadow: `0 0 8px ${CYAN}` }}
        />
      </motion.div>
      {/* glass core */}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size * 0.78,
          height: size * 0.78,
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.16), rgba(181,255,77,0.08) 45%, rgba(94,234,212,0.05) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow:
            "inset 0 0 28px rgba(255,255,255,0.08), 0 0 44px rgba(181,255,77,0.16)",
        }}
      >
        <Bot
          size={size * 0.34}
          style={{
            color: analyzing ? CYAN : LIME,
            filter: `drop-shadow(0 0 12px ${analyzing ? "rgba(94,234,212,0.5)" : "rgba(181,255,77,0.45)"})`,
          }}
          strokeWidth={1.4}
        />
      </div>
    </motion.div>
  );
}

/* =============================================================================
 * AGENT SIDEBAR — compact persona + live telemetry + recent activity
 * ===========================================================================*/

function AgentSidebar({ analyzing }: { analyzing: boolean }) {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const { budgetRule, records, plan, activityLog, openDrawer } = useConsoleState();

  const ready = plan.filter((i) => i.status === "Ready").length;
  const blocked = plan.filter((i) => i.status === "Blocked").length;
  const executed = plan.filter((i) => i.status === "Executed");
  const spent = executed.reduce((a, c) => a + c.record.amount, 0);
  const remaining = budgetRule.monthlyBudget - spent;

  const telemetry = [
    { label: _("预算余额", "BUDGET LEFT"), value: `${remaining}`, unit: "USDC", color: LIME },
    { label: _("贡献记录", "RECORDS"), value: `${records.length}`, unit: "ROWS", color: CYAN },
    { label: _("待执行", "READY"), value: `${ready}`, unit: "TX", color: "#60A5FA" },
    { label: _("已拦截", "BLOCKED"), value: `${blocked}`, unit: "TX", color: "#FB7185" },
  ];

  const recent = activityLog.slice(0, 3);

  return (
    <FrostedPanel
      glowColor="lime"
      sheen
      className="flex h-full flex-col p-5"
    >
      <CornerGlow color="lime" className="-top-20 -right-20" intensity={0.14} />

      {/* identity */}
      <div className="relative z-10 flex items-start justify-between">
        <HudLabel prefix="AGENT::" value="AgentCFO" color="lime" size="sm" />
        <StatusPulse
          color={analyzing ? "cyan" : "lime"}
          label={analyzing ? "BUSY" : "ONLINE"}
          size="sm"
        />
      </div>

      <div className="relative z-10 mt-5 flex flex-col items-center">
        <AgentOrb size={116} analyzing={analyzing} />
        <h2 className="mt-4 text-lg font-bold tracking-tight text-fg">AgentCFO</h2>
        <p className="mt-1 text-center text-[11px] leading-relaxed text-fg-muted">
          {_("DAO 财务智能体 · CAW 边界内执行", "DAO treasury agent, executing within CAW guardrails")}
        </p>
      </div>

      <Scanline color="lime" className="relative z-10 my-5 opacity-40" />

      {/* telemetry */}
      <div className="relative z-10">
        <div className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
          {_("实时遥测", "Telemetry")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {telemetry.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-fg-subtle">
                {item.label}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="font-mono text-base font-bold tabular-nums"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
                <span className="font-mono text-[8.5px] text-fg-subtle">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* recent activity */}
      <div className="relative z-10 mt-5 flex min-h-0 flex-1 flex-col">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
            {_("最近执行", "Recent runs")}
          </span>
          <button
            onClick={() => openDrawer("activity")}
            className="group flex items-center gap-1 text-[10px] text-fg-subtle transition-colors hover:text-hud-lime"
          >
            <History size={10} />
            {_("全部", "View all")}
            <ArrowUpRight size={9} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
        <div className="space-y-1.5 overflow-y-auto">
          {recent.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
            >
              <p className="truncate text-[11px] text-fg-muted">{entry.message}</p>
              <p className="mt-0.5 font-mono text-[9px] text-fg-subtle">
                {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </FrostedPanel>
  );
}

/* =============================================================================
 * MOBILE PERSONA STRIP — compact identity bar for < lg viewports
 * ===========================================================================*/

function MobilePersonaStrip({ analyzing }: { analyzing: boolean }) {
  const { lang } = useApp();
  return (
    <FrostedPanel glowColor="lime" sheen className="flex items-center gap-3 px-4 py-3">
      <AgentOrb size={44} analyzing={analyzing} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-fg">AgentCFO</div>
        <div className="truncate text-[10px] text-fg-muted">
          {lang === "zh" ? "DAO 财务智能体" : "DAO treasury agent"}
        </div>
      </div>
      <StatusPulse color={analyzing ? "cyan" : "lime"} label={analyzing ? "BUSY" : "ONLINE"} size="sm" />
    </FrostedPanel>
  );
}

/* =============================================================================
 * CHAT PANEL — the primary work surface, quick commands integrated
 * ===========================================================================*/

function ChatPanel({
  messages,
  isThinking,
  inputValue,
  setInputValue,
  onSend,
  onKeyDown,
  onQuickAction,
}: {
  messages: ChatMessage[];
  isThinking: boolean;
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onQuickAction: (action: string) => void;
}) {
  const { lang } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const quickActions = [
    {
      key: lang === "zh" ? "生成付款计划" : "Generate payment plan",
      label: lang === "zh" ? "生成计划" : "Generate Plan",
      icon: FileText,
      color: LIME,
    },
    {
      key: lang === "zh" ? "检查风险" : "Check risk",
      label: lang === "zh" ? "检查风险" : "Check Risk",
      icon: Shield,
      color: CYAN,
    },
    {
      key: lang === "zh" ? "查看审计报告" : "View audit report",
      label: lang === "zh" ? "查看审计" : "View Audit",
      icon: TrendingUp,
      color: "#C084FC",
    },
  ];

  return (
    <FrostedPanel glowColor="lime" sheen scanline className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
        <Zap size={15} style={{ color: LIME }} />
        <span className="text-[13px] font-bold text-fg">
          {lang === "zh" ? "指挥对话" : "Command Conversation"}
        </span>
        <span className="ml-auto font-mono text-[10px] text-fg-subtle">
          {messages.length} {lang === "zh" ? "条消息" : "messages"}
        </span>
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isLatestAgent =
              msg.role === "agent" &&
              idx === messages.length - 1 &&
              !isThinking;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: idx < 3 ? idx * 0.15 : 0,
                  ease: "easeOut",
                }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                    msg.role === "agent"
                      ? "border border-lime-500/20 bg-lime-500/10"
                      : "border border-white/[0.08] bg-white/[0.06]"
                  )}
                >
                  {msg.role === "agent" ? (
                    <Bot size={14} style={{ color: LIME }} />
                  ) : (
                    <User size={14} className="text-fg-muted" />
                  )}
                </div>

                {msg.role === "agent" ? (
                  <AgentBubble text={msg.text} isLatest={isLatestAgent} />
                ) : (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-white/[0.06] bg-white/[0.07] px-4 py-3 text-[13.5px] leading-relaxed text-fg">
                    {msg.text}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-lime-500/20 bg-lime-500/10">
                <Bot size={14} style={{ color: LIME }} />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.03] px-4 py-2">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* quick commands + input */}
      <div className="border-t border-white/[0.06] px-5 pb-4 pt-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="mr-0.5 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle sm:block">
            {lang === "zh" ? "快速指令" : "Quick"}
          </span>
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <motion.button
                key={a.label}
                onClick={() => onQuickAction(a.key)}
                disabled={isThinking}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: `${a.color}2E`,
                  backgroundColor: `${a.color}0D`,
                  color: a.color,
                }}
              >
                <Icon size={12} />
                {a.label}
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                lang === "zh"
                  ? "输入指令或问题..."
                  : "Type a command or question..."
              }
              disabled={isThinking}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-11 text-[13px] text-fg placeholder:text-fg-subtle/60 transition-all focus:border-lime-500/30 focus:outline-none focus:ring-1 focus:ring-lime-500/10 disabled:opacity-50"
            />
            <Sparkles
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-subtle/40"
            />
          </div>
          <motion.button
            onClick={onSend}
            disabled={!inputValue.trim() || isThinking}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              backgroundColor: inputValue.trim()
                ? `${LIME}15`
                : "rgba(255,255,255,0.03)",
              border: inputValue.trim()
                ? `1px solid ${LIME}30`
                : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Send
              size={16}
              style={{
                color: inputValue.trim() ? LIME : "rgba(255,255,255,0.3)",
              }}
            />
          </motion.button>
        </div>
      </div>
    </FrostedPanel>
  );
}

/**
 * Summaries driven by the global console state so chat responses stay
 * consistent with Treasury / Policy changes.
 */
function formatPlanSummary(plan: PaymentPlanItem[], lang: string): string {
  const ready = plan.filter((i) => i.status === "Ready");
  const blocked = plan.filter((i) => i.status === "Blocked");
  const totalReady = ready.reduce((a, c) => a + c.record.amount, 0);
  const totalBlocked = blocked.reduce((a, c) => a + c.record.amount, 0);
  if (lang === "zh") {
    return `付款计划已生成：${ready.length} 笔通过（${totalReady} USDC），${blocked.length} 笔被拦截（${totalBlocked} USDC）。${blocked.length > 0 ? `原因：${blocked[0].riskReason}。` : ""}总计：${totalReady + totalBlocked} USDC。`;
  }
  return `Payment plan generated: ${ready.length} passed (${totalReady} USDC), ${blocked.length} blocked (${totalBlocked} USDC).${blocked.length > 0 ? ` Reason: ${blocked[0].riskReason}.` : ""} Total: ${totalReady + totalBlocked} USDC.`;
}

function formatRiskSummary(
  plan: PaymentPlanItem[],
  budgetRule: BudgetRules,
  lang: string
): string {
  const ready = plan.filter((i) => i.status === "Ready");
  const blocked = plan.filter((i) => i.status === "Blocked");
  const executed = plan.filter((i) => i.status === "Executed");
  const totalExecuted = executed.reduce((a, c) => a + c.record.amount, 0);
  const remaining = budgetRule.monthlyBudget - totalExecuted;
  if (lang === "zh") {
    return `风险扫描完成：${ready.length} 项就绪，${blocked.length} 项被拦截。月度预算剩余 ${remaining}/${budgetRule.monthlyBudget} USDC，单笔限额 ${budgetRule.singlePaymentLimit} USDC。`;
  }
  return `Risk scan complete: ${ready.length} ready, ${blocked.length} blocked. Monthly budget remaining: ${remaining}/${budgetRule.monthlyBudget} USDC. Single payment limit: ${budgetRule.singlePaymentLimit} USDC.`;
}

function formatAuditSummary(
  plan: PaymentPlanItem[],
  cawStatuses: CawStatus[],
  lang: string
): string {
  const executed = plan.filter((i) => i.status === "Executed");
  const blocked = plan.filter((i) => i.status === "Blocked");
  const hashes = executed
    .map((i) => i.txHash)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
  if (lang === "zh") {
    return `审计追踪：${executed.length} 笔已执行，${blocked.length} 笔被拦截。CAW Agent Vault 已签名${hashes ? `（${hashes}）` : ""}。结算报告就绪。`;
  }
  return `Audit trail: ${executed.length} executed, ${blocked.length} blocked. CAW Agent Vault signed${hashes ? ` (${hashes})` : ""}. Settlement report ready.`;
}

/**
 * AgentHub — Console home. Chat-first layout: compact persona sidebar on the
 * left, the conversation as the primary surface, quick commands integrated
 * above the input.
 */
export function AgentHub() {
  const { lang } = useApp();
  const {
    budgetRule,
    plan,
    cawStatuses,
    generatePlan,
    executePlan,
  } = useConsoleState();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const pushAgentMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "agent", text }]);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInputValue("");
    setIsThinking(true);

    setTimeout(() => {
      pushAgentMessage(
        lang === "zh"
          ? `已收到您的请求："${userText}"。正在分析资金拓扑和风险边界...`
          : `Received: "${userText}". Analyzing treasury topology and risk boundaries...`
      );
      setIsThinking(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (isThinking) return;
    setMessages((prev) => [...prev, { role: "user", text: action }]);
    setIsThinking(true);

    try {
      const isPlan = action.includes("Plan") || action.includes("计划");
      const isRisk = action.includes("Risk") || action.includes("风险");
      const isAudit = action.includes("Audit") || action.includes("审计");

      if (isPlan) {
        const p = await generatePlan();
        pushAgentMessage(formatPlanSummary(p, lang));
      } else if (isRisk) {
        const currentPlan = plan.length > 0 ? plan : await generatePlan();
        pushAgentMessage(formatRiskSummary(currentPlan, budgetRule, lang));
      } else if (isAudit) {
        let currentPlan = plan;
        if (currentPlan.length === 0) {
          currentPlan = await generatePlan();
        }
        const hasExecuted = currentPlan.some((i) => i.status === "Executed");
        if (!hasExecuted) {
          currentPlan = await executePlan();
        }
        pushAgentMessage(formatAuditSummary(currentPlan, cawStatuses, lang));
      }
    } catch {
      pushAgentMessage(
        lang === "zh"
          ? "操作失败，请重试。"
          : "Action failed. Please try again."
      );
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] w-full max-w-6xl flex-col gap-4 px-4 py-4 md:h-[calc(100dvh-4rem)] md:px-6 md:py-6">
      {/* mobile compact persona */}
      <div className="lg:hidden">
        <MobilePersonaStrip analyzing={isThinking} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden min-h-0 lg:block">
          <AgentSidebar analyzing={isThinking} />
        </div>
        <div className="min-h-0">
          <ChatPanel
            messages={messages}
            isThinking={isThinking}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            onQuickAction={handleQuickAction}
          />
        </div>
      </div>
    </div>
  );
}
