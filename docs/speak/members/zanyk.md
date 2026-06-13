# ZanyK · 指导 / 交付总控

> 第一人称陈述 · 可用于视频引入或路演开场

---

我是 ZanyK，队里的指导和交付总控，也可以理解成这个项目的「值班长」。

6 月 1 日黑客松开打之后，我们选的是 **Cobo 赛道｜Agentic Economy × Cobo Agentic Wallet**。大家问过很多次：DAO 付钱到底痛在哪？我们最后钉死一个场景——**小团队每月给贡献者结算 USDC，既要快，又不能乱花钱**。这就是 AgentCFO 名字的由来：给 DAO 一个**带受控钱包的 AI 财务官**。

我主要负责的不是写业务代码，而是把六个角色拧成一条交付链：

- 在 GitHub 上建仓库、拉人、维护 README 和 `docs/pm/` 全套管理文档
- 每天对照 `TASK_BOARD.md` 盯进度，22:00 站会，风险升级
- 把后端契约、前端 Demo、CAW 证据三条线对齐，避免 README 说一套、代码跑另一套
- 6 月 13 日前推动提交清单闭环：Repo、README、视频、tx hash、PPT

**GitHub 这边我具体做了什么：**

- 创建并维护 https://github.com/San-Y108/agent-cfo ，开放 collaborator
- 推动 README 从「技术手册」打磨为赛方可读的**项目首页**（Hero、Showcase、赛事、CAW 证据）
- 建立 `docs/backup/`、`docs/backend/`、`docs/plans/` 文档结构，技术细节下沉、首页保持可读
- 协调 demo-sample 与白名单修复，让 Bob blocked、Data API 5 USDC 与 Demo 脚本一致
- 维护 `AGENTS.md`、`CLAUDE.md`，让多 Agent 协作时不越界改代码

**PPT 这边：** 我用 ppt-master 流程产出了 14 页路演稿 `assets/ppt/agentcfo-pitch.pptx`，从 Problem → Flow → CAW Evidence → Team 全覆盖；每页演讲备注在 `assets/ppt/agentcfo-pitch/notes/`。物料同学也提供了 PDF 同稿 `assets/ppt/material/agentcfo-pitch-material-team-v1.pdf`。

如果评委只问一句「你们怎么在六天里交付的」——我的回答是：**先钉 P0 闭环，再补 CAW 真证据，最后把故事讲清楚**；代码可以 mock，但边界不能糊。
