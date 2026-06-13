# threetwoa · 前端

> 第一人称陈述

---

我是 threetwoa，负责前端——评委看到的**每一个像素和每一次点击**，基本都在我这边。

6 月 8 日晚上脚手架跑通之后，我的工作分两条线：**Landing 讲清楚故事**，**Console 走通付款流程**。线上地址：https://agentcfo-frontend.vercel.app

**Landing Page 我做了什么：**

- **Hero 首屏**：「让 DAO 金库决策变成可执行的付款流」，配 CTA「运行付款流程」直达 Console
- **工作流 Workflow**：五步卡片——计划 → 风控 → 人工批准 → CAW → 审计
- **Guardrails**：预算、白名单、Human Approval，fail-closed 叙事
- **Platform / Pipeline / Timeline / FAQ / Footer**：完整营销叙事，Footer 链到 GitHub 和 Console
- 视觉：Velorix 风格 Hero 视频背景、GSAP 滚动锚点、3D HSM 卡片、Pipeline 双栏编排

**Console Command Center 我做了什么：**

- **Agent Hub**（`/console`）：聊天式财务官工作台，底部三个快捷按钮——「生成计划」「检查风险」「查看审计」，和全局 `console-state` 联动
- **Treasury**（`/console/treasury`）：完整时间轴——Generate Plan → Risk Gate 动画 → Approve & Execute → Audit + CAW Status
- **Policy / Wallets / Analytics**：风控规则展示、钱包视图、分析面板，与全局状态打通
- 顶栏 **Mock 模式徽章** + 中英文切换，避免评委误会当前环境
- API 适配层 `frontend/lib/api/*`，mock / real 双模式；`run-demo-flow.ts` 串联四条后端 API

**GitHub 上我的主要提交（节选）：**

- `feat(landing)`：Hero、Pipeline、FAQ、Footer 等整页视觉与交互
- `feat(console)`：布局骨架、Agent Hub、Treasury 路由、全局 state、模块联动
- `fix(console)`：Treasury 宽度、Policy 三列、移动端 whitelist 卡片等路演前修复
- 仓库累计前端提交 150+（`Aafff623`），PR #1 `feat/frontend-bootstrap` 已合并 main

**和 PPT / Demo 视频的关系：**

- PPT 第 7 页 Demo 场景，就是我在 Console 里实现的 Alice/Bob/Charlie/Data API
- 录视频时建议从我做的路径走：Landing → Agent Hub 三按钮 →（可选）Treasury 指 Bob 红字 → GitHub CAW 证据
- 我会明确口播：**线上 Mock 可稳定演示全链路；真实 CAW tx 在 README，不伪造链上记录**

前端不是「贴皮」，而是把后端和 CAW 同学做的硬规则，变成评委**一眼看懂**的产品体验。
