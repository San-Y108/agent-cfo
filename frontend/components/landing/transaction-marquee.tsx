"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Status = "SIGNED" | "POLICY_HOLD" | "SAFE_LIMIT" | "RECORDS_IN" | "WALLET_LIVE" | "AUDIT_OK";

type MarqueeItem = {
  sender: string;
  amount: string;
  action: string;
  status: Status;
  date: string;
};

const marqueeItems: MarqueeItem[] = [
  { sender: "Cobo_CAW_f39A", amount: "20.00 USDC", action: "Signed Alice Dev reward", status: "SIGNED", date: "Just now" },
  { sender: "Indexer_CSV", amount: "4 entries", action: "Parsed contributions.csv", status: "RECORDS_IN", date: "12s ago" },
  { sender: "Cobo_CAW_f39A", amount: "10.00 USDC", action: "Signed Charlie QA task", status: "SIGNED", date: "1m ago" },
  { sender: "Policy_Gate_v3", amount: "15.00 USDC", action: "Blocked Bob Designer", status: "POLICY_HOLD", date: "2m ago" },
  { sender: "Cobo_CAW_f39A", amount: "5.00 USDC", action: "Signed Indexer query", status: "SIGNED", date: "3m ago" },
  { sender: "Sepolia_RPC", amount: "tx 0xae3f…2c91", action: "Confirmed on Sepolia", status: "WALLET_LIVE", date: "4m ago" },
  { sender: "Audit_Engine", amount: "audit-2026-06-09", action: "Settlement report sealed", status: "AUDIT_OK", date: "6m ago" },
  { sender: "Policy_Gate_v3", amount: "250.00 USDC", action: "Sync safe thresholds", status: "SAFE_LIMIT", date: "11m ago" },
  { sender: "Notion_Sync", amount: "12 rows", action: "Pulled contributor table", status: "RECORDS_IN", date: "18m ago" },
  { sender: "Cobo_CAW_f39A", amount: "150.00 MATIC", action: "Paid Gas Relayer", status: "SIGNED", date: "24m ago" },
];

const STATUS_STYLE: Record<Status, { text: string; glow: string; dot: string }> = {
  SIGNED:      { text: "text-[#B5FF4D]", glow: "rgba(181,255,77,0.12)", dot: "bg-[#B5FF4D]" },
  POLICY_HOLD: { text: "text-[#FB7185]", glow: "rgba(251,113,133,0.12)", dot: "bg-[#FB7185]" },
  SAFE_LIMIT:  { text: "text-[#C084FC]", glow: "rgba(192,132,252,0.12)", dot: "bg-[#C084FC]" },
  RECORDS_IN:  { text: "text-[#5EEAD4]", glow: "rgba(94,234,212,0.12)", dot: "bg-[#5EEAD4]" },
  WALLET_LIVE: { text: "text-[#60A5FA]", glow: "rgba(96,165,250,0.12)", dot: "bg-[#60A5FA]" },
  AUDIT_OK:    { text: "text-[#C084FC]", glow: "rgba(192,132,252,0.12)", dot: "bg-[#C084FC]" },
};

const DOT_COLOR: Record<Status, string> = {
  SIGNED:      "bg-[#B5FF4D]",
  POLICY_HOLD: "bg-[#FB7185]",
  SAFE_LIMIT:  "bg-[#C084FC]",
  RECORDS_IN:  "bg-[#5EEAD4]",
  WALLET_LIVE: "bg-[#60A5FA]",
  AUDIT_OK:    "bg-[#C084FC]",
};

const WAVE_BG = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 12" preserveAspectRatio="none"><path d="M0,6 Q15,1 30,6 T60,6" fill="none" stroke="rgba(181,255,77,0.35)" stroke-width="1"/></svg>'
)}")`;

/* ── Decorative rail components ─────────────────────────────────────── */

function GearPulley({ direction = "left" }: { direction?: "left" | "right" }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 30, height: 30, flexShrink: 0 }}>
      <motion.svg
        className="absolute inset-0"
        viewBox="0 0 30 30"
        animate={{ rotate: direction === "left" ? 360 : -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="gearGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="50%" stopColor="rgba(181,255,77,0.20)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        <circle cx="15" cy="15" r="11" fill="none" stroke="url(#gearGrad)" strokeWidth="1.2" />
        {Array.from({ length: 6 }).map((_, j) => (
          <rect
            key={j}
            x="14"
            y="1"
            width="2"
            height="4"
            rx="1"
            fill="rgba(255,255,255,0.10)"
            transform={`rotate(${j * 60} 15 15)`}
          />
        ))}
      </motion.svg>
      <div className="relative z-10 h-1 w-1 rounded-full bg-[#B5FF4D]/40" style={{ boxShadow: "0 0 8px rgba(181,255,77,0.35)" }} />
    </div>
  );
}

