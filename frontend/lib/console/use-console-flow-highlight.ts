"use client";

import { useMemo } from "react";
import { useConsoleState, FlowStep } from "@/lib/console/console-state";

function isWhitelistBlock(reason?: string): boolean {
  if (!reason) return false;
  const lower = reason.toLowerCase();
  return lower.includes("whitelist") || lower.includes("白名单") || lower.includes("not whitelisted");
}

/**
 * Derived demo-flow flags for cross-module UI (Policy pulse, Analytics empty, Wallets badge).
 */
export function useConsoleFlowHighlight() {
  const { plan, step } = useConsoleState();

  return useMemo(() => {
    const executedItems = plan.filter((i) => i.status === "Executed");
    const blockedItems = plan.filter((i) => i.status === "Blocked");
    const whitelistBlocked = blockedItems.filter((i) => isWhitelistBlock(i.riskReason));

    return {
      hasExecuted: executedItems.length > 0,
      hasBlocked: blockedItems.length > 0,
      hasBlockedWhitelist: whitelistBlocked.length > 0,
      whitelistBlockedNames: whitelistBlocked.map((i) => i.record.name),
      executedCount: executedItems.length,
      blockedCount: blockedItems.length,
      isFlowComplete: step === FlowStep.Done,
    };
  }, [plan, step]);
}
