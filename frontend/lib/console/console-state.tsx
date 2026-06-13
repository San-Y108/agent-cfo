"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MOCK_RULES, MOCK_RECORDS } from "@/lib/demo/console-mock";
import { useApp } from "@/lib/i18n/context";
import {
  activitySessionStarted,
  activityRecordsAdded,
  activityWhitelistUpdated,
  activitySingleLimitSet,
  activityMonthlyBudgetSet,
  activityFlowReset,
  activityPlanGenerated,
  activityPlanApi,
  activityPlanFailed,
  activityExecuteComplete,
  activityExecuteReal,
  activityExecuteFailed,
  activityCawRefreshed,
  activityCawRefreshFailed,
} from "@/lib/console/activity-messages";
import type {
  ContributorRecord,
  BudgetRules,
  PaymentPlanItem,
} from "@/lib/types/console";
import type { CawStatus } from "@/lib/api/types";
import { isMockMode } from "@/lib/api/client";
import { createPaymentPlan } from "@/lib/api/payment";
import { runRiskCheck } from "@/lib/api/risk";
import { executePayment, refreshCawStatus as refreshCawStatusApi } from "@/lib/api/caw";
import { getAuditReport } from "@/lib/api/audit";
import {
  executionToCawStatuses,
  mapRiskPaymentsToPlanItems,
  mergeExecutionIntoPlan,
  toApiBudgetRule,
  toApiContributions,
} from "@/lib/console/map-api-plan";

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
  flowError: string | null;
  paymentPlanId: string | null;
  auditReportId: string | null;
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
  clearFlowError: () => void;
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
  const { lang } = useApp();
  const [budgetRule, setBudgetRule] = useState<BudgetRules>(MOCK_RULES);
  const [records, setRecords] = useState<ContributorRecord[]>(MOCK_RECORDS);
  const [plan, setPlan] = useState<PaymentPlanItem[]>([]);
  const [step, setStep] = useState<FlowStep>(FlowStep.Idle);
  const [isExecuting, setIsExecuting] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [paymentPlanId, setPaymentPlanId] = useState<string | null>(null);
  const [auditReportId, setAuditReportId] = useState<string | null>(null);
  const [cawStatuses, setCawStatuses] = useState<CawStatus[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([
    {
      id: "act_boot",
      ts: new Date().toISOString(),
      type: "system",
      message: activitySessionStarted("en"),
    },
  ]);

  useEffect(() => {
    setActivityLog((prev) =>
      prev.map((entry) =>
        entry.id === "act_boot"
          ? { ...entry, message: activitySessionStarted(lang) }
          : entry
      )
    );
  }, [lang]);
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
      activityRecordsAdded(newRecords.length, lang)
    );
  }, [logActivity, lang]);

  const updateWhitelist = useCallback((whitelist: string[]) => {
    setBudgetRule((prev) => ({ ...prev, whitelist }));
    logActivity("rule", activityWhitelistUpdated(whitelist.length, lang));
  }, [logActivity, lang]);

  const updateSingleLimit = useCallback((singlePaymentLimit: number) => {
    setBudgetRule((prev) => ({ ...prev, singlePaymentLimit }));
    logActivity("rule", activitySingleLimitSet(singlePaymentLimit, lang));
  }, [logActivity, lang]);

  const updateMonthlyBudget = useCallback((monthlyBudget: number) => {
    setBudgetRule((prev) => ({ ...prev, monthlyBudget }));
    logActivity("rule", activityMonthlyBudgetSet(monthlyBudget, lang));
  }, [logActivity, lang]);

  const clearFlowError = useCallback(() => setFlowError(null), []);

  const resetFlow = useCallback(() => {
    setPlan([]);
    setStep(FlowStep.Idle);
    setIsExecuting(false);
    setFlowError(null);
    setPaymentPlanId(null);
    setAuditReportId(null);
    setCawStatuses([]);
    setRecords(MOCK_RECORDS);
    setBudgetRule(MOCK_RULES);
    logActivity("system", activityFlowReset(lang));
  }, [logActivity, lang]);

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
    setFlowError(null);
    setStep(FlowStep.Scanning);
    setPlan([]);

    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const p = records.map(evaluateItem);
          setPlan(p);
          setStep(FlowStep.Review);
          const ready = p.filter((i) => i.status === "Ready").length;
          const blocked = p.filter((i) => i.status === "Blocked").length;
          logActivity(
            "plan",
            activityPlanGenerated(ready, blocked, lang)
          );
          resolve(p);
        }, 1200);
      });
    }

    try {
      const budgetRuleApi = toApiBudgetRule(budgetRule);
      const paymentPlan = await createPaymentPlan({
        contributions: toApiContributions(records),
        budgetRule: budgetRuleApi,
      });
      setPaymentPlanId(paymentPlan.paymentPlanId);

      const riskResult = await runRiskCheck({
        paymentPlanId: paymentPlan.paymentPlanId,
        budgetRule: budgetRuleApi,
      });

      const p = mapRiskPaymentsToPlanItems(riskResult.payments, records);
      setPlan(p);
      setStep(FlowStep.Review);
      const ready = p.filter((i) => i.status === "Ready").length;
      const blocked = p.filter((i) => i.status === "Blocked").length;
      logActivity(
        "plan",
        activityPlanApi(paymentPlan.paymentPlanId, ready, blocked, lang)
      );
      return p;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment plan request failed";
      setFlowError(message);
      setStep(FlowStep.Idle);
      logActivity("system", activityPlanFailed(message, lang));
      return [];
    }
  }, [records, evaluateItem, logActivity, budgetRule, lang]);

  const executePlan = useCallback(async (): Promise<PaymentPlanItem[]> => {
    if (plan.length === 0) return plan;

    setFlowError(null);
    setStep(FlowStep.Executing);
    setIsExecuting(true);

    if (isMockMode()) {
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
              mode: "mock",
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
            activityExecuteComplete(total, sum, lang)
          );
          resolve(executed);
        }, 2000);
      });
    }

    if (!paymentPlanId) {
      setFlowError("Missing paymentPlanId — generate a plan first");
      setStep(FlowStep.Review);
      setIsExecuting(false);
      return plan;
    }

    try {
      const approvedPaymentIds = plan
        .filter((i) => i.status === "Ready")
        .map((i) => i.record.id);

      const execution = await executePayment({
        paymentPlanId,
        approvedPaymentIds,
        humanApproval: { approved: true, approvedBy: "console-operator" },
      });

      setAuditReportId(execution.auditReportId);
      await getAuditReport(execution.auditReportId);

      const executed = mergeExecutionIntoPlan(plan, execution);
      setPlan(executed);
      setCawStatuses(executionToCawStatuses(execution));
      setStep(FlowStep.Done);
      setIsExecuting(false);

      const total = execution.payments.filter((p) => p.status === "Executed").length;
      const sum = executed
        .filter((i) => i.status === "Executed")
        .reduce((a, c) => a + c.record.amount, 0);
      logActivity(
        "execute",
        activityExecuteReal(execution.executionId, total, sum, lang)
      );
      return executed;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment execution failed";
      setFlowError(message);
      setStep(FlowStep.Review);
      setIsExecuting(false);
      logActivity("system", activityExecuteFailed(message, lang));
      return plan;
    }
  }, [plan, paymentPlanId, logActivity, lang]);

  const refreshCawStatus = useCallback(async (): Promise<CawStatus[]> => {
    if (isMockMode()) {
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
    }

    if (cawStatuses.length === 0) return [];

    try {
      const updated = await Promise.all(
        cawStatuses.map((s) => refreshCawStatusApi(s.cawRequestId))
      );
      setCawStatuses(updated);
      logActivity("execute", activityCawRefreshed(lang));
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "CAW refresh failed";
      setFlowError(message);
      logActivity("system", activityCawRefreshFailed(message, lang));
      return cawStatuses;
    }
  }, [cawStatuses, logActivity, lang]);

  return (
    <ConsoleStateContext.Provider
      value={{
        budgetRule,
        records,
        plan,
        step,
        isExecuting,
        flowError,
        paymentPlanId,
        auditReportId,
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
        clearFlowError,
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
