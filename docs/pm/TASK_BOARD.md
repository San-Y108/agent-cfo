# AgentCFO 任务看板

> 最后更新：2026年6月10日 实盘核查（统计修正）
> 规则：12 号之后不新增大功能，只修复、打磨、录视频、补材料
> 核查方式：逐文件检查代码/文档/部署状态，不凭记忆

---

## 状态说明

| 状态 | 含义 |
|------|------|
| 🔴 BLOCKED | 卡住了，需要别人介入 |
| 🟡 TODO | 待开始 |
| 🔵 IN_PROGRESS | 进行中 |
| ✅ DONE | 完成，已验证 |
| ❌ CANCELLED | 明确不做 |

---

## 当前进度总览

| 岗位 | 负责人 | 进度 | 最大卡点 |
|------|--------|------|----------|
| 交付/总控 | San-Y108 (严硕) | ✅ repo + 文档已完成 | 路演讲稿、PPT、视频仍缺 |
| 后端/Agent | W5W8L9jlu | ✅ P0 + P2 全完成，126 tests pass，Render 已部署 | Render 为 ephemeral/mock-demo；real mode 联调需等 CAW live transfer |
| 前端 | Aafff623 | ✅ Landing + Demo + Console + Vercel 全完成 | real mode 未在页面切换；截图/demo视频未产出 |
| 合约/CAW | gitgdut | 🔵 1笔testnet tx已记录 | 仍缺至少2笔tx；需后端发起live transfer后做测试 |
| 物料/设计 | Eloise-qiu | 🟡 确认加入repo | PPT/视频/截图/Logo/头图全部未产出 |

---

## Phase 0：启动对齐（6月8日）

### 总控（严硕）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-001 | 创建 GitHub 仓库 + 团队权限 | repo 链接 + 全员 collaborator | 6月8日 12:00 | ✅ DONE |
| T-002 | README 初始框架 push | README.md | 6月8日 12:00 | ✅ DONE |
| T-003 | 管理文档 push | docs/pm/ 下 7 个文档 | 6月8日 12:00 | ✅ DONE |
| T-004 | 交付总控报告 | DELIVERY_MASTER_REPORT | 6月8日 12:00 | ✅ DONE |
| T-005 | 发开工消息 | 群消息 | 6月8日 12:00 | ✅ DONE |
| T-006 | 确认全员已 clone | 3/4 人确认（后端+前端+CAW） | 6月8日 14:00 | ✅ DONE |
| T-007 | 催 CAW 同学开始验证 | CAW 进度回复 | 6月8日 14:00 | ✅ DONE |

### 后端/Agent（W5W8L9jlu）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-010 | 后端框架搭建 | FastAPI 项目 + requirements.txt | 6月8日 | ✅ DONE |
| T-011 | POST /api/payment-plan | 可调用接口 | 6月8日 | ✅ DONE |
| T-012 | POST /api/risk-check | 可调用接口 | 6月8日 | ✅ DONE |
| T-013 | POST /api/execute-payment | mock 接口（txHash=null） | 6月8日 | ✅ DONE |
| T-014 | GET /api/audit-report/{id} | 可调用接口 | 6月8日 | ✅ DONE |
| T-015 | 风险检查引擎 6 条规则 | budget/whitelist/limit/token/duplicate wallet/duplicate task | 6月8日 | ✅ DONE |
| T-016 | mock CAW 适配器 | caw_adapter.py (mock) | 6月8日 | ✅ DONE |
| T-017 | 测试用例 | test_mvp_flow.py → 当前 126 tests pass | 6月8日 | ✅ DONE |

### 前端（Aafff623）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-020 | 确认技术栈 | Next.js + TypeScript + Tailwind | 6月8日 18:00 | ✅ DONE |
| T-021 | 脚手架跑通 | pnpm-lock + 完整组件结构 | 6月8日 22:00 | ✅ DONE |
| T-022 | 对接后端 mock API | lib/api/ 层已对齐 5 个接口 | 6月9日 | ✅ DONE |

### 合约/CAW（gitgdut）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-030 | Cobo 文档 Quickstart 通读 | 权限模型分析文档 | 6月8日 18:00 | ✅ DONE |
| T-031 | 申请开发者 API Key | Sandbox Key 或正式环境 Key | 6月8日 22:00 | ✅ DONE |
| T-032 | 搞懂 Cobo 权限模型 | 三层权限 + 双层风控方案 | 6月9日 | ✅ DONE |
| T-033 | 创建 Agent Wallet | Wallet 地址 | 6月9日 | ✅ DONE |
| T-034 | 准备测试网资金 | ETH 或 USDC 余额截图 | 6月9日 | ✅ DONE |
| T-035 | 第一笔测试网付款 | 1 个 tx hash 已写入 README；区块浏览器链接/截图待补 | 6月10日 | ✅ DONE |

