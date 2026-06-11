# AgentCFO 任务看板

> 最后更新：2026年6月10日 Day 2 总控审视（第二轮）
> 规则：12 号之后不新增大功能，只修复、打磨、录视频、补材料
>
> ⚠️ 已发现问题：README 描述 4 个贡献者（含 Data API = 50 USDC），但 `/api/demo-sample` 只返回 3 个（45 USDC）。后端需修复。

---

## 状态说明

| 状态 | 含义 |
|------|------|
| 🔴 BLOCKED | 卡住了，需要别人介入 |
| 🟡 TODO | 待开始 |
| 🔵 IN_PROGRESS | 进行中 |
| ✅ DONE | 完成，已验收 |
| ❌ CANCELLED | 明确不做 |

---

## 当前进度总览

| 岗位 | 负责人 | 进度 | 最大卡点 |
|------|--------|------|----------|
| 交付/总控 | San-Y108 (严硕) | ✅ repo + 文档已完成 | 物料兜底 + 路演准备 |
| 后端/Agent | W5W8L9jlu | ✅ P0 + P1 Render + P2 spike + Phase 4C closeout | **🔴 今日生病，T-076/edge case/P0 验证暂由 CAW 代做** |
| 前端 | Aafff623 | ✅ Landing + Demo + Console + Vercel | PR #1 未合并；real mode 未接入 /demo |
| 合约/CAW | gitgdut | ✅ API Key + Wallet + **3 笔 testnet tx** + demo-sample 修复 + P0 验证 | 截图待上传到仓库；Demo 话术稿待写 |
| 物料/设计 | Eloise-qiu | 🔴 **0 产出，已逾期 2 天** | PPT/视频/头图/Logo/截图全部缺失，**今日必须确认产能或启动兜底** |

---

## Phase 0：启动对齐（6月8日）✅ 全部完成

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
| T-017 | 测试用例 | test_mvp_flow.py | 6月8日 | ✅ DONE |

### 前端（Aafff623）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-020 | 确认技术栈 | Next.js + TypeScript + Tailwind | 6月8日 18:00 | ✅ DONE |
| T-021 | 脚手架跑通 | pnpm-lock + 完整组件结构 | 6月8日 22:00 | ✅ DONE |
| T-022 | 对接后端 mock API | 能调用 5 个接口（含 caw-status） | 6月9日 | ✅ DONE |

### 合约/CAW（gitgdut）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-030 | Cobo 文档 Quickstart 通读 | 权限模型分析文档 | 6月8日 18:00 | ✅ DONE |
| T-031 | 申请开发者 API Key | Sandbox Key 或正式环境 Key | 6月8日 22:00 | ✅ DONE |
| T-032 | 搞懂 Cobo 权限模型 | 三层权限 + 双层风控方案 | 6月9日 | ✅ DONE |
| T-033 | 创建 Agent Wallet | Wallet 地址 | 6月9日 | ✅ DONE |
| T-034 | 准备测试网资金 | ETH 或 USDC 余额截图 | 6月9日 | ✅ DONE |
| T-035 | 第一笔测试网付款 | 1 个 tx hash 已写入 README | 6月10日 | ✅ DONE |

### 物料/设计（Eloise-qiu）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-040 | 项目名 + Logo 初稿 | 草图或方向 | 6月8日 22:00 | 🔴 BLOCKED（逾期 2 天，0 产出） |
| T-041 | PPT 7 页大纲 | 初版 PPT 文件 | 6月9日 | 🔴 BLOCKED（逾期 1 天） |
| T-042 | Demo 视频脚本 | 逐段台词 + 画面描述 | 6月9日 | 🔴 BLOCKED（逾期 1 天） |
| T-043 | 赛道匹配说明文案 | 中英文各一版 | 6月9日 | 🔴 BLOCKED（逾期 1 天） |

---

## Phase 1：核心模块联调（6月9日-10日）

### 后端/Agent

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-050 | 启用/验证真实 CAW mode | opt-in testnet RealCawAdapter skeleton + 1 笔 tx evidence | 6月10日 | ✅ DONE |
| T-051 | 加入 LLM 生成付款计划 | payment_planner.py (OpenAI) | 6月9日 | ✅ DONE（已实现 OpenAI Structured Outputs） |
| T-052 | 和前端联调 | 前端能调通 5 个接口 | 6月9日 | 🔴 BLOCKED（后端同学生病，待恢复） |
| T-053 | 和 CAW 联调 | 本地 live test 完成 1 笔 | 6月10日 | ✅ DONE（1 笔 testnet evidence） |
| T-054 | 部署后端到公网 | https://agentcfo-backend.onrender.com | 6月10日 | ✅ DONE |
| T-055 | SQLite 持久化 | store.py SQLiteStore + 测试 | 6月10日 | ✅ DONE |
| T-056 | CAW 状态查询接口 | GET /api/caw-status/{id} | 6月10日 | ✅ DONE |
| T-057 | P2 demo-safe spike | 全部 P2 metadata/preview/simulation endpoints | 6月10日 | ✅ DONE |
| T-058 | P2 demo contracts + runbook | /api/demo/runbook, /api/demo/contracts | 6月10日 | ✅ DONE |
| T-059 | Request Finance live spike | env-gated read-only + off-chain create（guard 已关） | 6月10日 | ✅ DONE |
| T-076 | 修复 demo-sample 数据 | 加入 Data API（5 USDC）+ 加入白名单，对齐 README 4 贡献者场景 | 6月10日 | ✅ DONE（CAW 完成贡献 + 总控修复白名单） |

