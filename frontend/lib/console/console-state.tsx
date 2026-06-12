"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { MOCK_RULES, MOCK_RECORDS } from "@/lib/demo/console-mock";
import type {
  ContributorRecord,
  BudgetRules,
  PaymentPlanItem,
} from "@/lib/types/console";
import type { CawStatus } from "@/lib/api/types";
import { isMockMode } from "@/lib/api/client";

/**
 * Payment workflow step enum.
 *
 * Kept numeric so the existing <FlowTimeline> (0–4) continues to work,
 * while removing magic numbers from TreasuryModule.
 */
export enum FlowStep {
  Idle = 0,
  Scanning = 1,
  Review = 2,
  Executing = 3,
  Done = 4,
}

export type ActivityType = "plan" | "execute" | "rule" | "records" | "system";

export interface ActivityEntry {
  id: string;
  ts: string;
  type: ActivityType;
  message: string;
}

export type DrawerTab = "sandbox" | "rules" | "activity";

interface ConsoleState {
  budgetRule: BudgetRules;
  records: ContributorRecord[];
  plan: PaymentPlanItem[];
  step: FlowStep;
  isExecuting: boolean;
  cawStatuses: CawStatus[];
  activityLog: ActivityEntry[];
  drawerOpen: boolean;
  drawerTab: DrawerTab;
}

interface ConsoleActions {
  setBudgetRule: (rule: BudgetRules) => void;
  setRecords: (records: ContributorRecord[]) => void;
  addRecords: (records: ContributorRecord[]) => void;
  updateWhitelist: (whitelist: string[]) => void;
  updateSingleLimit: (limit: number) => void;
  updateMonthlyBudget: (budget: number) => void;
  setPlan: (plan: PaymentPlanItem[]) => void;
  setStep: (step: FlowStep) => void;
  setIsExecuting: (v: boolean) => void;
  setCawStatuses: (statuses: CawStatus[]) => void;
  resetFlow: () => void;
  generatePlan: () => Promise<PaymentPlanItem[]>;
  executePlan: () => Promise<PaymentPlanItem[]>;
  refreshCawStatus: () => Promise<CawStatus[]>;
  logActivity: (type: ActivityType, message: string) => void;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
}

const ConsoleStateContext = createContext<(ConsoleState & ConsoleActions) | null>(
  null
);