### 物料/设计（Eloise-qiu）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-040 | Logo 初稿 | 项目名已确定为 AgentCFO；Logo 未产出 | 6月8日 22:00 | ❌ 未产出 |
| T-041 | PPT 7 页大纲 | 初版 PPT 文件 | 6月9日 | ❌ 未产出 |
| T-042 | Demo 视频脚本 | 逐段台词 + 画面描述 | 6月9日 | ❌ 未产出 |
| T-043 | 赛道匹配说明文案 | 中英文各一版 | 6月9日 | ❌ 未产出 |

---

## Phase 1：核心模块联调（6月9日-10日）

### 后端/Agent

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-050 | 启用/验证真实 CAW mode | opt-in testnet RealCawAdapter skeleton + 1 笔 tx evidence | 6月10日 | ✅ DONE |
| T-051 | 加入 LLM 生成付款计划 | payment_planner.py (OpenAI) | 6月9日 | ✅ DONE（mock+OpenAI双模式） |
| T-052 | 和前端联调 | 前端 lib/api/ 已对齐后端；real mode 页面切换待做 | 6月9日 | ✅ DONE（adapter层完成） |
| T-053 | 和 CAW 联调 | 本地 live test 1 笔完成；Render 上为 mock-demo | 6月10日 | 🔵 等CAW补tx |
| T-054 | 部署后端到公网 | https://agentcfo-backend.onrender.com | 6月10日 | ✅ DONE |
| T-055 | SQLite 持久化 | store.py SQLiteStore + 测试 | 6月10日 | ✅ DONE |
| T-056 | CAW 状态查询接口 | GET /api/caw-status/{id} + /refresh | 6月10日 | ✅ DONE |
| T-057 | P2 demo-safe spike | 20+ 个 P2 端点（evidence timeline, demo scenarios, risk what-if, policy guardrails, evidence export, Request Finance preflight/lifecycle/webhook, Sablier payroll sim, Safe guard dry-run, multi-agent coordination, demo runbook/contracts, openapi-lite） | 6月9日 | ✅ DONE |

### 前端

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-060 | 主流程页面 4 步 | demo/page.tsx + 分步揭示工作流 | 6月9日 | ✅ DONE |
| T-061 | Bob 标红展示 | Bob blocked 标红 + 警告提示 | 6月9日 | ✅ DONE |
| T-062 | 人工确认按钮 | Approve & Execute 真实交互 | 6月9日 | ✅ DONE |
| T-063 | tx hash 展示 | copyable-hash 组件 | 6月10日 | ✅ DONE |
| T-064 | 审计报告页 | audit-report 组件 | 6月10日 | ✅ DONE |
| T-065 | Mock 模式兜底 | lib/mock/ + demo-data 完整 mock 层 | 6月10日 | ✅ DONE |
| T-066 | 部署前端到公网 | https://agentcfo-frontend.vercel.app | 6月10日 | ✅ DONE |
| T-067 | Landing 重设计 | Velorix Hero + scroll sections（Problem/Workflow/Risk/Wallet/Audit） | 6月9日 | ✅ DONE |
| T-068 | 业务工作台 /console | Treasury/Wallets/Analytics/Policy 四页完整迁移 | 6月9日 | ✅ DONE |
| T-069 | 主题+双语 | 暗亮模式 + 中英文切换 | 6月9日 | ✅ DONE |

### 合约/CAW

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-070 | 验证真实 CAW adapter | Phase 4C skeleton + 1 笔 testnet evidence | 6月10日 | ✅ DONE |
| T-071 | 和后端联调 | 本地 live transfer 1 笔完成 | 6月10日 | ✅ DONE |
| T-072 | 完成至少 3 笔测试网付款 | 3 个 tx hash | 6月10日 | 🔵 已有1笔，等后端发起live transfer后补2笔 |
| T-073 | 整理 CAW 配置说明 | 518行配置文档已交付 | 6月10日 | ✅ DONE |

### 物料/设计

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-080 | README 头图 16:9 | poster.png | 6月10日 | ❌ 未产出 |
| T-081 | PPT 初版 | 7 页完整 PPT | 6月10日 | ❌ 未产出 |
| T-082 | Demo 视频脚本终版 | 逐段台词定稿 | 6月10日 | ❌ 未产出 |

---

