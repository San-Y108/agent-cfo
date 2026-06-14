"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles as SparklesIcon,
  Shield,
  FileText,
  TrendingUp,
  User,
  Zap,
  History,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { localizeActivityMessage } from "@/lib/console/activity-messages";
import { cn } from "@/lib/utils";
import { useConsoleState } from "@/lib/console/console-state";
import { agentChat } from "@/lib/api/agent";
import type { AgentChatContext, AgentChatMessage } from "@/lib/api/types";
import type { PaymentPlanItem, BudgetRules } from "@/lib/types/console";
import type { CawStatus } from "@/lib/api/types";
import {
  StatusPulse,
  Scanline,
  FrostedPanel,
  DetailDeckShell,
  PreflightRow,
} from "@/components/console/command-deck";
import { AgentCfoMascot, AgentChatAvatar } from "@/components/console/agent-cfo-mascot";
import { QuickActionButton } from "@/components/console/quick-action-button";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
import { GradientText } from "@/components/ui/aceternity/colourful-text";
import { GradientOrb } from "@/components/ui/aceternity/background";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import {
  AgentChatMarkdown,
  hasAgentMarkdown,
} from "@/components/console/agent-chat-markdown";

const LIME = "#B5FF4D";
const CYAN = "#5EEAD4";

interface ChatMessage {
  role: "agent" | "user";
  text: string;
}

function getSeedMessages(lang: "en" | "zh"): ChatMessage[] {
  if (lang === "zh") {
    return [
      {
        role: "agent",
        text: "你好！我是 AgentCFO，你的 DAO 财务智能体。",
      },
      {
        role: "user",
        text: "为本月贡献者生成付款计划。",
      },
      {
        role: "agent",
        text: "已分析 4 条记录。3 笔通过风控检查，1 笔被拦截（Bob — 不在白名单）。",
      },
    ];
  }
  return [
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
}

const chatStorageKey = (language: string) =>
  `agentcfo:agent-hub:messages:${language}`;

function readStoredMessages(language: string): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(chatStorageKey(language));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (m) =>
          m &&
          (m.role === "agent" || m.role === "user") &&
          typeof m.text === "string"
      )
    ) {
      return parsed as ChatMessage[];
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

function writeStoredMessages(
  language: string,
  messagesToStore: ChatMessage[]
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(chatStorageKey(language), JSON.stringify(messagesToStore));
  } catch {
    // ignore storage errors (e.g. quota exceeded)
  }
}

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
  const useTypewriter = isLatest && !hasAgentMarkdown(text);
  const [done, setDone] = useState(!useTypewriter);

  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-hud-lime/15 bg-hud-lime/[0.04] px-4 py-3 text-[14px] leading-relaxed text-fg shadow-[0_0_24px_-12px_var(--glow-lime)]">
      {useTypewriter && !done ? (
        <TypewriterBubble text={text} onDone={() => setDone(true)} />
      ) : (
        <AgentChatMarkdown text={text} />
      )}
    </div>
  );
}

/* =============================================================================
 * PERSONA RAIL — left column: mascot + identity + telemetry (Plan A)
 * ===========================================================================*/

function useAgentTelemetry() {
  const { lang } = useApp();
  const { budgetRule, records, plan } = useConsoleState();
  const ready = plan.filter((i) => i.status === "Ready").length;
  const blocked = plan.filter((i) => i.status === "Blocked").length;
  const executed = plan.filter((i) => i.status === "Executed");
  const spent = executed.reduce((a, c) => a + c.record.amount, 0);
  const remaining = budgetRule.monthlyBudget - spent;

  return [
    { labelKey: ["预算余额", "BUDGET LEFT"] as const, value: remaining, unit: "USDC", color: LIME },
    {
      labelKey: ["贡献记录", "RECORDS"] as const,
      value: records.length,
      unit: lang === "zh" ? "条" : "ROWS",
      color: CYAN,
    },
    {
      labelKey: ["待执行", "READY"] as const,
      value: ready,
      unit: lang === "zh" ? "笔" : "TX",
      color: "#60A5FA",
    },
    {
      labelKey: ["已拦截", "BLOCKED"] as const,
      value: blocked,
      unit: lang === "zh" ? "笔" : "TX",
      color: "#FB7185",
    },
  ];
}

