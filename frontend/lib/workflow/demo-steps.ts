export type DemoStepId =
  | "input"
  | "parse"
  | "payment-plan"
  | "risk-check"
  | "human-approval"
  | "caw-execution"
  | "audit-report";

export interface DemoStep {
  id: DemoStepId;
  title: string;
  description: string;
  status: "idle" | "running" | "completed" | "blocked" | "error";
}

export const demoSteps: DemoStep[] = [
  { id: "input", title: "输入", description: "贡献记录 / 订阅账单输入", status: "idle" },
  { id: "parse", title: "解析", description: "AgentCFO 解析任务", status: "idle" },
  { id: "payment-plan", title: "Payment Plan", description: "生成 Payment Plan", status: "idle" },
  { id: "risk-check", title: "Risk Check", description: "预算 / 白名单 / 限额 / 重复付款检查", status: "idle" },
  { id: "human-approval", title: "人工确认", description: "Human Approval", status: "idle" },
  { id: "caw-execution", title: "CAW Execution", description: "Cobo Agentic Wallet 执行付款 (Simulated)", status: "idle" },
  { id: "audit-report", title: "Audit Report", description: "生成可审计报告", status: "idle" },
];
