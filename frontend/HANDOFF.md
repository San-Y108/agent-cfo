# AgentCFO Frontend — HANDOFF（交接内核 / 给 Kimi K2.6）

> 这是一份**冷启动交接文档**。新模型（Kimi K2.6）接手前端 UI redesign 前，**先读本文件**，再读 `CLAUDE.md`（总纲）、`checklist.md`（任务态）、`backend-integration.md`（联调）。
> 你的角色：Claude Code 执行层 → 现在交给 Kimi K2.6，负责后续 `/demo` 重设计与搜索/落地。
> 生成时间：2026-06-08。生成方：Claude Opus（上一棒）。

---

## 0. ⚠️ 必读重点（最容易踩坑/最容易丢的上下文）

1. **环境是 Windows + Git Bash（MSYS）**，真实工作目录是 `/d/OneDrive/Desktop/threetwoa/my-competition/agent-cfo`。**harness 自报的 macOS / `/Users/...` 路径是假的，不要信**。所有命令用 `/d/...` 路径。
2. **`localhost:3001` 有一个陈旧 Service Worker（来自你之前跑过的某个 Vite/PWA app，带 codemirror+xterm）会劫持页面 → 整页花白白屏**。这不是代码 bug。规避：**用 `PORT=3100 pnpm dev` 在 3100 跑**（SW 按 origin 隔离，3100 干净），或在 DevTools → Application → Service Workers → Unregister + Clear site data。端口 3000 也被另一进程占着。
3. **后端是唯一 contract 真相源**：`app/models.py` / `app/routers/payments.py` / `tests/test_mvp_flow.py`。字段名/枚举/响应形状以这三处为准。**禁止自行发明 endpoint / field / response wrapper**；要改 API 先输出提案再动。
4. **工作边界**：只动 `frontend/`。要碰 `frontend/` 外（后端 `app/`、仓库根、部署配置）**先停下来问用户**。不改后端/根配置/部署配置，除非明确授权。
5. **Vercel Framework Preset 必须是 Next.js**（曾是 null → 全站 404；已修）。改任何项目设置后**必须 `vercel --prod` 重新部署才生效**。
6. **不删除现有动画/视频资源**。`/` 的 Hero（`components/landing/velorix-hero.tsx`）是 **纯 CSS 动效，不要给它加 Framer Motion**（保持 Velorix 原样）；`/demo` 可以用 Framer Motion（已装）。
7. **协作流程**：子分支 `feat/frontend-bootstrap` → PR #1 → 队友 review → 合并。**不要直接 push main**（虽然 main 无保护、技术上能）。
8. **无浏览器工具**：上一棒没有可调用的浏览器/截图工具，验证靠 `curl` + 让用户肉眼看。Kimi 接手后请先确认自己是否有浏览器/截图能力；没有就照旧（curl 验 HTML + 请用户看）。
9. **黑客松优先级**：创意性 + 前端观感 + demo 视频 + 路演极其重要。`/demo` 现在太粗糙，是下一个主任务。

---

## 1. 项目一句话 & 两个面

**AgentCFO ｜ DAO AI 财务官**（Cobo Agentic Commerce 赛道）：读贡献记录+预算规则 → 生成付款计划 → 风险检查 → 人工确认 → Cobo Agentic Wallet 受控执行 → 输出可审计报告。Slogan：*Give every DAO an AI CFO with a controlled wallet.*

- **`/` 落地页（marketing）**：讲"为什么/是什么"。现在只有 Hero（已 Velorix 化），**下面还要补可滚动的板块**（见 §6 TODO）。
- **`/demo` Demo Console（product）**：讲"它真能做事"，一个 dashboard 跑完整 workflow。**核心功能就这一条 loop**，不拆成多页。

---

## 2. 关键资产 / 项目记忆（Key Assets）

