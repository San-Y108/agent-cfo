# AgentCFO Frontend — CLAUDE.md

> frontend 总纲。新会话进入 `agent-cfo/frontend` 时，先读本文件，再读 `checklist.md` 与 `backend-integration.md`。
> 本文件只描述 **frontend** 范围；后端契约真相在 `app/`（见第 6 节）。

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

- **Landing Page** — 项目介绍 / hero / bento
- **Demo Console** — `/demo`，命令中心式工作流展示
- **workflow 展示** — 让评委看见 Agent「思考 → 检查 → 执行」，不是只做表格
- **mock / real mode 切换** — env 驱动（见第 6 节、`backend-integration.md`）
- **API adapter** — `lib/api/*`，对接后端 4 个端点
- **Vercel deployment**
- **demo presentation clarity** — 评委可理解性是前端核心职责，不只是页面美化

## 4. 技术栈 & 目录

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · lucide-react · pnpm

```
app/         路由：page.tsx (Landing) / demo/page.tsx (Demo Console) / layout / globals.css
components/  landing · demo · payment · risk · approval · execution · audit · workflow · ui
lib/api/     adapter 层：client / payment / risk / caw / audit / types（后端契约镜像）
lib/mock/    backend-shaped mock 数据（mock 与 real 共用同一套 TS 类型）
lib/workflow derive(视图派生) / run-demo-flow(real 调用链) / demo-state-machine / demo-steps / workflow-copy
lib/demo/    demo-data（Demo Console 统一 mock 数据源）
```

## 5. 当前状态

- ✅ frontend 已迁入团队仓库 `agent-cfo/frontend`（branch `feat/frontend-bootstrap`；迁移 commit `362f1bc`，契约对齐 commit `789e4c8`）。
- ✅ Vercel 生产部署：**https://agentcfo-frontend.vercel.app**（project `agentcfo-frontend`，公开可访问）。
- ⚠️ **当前线上为 mock mode**（`NEXT_PUBLIC_DEMO_MODE=mock`）。
- ✅ API **types / adapter / mock shape 已以后端 contract 对齐**（mock 与 real 同构同值，已用真实后端 HTTP 链路验证）。
- ✅ **`/` 落地页 Hero 已改造为 Velorix IIC 风格**（`components/landing/velorix-hero.tsx`，纯 CSS 动效；commit `9be4ace`）；Hero 下方 scroll 板块（Problem / Workflow / …）待补。
- ❌ **`/demo` real mode UI 接入尚未完成**：页面仍读静态 `demoData`；`runDemoFlow()` 调用链已就绪但页面未切换（无 loading / error 态）。
- 🔜 **下一主任务：`/demo` redesign**（静态看板 → 分步揭示的 Agent 工作流演示，用 HeroUI v3 + Aceternity）。换模型/新会话先读 `HANDOFF.md`。

## 6. API contract 规则（重要）

- **代码级真相（最高优先）**：后端 `app/models.py`、`app/routers/payments.py`、`tests/test_mvp_flow.py`。字段名 / 枚举值 / response 形状一律以这三处为准。
- **产品级来源**：规划文档「建议 API」与 Demo 故事（提供产品语义和命名意图）。
- 后端是唯一 contract source of truth。代码与规划文档不一致时**以后端代码为准**（例：规划文档示例用 `risk` 单数 + `riskLevel:"Medium"`，后端实际是 `risks: string[]` + `riskLevel` 枚举 Unchecked/Low/Medium/High/Blocked）。
- **禁止自行发明 endpoint / field / response wrapper**。历史上的 `ApiResponse<T>` 信封、`/api/payment-plans`、`/api/caw/status` 等幻想接口已全部移除，不要再引入。
- 如需新增 / 修改 API：**先输出提案（端点、入参、出参、影响面），等确认后再写代码**，不直接动手。

## 7. 工作边界

- 正式前端开发**只在 `frontend/` 内**进行。
- 如需修改 `frontend/` 外文件（后端 `app/`、仓库根目录、部署配置等），**先停止并向用户申请**。
- 不修改后端、根目录配置、部署配置，除非得到明确授权。
- 默认执行范式：Explore → Plan → Execute → Verify → Summarize。非平凡改动先自检（`pnpm typecheck` / `pnpm build` / smoke），**不伪造验证结果**：没运行就是未验证。

## 8. 关键资产 / Key Assets（项目记忆）

| 项 | 值 |
|---|---|
| 仓库 | `github.com/San-Y108/agent-cfo`（owner 队友 San-Y108；你是 write 协作者 `Aafff623`，非 admin；`main` 无保护） |
| 分支 / PR | `feat/frontend-bootstrap` → **PR #1** OPEN 未合并 → `main` |
| **Vercel 正式 URL** | **https://agentcfo-frontend.vercel.app**（production，mock mode） |
| Vercel project / scope | `agentcfo-frontend` / `laiyif68-5443s-projects`；Framework = **Next.js（必须）**；Deployment Protection = OFF；部署 `vercel --prod` |
| Vercel 生产 env | `NEXT_PUBLIC_DEMO_MODE=mock`、`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` |
| 后端 | `app/` FastAPI，4 接口，`pytest` 12 passed；**Render URL = TODO**；CORS 未配 |
| 本地 dev | `PORT=3100 pnpm dev`（⚠️ `:3001` 有陈旧 Service Worker 会白屏；`:3000` 被占用） |
| Demo 数据 | Alice 20 / Bob 15(blocked) / Charlie 10 / Data API 5 USDC；预算 50、单笔限额 25 |

> 换模型 / 新会话交接：**先读 `HANDOFF.md`**（含完整任务时间线、踩坑记录、下一步与 `/demo` redesign 输入）。
