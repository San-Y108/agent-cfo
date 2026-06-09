# AgentCFO 风险日志

> 最后更新：2026年6月9日 Phase 4C closeout
> 规则：任何新发现的风险必须当天更新到此文档，并在站会中同步

---

## 风险等级说明

| 等级 | 含义 | 处理要求 |
|------|------|----------|
| 🔴 P0 | 致命风险，会导致项目无法展示 | 必须当天解决或制定兜底方案 |
| 🟠 P1 | 高风险，会严重影响 Demo 效果 | 24 小时内解决 |
| 🟡 P2 | 中风险，影响体验但不致命 | 48 小时内解决 |
| 🟢 P3 | 低风险，锦上添花 | 有空再做 |

---

## 活跃风险

### R-02 🟡 物料/设计同学已确认，待启动

| 字段 | 内容 |
|------|------|
| 等级 | 🔴→🟡 P2（降级） |
| 负责人 | Eloise-qiu（物料/设计） |
| 发现日期 | 6月8日 |
| 影响 | 物料负责 PPT、视频、海报、文案，这些是路演和提交必须项 |
| 当前状态 | ✅ 已确认身份，GitHub 已加入 repo collaborator，待启动产出 |
| 缓解措施 | 尽快发任务消息给 Eloise-qiu，明确今日交付物 |
| 兜底方案 | 如果 6月9日仍无产出，总控自己出 PPT 大纲 + 视频脚本框架 |
| 截止 | 6月9日 18:00 前完成 PPT 7 页大纲 |

### R-04 🟡 后端 mock 模式 + SQLite/Render 持久化边界

| 字段 | 内容 |
|------|------|
| 等级 | 🟡 P2 |
| 负责人 | W5W8L9jlu（后端） |
| 发现日期 | 6月8日 |
| 影响 | 默认 mock flow 的 txHash 仍为 null；当前 Render demo 按 ephemeral/mock-only 处理，不承诺保留线上 audit/status evidence |
| 当前状态 | ✅ SQLiteStore、/api/caw-status/{id}、/api/caw-status/{id}/refresh 已实现；Phase 4C 已完成 1 笔低额 CAW testnet transfer 证据；默认 mock/fail-closed 保留 |
| 缓解措施 | 本次 closeout 决策：Render 仅用于 P0 mock flow 在线验证；本地 1 笔 CAW evidence 不能由 Render 展示，除非在 Render 重新执行或显式 seed。下一步推荐 SQLite + Render persistent disk；长期/多实例审计再迁移 Postgres，均需单独批准。Audit Report 保持执行时快照，latest CAW status 单独刷新展示 |
| 截止 | 已决策：当前 Render 为 ephemeral/mock-demo；如需持久 evidence，另行批准 persistent disk 或 Postgres |

### R-05 🟡 测试网资金获取

| 字段 | 内容 |
|------|------|
| 等级 | 🟡 P2 |
| 负责人 | gitgdut（合约/CAW） |
| 发现日期 | 6月8日 |
| 影响 | 已证明 1 笔低额 SETH testnet transfer，但提交清单仍缺至少 3 笔 tx/截图证据 |
| 当前状态 | ✅ README 已记录 1 笔 txHash 和 cawRequestId；仍缺至少 2 笔或需要调整提交口径 |
| 缓解措施 | 若继续追 3 笔，必须每次单独人工批准；否则对外口径只主张 1 笔低额 testnet evidence。所有截图必须脱敏 |
| 截止 | 6月10日 |

### R-06 🟡 路演当天网络/环境问题

| 字段 | 内容 |
|------|------|
| 等级 | 🟡 P2 |
| 负责人 | 严硕（总控） + 物料 |
| 发现日期 | 6月8日 |
| 影响 | 路演当天网络不稳定会导致 Demo 卡住 |
| 缓解措施 | 准备本地录屏版本 + 全流程截图包 |
| 截止 | 6月12日 |

---

## 已关闭风险

### R-01 🟢 CAW 配置已到位

| 字段 | 内容 |
|------|------|
| 等级 | 🟢 P3（已关闭） |
| 负责人 | gitgdut（合约/CAW） |
| 发现日期 | 6月8日 |
| 关闭日期 | 6月9日 |
| 关闭原因 | API Key 已申请，Agent Wallet 已创建（active），SDK 确认（cobo-agentic-wallet v0.1.40），完整后端对接文档已交付（518行） |

### R-03 🟢 前端已部署 Vercel

| 字段 | 内容 |
|------|------|
| 等级 | 🟢 P3（已关闭） |
| 负责人 | Aafff623（前端） |
| 发现日期 | 6月8日 |
| 关闭日期 | 6月8日 |
| 关闭原因 | 前端已部署 Vercel，Landing + Demo + i18n + 主题切换 + 纯黑风格完整可用 |

---

## 风险更新规则

1. 新风险发现后当天更新到本文档
2. 每晚站会必须同步最高风险
3. P0 风险必须有兜底方案，不允许"走一步看一步"
4. 风险关闭条件：问题已解决且有验证证据
5. 兜底方案一旦启用，通知全员并更新此文档
