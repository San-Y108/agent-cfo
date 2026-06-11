# Pipeline Section 重构 — Pretext 深度融合 Handoff

> **Date**: 2026-06-11
> **Branch**: `feat/console-aceternity-upgrade`
> **Scope**: `frontend/components/landing/pipeline-showcase.tsx` 完全重构
> **Status**: 方案已确定，Pretext 已安装验证，待实现

---

## 1. 当前问题诊断

### 1.1 布局问题

当前 Pipeline Section 采用 **左右分栏 + 复杂 Mock UI** 的设计：

```
┌─────────────────────────────────────────┐
│  [eyebrow]                              │
│  [headline — 2 lines]                   │  ┌─────────────────────┐
│  [body — 1 sentence]                    │  │ [复杂 Mock UI 卡片]  │
│                                         │  │ 输入源 + AI解析 +    │
│                                         │  │ 表格 + 按钮...       │
└─────────────────────────────────────────┘  └─────────────────────┘
```

**问题**：
- Mock UI 卡片占据 50% 空间但只是装饰性截图
- 文字内容太少（每 stage 仅 eyebrow + headline + 1 段 body）
- 排版保守，缺乏 editorial 张力
- 5 个 stage 的 Mock UI 各不相同但视觉上喧宾夺主

### 1.2 内容问题

当前每 stage 内容量：

| 元素 | 当前 | 应有 |
|---|---|---|
| Eyebrow | 1 行 | 保留 |
| Headline | 2 行 | 保留，更大 |
| Body | 1-2 句话 | **2-3 段详细描述** |
| Key Points | 无 | **3-4 个 bullet** |
| Data Snippet | 复杂 Mock UI | **简化代码块** |

---

## 2. Pretext 研究结论

### 2.1 什么是 Pretext

**Pretext** (`@chenglou/pretext`) 是 Cheng Lou（React 核心团队）开发的纯 JS/TS 文本测量与布局库。

**核心能力**：
- **无 DOM 文本测量** — 用 Canvas `measureText` 计算文本尺寸，避免 reflow
- **手动行布局** — `prepareWithSegments` + `layoutWithLines` 逐行控制文本
- **富文本内联流** — `prepareRichInline` 混合不同字体/样式的内联文本
- **动态重排** — 宽度变化时实时重新计算文本布局
- **多语言支持** — 完整支持 CJK、阿拉伯语、RTL、Emoji

**已验证可用**：`pnpm add @chenglou/pretext` 安装成功，`pnpm build` 通过。

### 2.2 与 Pipeline Section 的融合点

Pretext 不是特效库，但能为文本动画提供**精确测量基础**：

| Pretext API | 用途 | 效果 |
|---|---|---|
| `prepareWithSegments` + `layoutWithLines` | 预计算每行文本布局 | 逐行揭示动画的精确位置 |
| `prepareRichInline` | 混合样式内联文本 | 段落中高亮关键词 + code spans |
| Canvas 渲染 | 逐字符精确控制 | 字符解码/打乱效果 |
| `measureLineStats` | 获取行数/最大宽度 | 动态容器高度计算 |

---

## 3. 重构方案：Editorial Narrative Flow

### 3.1 设计哲学

> **从 "产品功能展示" 升级为 "编辑叙事流"**
>
> 每个 stage 不是展示一个 UI 截图，而是讲述一个完整的 story：
> 从输入信号 → 处理逻辑 → 输出结果 → 价值主张。

### 3.2 布局重构

**Before（当前）**：
```
┌─────────────────────────────────────────┐
│  Text (40%)  │  Mock UI Card (60%)      │
└─────────────────────────────────────────┘
```

