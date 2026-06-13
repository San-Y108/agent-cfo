# AgentCFO Pitch - Design Spec

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | AgentCFO Pitch |
| **Canvas Format** | PPT 16:9 (1280×720) |
| **Page Count** | 14 |
| **Design Style** | B) General Consulting + Dark Fintech / Web3 |
| **Target Audience** | 比赛评委、Web3/DAO 从业者、Cobo Agentic Commerce 赛道评审 |
| **Use Case** | 竞赛路演 / 产品 Demo 介绍 |
| **Created Date** | 2026-06-13 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280×720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left/right 60px, top/bottom 50px |
| **Content Area** | 1160×620 |

---

## III. Visual Theme

### Theme Style

- **Style**: B) General Consulting + Dark Fintech / Web3
- **Theme**: Dark theme
- **Tone**: 专业、可信、技术感、受控自动化

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#0B1220` | 页面主背景 |
| **Secondary bg** | `#111827` | 卡片、区块背景 |
| **Primary** | `#22D3EE` | 标题装饰、关键流程、图标强调 |
| **Accent** | `#8B5CF6` | 数据高亮、链接、次要强调 |
| **Secondary accent** | `#1E3A5F` | 渐变过渡、分隔区域 |
| **Body text** | `#F1F5F9` | 正文 |
| **Secondary text** | `#94A3B8` | 说明、注释 |
| **Tertiary text** | `#64748B` | 页脚、辅助信息 |
| **Border/divider** | `#1E293B` | 卡片边框、分隔线 |
| **Success** | `#10B981` | 通过、可执行状态 |
| **Warning** | `#F59E0B` | 风险、阻断状态 |

### AI Image Strategy

- **Image Rendering**: vector-illustration
- **Image Palette**: cool-corporate

---

## IV. Typography System

**Typography direction**: modern CJK sans + tech consulting body

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `"Microsoft YaHei"` | `Arial` | `sans-serif` |
| **Body** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Emphasis** | `"Microsoft YaHei"` | `Georgia` | `serif` |
| **Code** | — | `Consolas, "Courier New"` | `monospace` |

**Per-role font stacks**:
- Title: `"Microsoft YaHei", Arial, sans-serif`
- Body: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`
- Emphasis: `Georgia, "Microsoft YaHei", serif`
- Code: `Consolas, "Courier New", monospace`

**Baseline**: Body font size = 20px

---

## V. Layout Principles

- Z-pattern flow, left-to-right for process pages
- Card grid for features and API tables
- Full-width flow diagram for architecture
- Cover: hero title left, decorative gradient right
- Page numbers bottom-right, 12px tertiary text

---

## VI. Icon System

- **Library**: tabler-outline
- **Stroke width**: 2
- **Inventory**: wallet, shield-check, users, chart-bar, file-report, bolt, circle-check, alert-triangle, api, building-bank, route, lock

---

## VII. Visualization

No chart template pages. Flow diagrams and tables rendered as native SVG.

---

## VIII. Image Resource List

| ID | Filename | Purpose | Acquire Via | Status | Type |
| --- | --- | --- | --- | --- | --- |
| cover_bg | cover_bg.jpg | 封面右侧抽象 Web3/财务科技氛围图 | ai | Pending | Decorative |

---

## IX. Content Outline

### P01 — Cover (anchor)
- Title: AgentCFO
- Subtitle: 给每个 DAO 一个带受控钱包的 AI 财务官
- Tagline: Cobo Agentic Commerce 赛道
- Right: cover_bg decorative image

### P02 — Problem (dense)
- Title: DAO 小团队的付款痛点
- 4 pain points: 人工表格易错、支出不透明、多签效率低、全自动有风险

### P03 — Solution (breathing)
- Title: AgentCFO 的核心边界
- 5 role cards: Agent / Risk Engine / Human Approval / CAW / Audit Report

### P04 — Core Flow (dense)
- Title: 端到端付款闭环
- Flow: Contribution Records → Payment Plan → Risk Check → Human Approval → CAW Execution → Tx Hash → Audit Report

### P05 — Key Features (dense)
- Title: 六大核心能力
- 6 feature cards with icons

### P06 — Architecture (breathing)
- Title: 系统架构
- Layers: Frontend → Backend API → Agent/LLM → Risk Engine → Human Gate → CAW Adapter → Audit Report

### P07 — Demo Scenario (dense)
- Title: MVP Demo 场景
- Table: Alice 20 USDC, Bob 15 USDC (blocked), Charlie 10 USDC, Data API 5 USDC

### P08 — CAW Evidence (dense)
- Title: Cobo Agentic Wallet 测试网证据
- Key fields: Sepolia/SETH, tx hash masked, request_id, status 900

### P09 — Tech Stack (breathing)
- Title: 技术栈
- Python 3.13+, FastAPI, Pydantic, pytest, SQLite, CAW SDK 0.1.40

### P10 — P0 APIs (dense)
- Title: P0 核心 API
- 5 endpoints with purpose

### P11 — Roadmap (dense)
- Title: 路线图
- P0/P1/P2 milestones with checkmarks

### P12 — Why Cobo (breathing)
- Title: 为什么匹配 Cobo Agentic Commerce
- 3 rows: Agent-Native Payments, Resource Procurement, A2A Treasury

### P13 — Team (dense)
- Title: 团队分工
- 5 roles table

### P14 — Ending (anchor)
- Title: AgentCFO — Controlled AI Treasury for DAOs
- Links: frontend vercel, backend render
- Thank you

---

## X. Speaker Notes

Each page: 30-45 second narration covering key message, demo hook, and safety boundary (mock vs real CAW).

---

## XI. Technical Constraints

- viewBox 0 0 1280 720
- No rgba in gradients; use stop-opacity
- Icons via data-icon placeholders
- Formula policy: text-only
- Mock mode must be clearly labeled where shown
