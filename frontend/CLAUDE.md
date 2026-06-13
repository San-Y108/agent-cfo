# AgentCFO Frontend — CLAUDE.md

> frontend 总纲。新会话进入 `agent-cfo/frontend` 时，**先读本文件**，再读 `HANDOFF.md`（索引）、`checklist.md`（任务态）、`backend-integration.md`（联调）。
> 本文件只描述 **frontend** 范围；后端契约真相在仓库根 `app/`（见第 6 节）。

## 1. 项目定位

- **AgentCFO ｜ DAO AI 财务官**：面向 Web3 小团队 / DAO 的 AI 财务官。读取贡献记录 + 预算规则，生成付款计划，执行风险检查，人工确认后通过 **Cobo Agentic Wallet (CAW)** 在受控边界内执行测试网付款，最后输出可审计结算报告。
- 赛道：**Cobo / Agentic Commerce**。核心命题：AI Agent 可以参与真实经济活动，且资金操作必须经过 CAW。
- Slogan：*Give every DAO an AI CFO with a controlled wallet.*

## 2. 核心 demo loop

```
contribution records   贡献记录 / 订阅账单
   ↓
payment plan           AI 生成付款计划（含付款原因）
   ↓
risk check             预算 / 白名单 / 单笔限额 / 重复付款 / token 检查
   ↓
human approval         人工确认（blocked 项不可执行）
   ↓
CAW execution          Cobo Agentic Wallet 受控执行（测试网）
   ↓
audit report           tx hash / Agent Wallet / 付款状态 / 剩余预算
```

Demo 场景（与 mock 数据一致）：Alice 20 / Bob 15 / Charlie 10 / Data API 5 USDC；月预算 50、单笔限额 25。**Bob 钱包不在白名单 → blocked**，其余 3 笔通过检查并在人工确认后执行。

## 3. frontend 负责范围

- **Landing Page** — `/`，营销叙事 + Hero + scroll sections
- **Console Command Center** — `/console`，Agent-first 工作台（Treasury / Wallets / Analytics / Policy）
- **workflow 展示** — 让评委看见 Agent「思考 → 检查 → 执行」
- **mock / real mode 切换** — env 驱动（见第 6 节、`backend-integration.md`）
- **API adapter** — `lib/api/*`，对接后端 4 个端点
- **Vercel deployment**
- **demo presentation clarity** — 评委可理解性是前端核心职责

> **团队边界**：本仓库分 PM / 前端 / 后端 / 合约。我们**只改 `frontend/`**；碰 `app/`、根目录、部署配置须先申请。

## 4. 技术栈 & 目录

