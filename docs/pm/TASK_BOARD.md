# AgentCFO 任务看板

> 最后更新：Day 0 启动日
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

## Phase 0：启动对齐（Day 0）

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-001 | 创建 GitHub 仓库 + 团队权限 | 总控 | repo 链接 + 全员 collaborator | Day 0 12:00 | 🟡 TODO |
| T-002 | README 初始框架 push | 总控 | README.md 跑通显示 | Day 0 12:00 | 🟡 TODO |
| T-003 | 技术方案定稿 | 后端 + 合约 | 技术架构文字版 + API 接口草案 | Day 0 18:00 | 🟡 TODO |
| T-004 | 前端技术栈选定 | 前端 | 确认 React/Next/Vue | Day 0 12:00 | 🟡 TODO |
| T-005 | 前端脚手架跑通 | 前端 | `npm run dev` 不报错 | Day 0 18:00 | 🟡 TODO |
| T-006 | 项目名 + Logo 初稿 | 物料 | Logo 草图 + 一句话简介 | Day 0 18:00 | 🟡 TODO |
| T-007 | CAW 文档通读 + 沙箱申请 | 合约/CAW | API Key 已申请 | Day 0 18:00 | 🟡 TODO |
| T-008 | CAW 测试网发 0.001 ETH | 合约/CAW | tx hash 截图 | Day 0 22:00 | 🟡 TODO |

---

## Phase 1：核心模块开发（Day 1–2）

### 后端 / Agent

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-010 | 后端框架搭建（FastAPI） | 后端 | 项目跑通 + /health 接口 | Day 1 | 🟡 TODO |
| T-011 | Mock 贡献数据 JSON | 后端 | 贡献记录 + 预算规则示例数据 | Day 1 | 🟡 TODO |
| T-012 | POST /api/payment-plan 接口 | 后端 | 输入贡献记录，返回付款计划 JSON | Day 1 | 🟡 TODO |
| T-013 | POST /api/risk-check 接口 | 后端 | 输入付款计划，返回风险检查结果 | Day 2 | 🟡 TODO |
| T-014 | POST /api/execute-payment 接口 | 后端 + 合约 | 调用 CAW，返回 tx hash | Day 2 | 🟡 TODO |
| T-015 | GET /api/audit-report/:id 接口 | 后端 | 返回完整审计报告 | Day 2 | 🟡 TODO |
| T-016 | Agent 付款计划生成逻辑 | 后端 | LLM 或硬编码均可，输出结构化 JSON | Day 2 | 🟡 TODO |
| T-017 | 风险检查 4 条规则 | 后端 | 预算/白名单/限额/重复付款 | Day 2 | 🟡 TODO |

### 前端

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-020 | 4 个主页面路由 | 前端 | Dashboard / 贡献输入 / 计划审批 / 执行结果 | Day 1 | 🟡 TODO |
| T-021 | 贡献记录输入页 | 前端 | 支持输入或上传 JSON/CSV | Day 1 | 🟡 TODO |
| T-022 | Agent 付款计划展示 | 前端 | 卡片式展示每笔付款 | Day 1 | 🟡 TODO |
| T-023 | 风险检查结果展示 | 前端 | 异常付款醒目标红 | Day 2 | 🟡 TODO |
| T-024 | 人工确认按钮 | 前端 | Approve / Reject 两个操作 | Day 2 | 🟡 TODO |
| T-025 | 付款执行状态页 | 前端 | 展示 tx hash + Agent Wallet 地址 | Day 2 | 🟡 TODO |
| T-026 | 审计报告页 | 前端 | 像正式财务结算报告 | Day 2 | 🟡 TODO |
| T-027 | Mock 模式兜底 | 前端 | 后端/CAW 不可用时前端仍能完整展示 | Day 2 | 🟡 TODO |

### 合约 / CAW

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-030 | Agent Wallet 创建 | 合约/CAW | Wallet 地址 | Day 1 | 🟡 TODO |
| T-031 | 测试网 USDC 准备 | 合约/CAW | 余额截图 | Day 1 | 🟡 TODO |
| T-032 | 预算/白名单/限额配置 | 合约/CAW | 配置说明文档 | Day 1 | 🟡 TODO |
| T-033 | 第一笔测试网付款 | 合约/CAW | tx hash + 浏览器链接 | Day 2 | 🟡 TODO |
| T-034 | CAW 付款执行脚本 | 合约/CAW | 后端可调用的接口或脚本 | Day 2 | 🟡 TODO |

### 物料 / 设计 / 内容

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-040 | PPT 大纲 + 初版 | 物料 | 7 页 PPT 初稿 | Day 1 | 🟡 TODO |
| T-041 | README 头图 16:9 | 物料 | poster.png | Day 2 | 🟡 TODO |
| T-042 | Demo 视频脚本 | 物料 | 逐段台词 + 画面描述 | Day 2 | 🟡 TODO |
| T-043 | 赛道匹配说明文案 | 物料 | 中英文各一版 | Day 1 | 🟡 TODO |

---

## Phase 2：联调与打磨（Day 3–4）

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-050 | 前后端联调 | 前端 + 后端 | 主流程跑通不报错 | Day 3 | 🟡 TODO |
| T-051 | 后端 + CAW 联调 | 后端 + 合约 | execute-payment 返回真实 tx hash | Day 3 | 🟡 TODO |
| T-052 | 全链路端到端测试 | 全员 | 4 步流程完整走一遍 | Day 4 | 🟡 TODO |
| T-053 | 前端 UI 打磨 | 前端 | 不需要精美，但不能白屏/错位 | Day 4 | 🟡 TODO |
| T-054 | 录制 Demo 视频 | 物料 + 总控 | 3–5 分钟完整演示视频 | Day 4 | 🟡 TODO |
| T-055 | 完整 README 终版 | 总控 | 所有章节填写完毕 | Day 4 | 🟡 TODO |
| T-056 | PPT 终版 | 物料 | 7 页定稿 | Day 4 | 🟡 TODO |
| T-057 | 路演讲稿终版 | 总控 | 5 分钟逐段稿 | Day 4 | 🟡 TODO |

---

## Phase 3：冻结与提交（Day 5+）

| ID | 任务 | 负责人 | 交付物 | 截止 | 状态 |
|----|------|--------|--------|------|------|
| T-060 | 路演彩排 ×2 | 总控 | 录屏回放 + 问题清单 | Day 5 | 🟡 TODO |
| T-061 | 备用截图准备 | 物料 | 全流程截图包 | Day 5 | 🟡 TODO |
| T-062 | 备用视频本地版 | 物料 | 本地 mp4 备份 | Day 5 | 🟡 TODO |
| T-063 | 提交材料检查 | 总控 | 对照 SUBMISSION_CHECKLIST.md | Day 5 | 🟡 TODO |
| T-064 | GitHub repo 最终整理 | 总控 | 所有文件就位、无临时文件 | Day 5 | 🟡 TODO |

---

## 任务统计

| 状态 | 数量 |
|------|------|
| 🔴 BLOCKED | 0 |
| 🟡 TODO | 42 |
| 🔵 IN_PROGRESS | 0 |
| ✅ DONE | 0 |
| ❌ CANCELLED | 0 |