**After（新方案）**：
```
┌─────────────────────────────────────────┐
│                                         │
│     01  ← 超大 ghost number (装饰)      │
│                                         │
│     STAGE 01 · RECORDS                  │
│                                         │
│     Contribution records become         │
│     payout plans.                       │
│     ─────────────────────────────       │
│                                         │
│     [Lead paragraph — 2-3 句]           │
│                                         │
│     [Detail paragraph 1]                │
│     [Detail paragraph 2]                │
│                                         │
│     ┌─────────────────────────┐         │
│     │ ✓ CSV upload            │         │
│     │ ✓ GitHub Issues sync    │         │
│     │ ✓ Notion database       │         │
│     └─────────────────────────┘         │
│                                         │
│     ┌─────────────────────────┐         │
│     │ alice.eth   20 USDC     │  ← 简化 │
│     │ bob.eth     15 USDC     │    data │
│     └─────────────────────────┘   snippet│
│                                         │
└─────────────────────────────────────────┘
```

**关键变化**：
- 每个 stage 占 **100vw × 100vh**，全屏 editorial
- 文本区域 **max-w-3xl（768px）**，居中偏左
- Mock UI 简化为 **底部 data snippet**（类似代码块）
- 背景使用 stage accent 色的 **subtle radial gradient**

### 3.3 内容扩展规范

每 stage 数据结构扩展为：

```typescript
type Stage = {
  no: string;           // "01"
  key: StageKey;
  title: string;
  accent: string;       // e.g. "#5EEAD4"
  accentSoft: string;   // rgba(94,234,212,0.08)
  accentBorder: string; // rgba(94,234,212,0.28)
  
  // ── 保留字段 ──
  eyebrow: string;
  headline: React.ReactNode;
  
  // ── 新增字段 ──
  lead: string;         // 2-3 句核心描述（代替原来的 body）
  paragraphs: string[]; // 2-3 段详细说明
  capabilities: {       // 3-4 个关键能力
    icon: string;       // lucide icon name
    label: string;
    desc: string;
  }[];
  dataSnippet: string;  // 简化的代码/数据片段
};
```

**Stage 01 · Records 扩展示例**：

```typescript
{
  no: "01",
  key: "records",
  title: "Records",
  accent: "#5EEAD4",
  accentSoft: "rgba(94,234,212,0.08)",
  accentBorder: "rgba(94,234,212,0.28)",
  eyebrow: "Stage 01 · Records",
  headline: (
    <>
      Contribution records become<br />
      <span style={{ color: "#5EEAD4" }}>payout plans</span>.
    </>
  ),
  
  // NEW
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
}
```

其他 4 个 stage 按相同模式扩展（详见第 7 节）。

---

## 4. Pretext 深度融合效果

### 4.1 效果一：Line-by-Line Editorial Reveal

**概念**：文本不是直接出现，而是逐行从下方滑入 + 淡入。

**实现**：
1. 使用 Pretext `prepareWithSegments(text, font)` 预计算文本
2. 使用 `layoutWithLines(prepared, maxWidth, lineHeight)` 获取每行文本
3. GSAP ScrollTrigger 触发时，逐行播放动画：
   - 每行从 `opacity: 0, translateY: 20px` 到 `opacity: 1, translateY: 0`
   - 行间 stagger: 0.08s
   - 使用 `ease: "power2.out"`

**Pretext 价值**：精确计算每行文本，确保动画位置完美对齐，无需 DOM reflow。

**文件**：`components/landing/pretext-line-reveal.tsx`

```typescript
// 接口设计
interface LineRevealProps {
  text: string;
  font: string;           // e.g. "16px Inter"
  maxWidth: number;       // container width
  lineHeight: number;     // e.g. 24
  className?: string;
  stagger?: number;       // 行间延迟，默认 0.08
  scrollTrigger?: boolean; // 是否由 ScrollTrigger 触发
}
```

### 4.2 效果二：Character Decode Effect

**概念**：Headline 先显示为随机字符（乱码/干扰），然后逐字符"解码"为正确文本。

**实现**：
1. Pretext `prepareWithSegments` 计算 headline 布局
2. 用 Canvas 渲染 headline 文本
3. 每个字符先显示为随机字符（从 ASCII 33-126 中随机选取）
4. 100ms-300ms 后"解码"为正确字符
5. 从左到右依次解码，stagger: 30ms

**Pretext 价值**：精确测量每个字符宽度，确保 Canvas 渲染时字符位置准确，不会出现错位。

**文件**：`components/landing/pretext-decode-text.tsx`