function TelemetryBentoCard({
  label,
  value,
  unit,
  color,
  index,
  compact,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  index: number;
  compact?: boolean;
}) {
  return (
    <BentoCard
      glowColor={color}
      padding="sm"
      index={index}
      className={cn(
        "!border-border-token !bg-surface-2/60",
        compact ? "!p-2 text-center" : "!p-3"
      )}
    >
      {!compact && (
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-fg-muted">
          {label}
        </p>
      )}
      <div
        className={cn(
          "flex items-baseline gap-1",
          compact ? "justify-center" : "mt-1.5"
        )}
        style={{ color }}
      >
        <AnimatedNumber
          value={value}
          className={cn(
            "font-mono font-bold tabular-nums",
            compact ? "text-[10px]" : "text-base"
          )}
          springConfig={{ stiffness: 90, damping: 28 }}
        />
        {!compact && (
          <span className="font-mono text-[10px] text-fg-subtle">{unit}</span>
        )}
      </div>
    </BentoCard>
  );
}

function PersonaRail({ analyzing }: { analyzing: boolean }) {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const { openDrawer } = useConsoleState();
  const telemetry = useAgentTelemetry();

  return (
    <FrostedPanel
      glowColor="violet"
      sheen
      className="relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-border-token p-0 lg:min-h-0"
    >
      <GradientOrb
        color="violet"
        className="pointer-events-none absolute -left-20 -top-24 z-0 h-[260px] w-[260px] opacity-30 blur-[100px]"
      />

      {/* Mobile: compact horizontal strip */}
      <div className="relative z-10 flex items-center gap-3 p-4 lg:hidden">
        <div className="w-[72px] shrink-0">
          <AgentCfoMascot analyzing={analyzing} size="sm" interactive={false} embedded />
        </div>
        <div className="min-w-0 flex-1">
          <GradientText className="text-sm font-bold tracking-tight">AgentCFO</GradientText>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusPulse
              color={analyzing ? "cyan" : "lime"}
              label={analyzing ? _("忙碌", "BUSY") : _("在线", "ONLINE")}
              size="sm"
            />
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-1.5">
          {telemetry.slice(0, 2).map((item, i) => (
            <TelemetryBentoCard
              key={item.labelKey[1]}
              index={i}
              label={_(item.labelKey[0], item.labelKey[1])}
              value={item.value}
              unit={item.unit}
              color={item.color}
              compact
            />
          ))}
        </div>
      </div>

      {/* Desktop: full vertical persona rail */}
      <div className="relative z-10 hidden flex-col lg:flex lg:h-full">
        <AgentCfoMascot analyzing={analyzing} size="md" interactive className="rounded-none border-x-0 border-t-0" />

        <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-4">
          <div className="text-center">
            <h2 className="text-lg font-bold tracking-tight">
              <GradientText>AgentCFO</GradientText>
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
              {_("DAO 财务智能体", "DAO treasury agent")}
            </p>
            <div className="mt-2.5 flex justify-center">
              <StatusPulse
                color={analyzing ? "cyan" : "lime"}
                label={analyzing ? _("忙碌", "BUSY") : _("在线", "ONLINE")}
                size="sm"
              />
            </div>
          </div>

          <Scanline color="violet" className="opacity-20" />

          <div className="flex-1">
            <p className="mb-2.5 text-[12px] font-medium text-fg-muted">
              {_("预算与状态", "Budget & status")}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {telemetry.map((item, i) => (
                <TelemetryBentoCard
                  key={item.labelKey[1]}
                  index={i}
                  label={_(item.labelKey[0], item.labelKey[1])}
                  value={item.value}
                  unit={item.unit}
                  color={item.color}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDrawer("activity")}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border-token bg-surface-2/70 px-3 py-3 text-[12px] font-medium text-fg-muted transition-all hover:border-hud-lime/35 hover:bg-surface-hover hover:text-hud-lime active:scale-[0.98]"
          >
            <History size={13} />
            {_("查看执行记录", "View activity log")}
            <ArrowUpRight
              size={11}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </FrostedPanel>
  );
}

/* =============================================================================
 * CHAT PANEL — the primary work surface, quick commands integrated
 * ===========================================================================*/

function DemoPreflightPanel({ lang }: { lang: "en" | "zh" }) {
  const { plan, records, budgetRule, activityLog } = useConsoleState();
  const ready = plan.filter((i) => i.status === "Ready").length;
  const blocked = plan.filter((i) => i.status === "Blocked").length;
  const hasPlan = plan.length > 0;

  return (
    <DetailDeckShell glowColor="lime" className="mx-auto mt-2 max-w-lg">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
        {lang === "zh" ? "演示预检面板" : "Demo preflight panel"}
      </p>
      <PreflightRow
        label={lang === "zh" ? "贡献记录" : "Contribution records"}
        value={lang === "zh" ? `${records.length} 条` : `${records.length} rows`}
        status="ok"
      />
      <PreflightRow
        label={lang === "zh" ? "月预算" : "Monthly budget"}
        value={`${budgetRule.monthlyBudget} USDC`}
        status="ok"
      />
      <PreflightRow
        label={lang === "zh" ? "付款计划" : "Payment plan"}
        value={
          hasPlan
            ? lang === "zh"
              ? `${ready} 通过 / ${blocked} 拦截`
              : `${ready} ok / ${blocked} blocked`
            : lang === "zh"
              ? "待生成"
              : "Pending"
        }
        status={hasPlan ? (blocked > 0 ? "warn" : "ok") : "idle"}
      />
      {activityLog.length > 0 ? (
        <div className="mt-2 max-h-24 space-y-1 overflow-y-auto border-t border-border-token pt-2">
          {activityLog.slice(-4).map((entry) => (
            <p key={entry.id} className="font-mono text-[10px] text-fg-subtle">
              {localizeActivityMessage(entry.message, lang)}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[10px] text-fg-subtle">
          {lang === "zh"
            ? "点击「生成计划」后，此处会追加风险扫描与 CAW 执行日志。"
            : "After Generate Plan, risk scan and CAW execution logs appear here."}
        </p>
      )}
    </DetailDeckShell>
  );
}

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
      primary: true,
    },
    {
      key: lang === "zh" ? "检查风险" : "Check risk",
      label: lang === "zh" ? "检查风险" : "Check Risk",
      icon: Shield,
      color: CYAN,
      primary: false,
    },
    {
      key: lang === "zh" ? "查看审计报告" : "View audit report",
      label: lang === "zh" ? "查看审计" : "View Audit",
      icon: TrendingUp,
      color: "#C084FC",
      primary: false,
    },
  ];

  return (
    <FrostedPanel
      glowColor="lime"
      sheen
      scanline
      className="relative flex h-full min-h-0 flex-col overflow-hidden shadow-[0_0_48px_-16px_var(--glow-lime)]"
    >
      <GradientOrb
        color="lime"
        className="pointer-events-none absolute -right-16 -top-20 z-0 h-[240px] w-[240px] opacity-20 blur-[100px]"
      />

      {/* header */}
      <div className="relative z-10 flex shrink-0 items-center gap-2.5 border-b border-border-token px-5 py-4">
        <Zap size={16} className="text-hud-lime" />
        <span className="text-[14px] font-bold">
          <GradientText>
            {lang === "zh" ? "指挥对话" : "Command Conversation"}
          </GradientText>
        </span>
        <span className="ml-auto font-mono text-[11px] text-fg-muted">
          {messages.length} {lang === "zh" ? "条消息" : "messages"}
        </span>
      </div>

      {/* messages — grows to fill, keeps input at bottom */}
      <div
        ref={scrollRef}
        className="relative z-10 min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5"
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
                  "flex gap-2.5",
                  msg.role === "user" ? "flex-row-reverse items-center" : "flex-row items-start"
                )}
              >
                {msg.role === "agent" ? (
                  <AgentChatAvatar />
                ) : (
                  <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border border-border-token bg-surface-2">
                    <User size={15} className="text-fg-muted" />
                  </div>
                )}

                {msg.role === "agent" ? (
                  <AgentBubble text={msg.text} isLatest={isLatestAgent} />
                ) : (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border-token bg-surface-2 px-4 py-3 text-[14px] leading-relaxed text-fg">
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
              className="flex items-start gap-2.5"
            >
              <AgentChatAvatar analyzing />
              <div className="relative overflow-hidden rounded-2xl rounded-tl-sm border border-border-token bg-surface-2/70 px-4 py-2">
                <SparklesFX count={10} color={CYAN} className="opacity-50" />
                <div className="relative">
                  <TypingIndicator />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length <= 3 && !isThinking && (
          <div className="space-y-3 pt-2">
            <p className="text-center text-[12px] text-fg-muted">
              {lang === "zh"
                ? "试试点击下方「生成计划」开始 Demo"
                : "Try Generate Plan below to start the demo"}
            </p>
            <DemoPreflightPanel lang={lang} />
          </div>
        )}
      </div>

      {/* quick commands + input — pinned to bottom */}
      <div className="relative z-10 mt-auto shrink-0 border-t border-border-token bg-surface/90 px-5 pb-4 pt-4 backdrop-blur-md">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          {quickActions.map((a) => (
            <QuickActionButton
              key={a.label}
              label={a.label}
              icon={a.icon}
              color={a.color}
              primary={a.primary}
              disabled={isThinking}
              onClick={() => onQuickAction(a.key)}
            />
          ))}
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
              className="w-full rounded-xl border border-border-token bg-surface-2/70 px-4 py-3.5 pr-11 text-[14px] text-fg placeholder:text-fg-subtle transition-all focus:border-lime-500/45 focus:outline-none focus:ring-2 focus:ring-lime-500/20 disabled:opacity-50"
            />
            <SparklesIcon
              size={15}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
          </div>
          <motion.button
            type="button"
            onClick={onSend}
            disabled={!inputValue.trim() || isThinking}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-all",
              inputValue.trim() && !isThinking
                ? "border-lime-400/50 bg-lime-400/20 shadow-[0_0_16px_-4px_rgba(181,255,77,0.45)]"
                : "border-border-token bg-surface-2/60"
            )}
          >
            <Send
              size={17}
              style={{
                color: inputValue.trim() ? LIME : "var(--fg-subtle)",
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

function toApiMessages(messages: ChatMessage[]): AgentChatMessage[] {
  return messages.map((message) => ({
    role: message.role === "agent" ? "assistant" : "user",
    content: message.text,
  }));
}

function buildPlanSummary(
  plan: PaymentPlanItem[],
  lang: "en" | "zh"
): string | undefined {
  if (plan.length === 0) return undefined;
  const ready = plan.filter((item) => item.status === "Ready").length;
  const blocked = plan.filter((item) => item.status === "Blocked").length;
  const executed = plan.filter((item) => item.status === "Executed").length;
  if (lang === "zh") {
    return `${plan.length} 笔：${ready} 就绪，${blocked} 拦截，${executed} 已执行`;
  }
  return `${plan.length} items: ${ready} ready, ${blocked} blocked, ${executed} executed`;
}

function buildAgentChatContext(
  budgetRule: BudgetRules,
  recordsCount: number,
  plan: PaymentPlanItem[],
  flowStep: number,
  lang: "en" | "zh"
): AgentChatContext {
  return {
    monthlyBudget: budgetRule.monthlyBudget,
    singlePaymentLimit: budgetRule.singlePaymentLimit,
    allowedToken: budgetRule.allowedToken,
    whitelist: budgetRule.whitelist,
    recordCount: recordsCount,
    planItemCount: plan.length,
    planSummary: buildPlanSummary(plan, lang),
    flowStep,
  };
}

/**
 * AgentHub — Plan A: left persona rail + right conversation (primary).
 */
export function AgentHub() {
  const { lang } = useApp();
  const {
    budgetRule,
    records,
    plan,
    step,
    cawStatuses,
    generatePlan,
    executePlan,
  } = useConsoleState();
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getSeedMessages(lang)
  );
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  useEffect(() => {
    const stored = readStoredMessages(lang);
    if (stored) {
      setMessages(stored);
    }
    setChatLoaded(true);
  }, [lang]);

  useEffect(() => {
    if (chatLoaded) {
      writeStoredMessages(lang, messages);
    }
  }, [messages, lang, chatLoaded]);

  const pushAgentMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "agent", text }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue.trim();
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: userText },
    ];
    setMessages(nextMessages);
    setInputValue("");
    setIsThinking(true);

    try {
      const response = await agentChat({
        messages: toApiMessages(nextMessages),
        lang,
        context: buildAgentChatContext(budgetRule, records.length, plan, step, lang),
      });
      pushAgentMessage(response.message.content);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown agent chat error";
      const isNotConfigured = message.includes("503");
      const isMissingRoute = message.includes("404");
      pushAgentMessage(
        lang === "zh"
          ? isMissingRoute
            ? "后端接口未更新，请重启 uvicorn（需包含 /api/agent/chat）。"
            : isNotConfigured
              ? "Agent 未配置，请在后端设置 MINIMAX_API_KEY 后重启。"
              : `Agent 请求失败：${message}`
          : isMissingRoute
            ? "Backend route missing. Restart uvicorn with the latest /api/agent/chat code."
            : isNotConfigured
              ? "Agent chat is not configured. Set MINIMAX_API_KEY on the backend and restart."
              : `Agent request failed: ${message}`
      );
    } finally {
      setIsThinking(false);
    }
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
    <div className="flex h-[calc(100dvh-7.5rem)] w-full max-w-none flex-col gap-3 overflow-hidden px-3 py-3 md:h-[calc(100dvh-4rem)] md:gap-4 md:px-5 md:py-4 lg:grid lg:grid-cols-[minmax(260px,288px)_1fr] lg:grid-rows-1 lg:items-stretch">
      <PersonaRail analyzing={isThinking} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
  );
}