### 前端

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-060 | 主流程页面 4 步 | demo/page.tsx + 4 个组件 | 6月9日 | ✅ DONE |
| T-061 | Bob 标红展示 | risk-gate.tsx Blocked 状态 | 6月9日 | ✅ DONE |
| T-062 | 人工确认按钮 | human-approval.tsx | 6月9日 | ✅ DONE |
| T-063 | tx hash 展示 | copyable-hash.tsx 组件 | 6月10日 | ✅ DONE |
| T-064 | 审计报告页 | audit-report.tsx | 6月10日 | ✅ DONE |
| T-065 | Mock 模式兜底 | lib/mock/ 完整 mock 层 | 6月10日 | ✅ DONE |
| T-066 | 部署前端到公网 | https://agentcfo-frontend.vercel.app | 6月10日 | ✅ DONE |
| T-067 | Landing 重设计 | Velorix Hero + scroll sections | 6月9日 | ✅ DONE |
| T-068 | Console 工作台 | /console 4 tab（Treasury/Wallets/Analytics/Policy） | 6月9日 | ✅ DONE |
| T-069 | PR #1 合并或同步 main | feat/frontend-bootstrap → main | 6月10日 | 🔵 IN_PROGRESS |
| T-070 | Real mode 接入 /demo | 调用 runDemoFlow + loading/error 态 | 6月11日 | 🟡 TODO |

### 合约/CAW

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-071 | 验证真实 CAW adapter | Phase 4C skeleton + 1 笔 testnet evidence | 6月10日 | ✅ DONE |
| T-072 | 和后端联调 | 本地 live transfer 已完成 | 6月10日 | ✅ DONE |
| T-073 | 补充测试网付款证据 | 3 个 tx hash ✅ 全部完成 | 6月10日 | ✅ DONE（CAW 独立完成 3 笔 Sepolia/SETH testnet tx） |
| T-074 | 整理 CAW 配置说明 | 配置文档 | 6月10日 | ✅ DONE |
| T-075 | 截图脱敏补充 | 区块浏览器截图已有（本地路径），需上传到仓库 | 6月11日 | 🔵 IN_PROGRESS（截图已取，待上传到 repo） |
| T-077 | CAW Demo 话术稿 | 1 分钟 CAW 讲解稿（介绍 CAW、展示真实 tx、解释 mock fallback） | 6月11日 | 🟡 TODO |
| T-078 | 确认 Agent Wallet 地址公开口径 | masked 还是完整地址，对照赛道要求确认 | 6月10日 | 🟡 TODO |
| T-079 | Demo day CAW 准备清单 | env vars 配置、mock/real 切换、余额检查、备用方案 | 6月12日 | 🟡 TODO |

### 物料/设计

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-080 | README 头图 16:9 | poster.png | 6月10日 | 🔴 BLOCKED |
| T-081 | PPT 初版 | 7 页完整 PPT | 6月10日 | 🔴 BLOCKED |
| T-082 | Demo 视频脚本终版 | 逐段台词定稿 | 6月10日 | 🔴 BLOCKED |

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

## 关键依赖关系

```
后端 P0/P1/P2 API（✅ 已完成 + 已部署 Render）
    → 前端已对接 mock mode（✅ lib/api/ 层已对齐）
    → 前端 real mode 待接入（🟡 需 Render URL + CORS）
    → ⚠️ demo-sample 缺 Data API（T-076，今天修）

前端主流程（✅ Landing + Demo + Console + Vercel）
    → PR #1 待合并（T-069）
    → real mode /demo 待接入（T-070）
    → ⚠️ /demo 用硬编码 mock 数据，未调用后端 API（短期不影响路演，需心里有数）

CAW 验证（✅ 1 笔 testnet tx）
    → 补充证据：和后端配合跑第 2-3 笔（T-073，内部目标非硬性要求）
    → 截图脱敏（T-075，可独立完成）

设计/物料（🔴 Eloise-qiu 0 产出，逾期 2 天）
    → PPT / 视频 / 头图 / Logo / 截图全部缺失
    → 今日必须确认产能或启动兜底
```

---

## 任务统计

| 状态 | 数量 |
|------|------|
| 🔴 BLOCKED | 8 |
| 🟡 TODO | 18 |
| 🔵 IN_PROGRESS | 2 |
| ✅ DONE | 47 |
| ❌ CANCELLED | 0 |