```typescript
// 接口设计
interface DecodeTextProps {
  text: string;
  font: string;
  className?: string;
  decodeDuration?: number;  // 总解码时间，默认 1200ms
  charStagger?: number;     // 字符间 stagger，默认 30ms
  scrambleChars?: string;   // 乱码字符集，默认 "!@#$%^&*()_+-=[]{}|;:,.<>?"
}
```

### 4.3 效果三：Rich Inline Highlight

**概念**：段落中高亮关键词、code spans、accent 色标签，形成层次分明的阅读体验。

**实现**：
1. 使用 Pretext `prepareRichInline` 处理富文本片段
2. 每个片段可以有不同字体、颜色、break 行为
3. 用 `walkRichInlineLineRanges` 逐行渲染
4. DOM 输出或 Canvas 输出

**文件**：`components/landing/pretext-rich-paragraph.tsx`

```typescript
// 接口设计
interface RichParagraphProps {
  fragments: {
    text: string;
    font?: string;        // 默认继承
    color?: string;       // 文本颜色
    break?: 'normal' | 'never';
  }[];
  maxWidth: number;
  lineHeight: number;
  className?: string;
}
```

### 4.4 效果组合

每个 stage 的动画时序：

```
ScrollTrigger 触发 (进入 stage 视口)
  │
  ├─ 0.0s: Stage number (ghost "01") fade in
  ├─ 0.1s: Eyebrow label slide in
  ├─ 0.3s: Headline — Character Decode Effect 开始
  ├─ 0.8s: Lead paragraph — Line-by-Line Reveal 开始
  ├─ 1.5s: Detail paragraphs — Line-by-Line Reveal
  ├─ 2.2s: Capabilities list — stagger fade in
  └─ 2.8s: Data snippet — typewriter effect
```

---

## 5. 新文件结构

```
frontend/components/landing/
  ├── pipeline-showcase.tsx          ← 现有，保留为参考/备份
  ├── pipeline-editorial.tsx         ← 新：主组件（替换 pipeline-showcase）
  ├── pipeline-stage-data.ts         ← 新：扩展的 stage 数据
  ├── pretext-line-reveal.tsx        ← 新：Pretext 逐行揭示
  ├── pretext-decode-text.tsx        ← 新：Pretext 字符解码
  ├── pretext-rich-paragraph.tsx     ← 新：Pretext 富文本段落
  └── pipeline-data-snippets.tsx     ← 新：简化的 data snippet 组件
```

---

## 6. 实现步骤（推荐顺序）

### Step 1: 准备数据（30 min）
- 创建 `pipeline-stage-data.ts`
- 扩展 5 个 stage 的 lead + paragraphs + capabilities + dataSnippet
- 保留原有 accent/颜色体系

### Step 2: 安装 Pretext + 验证（10 min）
- ✅ 已完成：`pnpm add @chenglou/pretext`
- ✅ 已验证：`pnpm build` 通过

### Step 3: 创建 Pretext 基础组件（60 min）
- `pretext-line-reveal.tsx` — 逐行揭示
- `pretext-decode-text.tsx` — 字符解码
- `pretext-rich-paragraph.tsx` — 富文本段落
- 每个组件独立测试

### Step 4: 创建 Data Snippet 组件（20 min）
- `pipeline-data-snippets.tsx`
- 简化版代码块，类似 terminal output 风格
- 使用 monospace font，accent 色高亮金额

### Step 5: 重构 Pipeline Editorial 主组件（90 min）
- `pipeline-editorial.tsx`
- 全屏 100vh panel 布局
- 整合 Pretext 效果 + GSAP ScrollTrigger
- 保留水平滚动或改为垂直滚动（需决策）

### Step 6: 接入 landing-sections.tsx（10 min）
- 替换 `<PipelineShowcase />` 为 `<PipelineEditorial />`

### Step 7: 测试 + 调优（30 min）
- `pnpm build` 验证
- 滚动性能测试
- 移动端适配
- `prefers-reduced-motion` 降级

---

## 7. 5 个 Stage 内容扩展草稿

### Stage 01 · Records

