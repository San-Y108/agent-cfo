# Demo 视频录制指南

> 通俗分镜 + 口播稿 · 约 3–4 分钟 · 从 Landing 开录  
> 配套流程大纲：[`outline-flow.md`](outline-flow.md)

---

## 录制前准备（3 分钟）

- Tab A：`https://agentcfo-frontend.vercel.app`
- Tab B：`https://github.com/San-Y108/agent-cfo`（滚到 CAW Testnet 证据）
- Console 语言切 **中文**；浏览器全屏；关通知
- 录屏：`Win + Alt + R` 或 OBS；**只录 1–2 遍**，小失误继续

底线口播（收尾必说）：

> 「演示是 Mock 模式，完整流程可跑；真实 CAW 测试网证据在 README。」

---

## 压缩版分镜（约 3 分 20 秒）

### Landing 开场（0:00 – 1:15）

**口播：**

> 我们是 AgentCFO，Cobo 赛道。小 DAO 月底要给贡献者发 USDC，靠表格易错，多签太慢。AgentCFO：AI 列清单，风控把关，你点头，Cobo 钱包才付钱，最后出审计报告。

**动作：** 首屏停留 → 滚到 **工作流** 指五步 → Footer **进入 Console**

### Console 主流程（1:15 – 2:25）

**口播：**

> Demo：Alice 20、Bob 15、Charlie 10、Data API 5，预算 50。Bob 不在白名单，用来演示拦截。顶栏 Mock 徽章——稳定演示，不发起真实转账。

**动作（Agent Hub）：** 依次点 **生成计划 → 检查风险 → 查看审计**；Agent 回复出现 **Bob blocked** 时停 2 秒

### GitHub 证据（2:25 – 3:05）

**口播：**

> Sepolia 已完成两笔低额 CAW 转账，hash 在 README。演示 Mock，能力已验证；Human Approval 和风控是硬边界。

**动作：** 切 Tab B，划过两笔 txHash（不必念全）

### 收尾（3:05 – 3:20）

> AgentCFO——AI 帮忙算账，规则决定放行，人类确认，CAW 才真正动钱。谢谢。

---

## 千万别说

- 「已完成三笔商业链上付款」（仅 2 笔 testnet evidence）
- 把 Mock 里的 txHash 说成真的
- 展示 API Key 或完整钱包地址

---

## 录完后：

1. 视频放入 **`assets/video/agentcfo-demo.mp4`**（团队共同资产，不要拖进 frontend）
2. 对 Agent：**「按 demo-video-landing-integration-plan 适配」**

详见 [`docs/plans/demo-video-landing-integration-plan.md`](../../../docs/plans/demo-video-landing-integration-plan.md)

## 相关陈述稿

- 六人合集：[`dialogue-collection.md`](dialogue-collection.md)
- 流程大纲：[`outline-flow.md`](outline-flow.md)
- 个人稿：[`members/`](members/)
