/* =============================================================================
 * PIPELINE STAGE DATA — Editorial Flow
 * Extended content for the 5-stage pipeline section.
 * ===========================================================================*/

import { STAGES_ZH } from "./pipeline-stage-data-zh";

export type StageKey = "records" | "risk" | "approval" | "wallet" | "audit";

export type Capability = {
  icon: string; // lucide icon name
  label: string;
  desc: string;
};

export type Stage = {
  no: string;
  key: StageKey;
  title: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  eyebrow: string;
  headline: string; // use \n for line breaks
  lead: string;
  paragraphs: string[];
  capabilities: Capability[];
  dataSnippet: string;
};

export const STAGES: Stage[] = [
  {
    no: "01",
    key: "records",
    title: "Records",
    accent: "#5EEAD4",
    accentSoft: "rgba(94,234,212,0.08)",
    accentBorder: "rgba(94,234,212,0.28)",
    eyebrow: "Stage 01 · Records",
    headline: "Contribution records become\npayout plans.",
    lead: "Every payout starts with a signal. A GitHub issue closed, a Notion row filled, a CSV uploaded — AgentCFO reads them all and turns messy contribution records into structured payment plans.",
    paragraphs: [
      "Contributors don't file expense reports. They write code, design posters, host AMAs. AgentCFO meets them where they work — pulling structured signals from the tools they already use, not adding another form to fill.",
      "Each contribution is automatically tagged with a reason, a recipient, and an amount. No manual data entry. No forgotten line items. Just raw signals transformed into a payment plan where every line has a purpose.",
    ],
    capabilities: [
      { icon: "FileSpreadsheet", label: "CSV / JSON upload", desc: "Drop a spreadsheet, get a structured plan" },
      { icon: "GitBranch", label: "GitHub Issues", desc: "Closed issues become payable tasks automatically" },
      { icon: "NotebookPen", label: "Notion database", desc: "Sync contributor rows without leaving Notion" },
    ],
    dataSnippet: `PAYMENT PLAN — 4 entries
alice.eth    20 USDC  wrote event recap
bob.eth      15 USDC  designed poster
charlie.eth  10 USDC  hosted AMA
data-api      5 USDC  subscription · jun`,
  },
  {
    no: "02",
    key: "risk",
    title: "Risk",
    accent: "#FB7185",
    accentSoft: "rgba(251,113,133,0.07)",
    accentBorder: "rgba(251,113,133,0.28)",
    eyebrow: "Stage 02 · Risk",
    headline: "Five policy gates run\nbefore any wallet call.",
    lead: "Before any wallet opens, five policy gates run in sequence. Budget cap, whitelist, single-payment limit, token policy, duplicate guard — each gate gets a vote. One \"no\" and the payment stops cold.",
    paragraphs: [
      "The risk engine doesn't guess. It applies deterministic rules to every line item: Is the total within budget? Is the recipient on the whitelist? Does any single payment exceed the limit? Is the token allowed? Has this exact payment been requested before?",
      "Blocked items never reach the execution queue. They stay visible with their reasons attached — so contributors know why, and operators know what to fix. Transparency is the default, not a feature toggle.",
    ],
    capabilities: [
      { icon: "Wallet", label: "Budget cap", desc: "Monthly spending limits enforced per DAO" },
      { icon: "UserCheck", label: "Whitelist", desc: "Only approved recipients receive funds" },
      { icon: "ArrowRight", label: "Single limit", desc: "Max amount per transaction, configurable" },
      { icon: "Coins", label: "Token policy", desc: "Restrict to specific tokens and chains" },
      { icon: "ShieldCheck", label: "Duplicate guard", desc: "Catch accidental double payments" },
    ],
    dataSnippet: `RISK CHECK — 5 gates · 4 pass · 1 block
✓ Budget cap      50 USDC monthly · 50 used
✓ Whitelist       alice / charlie / data-api
✓ Single limit    ≤ 25 USDC · max 20
✓ Token policy    USDC · sepolia testnet
✗ Duplicate guard bob.eth not in whitelist`,
  },
  {
    no: "03",
    key: "approval",
    title: "Approval",
    accent: "#B5FF4D",
    accentSoft: "rgba(181,255,77,0.08)",
    accentBorder: "rgba(181,255,77,0.32)",
    eyebrow: "Stage 03 · Approval",
    headline: "A human approves\nthe final move. Always.",
    lead: "No autonomous transfers. Ever. A real person reviews the cleared queue, sees exactly what's being paid and why, and clicks Approve & Execute. Blocked items stay blocked — with their reasons right there.",
    paragraphs: [
      "AI can draft the plan, run the risk check, and prepare the execution — but it cannot sign the transaction. Human-in-the-loop isn't a setting you toggle off. It's the architecture.",
      "The approval view shows every line item with its risk status, reason, and amount. The operator sees the full picture in one screen. No spreadsheets, no email threads, no \"wait, who approved this?\"",
    ],
    capabilities: [
      { icon: "CheckCircle", label: "One-click approve", desc: "Clear queue, single action" },
      { icon: "Eye", label: "Blocked visibility", desc: "Rejected items stay visible with reasons" },
      { icon: "ScrollText", label: "Audit trail", desc: "Every approval logged with approver identity" },
      { icon: "Layers", label: "Batch execution", desc: "Approve multiple payments in one go" },
    ],
    dataSnippet: `APPROVAL QUEUE — 3 approved · 1 blocked
APPROVED:
  alice.eth    20 USDC  ✓
  charlie.eth  10 USDC  ✓
  data-api      5 USDC  ✓
BLOCKED:
  bob.eth      15 USDC  ✗ not in whitelist

[ Approve & Execute · 35 USDC ]`,
  },
  {
    no: "04",
    key: "wallet",
    title: "Wallet",
    accent: "#60A5FA",
    accentSoft: "rgba(96,165,250,0.07)",
    accentBorder: "rgba(96,165,250,0.28)",
    eyebrow: "Stage 04 · Wallet",
    headline: "Cobo Agentic Wallet,\ninside a policy boundary.",
    lead: "AgentCFO never holds keys. Every approved payment routes through Cobo Agentic Wallet — a policy-bound agent wallet that enforces the rules at the protocol level, not just in the UI.",
    paragraphs: [
      "The wallet is configured with the same rules as the risk engine: same whitelist, same budget, same token restrictions. Even if something slips through the app layer, the wallet catches it. Defense in depth.",
      "Every transfer returns a real transaction hash on Sepolia testnet. You can trace it, verify it, audit it. The demo uses testnet funds — zero real money at risk — but the flow is identical to mainnet.",
    ],
    capabilities: [
      { icon: "Wallet", label: "Cobo Agentic Wallet", desc: "Policy-enforced agent wallet" },
      { icon: "TestTube", label: "Testnet execution", desc: "Real tx hashes, zero real funds at risk" },
      { icon: "Settings", label: "Configurable policy", desc: "Wallet rules synced with risk engine" },
      { icon: "Link", label: "Tx hash traceability", desc: "Every payment on-chain and auditable" },
    ],
    dataSnippet: `WALLET EXECUTION — 3 transfers
0xae3f...2c91  → alice.eth    20 USDC  ✓ confirmed
0x8b21...4ee0  → charlie.eth  10 USDC  ✓ confirmed
0x4c7d...91b3  → data-api      5 USDC  ✓ confirmed

Policy: testnet-simulated · agent-wallet-bound`,
  },
  {
    no: "05",
    key: "audit",
    title: "Audit",
    accent: "#C084FC",
    accentSoft: "rgba(192,132,252,0.07)",
    accentBorder: "rgba(192,132,252,0.28)",
    eyebrow: "Stage 05 · Audit",
    headline: "Every run writes a\nsettlement report.",
    lead: "Every run produces a settlement report — not as an afterthought, but as the natural output of the pipeline. Tx hash, recipient, risk result, approver, blocked reasons: everything in one exportable document.",
    paragraphs: [
      "The report isn't a spreadsheet you compile at month-end. It's generated automatically at the moment of execution — with every decision, every check, every approval logged in real time. Audit-grade by default.",
      "Export as PDF or JSON. Share with accountants, auditors, or the community. The entire payment history is transparent, traceable, and tamper-evident because every hash lives on-chain.",
    ],
    capabilities: [
      { icon: "FileText", label: "Auto-generated", desc: "Report created at execution time" },
      { icon: "Download", label: "Exportable", desc: "PDF or JSON output" },
      { icon: "Shield", label: "On-chain proof", desc: "Every tx hash included and verifiable" },
      { icon: "GitCommit", label: "Full traceability", desc: "From contribution record to settlement" },
    ],
    dataSnippet: `SETTLEMENT REPORT — audit-2026-06-09
Approved: 3    Blocked: 1    Settled: 35 USDC

ON-CHAIN PROOF:
0xae3f...2c91  ✓
0x8b21...4ee0  ✓
0x4c7d...91b3  ✓

RISK: 4 pass · 1 block
APPROVER: human`,
  },
];

export function getPipelineStages(lang: "en" | "zh"): Stage[] {
  return lang === "zh" ? STAGES_ZH : STAGES;
}