**Lead**: Every payout starts with a signal. A GitHub issue closed, a Notion row filled, a CSV uploaded — AgentCFO reads them all and turns messy contribution records into structured payment plans.

**Paragraphs**:
1. Contributors don't file expense reports. They write code, design posters, host AMAs. AgentCFO meets them where they work — pulling structured signals from the tools they already use, not adding another form to fill.
2. Each contribution is automatically tagged with a reason, a recipient, and an amount. No manual data entry. No forgotten line items. Just raw signals transformed into a payment plan where every line has a purpose.

**Capabilities**:
- CSV / JSON upload — Drop a spreadsheet, get a structured plan
- GitHub Issues — Closed issues become payable tasks automatically  
- Notion database — Sync contributor rows without leaving Notion

**Data Snippet**:
```
PAYMENT PLAN — 4 entries
alice.eth    20 USDC  wrote event recap
bob.eth      15 USDC  designed poster
charlie.eth  10 USDC  hosted AMA
data-api      5 USDC  subscription · jun
```

---

### Stage 02 · Risk

**Lead**: Before any wallet opens, five policy gates run in sequence. Budget cap, whitelist, single-payment limit, token policy, duplicate guard — each gate gets a vote. One "no" and the payment stops cold.

**Paragraphs**:
1. The risk engine doesn't guess. It applies deterministic rules to every line item: Is the total within budget? Is the recipient on the whitelist? Does any single payment exceed the limit? Is the token allowed? Has this exact payment been requested before?
2. Blocked items never reach the execution queue. They stay visible with their reasons attached — so contributors know why, and operators know what to fix. Transparency is the default, not a feature toggle.

**Capabilities**:
- Budget cap — Monthly spending limits enforced per DAO
- Whitelist — Only approved recipients receive funds
- Single limit — Max amount per transaction, configurable
- Token policy — Restrict to specific tokens and chains
- Duplicate guard — Catch accidental double payments

**Data Snippet**:
```
RISK CHECK — 5 gates · 4 pass · 1 block
✓ Budget cap      50 USDC monthly · 50 used
✓ Whitelist       alice / charlie / data-api
✓ Single limit    ≤ 25 USDC · max 20
✓ Token policy    USDC · sepolia testnet
✗ Duplicate guard bob.eth not in whitelist
```

---

### Stage 03 · Approval

**Lead**: No autonomous transfers. Ever. A real person reviews the cleared queue, sees exactly what's being paid and why, and clicks Approve & Execute. Blocked items stay blocked — with their reasons right there.

**Paragraphs**:
1. AI can draft the plan, run the risk check, and prepare the execution — but it cannot sign the transaction. Human-in-the-loop isn't a setting you toggle off. It's the architecture.
2. The approval view shows every line item with its risk status, reason, and amount. The operator sees the full picture in one screen. No spreadsheets, no email threads, no "wait, who approved this?"

**Capabilities**:
- One-click approve — Clear queue, single action
- Blocked visibility — Rejected items stay visible with reasons
- Audit trail — Every approval logged with approver identity
- Batch execution — Approve multiple payments in one go

**Data Snippet**:
```
APPROVAL QUEUE — 3 approved · 1 blocked
APPROVED:
  alice.eth    20 USDC  ✓
  charlie.eth  10 USDC  ✓
  data-api      5 USDC  ✓
BLOCKED:
  bob.eth      15 USDC  ✗ not in whitelist

[ Approve & Execute · 35 USDC ]
```

---

### Stage 04 · Wallet

**Lead**: AgentCFO never holds keys. Every approved payment routes through Cobo Agentic Wallet — a policy-bound agent wallet that enforces the rules at the protocol level, not just in the UI.

**Paragraphs**:
1. The wallet is configured with the same rules as the risk engine: same whitelist, same budget, same token restrictions. Even if something slips through the app layer, the wallet catches it. Defense in depth.
2. Every transfer returns a real transaction hash on Sepolia testnet. You can trace it, verify it, audit it. The demo uses testnet funds — zero real money at risk — but the flow is identical to mainnet.

