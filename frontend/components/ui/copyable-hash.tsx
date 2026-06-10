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
        "group inline-flex items-center gap-1.5 rounded-md border border-border-token bg-surface-2 px-2 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg",
        className
      )}
      title="Click to copy"
    >
      {label && <span className="text-fg-subtle">{label}:</span>}
      <span className="max-w-[180px] truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3 flex-shrink-0 text-fg-subtle group-hover:text-fg" />
      )}
    </button>
  );
}
