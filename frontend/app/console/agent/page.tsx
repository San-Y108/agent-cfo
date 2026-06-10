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

/* =============================================================================
 * AGENT CHAT PAGE — DAO AI CFO conversational interface
 * Left: 3D agent character with sparkles + status
 * Right: Chat history + input
 * Bottom: Quick action buttons
 * ===========================================================================*/

const LIME = "#B5FF4D";
const CYAN = "#5EEAD4";
const CORAL = "#FB7185";
const VIOLET = "#C084FC";
const BLUE = "#60A5FA";

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

/* ── Sparkle particle component ── */
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

/* ── Typing indicator ── */
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

/* ── Holographic quick-action button ── */
function HolographicButton({
  icon: Icon,
  label,
  onClick,
  color = LIME,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex items-center gap-2.5 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm font-semibold text-fg transition-all duration-300 overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.boxShadow = `0 0 24px ${color}15, inset 0 1px 1px ${color}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Icon
        size={16}
        style={{ color }}
        className="transition-transform duration-300 group-hover:scale-110"
      />
      <span>{label}</span>
    </motion.button>
  );
}

/* ── Main page ── */
export default function AgentPage() {
  const { t, lang } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"ready" | "analyzing">("ready");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInputValue("");
    setIsThinking(true);
    setAgentStatus("analyzing");

    // Simulate agent response
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

  const statusText =
    agentStatus === "ready"
      ? lang === "zh"
        ? "就绪"
        : "Ready"
      : lang === "zh"
      ? "分析中..."
      : "Analyzing...";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 gap-6">
      {/* Main content: left agent + right chat */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* ── Left Panel: Agent Character ── */}
        <div className="w-[40%] flex flex-col items-center justify-center relative min-h-0">
          {/* GradientOrb background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(181,255,77,0.08) 0%, rgba(94,234,212,0.05) 35%, transparent 65%)",
            }}
          />

          {/* Large blurred ambient orbs */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(181,255,77,0.12) 0%, rgba(94,234,212,0.06) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Agent circle with breathing animation */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 200,
                height: 200,
                background:
                  "radial-gradient(circle, rgba(181,255,77,0.15) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main gradient circle */}
            <div
              className="relative flex items-center justify-center w-40 h-40 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, rgba(181,255,77,0.25), rgba(94,234,212,0.12) 50%, rgba(94,234,212,0.05) 100%)",
                border: "1px solid rgba(181,255,77,0.2)",
                boxShadow:
                  "0 0 60px rgba(181,255,77,0.15), inset 0 0 40px rgba(94,234,212,0.08)",
              }}
            >
              <Bot
                size={56}
                style={{
                  color: LIME,
                  filter: "drop-shadow(0 0 12px rgba(181,255,77,0.4))",
                }}
                strokeWidth={1.2}
              />
            </div>

            {/* Sparkle particles */}
            <SparkleParticle delay={0} x="20%" size={4} duration={3} />
            <SparkleParticle delay={0.8} x="75%" size={3} duration={3.5} />
            <SparkleParticle delay={1.5} x="50%" size={5} duration={4} />
            <SparkleParticle delay={2.2} x="30%" size={2.5} duration={2.8} />
            <SparkleParticle delay={0.4} x="80%" size={3.5} duration={3.2} />
          </motion.div>

          {/* Agent name */}
          <motion.h2
            className="relative z-10 mt-8 text-xl font-bold tracking-tight text-fg"
            style={{ fontFamily: "Inter, sans-serif" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            AgentCFO
          </motion.h2>

          {/* Status */}
          <motion.div
            className="relative z-10 flex items-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  agentStatus === "ready" ? LIME : CYAN,
                boxShadow:
                  agentStatus === "ready"
                    ? "0 0 8px rgba(181,255,77,0.6)"
                    : "0 0 8px rgba(94,234,212,0.6)",
              }}
            />
            <span className="text-xs text-fg-subtle font-mono">
              {statusText}
            </span>
          </motion.div>

          {/* Decorative subtitle */}
          <motion.p
            className="relative z-10 mt-3 text-[11px] text-fg-subtle text-center max-w-[200px] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {lang === "zh"
              ? "DAO 财务智能助手 · CAW 安全边界内执行"
              : "DAO Treasury AI · Executes within CAW guardrails"}
          </motion.p>
        </div>

        {/* ── Right Panel: Chat ── */}
        <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          {/* Chat header */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.06]">
            <Zap size={15} style={{ color: LIME }} />
            <span
              className="text-xs font-bold text-fg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {lang === "zh" ? "对话" : "Conversation"}
            </span>
            <span className="text-[10px] font-mono text-fg-subtle ml-auto">
              {messages.length} {lang === "zh" ? "条消息" : "messages"}
            </span>
          </div>

          {/* Messages scroll area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
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
                  {/* Avatar */}
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

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed",
                      msg.role === "agent"
                        ? "rounded-tl-sm border border-white/[0.06] bg-white/[0.03] text-fg"
                        : "rounded-tr-sm bg-white/[0.08] text-fg"
                    )}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
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

          {/* Input area */}
          <div className="px-5 py-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    lang === "zh"
                      ? "输入指令或问题..."
                      : "Type a command or question..."
                  }
                  disabled={isThinking}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-11 text-[13px] text-fg placeholder:text-fg-subtle/50 focus:outline-none focus:border-lime-500/30 focus:ring-1 focus:ring-lime-500/10 transition-all disabled:opacity-50"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <Sparkles
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-subtle/30"
                />
              </div>
              <motion.button
                onClick={handleSend}
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
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-1">
        <HolographicButton
          icon={FileText}
          label={lang === "zh" ? "生成计划" : "Generate Plan"}
          onClick={() =>
            handleQuickAction(
              lang === "zh" ? "生成付款计划" : "Generate payment plan"
            )
          }
          color={LIME}
        />
        <HolographicButton
          icon={Shield}
          label={lang === "zh" ? "检查风险" : "Check Risk"}
          onClick={() =>
            handleQuickAction(
              lang === "zh" ? "检查风险" : "Check risk"
            )
          }
          color={CYAN}
        />
        <HolographicButton
          icon={TrendingUp}
          label={lang === "zh" ? "查看审计" : "View Audit"}
          onClick={() =>
            handleQuickAction(
              lang === "zh" ? "查看审计报告" : "View audit report"
            )
          }
          color={VIOLET}
        />
      </div>
    </div>
  );
}