export function ConsoleStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [budgetRule, setBudgetRule] = useState<BudgetRules>(MOCK_RULES);
  const [records, setRecords] = useState<ContributorRecord[]>(MOCK_RECORDS);
  const [plan, setPlan] = useState<PaymentPlanItem[]>([]);
  const [step, setStep] = useState<FlowStep>(FlowStep.Idle);
  const [isExecuting, setIsExecuting] = useState(false);
  const [cawStatuses, setCawStatuses] = useState<CawStatus[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([
    {
      id: "act_boot",
      ts: new Date().toISOString(),
      type: "system",
      message: "Console session started · guardrails loaded",
    },
  ]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("sandbox");

  const logActivity = useCallback((type: ActivityType, message: string) => {
    setActivityLog((prev) => [
      {
        id: `act_${Date.now()}_${prev.length}`,
        ts: new Date().toISOString(),
        type,
        message,
      },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const openDrawer = useCallback((tab?: DrawerTab) => {
    if (tab) setDrawerTab(tab);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addRecords = useCallback((newRecords: ContributorRecord[]) => {
    setRecords((prev) => [...prev, ...newRecords]);
    logActivity(
      "records",
      `${newRecords.length} contribution record(s) added`
    );
  }, [logActivity]);

  const updateWhitelist = useCallback((whitelist: string[]) => {
    setBudgetRule((prev) => ({ ...prev, whitelist }));
    logActivity("rule", `Whitelist updated · ${whitelist.length} address(es)`);
  }, [logActivity]);

  const updateSingleLimit = useCallback((singlePaymentLimit: number) => {
    setBudgetRule((prev) => ({ ...prev, singlePaymentLimit }));
    logActivity("rule", `Single payment limit set to ${singlePaymentLimit} USDC`);
  }, [logActivity]);

  const updateMonthlyBudget = useCallback((monthlyBudget: number) => {
    setBudgetRule((prev) => ({ ...prev, monthlyBudget }));
    logActivity("rule", `Monthly budget set to ${monthlyBudget} USDC`);
  }, [logActivity]);

  const resetFlow = useCallback(() => {
    setPlan([]);
    setStep(FlowStep.Idle);
    setIsExecuting(false);
    setCawStatuses([]);
    setRecords(MOCK_RECORDS);
    setBudgetRule(MOCK_RULES);
    logActivity("system", "Flow reset · records and rules restored");
  }, [logActivity]);

  const evaluateItem = useCallback(
    (record: ContributorRecord): PaymentPlanItem => {
      const isWhitelisted = budgetRule.whitelist.some(
        (w) => w.toLowerCase() === record.wallet.toLowerCase()
      );
      if (!isWhitelisted) {
        return {
          record,
          status: "Blocked",
          riskReason: "Address not whitelisted",
        };
      }
      if (record.amount > budgetRule.singlePaymentLimit) {
        return {
          record,
          status: "Blocked",
          riskReason: `Over limit of ${budgetRule.singlePaymentLimit} USDC`,
        };
      }
      return { record, status: "Ready" };
    },
    [budgetRule.whitelist, budgetRule.singlePaymentLimit]
  );

  const generatePlan = useCallback(async (): Promise<PaymentPlanItem[]> => {
    setStep(FlowStep.Scanning);
    setPlan([]);
    return new Promise((resolve) => {
      setTimeout(() => {
        const p = records.map(evaluateItem);
        setPlan(p);
        setStep(FlowStep.Review);
        const ready = p.filter((i) => i.status === "Ready").length;
        const blocked = p.filter((i) => i.status === "Blocked").length;
        logActivity(
          "plan",
          `Payment plan generated · ${ready} ready, ${blocked} blocked`
        );
        resolve(p);
      }, 1200);
    });
  }, [records, evaluateItem, logActivity]);

  const executePlan = useCallback(async (): Promise<PaymentPlanItem[]> => {
    if (plan.length === 0) return plan;
    setStep(FlowStep.Executing);
    setIsExecuting(true);
    return new Promise((resolve) => {
      setTimeout(() => {
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
        const statuses: CawStatus[] = executed
          .filter((i) => i.status === "Executed")
          .map((item) => ({
            cawRequestId: `mock_caw_${item.record.id}`,
            executionId: `exec_${Date.now()}`,
            paymentItemId: item.record.id,
            providerStatus: "executed",
            normalizedStatus: "Executed" as const,
            mode: isMockMode() ? "mock" : "real",
            network: "Sepolia",
            agentWalletAddress: "0xAgentWallet...",
            txHash: item.txHash ?? null,
            error: null,
            diagnosticCode: null,
            lastCheckedAt: new Date().toISOString(),
          }));
        setCawStatuses(statuses);
        setStep(FlowStep.Done);
        setIsExecuting(false);
        const total = statuses.length;
        const sum = executed
          .filter((i) => i.status === "Executed")
          .reduce((a, c) => a + c.record.amount, 0);
        logActivity(
          "execute",
          `CAW execution complete · ${total} payment(s), ${sum} USDC settled`
        );
        resolve(executed);
      }, 2000);
    });
  }, [plan, logActivity]);

  const refreshCawStatus = useCallback(async (): Promise<CawStatus[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updated = cawStatuses.map((status) => ({
          ...status,
          txHash:
            status.txHash ??
            `0x${Math.random().toString(16).substring(2, 14).toUpperCase()}`,
          lastCheckedAt: new Date().toISOString(),
        }));
        setCawStatuses(updated);
        resolve(updated);
      }, 1500);
    });
  }, [cawStatuses]);

  return (
    <ConsoleStateContext.Provider
      value={{
        budgetRule,
        records,
        plan,
        step,
        isExecuting,
        cawStatuses,
        activityLog,
        drawerOpen,
        drawerTab,
        setBudgetRule,
        setRecords,
        addRecords,
        updateWhitelist,
        updateSingleLimit,
        updateMonthlyBudget,
        setPlan,
        setStep,
        setIsExecuting,
        setCawStatuses,
        resetFlow,
        generatePlan,
        executePlan,
        refreshCawStatus,
        logActivity,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </ConsoleStateContext.Provider>
  );
}

export function useConsoleState() {
  const ctx = useContext(ConsoleStateContext);
  if (!ctx) {
    throw new Error("useConsoleState must be used within ConsoleStateProvider");
  }
  return ctx;
}
