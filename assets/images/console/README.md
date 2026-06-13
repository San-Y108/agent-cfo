# Console 设计资产

Console Command Center 的 **模块吉祥物** 与 **多模块聚合参考页**（GPT / 设计稿导出）。

## 目录

```text
assets/images/console/
├── module-mascots/     # 五模块页嵌入用 3D 吉祥物（各 1 张）
└── references/         # 多模块混排参考页（非单页截图）
```

## 模块吉祥物 → Console 五页

| 模块 | 路由 | 模块色 | 资产文件 | 场景关键词 |
| --- | --- | --- | --- | --- |
| **Agent** | `/console` | lime `#B5FF4D` | `module-mascots/agent-module-mascot.png` | AI 对话 · 聊天气泡 |
| **Treasury** | `/console/treasury` | cyan `#5EEAD4` | `module-mascots/treasury-module-mascot.png` | 审计报告 · 付款闭环 |
| **Wallets** | `/console/wallets` | blue `#60A5FA` | `module-mascots/wallets-module-mascot.png` | 金库资产 · 验证通过 |
| **Analytics** | `/console/analytics` | violet `#C084FC` | `module-mascots/analytics-module-mascot.png` | 效率图表 · KPI |
| **Policy** | `/console/policy` | coral `#FB7185` | `module-mascots/policy-module-mascot.png` | 护盾 · Guardrail 预检 |

前端运行时镜像：`frontend/public/console/mascots/modules/{slug}-module.png`

设计规范：`frontend/docs/plans/console-stage-layout-plan.md` · `frontend/docs/reports/console-design-report-2026-06-13.md`

## 聚合参考页（四张）

用于 **多模块 UI 混排** 的布局参考，**不是**单模块页面截图，也 **不是** README Showcase 用图。

| 参考 ID | 文件 | 布局特征 |
| --- | --- | --- |
| `command-center-grid` | `references/ref-command-center-grid.png` | 深色 · 五模块等分卡片网格 |
| `treasury-focus-split` | `references/ref-treasury-focus-split.png` | 浅色 · Treasury Tab 激活 · 侧栏混排 |
| `agent-treasury-hub` | `references/ref-agent-treasury-hub.png` | 左主舞台 Agent+Treasury Workflow · 右四模块卡片 |
| `console-overview-light` | `references/ref-console-overview-light.png` | 浅色 · Agent 侧栏 · 五模块总览 |

## 与 README Showcase 的区别

| 类型 | 路径 | 用途 |
| --- | --- | --- |
| 单页产品截图 | `assets/images/readme/console-*.png` | GitHub README · 路演 |
| 模块吉祥物 | `console/module-mascots/` | 嵌入各模块 Stage 页 |
| 聚合参考页 | `console/references/` | 前端实现时的混排布局参考 |

## 投递来源

`inbox/module-mascots/` · `inbox/console-references/` → 复制到本目录 → 同步 `frontend/public/` → 删除 inbox 源文件（见 [`inbox/README.md`](../../../inbox/README.md)）。
