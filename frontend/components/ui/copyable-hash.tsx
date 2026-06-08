"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CopyableHash — 展示 tx hash / request id，支持点击复制。
 * mock 模式下 txHash 为 null，回退展示 cawRequestId。
 */
export function CopyableHash({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard 不可用时静默失败
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800/50 px-2 py-1 font-mono text-xs text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800",
        className
      )}
      title="Click to copy"
    >
      {label && <span className="text-neutral-500">{label}:</span>}
      <span className="max-w-[180px] truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 flex-shrink-0 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3 flex-shrink-0 text-neutral-500 group-hover:text-neutral-300" />
      )}
    </button>
  );
}
