export const workflowCopy = {
  inputTitle: "贡献记录与账单",
  inputDescription: "输入贡献者任务记录和工具订阅账单，AgentCFO 将自动解析。",

  parseTitle: "Agent 解析",
  parseDescription: "AgentCFO 读取并理解任务内容，识别应付款项。",

  paymentPlanTitle: "Payment Plan",
  paymentPlanDescription: "根据贡献记录生成结构化付款计划，包括金额、代币和收款方。",

  riskCheckTitle: "Risk Check",
  riskCheckDescription: "自动检查预算、白名单、单笔限额和重复付款风险。",

  humanApprovalTitle: "人工确认",
  humanApprovalDescription: "在 Agent 执行付款前，需要人工最终确认。",

  cawExecutionTitle: "CAW Execution",
  cawExecutionDescription: "Cobo Agentic Wallet 在权限边界内执行链上付款。",

  auditReportTitle: "Audit Report",
  auditReportDescription: "生成完整的可审计报告，包含所有交易记录和检查结果。",
} as const;
