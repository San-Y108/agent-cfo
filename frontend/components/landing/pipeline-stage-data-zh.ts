/* Chinese mirror of pipeline-stage-data.ts — Web3 / DAO professional tone */

import type { Stage } from "./pipeline-stage-data";

export const STAGES_ZH: Stage[] = [
  {
    no: "01",
    key: "records",
    title: "贡献记录",
    accent: "#5EEAD4",
    accentSoft: "rgba(94,234,212,0.08)",
    accentBorder: "rgba(94,234,212,0.28)",
    eyebrow: "阶段 01 · 贡献记录",
    headline: "贡献记录\n生成付款计划。",
    lead: "每笔付款都始于一个信号：GitHub Issue 关闭、Notion 行更新、CSV 上传——AgentCFO 读取这些来源，把零散的贡献记录整理成结构化的付款计划。",
    paragraphs: [
      "贡献者不会填报销单。他们写代码、做设计、办 AMA。AgentCFO 在他们已有的工具里采集结构化信号，而不是再增加一张表单。",
      "每条贡献自动带上付款原因、收款方和金额。无需手工录入，也不会漏项——原始信号被转成「每一行都有依据」的付款计划。",
    ],
    capabilities: [
      { icon: "FileSpreadsheet", label: "CSV / JSON 导入", desc: "上传表格，即时生成结构化计划" },
      { icon: "GitBranch", label: "GitHub Issues", desc: "已关闭 Issue 自动变为可付款任务" },
      { icon: "NotebookPen", label: "Notion 数据库", desc: "同步贡献者行，无需离开 Notion" },
    ],
    dataSnippet: `付款计划 — 4 笔
alice.eth    20 USDC  活动复盘
bob.eth      15 USDC  海报设计
charlie.eth  10 USDC  AMA 主持
data-api      5 USDC  订阅 · 6月`,
  },
  {
    no: "02",
    key: "risk",
    title: "风控",
    accent: "#FB7185",
    accentSoft: "rgba(251,113,133,0.07)",
    accentBorder: "rgba(251,113,133,0.28)",
    eyebrow: "阶段 02 · 风控检查",
    headline: "五道护栏\n先于钱包执行。",
    lead: "在调用任何钱包之前，五道策略护栏依次运行：月预算、白名单、单笔限额、代币策略、防重复——任一否决，付款立即停止。",
    paragraphs: [
      "风控引擎不做猜测，而是对每一行应用确定性规则：总额是否在预算内？收款方是否在白名单？单笔是否超限？代币是否允许？是否重复申请？",
      "被拦截的条目不会进入执行队列，原因会一并展示——贡献者知道为何被拒，运营知道如何修正。透明是默认行为，不是可选项。",
    ],
    capabilities: [
      { icon: "Wallet", label: "预算上限", desc: "按 DAO 强制执行月度支出限额" },
      { icon: "UserCheck", label: "白名单", desc: "仅向已批准地址付款" },
      { icon: "ArrowRight", label: "单笔限额", desc: "单笔最高金额，可配置" },
      { icon: "Coins", label: "代币策略", desc: "限制可用代币与链" },
      { icon: "ShieldCheck", label: "防重复", desc: "拦截意外重复付款" },
    ],
    dataSnippet: `风控检查 — 5 项 · 4 通过 · 1 拦截
✓ 预算上限      月 50 USDC · 已用 50
✓ 白名单        alice / charlie / data-api
✓ 单笔限额      ≤ 25 USDC · 最高 20
✓ 代币策略      USDC · Sepolia 测试网
✗ 防重复        bob.eth 不在白名单`,
  },
  {
    no: "03",
    key: "approval",
    title: "人工审批",
    accent: "#B5FF4D",
    accentSoft: "rgba(181,255,77,0.08)",
    accentBorder: "rgba(181,255,77,0.32)",
    eyebrow: "阶段 03 · 人工审批",
    headline: "最终出账\n必须人工确认。",
    lead: "没有自主转账。AI 可以起草计划、跑风控、准备执行——但无法签名。运营人员审阅已通过队列，点击「批准并执行」；被拦截项保持拦截并附带原因。",
    paragraphs: [
      "人工在环不是可关闭的设置，而是架构约束。审批视图在同一屏展示每笔的状态、原因与金额——无需表格来回、邮件扯皮。",
      "每一次批准都会记录审批人身份，形成可追溯的审计链路。",
    ],
    capabilities: [
      { icon: "CheckCircle", label: "一键批准", desc: "清晰队列，单次操作" },
      { icon: "Eye", label: "拦截可见", desc: "被拒条目保留原因" },
      { icon: "ScrollText", label: "审计追踪", desc: "记录审批人与时间" },
      { icon: "Layers", label: "批量执行", desc: "一次批准多笔付款" },
    ],
    dataSnippet: `审批队列 — 3 通过 · 1 拦截
已通过:
  alice.eth    20 USDC  ✓
  charlie.eth  10 USDC  ✓
  data-api      5 USDC  ✓
已拦截:
  bob.eth      15 USDC  ✗ 不在白名单

[ 批准并执行 · 35 USDC ]`,
  },
  {
    no: "04",
    key: "wallet",
    title: "CAW 钱包",
    accent: "#60A5FA",
    accentSoft: "rgba(96,165,250,0.07)",
    accentBorder: "rgba(96,165,250,0.28)",
    eyebrow: "阶段 04 · CAW 钱包",
    headline: "Cobo Agentic Wallet\n在策略边界内执行。",
    lead: "AgentCFO 不托管私钥。每笔已批准付款经 Cobo Agentic Wallet（CAW）路由——在协议层强制执行规则，而不只是 UI 提示。",
    paragraphs: [
      "钱包配置与风控引擎同源：同一白名单、同一预算、同一代币限制。即使应用层疏漏，钱包层仍会拦截——纵深防御。",
      "每笔转账在 Sepolia 测试网返回真实 tx hash，可追踪、可验证、可审计。Demo 使用测试网资金，流程与主网一致。",
    ],
    capabilities: [
      { icon: "Wallet", label: "Cobo Agentic Wallet", desc: "策略约束的 Agent 钱包" },
      { icon: "TestTube", label: "测试网执行", desc: "真实 tx hash，零真实资金风险" },
      { icon: "Settings", label: "可配置策略", desc: "钱包规则与风控同步" },
      { icon: "Link", label: "链上可追溯", desc: "每笔付款可链上验证" },
    ],
    dataSnippet: `CAW 执行 — 3 笔转账
0xae3f...2c91  → alice.eth    20 USDC  ✓ 已确认
0x8b21...4ee0  → charlie.eth  10 USDC  ✓ 已确认
0x4c7d...91b3  → data-api      5 USDC  ✓ 已确认

策略: 测试网模拟 · Agent 钱包绑定`,
  },
  {
    no: "05",
    key: "audit",
    title: "审计结算",
    accent: "#C084FC",
    accentSoft: "rgba(192,132,252,0.07)",
    accentBorder: "rgba(192,132,252,0.28)",
    eyebrow: "阶段 05 · 审计结算",
    headline: "每次运行\n输出结算报告。",
    lead: "每次执行自然产出结算报告——tx hash、收款方、风控结果、审批人、拦截原因，全部写入一份可导出文档。",
    paragraphs: [
      "报告不是月底手工拼的表格，而是在执行瞬间自动生成——每个决策、每次检查、每次审批实时入账，默认达到审计级粒度。",
      "可导出 PDF 或 JSON，分享给会计、审计或社区；链上 hash 保证历史透明、可验证。",
    ],
    capabilities: [
      { icon: "FileText", label: "自动生成", desc: "执行完成即生成报告" },
      { icon: "Download", label: "可导出", desc: "PDF 或 JSON" },
      { icon: "Shield", label: "链上凭证", desc: "包含每笔 tx hash" },
      { icon: "GitCommit", label: "全链路追溯", desc: "从贡献记录到结算" },
    ],
    dataSnippet: `结算报告 — audit-2026-06-09
已通过: 3    已拦截: 1    已结算: 35 USDC

链上凭证:
0xae3f...2c91  ✓
0x8b21...4ee0  ✓
0x4c7d...91b3  ✓

风控: 4 通过 · 1 拦截
审批人: human`,
  },
];
