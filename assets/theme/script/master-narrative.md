# AgentCFO 团队与项目总稿

> 第三人称汇总稿 · 适用于提交材料「项目说明」、评委阅读、Demo 视频画外音底稿  
> 生成日期：2026-06-13

---

## 一、项目与赛事背景

**AgentCFO**（队名：链上财务官小队）参加 **AI × Web3 Agentic Builders Hackathon**，赛道为 **Cobo 赛道｜Agentic Economy × Cobo Agentic Wallet**，属 AI × Web3 School Bootcamp 实践阶段作品。

项目瞄准 DAO 与小团队的共性痛点：贡献者结算依赖人工表格，易漏发错发；支出事后难审计；传统多签安全但低效；全自动付款又有失控风险。AgentCFO 提出折中方案——**AI 负责整理贡献记录并生成付款计划，确定性风控引擎裁决可否付款，人类保留最终确认权，资金执行统一经 Cobo Agentic Wallet（CAW），全程输出可审计报告**。

核心 Demo 场景固定为四名对象：Alice（20 USDC）、Bob（15 USDC，**故意不在白名单以演示拦截**）、Charlie（10 USDC）、Data API 工具订阅（5 USDC），月预算 50 USDC、单笔限额 25 USDC。

---

## 二、团队组成与分工

| 成员 | 角色 | 核心贡献（经验化表述） |
|---|---|---|
| **ZanyK** | 指导 / 交付总控 | 建仓库、拉协作、维护 README 与 PM 文档体系，推动提交闭环，产出 14 页 ppt-master 路演稿 |
| **欢** | PM | 拆需求、排 TASK_BOARD、对照 SUBMISSION_CHECKLIST 验收，对齐 Demo 数据与路演叙事 |
| **呱呱** | 物料 / 设计 / 内容 | Banner、Showcase 截图、团队头像归类，PPT 视觉与 PDF，Demo 视频脚本结构 |
| **threetwoa** | 前端 | Landing 全页 + Console 五模块，Vercel 部署，API 适配与 Mock 演示稳定性 |
| **九九八乂** | 后端 / Agent | FastAPI P0 API、六条风控规则、Render 部署、P2 demo-safe 扩展、契约真相源 |
| **purple sun** | 合约 / CAW | CAW 集成、Sepolia testnet 证据、RealCawAdapter 联调、安全边界与脱敏 |

协作原则：**契约以后端代码为准；LLM 不具最终授权；blocked 款项不进 CAW；Audit Report 为不可变快照；线上默认 Mock，CAW 真证据单独公示。**

---

## 三、GitHub 仓库维护记录（摘要）

**仓库：** https://github.com/San-Y108/agent-cfo（public）

| 阶段 | 时间 | 主要里程碑 |
|---|---|---|
| Phase 0 启动 | 6/8 | 仓库创建；README 初版；`docs/pm/` 七份管理文档；FastAPI P0 scaffold；前端脚手架 |
| Phase 1 联调 | 6/9–10 | 前端对接 mock API；Landing 重设计；Console 工作台；Render 后端部署；Vercel 前端部署 |
| CAW 验证 | 6/10 | Phase 4C RealCawAdapter；Sepolia 低额转账证据；demo-sample 对齐四人场景 |
| Phase 2 扩展 | 6/10+ | P2 metadata/simulation API；Request Finance env-gated spike |
| 前端合并 | 6/10+ | PR #1 合并 main；Console Agent Hub / Treasury 持续打磨 |
| 文档合并 | 6/13 | README polish 首页；`docs/backend/` 技术下沉；`docs/backup/` 备份；MIT LICENSE |

**贡献分布（git shortlog）：** 前端 `Aafff623` 约 150+ commits；后端 `x0jujubayi` 约 48 commits；总控文档 `San-Y108` 约 31 commits。

**目录结构要点：**

- `app/` + `tests/` — 后端契约与验收
- `frontend/` — Next.js Landing + Console
- `docs/pm/` — 任务看板、提交清单、彩排清单
- `docs/backend/` — CAW、部署、env、P2、测试深文档
- `assets/theme/script/` — 路演 / Demo 陈述稿、团队分工口述、录制大纲
- `assets/theme/ppt/` — 路演 PPT 源工程与导出
- `assets/images/readme/` — README Showcase 与团队头像

