# inbox — 待归类投递区

队友或 AI 先把**未归类的草稿、导出物、截图**放在对应子目录；整理后迁入 `assets/` / `frontend/public/`，并删除本区文件。

## 目录结构

```text
inbox/
├── team-mascots/          # ① 成员名字 × 3D 吉祥物（6 人）
├── 3d-assets/             # ② 产品级 3D 素材（Agent CFO）
├── screenshots/           # ③ 成员微信头像
│   └── team-avatars/
├── landing/               # ④ Landing Page 区段截图
├── module-mascots/        # ⑤ Console 五模块页吉祥物（各 1 张）
└── console-references/    # ⑥ 多模块聚合参考页（4 张）
```

---

## ① 成员名字与吉祥物

| 成员 | 角色 | inbox 源文件 | 前端运行时 | 团队资产归档 |
| --- | --- | --- | --- | --- |
| **九九八乂** | 后端 Agent | `team-mascots/jiujiu-mascot-source.png` | `frontend/public/console/mascots/jiujiu-mascot.png` | `assets/images/readme/team/jiujiu-mascot.png` ✅ |
| **threetwoa** | 前端 | `team-mascots/threetwoa-mascot-source.png` | `…/threetwoa-mascot.png` | `…/threetwoa-mascot.png` ✅ |
| **purple sun** | 合约 / CAW | `team-mascots/purple-sun-mascot-source.png` | `…/purple-sun-mascot.png` | `…/purple-sun-mascot.png` ✅ |
| **呱呱** | 物料 / 设计 | `team-mascots/guagua-mascot-source.png` | `…/guagua-mascot.png` | `…/guagua-mascot.png` ✅ |
| **欢** | PM | `team-mascots/huan-mascot-source.png` | `…/huan-mascot.png` | `…/huan-mascot.png` ✅ |
| **ZanyK** | 导师 | `team-mascots/zanyk-mascot-source.png` | `…/zanyk-mascot.png` | `…/zanyk-mascot.png` ✅ |

代码映射：`frontend/components/console/agent-mascot-stage.tsx`（成员轮播 · 角色色）

---

## ② 3D 素材（产品 / Agent）

| 用途 | inbox 源文件 | 处理后 / 运行时 | 说明 |
| --- | --- | --- | --- |
| Agent CFO 全身吉祥物 | `3d-assets/agent-cfo-mascot-source.png` | `frontend/public/console/mascots/agent-cfo-mascot.png` | 去背景：`frontend/scripts/remove-mascot-bg.py` |
| Agent 聊天头像 | `3d-assets/agent-cfo-avatar-source.png` | `…/agent-cfo-avatar.png` | 头部裁切版 |
| Agent Pipeline 3D 插图 | `3d-assets/agent-pipeline-3d-source.png` | — | 待接入 Landing / Console（如有） |

代码映射：`frontend/components/console/agent-cfo-mascot.tsx`（Agent Hub PersonaRail）

---

## ③ 对应截图（成员微信头像）

| 成员 | inbox 源文件 | 归档目标 |
| --- | --- | --- |
| threetwoa | `screenshots/team-avatars/threetwoa-role-source.jpg` | `assets/images/readme/team/threetwoa-role.jpg` ✅ |
| 九九八乂 | `…/jiujiu-role-source.jpg` | `…/jiujiu-role.jpg` ✅ |
| purple sun | `…/purple-sun-role-source.jpg` | `…/purple-sun-role.jpg` ✅ |
| 呱呱 | `…/guagua-role-source.jpg` | `…/guagua-role.jpg` ✅ |
| 欢 | `…/huan-role-source.jpg` | `…/huan-role.jpg` ✅ |
| ZanyK | `…/zanyk-role-source.jpg` | `…/zanyk-role.jpg` ✅ |

Console 单页产品截图（README Showcase，非 inbox 投递）：

| 页面 | 路径 |
| --- | --- |
| Agent Hub | `assets/images/readme/console-agent-hub.png` |
| Treasury | `…/console-treasury.png` |
| Wallets | `…/console-wallets.png` |
| Analytics | `…/console-analytics.png` |
| Policy | `…/console-policy.png` |

---

## ④ Landing Page 截图

