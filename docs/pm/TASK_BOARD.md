# AgentCFO 任务看板

> 最后更新：2026年6月9日 00:15
> 规则：12 号之后不新增大功能，只修复、打磨、录视频、补材料

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
| 交付/总控 | San-Y108 (严硕) | ✅ repo + 文档已完成 | 无 |
| 后端/Agent | W5W8L9jlu | ✅ SQLite + CAW查询 + Render部署 | CAW 配置已到位，可开始启用/验证 real CAW mode |
| 前端 | Aafff623 | ✅ Landing + Demo + Vercel + i18n + 纯黑风格 + API 对接 | 待保持 main 与部署分支同步 |
| 合约/CAW | gitgdut | ✅ API Key + Wallet + 配置文档 | 待准备测试网资金 + 第一笔交易 |
| 物料/设计 | Eloise-qiu | 🟡 已确认 | GitHub 已加入 repo，待启动 PPT/视频/视觉 |

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
| T-034 | 准备测试网资金 | ETH 或 USDC 余额截图 | 6月9日 | 🟡 TODO |
| T-035 | 第一笔测试网付款 | tx hash + 区块浏览器链接 | 6月10日 | 🟡 TODO |

### 物料/设计（Eloise-qiu）

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-040 | 项目名 + Logo 初稿 | 草图或方向 | 6月8日 22:00 | 🔵 IN_PROGRESS |
| T-041 | PPT 7 页大纲 | 初版 PPT 文件 | 6月9日 | 🟡 TODO |
| T-042 | Demo 视频脚本 | 逐段台词 + 画面描述 | 6月9日 | 🟡 TODO |
| T-043 | 赛道匹配说明文案 | 中英文各一版 | 6月9日 | 🟡 TODO |

---

## Phase 1：核心模块联调（6月9日-10日）

### 后端/Agent

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-050 | 启用/验证真实 CAW mode | RealCawAdapter testnet 验证 | 6月10日 | 🟡 TODO |
| T-051 | 加入 LLM 生成付款计划 | payment_planner.py (OpenAI) | 6月9日 | 🔵 IN_PROGRESS |
| T-052 | 和前端联调 | 前端能调通 5 个接口 | 6月9日 | 🔵 IN_PROGRESS |
| T-053 | 和 CAW 联调 | execute-payment 返回真实 tx hash | 6月10日 | 🟡 TODO |
| T-054 | 部署后端到公网 | https://agentcfo-backend.onrender.com | 6月10日 | ✅ DONE |
| T-055 | SQLite 持久化 | store.py SQLiteStore + 测试 | 6月10日 | ✅ DONE |
| T-056 | CAW 状态查询接口 | GET /api/caw-status/{id} | 6月10日 | ✅ DONE |

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

### 合约/CAW

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-070 | 验证真实 CAW adapter | RealCawAdapter testnet 验证 | 6月10日 | 🟡 TODO |
| T-071 | 和后端联调 | execute-payment 真实付款 | 6月10日 | 🟡 TODO |
| T-072 | 完成至少 3 笔测试网付款 | 3 个 tx hash | 6月10日 | 🟡 TODO |
| T-073 | 整理 CAW 配置说明 | cobo-agentic-wallet-backend-quickstart.md | 6月10日 | ✅ DONE |

### 物料/设计

| ID | 任务 | 交付物 | 截止 | 状态 |
|----|------|--------|------|------|
| T-080 | README 头图 16:9 | poster.png | 6月10日 | 🟡 TODO |
| T-081 | PPT 初版 | 7 页完整 PPT | 6月10日 | 🟡 TODO |
| T-082 | Demo 视频脚本终版 | 逐段台词定稿 | 6月10日 | 🟡 TODO |

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
后端 mock API（✅ 已完成 + 已部署 Render）
    → 前端已对接（✅ lib/api/ 层已对齐 5 个接口）

前端主流程（✅ 已完成 + 已部署 Vercel）
    → Landing + Demo 完整可用
    → lib/api 层已对齐 5 个接口
    → 待保持 main 与部署分支同步

CAW 验证（✅ API Key + Wallet + 配置文档已到位）
    → 后端可开始启用/验证 real CAW mode
    → 待准备测试网资金 + 第一笔交易拿 tx hash

设计/物料（🟡 Eloise-qiu 已确认）
    → 待启动 PPT、视频、视觉
```

---

## 任务统计

| 状态 | 数量 |
|------|------|
| 🔴 BLOCKED | 0 |
| 🟡 TODO | 27 |
| 🔵 IN_PROGRESS | 3 |
| ✅ DONE | 33 |
| ❌ CANCELLED | 0 |