Next.js 16 (App Router / Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · GSAP · recharts · lucide-react · @phosphor-icons/react · pnpm

```
app/
  page.tsx                    Landing `/`
  console/
    layout.tsx                Console 壳（navbar + drawer + 背景）
    page.tsx                  Agent Hub `/console`（默认首页）
    treasury/page.tsx         Treasury 全页路由
    wallets/page.tsx          Wallets 全页路由
    analytics/page.tsx        Analytics 全页路由
    policy/page.tsx           Policy 全页路由
    agent/page.tsx            Agent 别名路由

components/
  landing/                    Landing 区（锁定；console 可借用组件，勿随意改）
  console/                    ★ 主业务域
    modules/                  treasury · wallets · analytics · policy
    command-deck/             HUD primitives（HudLabel · Scanline · …）
    agent-hub.tsx             中心 Agent + 聊天
    edge-capsule.tsx          边缘胶囊导航（分屏面板入口）
    module-panel.tsx          常驻分屏面板壳
    navbar.tsx · drawer.tsx · …
  ui/                         通用 UI + aceternity 移植

lib/
  api/                        4 端点 adapter（契约镜像）
  mock/                       后端形状 mock
  workflow/                   runDemoFlow · derive · state-machine
  demo/console-mock.ts        Console 统一 mock 数据
  console/console-state.tsx   Console 全局状态（面板开合等）
  i18n/                       自定义双语 context + dict.ts
  types/console.ts            Console 业务类型
  constants/                  路由 / 项目常量
  gsap.ts                     GSAP ScrollTrigger 配置
```

## 5. 当前状态（2026-06-13）

- ✅ frontend 在团队仓库 `agent-cfo/frontend`，当前分支 **`main`**
- ✅ Vercel 生产：**https://agentcfo-frontend.vercel.app**（mock mode）
- ✅ API types / adapter / mock shape 已对齐后端 contract
- ✅ Landing `/`：Velorix Hero + scroll sections 完成
- ✅ Console `/console`：Phase 7.3 Stage Shell + Phase 7.4 Command Deck 视觉统一
  - `ModuleStageLayout` 三栏 + DetailDeck；`components/console/stages/*`
  - 对齐报告：`docs/reports/console-module-alignment-audit-2026-06-13.md`
- ⚠️ **线上 mock mode**（`NEXT_PUBLIC_DEMO_MODE=mock`）
- ❌ **real mode UI** — Treasury 已接 API（`console-state`）；Vercel 仍为 mock；Render URL 待填
- 🔜 **下一主任务**：本地 real 冒烟 → Render URL → Vercel env 切换

> 进度细节以 `docs/plans/console-stage-layout-checklist.md` 为准。

## 6. API contract 规则（重要）

- **代码级真相（最高优先）**：`app/models.py`、`app/routers/payments.py`、`tests/test_mvp_flow.py`
- **产品级来源**：规划文档「建议 API」与 Demo 故事
- 后端是唯一 contract source of truth
- **禁止自行发明 endpoint / field / response wrapper**
- 如需新增 / 修改 API：**先输出提案，等确认后再写代码**

## 7. 工作边界

- 正式前端开发**只在 `frontend/` 内**进行
- 如需修改 `frontend/` 外文件，**先停止并向用户申请**
- **Landing 锁定**：不随意改 `app/page.tsx`、`components/landing/*`（除非明确授权）
- 执行范式：Explore → Plan → Execute → Verify → Summarize
- 验证：`pnpm typecheck` / `pnpm build`；**不伪造验证结果**

## 8. 设计规范（Console + Landing 共用）

| 项 | 值 |
|---|---|
| 主背景 | `#0D0D0D` |
| 品牌色 lime | `#B5FF4D` |
| Stage 五色 | cyan `#5EEAD4` / coral `#FB7185` / lime `#B5FF4D` / blue `#60A5FA` / violet `#C084FC` |
| 字体 | Inter（正文）+ Courier New（mono / hash） |
| 动效优先级 | GSAP ScrollTrigger（Treasury 水平滚动）> framer-motion > CSS |

## 9. 关键资产

| 项 | 值 |
|---|---|
| 仓库 | `github.com/San-Y108/agent-cfo` |
| 分支 | `main` |
| Vercel URL | **https://agentcfo-frontend.vercel.app** |
| Vercel project | `agentcfo-frontend` / Framework = **Next.js** |
| 生产 env | `NEXT_PUBLIC_DEMO_MODE=mock`、`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` |
| 后端 | FastAPI 4 接口，`pytest` 12 passed；**Render URL = TODO**；CORS 未配 |
| 本地 dev | `PORT=3100 pnpm dev`（⚠️ `:3001` 有陈旧 SW 会白屏） |
| Demo 数据 | Alice 20 / Bob 15(blocked) / Charlie 10 / Data API 5 USDC |

## 10. 新会话阅读顺序

1. 本文件 `CLAUDE.md`
2. `HANDOFF.md` → 跟随链接读最新 `docs/handoff/phase-7-1-console-handoff.md`
3. `docs/plans/console-upgrade-checklist.md`（末尾 Phase 6/7）
4. `backend-integration.md`（联调时）
5. `checklist.md`（任务勾选）

## 11. 代码图谱（GitNexus）

仓库已索引 GitNexus（`npx gitnexus analyze`）。探索代码时可用：
- 仓库根 `AGENTS.md` — GitNexus 工具说明
- `npx gitnexus status` — 检查索引是否过期
- MCP 工具（若已配置）：`query` / `context` / `impact`

索引过期时：在仓库根运行 `npx gitnexus analyze`。