| 项 | 值 |
|---|---|
| 仓库 | `github.com/San-Y108/agent-cfo`（public，**owner = 队友 San-Y108**） |
| GitHub 身份 | `Aafff623`（**write 协作者，非 admin**；`main` **无分支保护**） |
| 当前分支 | `feat/frontend-bootstrap` |
| PR | **#1** `feat/frontend-bootstrap → main`，**OPEN 未合并**，mergeable |
| 分支领先 main 的 commit | `362f1bc` 迁移 → `789e4c8` 契约对齐 → `bc661a9` 文档 → `9be4ace` Hero → (本次 docs) |
| **Vercel 正式前端 URL** | **https://agentcfo-frontend.vercel.app**（production，**mock mode**，公开） |
| Vercel project / scope | `agentcfo-frontend` / `laiyif68-5443s-projects` |
| Vercel 身份 | `laiyif`（注意：与 GitHub `Aafff623` 是同一人不同号） |
| Vercel 关键设置 | Framework Preset = **Next.js（必须保持）**；Deployment Protection = **OFF** |
| 部署命令 | 在 `frontend/` 下 `vercel --prod --yes`（远端构建；设置变更后需重部署） |
| Vercel 生产 env | `NEXT_PUBLIC_DEMO_MODE=mock`、`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` |
| 后端 | `app/` FastAPI，4 接口已实现，`pytest` **12 passed** |
| **后端 Render URL** | **TODO（未知）** |
| 后端 CORS | **未配**；需允许 `https://agentcfo-frontend.vercel.app` + `http://localhost:3000` + `http://localhost:3100` |
| 本地 dev | `PORT=3100 pnpm dev`（⚠️ 别用 3001：陈旧 SW 白屏；3000 被占） |
| 后端本地 | `.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000`；测试 `.venv/Scripts/python.exe -m pytest` |
| Hero 背景视频 | 远程 CloudFront mp4（`velorix-hero.tsx` 内 `BG_VIDEO`，机器人+手视觉，远程依赖网络） |
| Demo 场景数据 | Alice 20 / **Bob 15（blocked，钱包不在白名单）** / Charlie 10 / Data API 5 USDC；月预算 50、单笔限额 25 |

---

## 3. 4 个后端端点 ↔ 前端 adapter

| 方法 | 路径 | adapter (`lib/api/`) | 入参 → 出参 |
|---|---|---|---|
| POST | `/api/payment-plan` | `payment.ts createPaymentPlan` | `PaymentPlanRequest` → `PaymentPlan` |
| POST | `/api/risk-check` | `risk.ts runRiskCheck` | `RiskCheckRequest` → `RiskCheckResult` |
| POST | `/api/execute-payment` | `caw.ts executePayment` | `ExecutePaymentRequest` → `PaymentExecutionResult` |
| GET | `/api/audit-report/{auditReportId}` | `audit.ts getAuditReport` | → `AuditReport` |

real 调用链编排在 `lib/workflow/run-demo-flow.ts` 的 `runDemoFlow()`。mock 模式 `request()` 会抛错（防误打后端）。

---

## 4. 历史任务时间线（这个 session 做过什么）

1. **工作区校准**（只读）：识别出真实环境是 Windows/git-bash（非 macOS），确认仓库结构（后端 `app/`、前端 `frontend/`、`docs/pm/`、`tests/`）。
2. **API 契约对齐**（commit `789e4c8`）：以后端为准，重写 `lib/api/{types,client,payment,risk,caw,audit}`、把 `lib/mock/*` 重做成后端形状、新增 `lib/workflow/{derive,run-demo-flow}`、改了 7 个 `/demo` 组件 + demo 页 + demo-data。验证：typecheck/build/pytest 12/真实 HTTP 链路冒烟全过。删除了旧的 `ApiResponse` 信封与 `/api/payment-plans`、`/api/caw/status` 等幻想接口。
3. **Vercel 部署**：push 分支 → 建 project `agentcfo-frontend` → 设 env → `vercel --prod`。踩坑链：① 401（Deployment Protection 开着 → 用户在 dashboard 关）② 404（Framework Preset=null → 用户设成 Next.js → 重部署）→ 最终 mock URL 可公开访问。
4. **文档规范化**（commit `bc661a9`）：`CLAUDE.md` / `checklist.md` / `backend-integration.md`。
5. **PR #1**：`feat/frontend-bootstrap → main`，OPEN 未合并。
6. **Velorix Hero 改造**（commit `9be4ace`）：把 `/` 落地页 Hero 改成 Velorix IIC 风格（保留视觉/动效，只换 AgentCFO 文案 + CTA 跳 `/demo`），纯 CSS、无新增依赖、旧 landing 组件保留未删。期间排查白屏 → 定位为 `:3001` 陈旧 SW → 改用 `:3100`。
7. **（本次）** 交接文档 + 资产收束；准备切换到 Kimi K2.6 做 `/demo` redesign。

---

## 5. 当前 `/demo` 设计问题（redesign 的输入清单）

