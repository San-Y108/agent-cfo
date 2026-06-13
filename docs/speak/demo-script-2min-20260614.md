# AgentCFO 2 分钟 Demo 录制脚本

> 用途：2026-06-14 Demo Day 现场 / 预录视频  
> 目标时长：**110–120 秒**（留 5 秒缓冲）  
> 演示入口：https://agentcfo-frontend.vercel.app  
> 配套材料：PPT `assets/ppt/agentcfo-pitch.pptx` · 完整版脚本见 `docs/speak/`

---

## 录制前 30 秒检查

1. 浏览器打开 **`https://agentcfo-frontend.vercel.app`**，全屏，切中文。
2. 关闭通知 / 书签栏 / 其他标签页（只留 Landing 一个标签）。
3. 确认页面首屏 Slogan 可见，无白屏。
4. 录屏开始后再开口；不要等页面加载时说话。

---

## 分镜脚本（秒级）

### 0:00–0:15｜开场 + 痛点（15 秒）

**画面**：Landing Hero 首屏，不要滚动。

**口播**：

> 「我们是 AgentCFO，参加 Cobo 赛道。DAO 小团队月底给 Alice、Bob、Charlie 发 USDC，靠表格容易漏发错发；多签又太慢。我们要给每个 DAO 一个带受控钱包的 AI 财务官。」

**动作**：
- 0:00 开口同时，鼠标轻点一下页面任意空白处，让评委看到页面是活的。
- 0:12 时，鼠标移向首屏 CTA「进入 Console」。

---

### 0:15–0:25｜进入 Console + 点题（10 秒）

**画面**：点击后进入 `/console`，Agent Hub 聊天界面。

**口播**：

> 「这是 Console 指挥中心。先看顶栏——Mock 模式，稳定演示全链路，不动真钱。」

**动作**：
- 0:15 点击「进入 Console」。
- 0:18 进入 Console 后，鼠标**指一下顶栏 Mock 徽章**（停留 1 秒）。
- 0:20 回到聊天区，准备点快捷按钮。

---

### 0:25–0:55｜走核心流程：生成计划 → 风险检查 → 查看审计（30 秒）

**画面**：Agent Hub 的快捷按钮三连击。

**口播**：

> 「Demo 场景固定：Alice 20、Bob 15、Charlie 10、Data API 5，月预算 50，单笔限额 25。点生成计划——AI 整理贡献记录；点检查风险——规则引擎判断；点查看审计——执行结果。注意 Bob 被拦，因为他的地址不在白名单。」

**动作**：
- 0:25 点击「生成计划」按钮。
- 0:30 Agent 回复出现后，点击「检查风险」。
- 0:38 风险结果出现后，点击「查看审计」。
- 0:45 审计结果出现后，鼠标**停在 Bob 的 Blocked 状态上 2 秒**，让评委看清楚。
- 0:52 切到 `/console/treasury`（侧边导航或地址栏）。

> **若 Agent Hub 三连击任一环节卡住**：直接切 Treasury，用 Treasury 的大按钮走同样流程。

---

### 0:55–1:15｜Treasury 时间轴 + 风控可视化（20 秒）

**画面**：Treasury 模块，Flow Timeline + 风险仪表盘。

**口播**：

> 「在 Treasury 里能看完整管线：贡献记录、付款计划、风险检查、人工确认、CAW 执行、审计报告。Bob 这行是红的，其余三笔通过并执行。这不是 AI 拍板，是白名单、预算、单笔限额写死在风控里。」

**动作**：
- 0:55 进入 Treasury 后，鼠标**从上到下划过 Flow Timeline** 的 5 个节点。
- 1:00 指一下左侧 Records 列表里的 **Bob（带 Blocked 徽章）**。
- 1:05 指一下右侧风险概览的「通过 / 拦截」数字。
- 1:10 展开右下角 Detail Deck（如果默认没展开），露出 Audit Snapshot + CAW Status。

---

### 1:15–1:40｜真链证据：切 GitHub README（25 秒）

**画面**：切到浏览器新标签，打开 `https://github.com/San-Y108/agent-cfo`，滚动到 **CAW Testnet 证据** 章节。

**口播**：

> 「演示是 Mock，但 CAW 真实能力已经跑通。我们在 Sepolia 测试网完成了两笔低额转账，tx hash 写在 README 里，可查证。Human Approval 和 Risk Engine 是硬边界——AI 不能跳过人直接动钱。」

**动作**：
- 1:15 切标签到 GitHub。
- 1:18 滚动到 README 的 **CAW Testnet 证据** 表格。
- 1:22 鼠标划过第一笔 txHash（`0x85a5…0ed4d98`），停留 2 秒。
- 1:27 划过第二笔 txHash（`0x6bd7…bae8a`），停留 2 秒。
- 1:32 上滚到 **为什么需要 AgentCFO** 或 **核心边界** 表格，让五层边界露出来。

---

### 1:40–1:55｜收尾 + CTA（15 秒）

**画面**：可切回 Landing Footer 或停在 GitHub README 的链接区。

**口播**：

> 「AgentCFO——AI 帮忙算账，规则决定放行，人类按下确认，CAW 才真正动钱。在线 Demo 和 GitHub 都在这里，欢迎体验。谢谢。」

**动作**：
- 1:40 切回 Landing 页面，滚动到 Footer。
- 1:45 鼠标停在 Footer 的 GitHub + Demo 链接上。
- 1:52 微笑/点头，停顿 2 秒，再结束录屏。

---

## 时间轴总览

| 时间段 | 画面 | 核心信息 |
|---|---|---|
| 0:00–0:15 | Landing Hero | 我们是谁 + 痛点 |
| 0:15–0:25 | `/console` Agent Hub | Mock 模式说明 |
| 0:25–0:55 | Agent Hub 三连击 | 生成计划 → 风险检查 → 审计；Bob blocked |
| 0:55–1:15 | `/console/treasury` | 完整管线 + 风控可视化 |
| 1:15–1:40 | GitHub README CAW 证据 | 真链 testnet 证据 |
| 1:40–1:55 | Landing Footer | 收尾 slogan + CTA |

---

## 必须说的一句话（底线）

> 「演示是 Mock 模式，完整流程可跑；真实 CAW 测试网证据在 README。」

这句话可以在 0:18 或 1:15 说一次即可。

---

## 绝对不能说

- ❌「我们完成了三笔商业链上付款」——只有 2 笔 testnet evidence。
- ❌「Bob 被 AI 拒绝了」——Bob 是被**白名单规则**拦截，不是 AI 决策。
- ❌ 把 Mock 界面里出现的 txHash 说成链上真实 hash。
- ❌ 展示完整钱包地址或 API Key。

---

## 备用方案（B 计划）

如果现场网络或 Console 卡住：

1. 立刻切到 **GitHub README**。
2. 口播改为：「线上 Demo 在 Vercel，这里是我们的核心流程图和 CAW 测试网证据。」
3. 快速划过：流程图 → CAW 证据 → 团队 → 结束。
4. 控制在 60 秒内完成。

---

## 录制后

1. 视频文件放入 `assets/video/agentcfo-demo.mp4`。
2. 更新 `README.md` § Demo Video 的在线链接。
3. 至少回看一遍，检查口播与画面是否同步。