| Landing 区块 | inbox 源文件 | 归档目标 |
| --- | --- | --- |
| Hero / 全页 | `landing/landing-hero-source.png` | `assets/images/readme/landing-hero.png` ✅ |
| Banner | `landing/banner-source.png` | `…/banner.png` ✅ |
| Pipeline · Platform · Guardrails · Timelines · Built by Teams · FAQ · Footer | `landing/landing-*-source.png` | `assets/images/readme/landing-*.png` ✅ |

---

## ⑤ Console 五模块吉祥物（新增）

紫发女孩 + 小球机器人 **按模块场景定制** 的 3D 插图；后续嵌入 Treasury / Wallets / Analytics / Policy / Agent 各模块 Stage 页。

| 模块 | 路由 | 模块色 | inbox 源文件 | 归档 / 运行时 |
| --- | --- | --- | --- | --- |
| **Agent** | `/console` | lime `#B5FF4D` | `module-mascots/agent-module-mascot-source.png` | `assets/images/console/module-mascots/agent-module-mascot.png` · `frontend/public/console/mascots/modules/agent-module.png` ✅ |
| **Treasury** | `/console/treasury` | cyan `#5EEAD4` | `…/treasury-module-mascot-source.png` | `…/treasury-module-mascot.png` · `…/treasury-module.png` ✅ |
| **Wallets** | `/console/wallets` | blue `#60A5FA` | `…/wallets-module-mascot-source.png` | `…/wallets-module-mascot.png` · `…/wallets-module.png` ✅ |
| **Analytics** | `/console/analytics` | violet `#C084FC` | `…/analytics-module-mascot-source.png` | `…/analytics-module-mascot.png` · `…/analytics-module.png` ✅ |
| **Policy** | `/console/policy` | coral `#FB7185` | `…/policy-module-mascot-source.png` | `…/policy-module-mascot.png` · `…/policy-module.png` ✅ |

场景关键词：Agent 聊天气泡 · Treasury 审计报告 · Wallets 金库验证 · Analytics 效率图表 · Policy 护盾预检

详细说明：[`assets/images/console/README.md`](../assets/images/console/README.md)

---

## ⑥ Console 聚合参考页（新增）

**多模块 UI 混排** 的设计参考（GPT 生成稿），对应 Command Center 整体布局方向，**不是**单一组件截图。

| 参考 ID | inbox 源文件 | 布局特征 | 归档 |
| --- | --- | --- | --- |
| `command-center-grid` | `console-references/ref-command-center-grid-source.png` | 深色 · 五模块等分卡片网格 | `assets/images/console/references/ref-command-center-grid.png` ✅ |
| `treasury-focus-split` | `…/ref-treasury-focus-split-source.png` | 浅色 · Treasury Tab 激活 · 侧栏混排 | `…/ref-treasury-focus-split.png` ✅ |
| `agent-treasury-hub` | `…/ref-agent-treasury-hub-source.png` | 左 Agent+Treasury 主舞台 · 右四模块卡片 | `…/ref-agent-treasury-hub.png` ✅ |
| `console-overview-light` | `…/ref-console-overview-light-source.png` | 浅色 · Agent 侧栏 · 五模块总览 | `…/ref-console-overview-light.png` ✅ |

前端实现参考：`frontend/docs/plans/console-stage-layout-plan.md`

---

## 归类规则（其他类型）

| 类型 | 迁入目标 |
| --- | --- |
| 路演 PPT / PDF | `assets/ppt/` |
| Demo 视频 | `assets/video/agentcfo-demo.mp4` |
| Logo、设计稿 | `assets/design/` |
| 文字草稿 | `docs/` |

## 整理流程

1. 新文件放入上表对应 **inbox 子目录**（勿用 hash 文件名堆根目录）
2. 复制到 **assets 归档** + **frontend/public 运行时**（吉祥物类）
3. 更新本 README 与 `assets/images/console/README.md`
4. 确认无误后 **删除 inbox 源文件**

## 当前状态

- 2026-06-13：①–④ 多数已迁入 `assets/images/readme/`；inbox 保留 `-source` 备份
- 2026-06-13：**⑤ 五模块吉祥物**、**⑥ 四张聚合参考页** 已分类并同步至 `assets/images/console/` 与 `frontend/public/console/mascots/modules/`
- 待办：前端各模块 Stage 页接入 `{slug}-module.png`；确认后可清空 inbox 已归档 `-source` 文件