**Capabilities**:
- Cobo Agentic Wallet — Policy-enforced agent wallet
- Testnet execution — Real tx hashes, zero real funds at risk
- Configurable policy — Wallet rules synced with risk engine
- Tx hash traceability — Every payment on-chain and auditable

**Data Snippet**:
```
WALLET EXECUTION — 3 transfers
0xae3f...2c91  → alice.eth    20 USDC  ✓ confirmed
0x8b21...4ee0  → charlie.eth  10 USDC  ✓ confirmed
0x4c7d...91b3  → data-api      5 USDC  ✓ confirmed

Policy: testnet-simulated · agent-wallet-bound
```

---

### Stage 05 · Audit

**Lead**: Every run produces a settlement report — not as an afterthought, but as the natural output of the pipeline. Tx hash, recipient, risk result, approver, blocked reasons: everything in one exportable document.

**Paragraphs**:
1. The report isn't a spreadsheet you compile at month-end. It's generated automatically at the moment of execution — with every decision, every check, every approval logged in real time. Audit-grade by default.
2. Export as PDF or JSON. Share with accountants, auditors, or the community. The entire payment history is transparent, traceable, and tamper-evident because every hash lives on-chain.

**Capabilities**:
- Auto-generated — Report created at execution time
- Exportable — PDF or JSON output
- On-chain proof — Every tx hash included and verifiable
- Full traceability — From contribution record to settlement

**Data Snippet**:
```
SETTLEMENT REPORT — audit-2026-06-09
Approved: 3    Blocked: 1    Settled: 35 USDC

ON-CHAIN PROOF:
0xae3f...2c91  ✓
0x8b21...4ee0  ✓
0x4c7d...91b3  ✓

RISK: 4 pass · 1 block
APPROVER: human
```

---

## 8. 技术约束

1. **Pretext 需要 Canvas 2D + Intl.Segmenter** — 现代浏览器都支持，但需检查 SSR（Next.js 静态生成时无 Canvas）
2. **所有 Pretext 组件必须 `"use client"`** — 因为它们依赖 Canvas 和浏览器 API
3. **字体同步** — Pretext 的 `font` 参数必须与 CSS `font` 声明完全一致，否则测量不准
4. **性能注意** — `prepare()` 是 one-time 计算，不要每帧重调用。resize 时只重调用 `layout()`
5. **移动端** — 减少字符解码效果的字符数，或关闭复杂动画
6. **`prefers-reduced-motion`** — 降级为直接显示文本，无动画
7. **不引入 Three.js** — Pretext + Canvas 2D 足够

---

## 9. 决策点（需用户/下一 session 确认）

| # | 决策 | 选项 |
|---|---|---|
1 | **滚动方向** | A) 保持水平滚动（5 个全屏 panel 横向排列）<br>B) 改为垂直滚动（每个 stage 是 100vh 的垂直 section） |
2 | **Pretext 渲染目标** | A) DOM 渲染（用 Pretext 测量，DOM 显示文本 + CSS 动画）<br>B) Canvas 渲染（Pretext 测量 + Canvas 绘制，更灵活但更复杂） |
3 | **字符解码范围** | A) 仅 headline 使用字符解码<br>B) headline + lead paragraph 使用<br>C) 所有文本使用（性能影响？） |
4 | **Mock UI 保留程度** | A) 完全删除，仅用 data snippet 替代<br>B) 保留简化版（如当前 data snippet）<br>C) 保留一个"总览"stage 展示完整 UI |
5 | **数据 snippet 风格** | A) Terminal 风格（绿色 monospace）<br>B) 代码块风格（带语法高亮）<br>C) 数据表格风格（简洁网格） |

---

## 10. 参考资源

- Pretext GitHub: https://github.com/chenglou/pretext
- Pretext Demos: https://chenglou.me/pretext/
- 关键 Demo: **Variable Typographic ASCII**（粒子驱动文本）、**Editorial Engine**（实时文本重排）
- 当前文件: `frontend/components/landing/pipeline-showcase.tsx`（完整实现参考）

---

*Generated by Claude Code on 2026-06-11. Next session: read this file first, resolve 决策点 #1-5, then implement Step 1-7.*
