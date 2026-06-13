# AgentCFO 团队陈述合集

> 六人第一人称对话体，按角色分段。可直接用于视频配音、路演接力或提交材料附录。  
> 个人完整版见 [`members/`](members/)

---

## ZanyK · 指导 / 交付总控

我是 ZanyK，队里的指导和交付总控。

我们参加的是 **AI × Web3 Agentic Builders Hackathon**，Cobo 赛道。选题很实在：DAO 小团队每月给贡献者发钱，靠表格容易错，多签又太慢——所以做了 **AgentCFO**，给每个 DAO 一个带受控钱包的 AI 财务官。

我不写业务主代码，我盯的是整条交付链：GitHub 仓库、README 真相源、任务看板、站会、提交清单。6 月 8 日建好 https://github.com/San-Y108/agent-cfo ，把 `docs/pm/` 管理文档、后端契约、前端 Demo、CAW 证据对齐到同一套叙事。

README 我从技术手册打磨成赛方可读的首页：Hero、Landing Showcase、Console Showcase、赛事信息、两笔 CAW testnet 证据。技术细节下沉到 `docs/backend/`，合并前完整版备份在 `docs/backup/`。

PPT 方面，我推动 ppt-master 产出 14 页 `assets/ppt/agentcfo-pitch.pptx`，每页演讲备注在 `assets/ppt/agentcfo-pitch/notes/`；物料同学也有 PDF 同稿。

---

## 欢 · PM

我是欢，PM，管「做什么、什么时候交、谁验收」。

黑客松最怕各做各的拼不起来。我把需求拆成可验收块：P0 必须演示计划 → 风控 → 人工确认 → 执行 → 审计，Bob 必须 blocked，CAW 必须是真路径。

我维护 `TASK_BOARD.md`、`SUBMISSION_CHECKLIST.md`、`DEMO_REHEARSAL_CHECKLIST.md`，每天站会对齐 BLOCKED 项。Demo 数据全队统一：Alice 20、Bob 15、Charlie 10、Data API 5，月预算 50 USDC。

分工上：九九八乂做硬规则 API，threetwoa 做看得懂的界面，purple sun 做 Sepolia 真证据，呱呱 做视觉和 PPT，ZanyK 兜底 GitHub 和交付。我不 push 业务代码，但我验收 README 写的和 Demo 点出来的是否一致。

---

## 呱呱 · 物料 / 设计 / 内容

我是呱呱，负责物料、设计和内容——让评委愿意继续看下去。

我整理 README Banner、Landing 八张 Showcase、团队微信头像（`assets/images/readme/`），归类 `inbox/` 投递物，维护物料版 PDF `assets/ppt/material/agentcfo-pitch-material-team-v1.pdf`。

PPT 14 页结构：封面定位 → 痛点 → 方案与五步流程 → 能力与架构 → Demo 四人场景 → CAW 证据 → 技术/API/路线图 → 赛道匹配 → 团队 → 收尾 CTA。第 7 页 Bob 红字 blocked 是记忆点；第 8 页 tx hash 只陈述事实，不夸大。

Demo 视频我定脚本节奏：Landing 讲故事 → Console 三按钮 → GitHub 看 CAW 证据。前端同学可出镜操作，我盯文案是否通俗、mock/real 是否说清楚。

---

## threetwoa · 前端

我是 threetwoa，负责前端——评委看到的界面和点击，主要在我这边。

线上 Demo：https://agentcfo-frontend.vercel.app

**Landing：** Hero「让 DAO 金库决策变成可执行的付款流」、Workflow 五步、Guardrails、Pipeline/FAQ/Footer，GSAP 滚动与 3D 视觉。

**Console：** Agent Hub 聊天工作台，快捷按钮「生成计划」「检查风险」「查看审计」；Treasury 完整时间轴；Policy/Wallets/Analytics 与全局 state 联动；顶栏 Mock 徽章 + 中英文。

API 层 `lib/api/*` 对齐后端契约，mock/real 双模式。GitHub 前端提交 150+，PR #1 已合并。

录视频建议走：Landing → Agent Hub 三按钮 →（可选）Treasury 指 Bob blocked → README CAW 证据。口播必提：线上 Mock 稳定演示全链路，真 tx 在 README。

---

## 九九八乂 · 后端 / Agent

我是九九八乂，后端和 Agent——账房、风控、档案室。

第一周交付 FastAPI P0：五条核心 API、六条风控规则、pytest 验收、SQLite、mock/real CAW adapter。线上：https://agentcfo-backend.onrender.com

Risk Engine 是唯一决定 Ready/Blocked 的地方；LLM 只能起草计划和理由。Bob 被拦是因为白名单规则写死在代码里，不是 AI 一时兴起。

还做了 Render 部署、P2 demo-safe 扩展、demo-sample 标准数据。契约真相源：`app/models.py`、`app/routers/payments.py`、`tests/test_mvp_flow.py`。技术深文档在 `docs/backend/`。

和 purple sun 分工：我定 adapter 契约，他填 CAW SDK 真调用。PPT 第 6/10/11 页从我这边事实出发。

---

## purple sun · 合约 / CAW

我是 purple sun，负责 CAW——全队真正碰链上动钱的人。

我完成：CAW API Key（不入库）、Agent Wallet（公开脱敏 `0x2cda...76da`）、SDK `cobo-agentic-wallet==0.1.40`、Sepolia 两笔低额转账证据（demo payment + internal transfer）、518 行对接说明、与后端 Phase 4C 联调。

线上 Render 默认 mock；真 testnet 需显式 env + 批准。Mock 不能冒充链上记录；UI 分开展示 Audit 快照和 Latest CAW Status。

PPT 第 8 页是我工作的浓缩。评委问 CAW 是不是摆设——不是，它是执行层唯一出口。

---

## 串联结语（可选，任一人念）

六个人、一条链：PM 定场景，后端定规则，CAW 定真证据，前端定体验，物料定表达，总控定交付。

代码在 GitHub，Demo 在 Vercel，故事在 Landing 和 PPT，信任在 Risk Engine 和 Human Approval 之间。

AgentCFO——给每个 DAO 一个带受控钱包的 AI 财务官。
