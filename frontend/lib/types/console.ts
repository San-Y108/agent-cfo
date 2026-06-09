/**
 * Console 业务层类型定义（来自 AI Studio 设计稿）
 * 与 backend app/models.py contract 同形
 */

export interface ContributorRecord {
  id: string;
  name: string;
  role: string;
  task: string;
  wallet: string;
  amount: number;
  token: string;
}

export interface PaymentPlanItem {
  record: ContributorRecord;
  status: "Ready" | "Blocked" | "Executed";
  riskReason?: string;
  txHash?: string;
}

export interface BudgetRules {
  monthlyBudget: number;
  singlePaymentLimit: number;
  allowedToken: string;
  whitelist: string[];
}
