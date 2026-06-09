"use client";

import React from "react";

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

const STATUS_STYLE: Record<Status, { bg: string; text: string; border: string }> = {
  SIGNED:      { bg: "bg-[#B5FF4D]/14", text: "text-[#B5FF4D]", border: "border-[#B5FF4D]/25" },
  POLICY_HOLD: { bg: "bg-[#FB7185]/14", text: "text-[#FB7185]", border: "border-[#FB7185]/25" },
  SAFE_LIMIT:  { bg: "bg-[#C084FC]/14", text: "text-[#C084FC]", border: "border-[#C084FC]/25" },
  RECORDS_IN:  { bg: "bg-[#5EEAD4]/14", text: "text-[#5EEAD4]", border: "border-[#5EEAD4]/25" },
  WALLET_LIVE: { bg: "bg-[#60A5FA]/14", text: "text-[#60A5FA]", border: "border-[#60A5FA]/25" },
  AUDIT_OK:    { bg: "bg-[#C084FC]/14", text: "text-[#C084FC]", border: "border-[#C084FC]/25" },
};

const AMOUNT_COLOR: Record<Status, string> = {
  SIGNED:      "text-[#B5FF4D]",
  POLICY_HOLD: "text-[#FB7185]",
  SAFE_LIMIT:  "text-[#C084FC]",
  RECORDS_IN:  "text-[#5EEAD4]",
  WALLET_LIVE: "text-[#60A5FA]",
  AUDIT_OK:    "text-[#C084FC]",
};

const DOT_COLOR: Record<Status, string> = {
  SIGNED:      "bg-[#B5FF4D]",
  POLICY_HOLD: "bg-[#FB7185]",
  SAFE_LIMIT:  "bg-[#C084FC]",
  RECORDS_IN:  "bg-[#5EEAD4]",
  WALLET_LIVE: "bg-[#60A5FA]",
  AUDIT_OK:    "bg-[#C084FC]",
};

export function TransactionMarquee() {
  const allItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="w-full border-y py-4 overflow-hidden relative mb-24 border-white/5 bg-white/[0.02]">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-[#0D0D0D] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-[#0D0D0D] to-transparent" />

      <div className="flex gap-14 animate-marquee whitespace-nowrap min-w-full">
        {allItems.map((item, idx) => {
          const s = STATUS_STYLE[item.status];
          return (
            <div key={idx} className="inline-flex items-center gap-3">
              <span className={`text-xs border px-2 py-1 rounded font-mono font-semibold bg-white/5 border-white/10 ${s.text}`}>
                <span className="text-white/45 font-normal">{item.sender}</span>
              </span>
              <span className="text-xs font-mono font-medium text-white/75">
                {item.action}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md font-mono border ${s.bg} ${s.text} ${s.border}`}
              >
                {item.status}
              </span>
              <span className={`text-xs font-semibold font-mono ${AMOUNT_COLOR[item.status]}`}>
                {item.amount}
              </span>
              <span className="text-xs font-mono text-white/30">
                ({item.date})
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ml-3 ${DOT_COLOR[item.status]}`} style={{ opacity: 0.7 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
