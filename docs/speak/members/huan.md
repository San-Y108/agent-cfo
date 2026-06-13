# 欢 · PM

> 第一人称陈述

---

我是欢，队里的 PM，管的是「做什么、什么时候交、谁来做」。

黑客松时间很短，我最怕的不是技术难，而是**五个人各写各的、最后拼不起来**。所以我从第一天就把需求拆成可验收的块：P0 必须能演示「计划 → 风控 → 人工确认 → 执行 → 审计」，Bob 必须 blocked，CAW 必须是真路径而不是贴图。

**我日常在盯这些事：**

- 维护 `docs/pm/TASK_BOARD.md`：每个 T-xxx 任务有负责人、截止、状态
- 写和更新 `SUBMISSION_CHECKLIST.md`、`DEMO_REHEARSAL_CHECKLIST.md`，对照赛方提交项打勾
- 组织站会模板 `DAILY_STANDUP.md`，同步 BLOCKED 项——比如物料逾期、后端生病时谁顶班
- 和后端、前端、CAW 对齐 **Demo 场景数据**：Alice 20 / Bob 15 / Charlie 10 / Data API 5，月预算 50

**分工委派上，我这样理解各岗：**

- 九九八乂：把 API 和风控引擎做「硬」——规则说了算，不是 LLM 说了算
- threetwoa：把流程做成评委一眼能看懂的界面，Landing 讲故事，Console 走流程
- purple sun：把「真花钱」这件事在 Sepolia 上跑通，给我们 tx hash 证据
- 呱呱：把视觉、PPT、视频变成对外脸面
- ZanyK：兜底交付和 GitHub 真相源

**和 GitHub / PPT 的关系：** 我不直接 push 业务代码，但我会验收「README 写的和 Demo 点出来的是不是一回事」。PPT 的 14 页结构也是我参与对齐的——封面讲赛道，第 7 页讲 Demo 四人场景，第 8 页讲 CAW 证据，第 13 页讲团队分工，避免路演和仓库两套叙事。

评委如果问「PM 贡献了什么」——我带来的是**可提交的秩序**：每个人知道自己该交什么、什么时候算完成。