---

## 四、产品交付：Landing Page

**URL：** https://agentcfo-frontend.vercel.app

Landing 承担「讲故事」职能，主要板块：

- **Hero**：一句话定位 + 进入 Console CTA
- **Workflow**：贡献记录 → 付款计划 → 风险检查 → 人工批准 → CAW → 审计
- **Guardrails**：预算、白名单、单笔限额、Human Approval
- **Platform / Pipeline**：模块边界与端到端管线叙事
- **Timeline**：从 scaffold 到 CAW testnet evidence 的建设路径
- **Built by Teams / FAQ / Footer**：团队叙事、常见问题、外链 GitHub 与 Console

截图已纳入 README Showcase 网格（`assets/images/readme/landing-*.png`）。

---

## 五、产品交付：Console Command Center

**URL：** https://agentcfo-frontend.vercel.app/console

Console 承担「走流程」职能：

| 模块 | 路径 | 功能 |
|---|---|---|
| Agent Hub | `/console` | 聊天式财务官；快捷「生成计划 / 检查风险 / 查看审计」 |
| Treasury | `/console/treasury` | 贡献记录 → 生成计划 → 风控动画 → 批准执行 → 审计与 CAW Status |
| Policy | `/console/policy` | 风控规则与 Guardrails 展示 |
| Wallets | `/console/wallets` | 钱包与资金视图 |
| Analytics | `/console/analytics` | 分析面板 |

Navbar 显示 **Mock 模式** 徽章；支持中英文。Demo 记忆点：**Bob 行 Blocked，其余 Ready/Executed**。

---

## 六、PPT 路演内容（14 页）

**文件：** `assets/theme/ppt/agentcfo-pitch.pptx` · 备注：`assets/theme/ppt/agentcfo-pitch/notes/`

| 页 | 主题 | 内容要点 |
|---|---|---|
| 01 | Cover | AgentCFO 定位 + Cobo 赛道 |
| 02 | Problem | DAO 付款四大痛点 |
| 03 | Solution | Agent / Risk / Human / CAW / Audit 五层边界 |
| 04 | Flow | 六步端到端闭环 |
| 05 | Features | 六大能力 + 双端部署 |
| 06 | Architecture | 前后端分层，LLM 非授权层 |
| 07 | Demo | 四人场景，Bob blocked |
| 08 | CAW Evidence | Sepolia tx，mock 兜底说明 |
| 09 | Tech Stack | Python/FastAPI/CAW SDK |
| 10 | API | P0 五端点 + status refresh |
| 11 | Roadmap | P0/P1 完成，P2 demo-safe |
| 12 | Why Cobo | 三方向赛道匹配 |
| 13 | Team | 六人分工 |
| 14 | Ending | CTA + 链接 |

物料 PDF：`assets/theme/ppt/material/agentcfo-pitch-material-team-v1.pdf`

---

## 七、链上与 CAW 证据

- Chain：Sepolia · Token：`SETH`
- Demo payment tx：`0x85a5a2e934ca0e34c7fb3e038ca06e54e15bd29b56b64e5b01ff80eb20ed4d98`
- Internal transfer tx：`0x6bd793bc3030c995245b2e73a466898e46278be092aa9f7a3c86cad21cbbae8a`
- Masked source：`0x2cda...76da`
- 线上 Render **默认 mock**；视频与 README 须区分 Mock 演示与 testnet 证据

---

## 八、当前完成度与待补项

**已完成：** 可运行前后端 Demo · P0 全链路 · Landing + Console · README polish · PPT 14 页 · 2 笔 CAW testnet 证据 · 管理文档体系

**提交前待补：** Demo 视频链接（3–5 分钟）· Console Treasury/Policy README 截图（可占位）· 成员 GitHub 主页链接 · 部分 README 图片资产入库 Git

---

## 九、一句话收尾

AgentCFO 用六天把「DAO 怎么安全、可审计地付钱」做成可点击、可复述、可查证的产品原型——**AI 帮忙算账，规则决定放行，人类按下确认，CAW 才真正动钱。**