当前 `/demo` 是个**静态深色看板**，问题：
1. **是"静态看板"不是"工作流演示"**：plan/risk/approval/execution/audit 一次性全平铺，无过程感（规划文档要"让评委看见 Agent 思考→检查→执行"）。
2. **没有真交互、按钮没实现**：缺 `Generate Plan` / `Approve & Execute` / 分步推进；Human Approval 只读，点不动。
3. **信息密度爆炸、视觉层级弱**：一页 6 大块同质深色卡，没焦点没节奏。
4. **和 Hero 视觉断层**：Hero 黑色电影感高级，dashboard 像普通后台。
5. **mock 痕迹像 debug 面板**（Simulated / cawRequestId / mock-testnet 呈现粗糙）。
6. **没有可讲解的故事动线**（路演需要"输入→AI生成→拦截 Bob→人工批准→执行→审计"的视觉主线）。
7. **顶部 7 步 timeline 是装饰**（全 completed 静态，不反映推进）。

**redesign 方向（与用户已对齐）**：把 `/demo` 从静态看板 → **分步揭示的 Agent 工作流演示**（Run 触发，带 motion 依次揭示，Bob 标红被拦，真交互按钮，能跟着路演讲），保持黑色高级感。

---

## 6. 下一步 TODO（按优先级）

1. **`/demo` redesign（主任务）**：先出重设计方案（信息架构 + 分步动线 + 各区用哪些组件 + 交互按钮清单），用户过目后实现。仍用 mock 数据（real 联调等 Render）。
2. **`/` 落地页 scroll sections**：Hero 下方补 `Problem / Workflow / Risk Guardrails / Wallet Execution / Audit Trail` 锚点板块（nav 平滑滚动到对应 section）。营销叙事，不是功能页。
3. **real mode UI 接入**：`/demo` 接 `runDemoFlow()` + loading/error + mock/real 切换（**等后端 Render URL + CORS**）。
4. **收尾**：更新过期的 `README.md`（仍写旧 URL/placeholder）；清 `.env.example` 遗留变量（`NEXT_PUBLIC_TESTNET_NAME` / `NEXT_PUBLIC_AGENT_WALLET_ADDRESS`，已不被读取）。
5. **PR #1** 待队友 review 后合并。

### UI 资产怎么用（用户指定）
- **HeroUI v3** → 交互组件骨架（button / tabs / modal / progress / table）。
- **Aceternity** → 视觉动效层（spotlight / animated beams / 卡片揭示），做冲击力。
- **Mkdirs Template** → 大概率用不到（偏 directory/SaaS）。
- **MotionSites 高级 Prompt** → 用户会提炼精炼片段给你，在页面里补充点缀。
- 动效分层：Hero 纯 CSS（别动）；`/demo` 用 Framer Motion（已装，不新增依赖）。

---

## 7. 关键文件地图

```
frontend/
  CLAUDE.md                 总纲（先读）
  checklist.md              任务态（A~E + E1 阶段）
  backend-integration.md    联调 / CORS / 端点
  HANDOFF.md                本文件
  app/page.tsx              渲染 VelorixHero（/ 落地 Hero）
  app/demo/page.tsx         Demo Console（★ 要 redesign 的页面）
  components/landing/
    velorix-hero.tsx        ★ Hero（Velorix 移植，纯 CSS，"use client"，勿加 Framer Motion）
    landing-hero / landing-bento / mini-command-preview   旧 landing（未用，勿删）
  components/{demo,payment,risk,approval,execution,audit,workflow,ui}/   /demo 各区
  lib/api/{types,client,payment,risk,caw,audit}.ts   契约对齐 adapter（types 镜像后端）
  lib/mock/*                后端形状 mock 数据
  lib/workflow/{derive,run-demo-flow,demo-state-machine,demo-steps,workflow-copy}.ts
  lib/demo/demo-data.ts     统一 mock 数据源
```

技术栈：Next 16 (App Router/Turbopack) · React 19 · TS strict · Tailwind v4 · Framer Motion 12 · lucide-react 1.17.0 · pnpm。

---

## 8. 验证 & 提交规范

- 验证：`pnpm typecheck`、`pnpm build`、`PORT=3100 pnpm dev` 后 `curl` 看 HTML / 请用户肉眼看。后端：`.venv/Scripts/python.exe -m pytest`。
- 提交：改完→自检→commit→push 到 `feat/frontend-bootstrap`（自动进 PR #1）。**用户习惯先 review 再 commit**，代码改动先让用户看再提交。
- 多文件/架构/依赖/安全相关改动：先停下报告，不擅自推进。没运行就是未验证，不要伪造结果。