## Phase 2：集成与打磨（6月11日）

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-090 | 全链路端到端测试 | 全员 | 主流程完整跑通 | 6月11日 | 🟡 TODO |
| T-091 | 前端 UI 打磨 | 前端 | 不白屏、不错位、能投屏 | 6月11日 | 🟡 TODO |
| T-092 | README 终版 | 总控 + 物料 | 所有章节填写完毕 | 6月11日 | 🟡 TODO |
| T-093 | PPT 终版 | 物料 | 7 页定稿 | 6月11日 | 🟡 TODO |
| T-094 | 录制 Demo 视频 | 物料 | 3-5 分钟完整演示 | 6月11日 | 🟡 TODO |
| T-095 | 路演讲稿终版 | 总控 | 5 分钟逐段稿 | 6月11日 | 🟡 TODO |
| T-096 | 第一次完整彩排 | 总控 | 录屏 + 问题清单 | 6月11日 | 🟡 TODO |

---

## Phase 3：冻结与提交（6月12日-13日）

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-100 | 功能冻结通知 | 总控 | 群消息 | 6月12日 10:00 | 🟡 TODO |
| T-101 | 修 bug only | 前端 + 后端 | 只修不加 | 6月12日 18:00 | 🟡 TODO |
| T-102 | 备用截图包 | 物料 | 全流程截图 | 6月12日 | 🟡 TODO |
| T-103 | 本地录屏备份 | 物料 | mp4 文件 | 6月12日 | 🟡 TODO |
| T-104 | 第二次完整彩排 | 总控 | 录屏 + 问题清单 | 6月12日 20:00 | 🟡 TODO |
| T-105 | 提交材料检查 | 总控 | 对照 SUBMISSION_CHECKLIST | 6月13日 10:00 | 🟡 TODO |
| T-106 | 正式提交 | 总控 | 提交截图 | 6月13日 12:00 | 🟡 TODO |

---

## 关键依赖关系（6月10日 实盘核查版）

```
后端 P0 mock API（✅ 已完成 + 已部署 Render）
    → 前端已对接（✅ lib/api/ 层已对齐）
    → 前端 Landing + Demo + Console 全部完成（✅ Vercel 部署）

后端 P2 demo-safe spike（✅ 20+ 端点已实现）
    → 前端暂未接入 P2 展示

CAW 验证（✅ API Key + Wallet + 配置文档 + 1 笔低额 testnet tx）
    → 仍缺至少 2 笔 tx
    → 需后端发起 live transfer，CAW 同学执行 + 记录
    → 截图仍需脱敏补充

设计/物料（❌ 全部未产出）
    → PPT / 视频 / 截图 / Logo / 头图 / 视频脚本
    → 这是当前最大风险：距离提交仅剩 3 天
```

---

## 合约同学可支援事项

基于 gitgdut 同学"手头活不多，愿意帮忙"的表态，以下是可以支援的方向：

| 优先级 | 任务 | 说明 | 前置条件 |
|--------|------|------|----------|
| 🔴 高 | 补 2 笔 testnet tx | 和后端配合，等后端在 Render 上发起 live transfer，执行并记录 tx hash | 后端同学配置 Render 环境变量 + 发起 transfer |
| 🔴 高 | 截图脱敏 | 把已有 CAW 截图中的 API Key / raw provider response 脱敏 | 无 |
| 🟡 中 | 协助前端 P2 展示 | 如果前端需要接入 P2 preview 区域，CAW 同学可以协助理解 Request Finance / Sablier / Safe 的接口含义 | 前端同学确认是否需要 |
| 🟢 低 | 协助物料同学 | 帮物料同学理解 CAW 技术细节，写入 PPT/视频脚本 | 物料同学启动后 |

---

## 任务统计（6月10日 核查）

| 状态 | 数量 |
|------|------|
| 🔴 BLOCKED | 0 |
| 🟡 TODO | 14 |
| 🔵 IN_PROGRESS | 2 |
| ✅ DONE | 44 |
| ❌ 未产出 | 7（物料 T-040~T-043, T-080~T-082） |
| **总计** | **67** |

---

## 最大风险清单（6月10日）

| 风险 | 等级 | 说明 |
|------|------|------|
| 物料全部未产出 | 🔴 P0 | PPT/视频/截图/Logo 全缺，距离提交仅3天 |
| CAW 缺 2 笔 tx | 🟡 P2 | 需后端+CAW配合发起 live transfer |
| Render 为 ephemeral | 🟡 P2 | 免费套餐不支持 persistent disk |
| 前端 real mode 未切换 | 🟢 P3 | mock mode 足够演示；real 为加分项 |