function ChainLink() {
  return (
    <div className="flex items-center justify-center" style={{ width: 32, height: 28, flexShrink: 0 }}>
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
        <rect x="2" y="7" width="11" height="6" rx="3" stroke="rgba(255,255,255,0.12)" strokeWidth="1.4" />
        <rect x="11" y="7" width="11" height="6" rx="3" stroke="rgba(181,255,77,0.22)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

function HexNode() {
  return (
    <div className="flex items-center justify-center" style={{ width: 28, height: 28, flexShrink: 0 }}>
      <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
        <path
          d="M10 1L18.66 6V16L10 21L1.34 16V6L10 1Z"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.2"
          fill="rgba(181,255,77,0.04)"
        />
      </svg>
    </div>
  );
}

function DottedLine() {
  return (
    <div className="flex items-center justify-center gap-1.5" style={{ width: 44, height: 12, flexShrink: 0 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-1 w-1 rounded-full" style={{ backgroundColor: i % 2 === 0 ? "rgba(181,255,77,0.30)" : "rgba(255,255,255,0.10)" }} />
      ))}
    </div>
  );
}

function CircuitTrace() {
  return (
    <div className="flex items-center justify-center" style={{ width: 44, height: 28, flexShrink: 0 }}>
      <svg width="38" height="14" viewBox="0 0 38 14" fill="none">
        <path d="M1 7H12L16 3L22 11L26 7H37" stroke="rgba(181,255,77,0.22)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="1" cy="7" r="1.5" fill="rgba(255,255,255,0.18)" />
        <circle cx="37" cy="7" r="1.5" fill="rgba(255,255,255,0.18)" />
      </svg>
    </div>
  );
}

function BoltNode() {
  return (
    <div className="flex items-center justify-center" style={{ width: 26, height: 28, flexShrink: 0 }}>
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
        <path d="M8 1L2 11H7L6 19L12 9H7L8 1Z" stroke="rgba(181,255,77,0.35)" strokeWidth="1.2" fill="rgba(181,255,77,0.06)" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function OrbitRing() {
  return (
    <div className="flex items-center justify-center" style={{ width: 30, height: 28, flexShrink: 0 }}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="8" stroke="rgba(255,255,255,0.10)" strokeWidth="1.2" />
        <circle cx="19" cy="7" r="2" fill="rgba(181,255,77,0.25)" />
        <path d="M13 5C8 5 5 9 5 13C5 17 9 19 13 21C17 19 21 17 21 13C21 9 18 5 13 5Z" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

type OrnamentType = "gear" | "chain" | "hex" | "dots" | "circuit" | "bolt" | "orbit";

const ORNAMENTS_TOP: OrnamentType[] = [
  "dots", "chain", "hex", "circuit", "bolt", "orbit", "dots", "gear",
  "hex", "chain", "circuit", "dots", "bolt", "orbit", "chain",
];

const ORNAMENTS_BOTTOM: OrnamentType[] = [
  "circuit", "hex", "dots", "orbit", "chain", "bolt", "dots", "hex",
  "gear", "circuit", "chain", "orbit", "dots", "hex", "bolt",
];

function TopBottomRail({
  flow,
  ornaments,
}: {
  flow: "left" | "right";
  ornaments: OrnamentType[];
}) {
  const reduce = useReducedMotion();
  // 三份复制用于无缝循环：视觉向右流 = translate3d(+33.333%)，向左流 = -33.333%
  const tripled = [...ornaments, ...ornaments, ...ornaments];
  const animation = reduce
    ? "none"
    : `transaction-rail-flow-${flow} 60s linear infinite`;

  return (
    <div
      className="relative h-12 w-full pointer-events-none overflow-hidden"
      style={{
        background:
          flow === "right"
            ? "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)"
            : "linear-gradient(0deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
      }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 flex items-center gap-10 will-change-transform"
        style={{ width: "max-content", animation }}
      >
        {tripled.map((type, i) => {
          if (type === "gear") return <GearPulley key={i} direction={flow === "right" ? "left" : "right"} />;
          if (type === "chain") return <ChainLink key={i} />;
          if (type === "hex") return <HexNode key={i} />;
          if (type === "circuit") return <CircuitTrace key={i} />;
          if (type === "bolt") return <BoltNode key={i} />;
          if (type === "orbit") return <OrbitRing key={i} />;
          return <DottedLine key={i} />;
        })}
      </motion.div>
      <div
        className="absolute left-8 right-8 h-px"
        style={{
          top: flow === "right" ? "auto" : "50%",
          bottom: flow === "right" ? "50%" : "auto",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }}
      />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export function TransactionMarquee() {
  const reduce = useReducedMotion();
  // Triple the items so the loop feels truly seamless at any viewport width.
  const items = [...marqueeItems, ...marqueeItems, ...marqueeItems];
  const [hovered, setHovered] = useState(false);

  // 传送带改用 CSS keyframes（见下方 <style> 块）。30s/份 适合逐条阅读。
  // -33.333% 是相对元素自身宽度，而元素 width: max-content ≈ 3 × 一份内容宽度，
  // 所以 to 状态正好是滚过一份内容，下一帧回到 0 时视觉上是第二份内容无缝接位。
  //
  // Hover 行为：把 animation 字符串的 duration 拆出来改成 animationPlayState 单独切。
  // 原因：CSS animation 的 duration 变化会触发浏览器从头重启 keyframes，元素会从
  // "当前应在位置"瞬间跳回 from(x=0)，视觉上就是"突变"。play-state 切换只冻结/恢复
  // 当前帧，无 restart。代价：hover 是"暂停"而非"减速"——但这反而更符合"想看清某个
  // pill"的预期。
  const scrollAnimation = reduce
    ? "none"
    : `transaction-marquee-scroll 30s linear infinite`;
  const scrollPlayState = reduce || hovered ? "paused" : "running";

  return (
    <div
      className="w-full relative mb-16 flex flex-col"
      style={{
        clipPath: "polygon(22px 0%, calc(100% - 22px) 0%, 100% 22px, 100% calc(100% - 22px), calc(100% - 22px) 100%, 22px 100%, 0% calc(100% - 22px), 0% 22px)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.025) 100%)",
      }}
    >
      <style>{`
        @keyframes transaction-marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-33.333%, 0, 0); }
        }
        @keyframes transaction-rail-flow-right {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(33.333%, 0, 0); }
        }
        @keyframes transaction-rail-flow-left {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-33.333%, 0, 0); }
        }
      `}</style>
      <TopBottomRail flow="right" ornaments={ORNAMENTS_TOP} />

      {/* Conveyor belt */}
      <div
        className="relative flex items-center overflow-hidden"
        style={{ height: "6rem", background: "linear-gradient(180deg, #0a0a0a 0%, #0c0c0c 50%, #0a0a0a 100%)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, rgba(13,13,13,1) 0%, rgba(13,13,13,0.9) 35%, transparent 100%)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(270deg, rgba(13,13,13,1) 0%, rgba(13,13,13,0.9) 35%, transparent 100%)" }} />

        {/* Scrolling cargo pills */}
        <motion.div
          className="flex items-center gap-2 will-change-transform relative"
          style={{
            width: "max-content",
            animation: scrollAnimation,
            animationPlayState: scrollPlayState,
            backgroundImage: WAVE_BG,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "0 58%",
            backgroundSize: "48px 6px",
          }}
        >
          {items.map((item, idx) => {
            const s = STATUS_STYLE[item.status];
            const staggerY = Math.round(Math.sin(idx * 0.85) * 6);
            return (
              <React.Fragment key={idx}>
                <div
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-md border border-white/[0.09] bg-[#111111]/80 hover:bg-[#161616] transition-colors"
                  style={{
                    boxShadow: `inset 0 1px 0 ${s.glow}`,
                    transform: `translateY(${staggerY}px)`,
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} style={{ opacity: 0.85, boxShadow: `0 0 6px ${s.glow}` }} />
                  <span className="text-[9px] font-mono text-white/55 hidden sm:inline uppercase tracking-wider">{item.sender}</span>
                  <span className="text-[10px] font-mono text-white/85 truncate max-w-[120px] sm:max-w-[170px]">{item.action}</span>
                  <span className={`text-[9px] font-mono font-semibold ${s.text}`}>{item.amount}</span>
                  <span className="text-[8px] font-mono text-white/45 hidden sm:inline">{item.date}</span>
                </div>

                {/* Flow arrow between cargo items */}
                <div className="flex items-center justify-center px-1 opacity-40">
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="rgba(181,255,77,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </React.Fragment>
            );
          })}
        </motion.div>
      </div>

      <TopBottomRail flow="left" ornaments={ORNAMENTS_BOTTOM} />
    </div>
  );
}
