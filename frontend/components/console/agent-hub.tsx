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
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { HolographicButton } from "@/components/ui/holographic-button";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
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

function SparkleParticle({
  delay,
  x,
  size,
  duration,
}: {
  delay: number;
  x: string;
  size: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: x,
        width: size,
        height: size,
        background:
          "radial-gradient(circle, rgba(181,255,77,0.9) 0%, rgba(94,234,212,0.4) 50%, transparent 70%)",
        boxShadow: `0 0 ${size * 2}px rgba(181,255,77,0.3)`,
      }}
      initial={{ opacity: 0, y: 40, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [40, -20, -60, -100],
        scale: [0, 1, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
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
  const [done, setDone] = useState(!isLatest);

  return (
    <BentoCard
      glowColor={LIME}
      className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.03] text-[13px] leading-relaxed text-fg"
    >
      {isLatest && !done ? (
        <TypewriterBubble text={text} onDone={() => setDone(true)} />
      ) : (
        <SemanticText text={text} />
      )}
    </BentoCard>
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
              ? "text-[#B5FF4D] font-semibold"
              : part.type === "risk"
              ? "text-[#FB7185] font-semibold"
              : undefined
          )}
        >
          {part.text}
        </span>
      ))}
    </>
  );
}

function AgentPersona({ agentStatus }: { agentStatus: "ready" | "analyzing" }) {
  const { lang } = useApp();
  const statusText =
    agentStatus === "ready"
      ? lang === "zh"
        ? "就绪"
        : "Ready"
      : lang === "zh"
      ? "分析中..."
      : "Analyzing...";

  return (
    <FrostedPanel
      glowColor="lime"
      scanline
      sheen
      className="relative h-full min-h-[480px] p-6 flex flex-col items-center justify-center"
    >
      <CornerGlow color="lime" className="-top-24 -right-24" intensity={0.22} />
      <CornerGlow color="cyan" className="-bottom-32 -left-32" intensity={0.12} />

      <div className="absolute top-6 left-6 right-6 z-10 flex items-start justify-between">
        <div>
          <HudLabel prefix="AGENT::" value="AgentCFO" color="lime" size="md" />
          <h2 className="mt-1 text-lg font-semibold text-fg">
            {lang === "zh" ? "感知型 CFO 人格" : "Sentient CFO Persona"}
          </h2>
        </div>
        <StatusPulse
          color={agentStatus === "analyzing" ? "cyan" : "lime"}
          label={agentStatus === "analyzing" ? "ANALYZING" : "ONLINE"}
          size="sm"
        />
      </div>

      <Scanline color="lime" className="absolute top-[76px] left-6 right-6 z-10" />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, rgba(181,255,77,0.12) 0%, rgba(94,234,212,0.06) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <motion.div
          className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[220px] h-[70px] rounded-[100%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(94,234,212,0.12) 0%, transparent 70%)",
            border: "1px solid rgba(94,234,212,0.12)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={
            agentStatus === "analyzing"
              ? { scale: [1, 1.02, 1], rotate: [0, 1, -1, 0] }
              : { scale: [1, 1.03, 1] }
          }
          transition={{
            duration: agentStatus === "analyzing" ? 1.2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              background:
                "radial-gradient(circle, rgba(181,255,77,0.12) 0%, transparent 70%)",
              backdropFilter: "blur(8px)",
            }}
            animate={{
              opacity: agentStatus === "analyzing" ? [0.5, 1, 0.5] : [0.4, 0.8, 0.4],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: agentStatus === "analyzing" ? 1.2 : 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute rounded-full"
            style={{
              width: 176,
              height: 176,
              border: "1px solid rgba(94,234,212,0.25)",
              boxShadow: "0 0 30px rgba(94,234,212,0.15), inset 0 0 20px rgba(94,234,212,0.08)",
              backdropFilter: "blur(4px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="relative flex items-center justify-center w-40 h-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.14), rgba(181,255,77,0.08) 45%, rgba(94,234,212,0.04) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow:
                "inset 0 0 40px rgba(255,255,255,0.08), 0 0 80px rgba(181,255,77,0.14), 0 0 40px rgba(94,234,212,0.08)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(94,234,212,0.1) 100%)",
              }}
            />
            <Bot
              size={56}
              style={{
                color: agentStatus === "analyzing" ? CYAN : LIME,
                filter: `drop-shadow(0 0 18px ${agentStatus === "analyzing" ? "rgba(94,234,212,0.5)" : "rgba(181,255,77,0.4)"})`,
              }}
              strokeWidth={1.2}
            />
          </motion.div>

          <SparkleParticle delay={0} x="20%" size={4} duration={3} />
          <SparkleParticle delay={0.8} x="75%" size={3} duration={3.5} />
          <SparkleParticle delay={1.5} x="50%" size={5} duration={4} />
          <SparkleParticle delay={2.2} x="30%" size={2.5} duration={2.8} />
          <SparkleParticle delay={0.4} x="80%" size={3.5} duration={3.2} />
        </motion.div>

        <motion.h2
          className="relative z-10 mt-10 text-xl font-bold tracking-tight text-fg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          AgentCFO
        </motion.h2>

        <motion.div
          className="relative z-10 flex items-center gap-2 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span
            className="w-2 h-2 rounded-full animate-status-pulse"
            style={{
              backgroundColor: agentStatus === "ready" ? LIME : CYAN,
              color: agentStatus === "ready" ? LIME : CYAN,
            }}
          />
          <span className="text-xs text-fg-subtle font-mono">{statusText}</span>
        </motion.div>

        <motion.p
          className="relative z-10 mt-3 text-[11px] text-fg-subtle text-center max-w-[220px] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {lang === "zh"
            ? "DAO 财务智能助手 · CAW 安全边界内执行"
            : "DAO Treasury AI · Executes within CAW guardrails"}
        </motion.p>
      </div>
    </FrostedPanel>
  );
}

function ChatSatellite({
  messages,
  isThinking,
  inputValue,
  setInputValue,
  onSend,
  onKeyDown,
}: {
  messages: ChatMessage[];
  isThinking: boolean;
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const { lang } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <FrostedPanel glowColor="lime" sheen className="h-full flex flex-col">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.06]">
        <Zap size={15} style={{ color: LIME }} />
        <span className="text-xs font-bold text-fg">
          {lang === "zh" ? "对话" : "Conversation"}
        </span>
        <span className="text-[10px] font-mono text-fg-subtle ml-auto">
          {messages.length} {lang === "zh" ? "条消息" : "messages"}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0"
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
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    msg.role === "agent"
                      ? "bg-lime-500/10 border border-lime-500/20"
                      : "bg-white/[0.06] border border-white/[0.08]"
                  )}
                >
                  {msg.role === "agent" ? (
                    <Bot size={14} style={{ color: LIME }} />
                  ) : (
                    <User size={14} className="text-fg-subtle" />
                  )}
                </div>

                {msg.role === "agent" ? (
                  <AgentBubble text={msg.text} isLatest={isLatestAgent} />
                ) : (
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-white/[0.08] text-[13px] leading-relaxed text-fg">
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-lime-500/10 border border-lime-500/20">
                <Bot size={14} style={{ color: LIME }} />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.03] px-4 py-2">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
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
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-11 text-[13px] text-fg placeholder:text-fg-subtle/50 focus:outline-none focus:border-lime-500/30 focus:ring-1 focus:ring-lime-500/10 transition-all disabled:opacity-50"
            />
            <Sparkles
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-subtle/30"
            />
          </div>
          <motion.button
            onClick={onSend}
            disabled={!inputValue.trim() || isThinking}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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

function QuickActionsStrip({
  isThinking,
  onAction,
}: {
  isThinking: boolean;
  onAction: (action: string) => void;
}) {
  const { lang } = useApp();

  const actions = [
    {
      key: lang === "zh" ? "生成付款计划" : "Generate payment plan",
      label: lang === "zh" ? "生成计划" : "Generate Plan",
      icon: <FileText className="w-4 h-4" />,
      variant: "lime" as const,
    },
    {
      key: lang === "zh" ? "检查风险" : "Check risk",
      label: lang === "zh" ? "检查风险" : "Check Risk",
      icon: <Shield className="w-4 h-4" />,
      variant: "cyan" as const,
    },
    {
      key: lang === "zh" ? "查看审计报告" : "View audit report",
      label: lang === "zh" ? "查看审计" : "View Audit",
      icon: <TrendingUp className="w-4 h-4" />,
      variant: "violet" as const,
    },
  ];

  return (
    <FrostedPanel glowColor="lime" sheen className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-hud-lime" />
          <span className="text-sm font-semibold text-fg">
            {lang === "zh" ? "快速指令" : "Quick Commands"}
          </span>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-3 flex-1">
          {actions.map((a) => (
            <HolographicButton
              key={a.label}
              icon={a.icon}
              variant={a.variant}
              size="sm"
              tilt3d
              disabled={isThinking}
              onClick={() => onAction(a.key)}
            >
              {a.label}
            </HolographicButton>
          ))}
        </div>
      </div>
    </FrostedPanel>
  );
}

/**
 * AgentHub — the central Agent CFO interface for the Command Center.
 *
 * Replaces the old `/console/agent` page as the default Console home.
 * Contains the Agent persona, chat, and quick actions.
 */
export function AgentHub() {
  const { lang } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"ready" | "analyzing">("ready");

  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInputValue("");
    setIsThinking(true);
    setAgentStatus("analyzing");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text:
            lang === "zh"
              ? `已收到您的请求："${userText}"。正在分析资金拓扑和风险边界...`
              : `Received: "${userText}". Analyzing treasury topology and risk boundaries...`,
        },
      ]);
      setIsThinking(false);
      setAgentStatus("ready");
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    if (isThinking) return;
    setMessages((prev) => [...prev, { role: "user", text: action }]);
    setIsThinking(true);
    setAgentStatus("analyzing");

    const responses: Record<string, { en: string; zh: string }> = {
      plan: {
        en: "Payment plan generated: Alice 20 USDC, Charlie 10 USDC, Data API 5 USDC. Bob blocked (not whitelisted). Total: 35 USDC.",
        zh: "付款计划已生成：Alice 20 USDC，Charlie 10 USDC，Data API 5 USDC。Bob 被拦截（不在白名单）。总计：35 USDC。",
      },
      risk: {
        en: "Risk scan complete: 3 Low-risk, 1 Blocked. Budget remaining: 15/50 USDC. No duplicate payments detected.",
        zh: "风险扫描完成：3 项低风险，1 项被拦截。预算剩余：15/50 USDC。未检测到重复付款。",
      },
      audit: {
        en: "Audit trail: 2 executed txns (0x7a3...f21, 0x9b2...c44). CAW Agent Vault signed. Settlement report ready.",
        zh: "审计追踪：2 笔已执行交易（0x7a3...f21，0x9b2...c44）。CAW Agent Vault 已签名。结算报告就绪。",
      },
    };

    const key =
      action.includes("Plan") || action.includes("计划")
        ? "plan"
        : action.includes("Risk") || action.includes("风险")
        ? "risk"
        : "audit";

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: lang === "zh" ? responses[key].zh : responses[key].en,
        },
      ]);
      setIsThinking(false);
      setAgentStatus("ready");
    }, 1800);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6">
      <div className="flex-1 min-h-0 @container">
        <div className="h-full grid grid-cols-1 @[900px]:grid-cols-[1fr_320px] gap-4">
          <div className="min-h-[400px]">
            <AgentPersona agentStatus={agentStatus} />
          </div>
          <div className="min-h-[320px]">
            <ChatSatellite
              messages={messages}
              isThinking={isThinking}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={handleSend}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
      <QuickActionsStrip isThinking={isThinking} onAction={handleQuickAction} />
    </div>
  );
}
