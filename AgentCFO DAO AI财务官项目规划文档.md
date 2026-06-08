# AgentCFO  DAO AI 财务官 黑客松项目规划文档

# AgentCFO / DAO AI 财务官 黑客松项目规划文档

## 一、项目定位

项目名称暂定：

**AgentCFO｜DAO AI 财务官**

一句话介绍：

**AgentCFO 是面向 Web3 小团队 / DAO 的 AI 财务官。它可以读取贡献记录、预算规则和付款需求，自动生成付款计划，并通过 Cobo Agentic Wallet 在预算、白名单、单笔限额和人工确认边界内执行真实链上付款，最后输出可审计的结算报告。**

我们参加的是 **Cobo 赛道**，核心是要证明：

**AI Agent 可以参与真实经济活动，并且资金操作必须通过 Cobo Agentic Wallet 完成。**

## 二、赛道匹配说明

Cobo 赛道关注 **Agentic Commerce**，也就是让 AI Agent 具备花钱、转账、结算、资产调度等真实资金执行能力。

AgentCFO 对应的赛道方向主要是：

### 1. Agent-Native Payments

Agent 根据贡献记录和预算规则，自动生成付款计划，并发起付款。

### 2. Agent Resource Procurement

Agent 可以判断 DAO 本月需要支付哪些工具订阅、服务费用或贡献者报酬，并在预算范围内完成采购 / 结算。

### 3. A2A Economy / Treasury Management

后续可以扩展到多个 Agent 管理不同部门预算，例如内容 Agent、设计 Agent、开发 Agent 各自管理自己的小预算，再统一向 DAO Treasury 汇报。

## 三、MVP 核心场景

本次 Demo 不做大而全的财务系统，只做一个非常清楚的 MVP：

**DAO 本月需要完成一次贡献者小额结算和一笔工具订阅付款。AgentCFO 读取贡献记录，生成付款计划，检查风险，并通过 Cobo Agentic Wallet 执行测试网付款。**

### Demo 故事

一个 Web3 小团队本月有 3 个贡献者和 1 个工具订阅费用：

| 对象     | 类型     | 说明               | 金额    |
| -------- | -------- | ------------------ | ------- |
| Alice    | 贡献者   | 写了一篇活动复盘   | 20 USDC |
| Bob      | 贡献者   | 设计了活动海报     | 15 USDC |
| Charlie  | 贡献者   | 维护社群并整理数据 | 10 USDC |
| Data API | 工具订阅 | 本月数据服务订阅费 | 5 USDC  |

AgentCFO 读取这份记录后：

1. 自动识别收款人、金额、钱包地址和付款原因。
2. 检查是否超过预算。
3. 检查是否超过单笔限额。
4. 检查钱包地址是否在白名单内。
5. 发现异常时暂停付款，例如地址不在白名单、金额超过限额、重复付款。
6. 生成人类可读的付款计划。
7. 人类确认后，通过 Cobo Agentic Wallet 执行付款。
8. 最后展示 Transaction Hash、Agent Wallet 地址、付款状态和审计报告。

## 四、项目核心价值

### 1. 对 DAO / Web3 小团队的价值

很多 Web3 小团队不是没有钱，而是缺少清晰、透明、低成本的资金执行流程。

常见问题包括：

- 贡献者结算靠人工表格，容易漏发、错发、重复发。
- DAO 支出不透明，事后很难追踪。
- 订阅费用、工具费用、赏金费用散落在不同地方。
- 普通多签虽然安全，但每笔小额付款都要多人确认，效率低。
- 完全自动化又有风险，容易失控。

AgentCFO 的价值是：

**让 Agent 负责整理、判断和生成付款计划，让 CAW 负责受控执行资金，让人类保留关键确认权。**

### 2. 对 Cobo 赛道的价值

AgentCFO 不是把钱包当展示元素，而是把 CAW 放在资金流程核心位置：

- Agent 的付款必须通过 CAW 完成。
- CAW 用于管理 Agent 钱包。
- CAW 承载预算、白名单、单笔限额、有效期等权限边界。
- Agent 不能无限制花钱，只能在授权范围内执行。
- 最终付款结果可以通过链上交易和 tx hash 验证。

## 五、产品流程

完整流程如下：

```
贡献记录 / 订阅账单输入
↓
AgentCFO 解析任务
↓
生成付款计划
↓
风险检查：预算、白名单、限额、重复付款
↓
人类确认
↓
Cobo Agentic Wallet 执行付款
↓
链上交易完成
↓
生成审计报告
```

## 六、MVP 功能范围

### 必须完成

| 模块        | 必须实现的内容                                               |
| ----------- | ------------------------------------------------------------ |
| 任务输入    | 支持输入 / 上传一份 mock 贡献记录，包含成员、任务、金额、钱包地址 |
| AI 付款计划 | Agent 根据贡献记录生成付款计划和付款原因                     |
| 风险检查    | 检查预算、白名单、单笔限额、重复付款                         |
| 人工确认    | 付款前必须有确认按钮，不能直接自动转账                       |
| CAW 付款    | 通过 Cobo Agentic Wallet 完成测试网付款                      |
| 链上记录    | 展示 tx hash、Agent Wallet 地址、测试网地址                  |
| 审计报告    | 展示每笔付款原因、状态、风险检查结果和剩余预算               |
| Demo 视频   | 录制 3–5 分钟完整演示视频                                    |
| README      | 写清楚项目目标、架构、运行方式、CAW 使用位置、关键代码说明   |

### 可以做但不强求

| 模块                 | 说明                                                         |
| -------------------- | ------------------------------------------------------------ |
| Request Network      | 可以作为发票 / 账单记录层，但不是 MVP 必须项                 |
| Sablier Flow         | 可以作为长期 payroll / stream payment 扩展，但不建议首版强做 |
| Safe Module          | 可以作为权限控制参考，但本次重点还是 CAW                     |
| Notion / GitHub 输入 | 可以后续扩展，MVP 先用 CSV / JSON / 表格 mock 数据           |
| 多 Agent 财务系统    | 后续扩展，不作为首版目标                                     |

### 明确不做

| 不做内容          | 原因                                |
| ----------------- | ----------------------------------- |
| 真实主网资金      | 黑客松 Demo 风险高，使用测试网即可  |
| 复杂 DAO 治理投票 | 会拉长范围，偏离 Agent 资金执行主线 |
| 完整会计系统      | 容易变成普通财务后台                |
| 自动无限制付款    | 不符合安全边界，也不利于评审        |
| 多链复杂适配      | 时间有限，先跑通一条测试网链路      |

## 七、系统架构

### 前端

负责展示完整产品体验：

1. Landing / 项目介绍页
2. DAO 任务输入页
3. Agent 生成付款计划页
4. 风险检查页
5. 人工确认页
6. CAW 付款执行状态页
7. 审计报告页

### 后端

负责 Agent 逻辑和业务 API：

1. 接收贡献记录
2. 调用 LLM / Agent 生成付款计划
3. 执行规则检查
4. 生成结构化 payment plan
5. 调用 CAW / 钱包执行接口
6. 返回付款结果和审计日志

### 合约 / CAW

负责资金执行和权限边界：

1. 配置 Agent Wallet
2. 设置预算上限
3. 设置白名单地址
4. 设置单笔付款上限
5. 执行测试网付款
6. 返回 tx hash
7. 保留关键配置说明和代码片段

## 八、数据结构建议

### 贡献记录输入示例

```
[
  {
    "name": "Alice",
    "role": "Content Contributor",
    "task": "Wrote event recap article",
    "wallet": "0xAlice...",
    "amount": 20,
    "token": "USDC"
  },
  {
    "name": "Bob",
    "role": "Designer",
    "task": "Designed event poster",
    "wallet": "0xBob...",
    "amount": 15,
    "token": "USDC"
  },
  {
    "name": "Charlie",
    "role": "Community Operator",
    "task": "Managed community and exported data",
    "wallet": "0xCharlie...",
    "amount": 10,
    "token": "USDC"
  }
]
```

### 预算规则示例

```
{
  "monthlyBudget": 50,
  "singlePaymentLimit": 25,
  "allowedToken": "USDC",
  "whitelist": [
    "0xAlice...",
    "0xCharlie...",
    "0xDataAPI..."
  ],
  "requiresHumanApproval": true
}
```

### Agent 输出示例

```
{
  "summary": "AgentCFO generated a payment plan for 3 contributors and 1 subscription.",
  "totalAmount": 50,
  "riskLevel": "Medium",
  "payments": [
    {
      "recipient": "Alice",
      "amount": 20,
      "reason": "Completed event recap article",
      "status": "Ready"
    },
    {
      "recipient": "Bob",
      "amount": 15,
      "reason": "Designed event poster",
      "status": "Blocked",
      "risk": "Recipient address is not in whitelist"
    },
    {
      "recipient": "Charlie",
      "amount": 10,
      "reason": "Managed community and exported data",
      "status": "Ready"
    }
  ]
}
```

## 九、5 人分工

## 1. 交付 / 路演 / 总控

### 核心职责

负责项目最终对外呈现，保证所有模块能串成一个完整故事。

### 具体任务

- 负责 5 分钟左右路演上麦投屏。
- 负责最终 Demo 流程串联。
- 负责 GitHub 仓库管理。
- 负责建立 GitHub Repo、分支规则、README 目录结构。
- 对接物料、前端、后端、合约同学。
- 每天同步进度，发现卡点及时协调。
- 确认最后提交材料完整。
- 负责路演现场备用方案，例如视频播放、截图展示、备用链接。

### 交付物

- GitHub Repo
- 最终 README
- 项目提交清单
- 路演讲述版本
- Demo 链接 / 视频 / 备用截图
- 5 分钟路演流程

## 2. 物料 / 设计 / 内容

### 核心职责

负责让项目看起来完整、专业、有记忆点。

### 具体任务

- 设计 PPT。
- 设计 16:9 GitHub README 项目海报。
- 写项目 slogan 和核心文案。
- 录制 3–5 分钟项目演示视频。
- 配合交付同学打磨 5 分钟演讲稿。
- 统一视觉风格。

### 视觉建议

风格关键词：

```
AI CFO
DAO Treasury
Agentic Commerce
Clean dashboard
Black / green / white
Trust / audit / automation
```

建议主视觉：

```
一个 AI 财务官坐在 DAO Treasury 控制台前，
左边是贡献记录，
中间是 AI 风险检查，
右边是 Cobo Agentic Wallet 执行付款，
底部是链上 tx hash 审计记录。
```

### 交付物

- PPT
- README 头图，16:9
- 项目 Logo / 标题视觉
- 演示视频
- 路演讲稿
- 截图素材包

## 3. 前端

### 核心职责

负责把 Demo 做成评委能看懂、能操作、能投屏展示的产品界面。

### 页面需求

至少需要完成以下页面或模块：

1. 项目首页 / Dashboard
2. 贡献记录输入区
3. Agent 分析中状态
4. 付款计划卡片
5. 风险检查结果
6. 人工确认按钮
7. 付款执行状态
8. 审计报告结果页

### 页面流程

```
首页
→ 输入贡献记录
→ 点击 Generate Payment Plan
→ 展示 Agent 分析结果
→ 展示 Risk Check
→ 点击 Approve & Execute
→ 展示 CAW 执行中
→ 展示 tx hash 和 Audit Report
```

### 前端重点

- 不要只做表格，要做成 Agent 工作流。
- 一定要让评委看见 Agent 在“思考、检查、执行”。
- 每笔付款要显示原因。
- 异常付款要醒目标红，例如地址不在白名单。
- tx hash 要可以点击或复制。
- 最后审计报告要像一份正式财务结算报告。

### 交付物

- 可访问前端 Demo
- 前端代码
- 页面截图
- 和后端 API 对接完成
- 备用 mock 模式，如果后端或 CAW 临时不稳定，前端仍能展示完整流程

## 4. 后端 / Agent

### 核心职责

负责 AgentCFO 的“大脑”，也就是解析贡献记录、生成付款计划、做风险检查、输出审计日志。

### 具体任务

- 设计 Agent workflow。
- 接收前端传来的贡献记录和预算规则。
- 调用 LLM 生成付款计划。
- 用规则层检查预算、白名单、限额、重复付款。
- 输出结构化 payment plan。
- 调用合约 / CAW 相关接口执行付款。
- 保存或返回 audit log。
- 为前端提供 API。

### 建议 API

```
POST /api/payment-plan
输入贡献记录和预算规则
输出 Agent 生成的付款计划

POST /api/risk-check
输入付款计划
输出风险检查结果

POST /api/execute-payment
输入确认后的付款计划
调用 CAW 执行付款
输出 tx hash

GET /api/audit-report/:id
输出最终审计报告
```

### 风险检查规则

MVP 至少做 4 个：

1. 总金额是否超过预算。
2. 单笔金额是否超过上限。
3. 收款地址是否在白名单。
4. 是否存在重复收款 / 重复任务。

### 交付物

- 后端 API
- Agent 付款计划生成逻辑
- 风险检查逻辑
- audit log 输出
- 与前端联调完成
- 与合约 / CAW 执行接口联调完成

## 5. 合约 / Cobo Agentic Wallet

### 核心职责

负责让项目符合 Cobo 赛道硬要求：资金相关操作必须通过 CAW 完成，并且要体现权限控制、安全隔离和真实资金执行能力。

### 具体任务

- 阅读 Cobo Agentic Wallet 文档和 Quickstart。
- 跑通 CAW 基础流程。
- 创建或配置 Agent Wallet。
- 准备测试网 token。
- 配置预算、白名单、单笔限额等权限边界。
- 完成至少 1–3 笔测试网付款。
- 记录 Agent Wallet 地址。
- 记录 Transaction Hash。
- 整理 CAW 使用的关键代码或配置说明。
- 和后端同学对接付款执行接口。

### 赛道硬性证明

必须尽量提供：

- Agent Wallet 地址
- 测试网地址
- Transaction Hash
- CAW 关键代码 / 配置说明
- 付款流程截图
- 权限控制说明

### 交付物

- CAW 配置说明
- 付款执行代码
- 测试网交易记录
- tx hash 列表
- Agent Wallet 地址
- 风险边界说明

## 十、项目需求表

| 类别   | 需求                                      | 优先级 | 负责人             |
| ------ | ----------------------------------------- | ------ | ------------------ |
| 产品   | 明确 AgentCFO 的一句话定位                | P0     | 交付 / 物料        |
| 产品   | 完成完整 Demo Story                       | P0     | 交付               |
| 产品   | 确定 MVP 只做 DAO 贡献结算 + 工具订阅付款 | P0     | 全员               |
| 前端   | Dashboard 页面                            | P0     | 前端               |
| 前端   | 贡献记录输入 / 上传模块                   | P0     | 前端               |
| 前端   | Agent 付款计划展示                        | P0     | 前端               |
| 前端   | 风险检查结果展示                          | P0     | 前端               |
| 前端   | 人工确认付款按钮                          | P0     | 前端               |
| 前端   | tx hash / 审计报告展示                    | P0     | 前端               |
| 后端   | payment plan API                          | P0     | 后端               |
| 后端   | risk check API                            | P0     | 后端               |
| 后端   | execute payment API                       | P0     | 后端 / 合约        |
| 后端   | audit report 输出                         | P0     | 后端               |
| Agent  | LLM 生成付款计划                          | P0     | 后端               |
| Agent  | 付款原因解释                              | P0     | 后端               |
| Agent  | 异常识别和风险提示                        | P0     | 后端               |
| CAW    | 跑通 Cobo Agentic Wallet                  | P0     | 合约               |
| CAW    | 真实测试网付款                            | P0     | 合约               |
| CAW    | Agent Wallet 地址记录                     | P0     | 合约               |
| CAW    | tx hash 记录                              | P0     | 合约               |
| CAW    | 白名单 / 限额 / 预算边界说明              | P0     | 合约               |
| README | 项目介绍                                  | P0     | 交付 / 物料        |
| README | 架构说明                                  | P0     | 交付 / 后端        |
| README | 运行方式                                  | P0     | 交付 / 前端 / 后端 |
| README | CAW 使用说明                              | P0     | 合约               |
| README | Demo 截图和视频链接                       | P0     | 物料               |
| 视频   | 3–5 分钟演示视频                          | P0     | 物料 / 交付        |
| PPT    | 5 分钟路演 PPT                            | P0     | 物料               |
| 部署   | 前端演示链接                              | P1     | 前端               |
| 部署   | 后端服务部署                              | P1     | 后端               |
| 扩展   | Request Network 账单记录                  | P2     | 后端 / 合约        |
| 扩展   | Sablier Flow 长期付款                     | P2     | 合约               |
| 扩展   | Safe Module 权限控制参考                  | P2     | 合约               |

## 十一、时间规划

目标：

**11 号完成主功能、视频、README 和 PPT。
12 号路演前只允许做修复、打磨和备用材料，不再新增大功能。**

## 阶段 1：立项与范围冻结

### 目标

所有人统一理解：我们做的是 Cobo 赛道的 Agentic Commerce 项目，不是普通财务后台。

### 必须完成

- 确认项目名：AgentCFO。
- 确认一句话介绍。
- 确认 Demo 剧本。
- 确认技术栈。
- 建立 GitHub Repo。
- 确认每个人的任务边界。
- 合约同学优先验证 CAW 是否能跑通。
- 前端先出页面结构。
- 后端先定义 API 数据结构。
- 物料先出 README 海报方向和 PPT 大纲。

### 阶段验收

- 每个人知道自己负责什么。
- Demo 主线确定。
- GitHub Repo 建好。
- CAW 接入路径明确。
- 前后端接口格式初步确定。

## 阶段 2：核心功能开发

### 目标

跑通最核心闭环：

```
输入贡献记录
→ Agent 生成付款计划
→ 风险检查
→ 人工确认
→ CAW 执行付款
→ 展示 tx hash 和审计报告
```

### 前端

- 完成主流程页面。
- 支持 mock 数据。
- 支持展示后端返回的 payment plan。
- 支持展示风险检查结果。
- 支持展示交易结果。

### 后端

- 完成 payment plan 生成。
- 完成 risk check。
- 完成 audit report。
- 和前端联调。
- 和合约 / CAW 联调。

### 合约 / CAW

- 跑通测试网付款。
- 获取 tx hash。
- 整理关键配置。
- 提供给前端 / 后端展示数据。

### 物料

- README 初版。
- PPT 初版。
- 海报初版。
- Demo 视频脚本初版。

### 阶段验收

- 即使 UI 还不完美，也要能完整跑一遍主流程。
- 至少有一笔真实测试网交易。
- README 已经有项目介绍和架构图。
- PPT 已经能讲完整故事。

## 阶段 3：集成与演示打磨

### 目标

让项目从“能跑”变成“能演”。

### 必须完成

- 前端 UI 打磨。
- 接入真实或半真实后端数据。
- 展示 CAW 交易结果。
- 完成审计报告页面。
- 完成 README。
- 完成 PPT。
- 录制 Demo 视频。
- 准备备用截图。
- 准备路演讲稿。
- 完成至少 2 次完整彩排。

### 阶段验收

- 5 分钟路演能讲完。
- 3–5 分钟 Demo 视频录好。
- GitHub README 可读。
- 项目提交材料齐全。
- 前端 Demo 能稳定打开。
- 如果现场网络 / 钱包 / 后端出问题，也能用视频和截图讲完整。

## 阶段 4：13 号最终冻结

### 目标

13 号中午12点前完成全部可提交内容。

### 12 号必须完成清单

- GitHub Repo 整理完成。
- README 完成。
- 前端 Demo 完成。
- 后端 API 完成。
- CAW 交易记录准备完成。
- Agent Wallet 地址准备完成。
- tx hash 准备完成。
- Demo 视频完成。
- PPT 完成。
- 5 分钟演讲稿完成。
- 备用截图完成。
- 路演彩排完成。
- 提交材料检查完成。

### 12 号之后不再新增

- 不新增大功能。
- 不改核心流程。
- 不临时换技术路线。
- 不引入新的外部协议。
- 不做复杂多链扩展。

## 阶段 5：13 号提交前

### 目标

只做修复和兜底。

### 可以做

- 修 bug。
- 调整 PPT 文案。
- 优化演讲节奏。
- 替换更清晰的截图。
- 补充 README 小段落。
- 重新录一版更流畅的视频。
- 准备备用网络和备用浏览器。
- 准备本地录屏版本。

### 不建议做

- 新增 Request Network / Sablier。
- 重构前端。
- 改后端架构。
- 改合约逻辑。
- 临时接入新链。
- 临时改变项目定位。

## 十二、GitHub Repo 建议结构

```
agent-cfo/
├── README.md
├── docs/
│   ├── architecture.md
│   ├── caw-integration.md
│   ├── demo-script.md
│   └── risk-boundary.md
├── frontend/
├── backend/
├── contracts/
├── demo/
│   ├── screenshots/
│   └── video-link.md
└── assets/
    ├── poster.png
    └── logo.png
```

## 十三、README 结构建议

README 至少包含：

1. 项目名称
2. 一句话介绍
3. 问题背景
4. 解决方案
5. 为什么适合 Cobo Agentic Commerce
6. 产品流程
7. 架构图
8. Demo 截图
9. CAW 使用说明
10. Agent Wallet 地址
11. Transaction Hash
12. 运行方式
13. 风险边界
14. 团队分工
15. Demo 视频链接

## 十四、PPT 结构建议

5 分钟路演建议 7 页以内：

### 第 1 页：项目名

**AgentCFO｜DAO AI 财务官**

Slogan：

**Give every DAO an AI CFO with a controlled wallet.**

### 第 2 页：问题

DAO 小团队经常遇到：

- 贡献者付款靠人工表格。
- 小额支出频繁但多签流程很重。
- 付款原因不透明。
- 容易漏付、错付、重复付款。
- 完全自动化又存在资金风险。

### 第 3 页：解决方案

AgentCFO：

- AI 读取贡献记录。
- 自动生成付款计划。
- 检查预算、白名单、限额、重复付款。
- 人类确认。
- CAW 执行付款。
- 输出链上审计报告。

### 第 4 页：Demo 流程

```
Contribution Records
→ AI Payment Plan
→ Risk Check
→ Human Approval
→ CAW Execution
→ Audit Report
```

### 第 5 页：CAW 为什么关键

- Agent Wallet 管理资金。
- 限制 Agent 的可执行范围。
- 支持安全隔离。
- 付款不是 mock，而是可验证链上交易。
- 每笔交易都有 tx hash。

### 第 6 页：架构

展示：

```
Frontend
→ Backend / Agent
→ Risk Engine
→ Cobo Agentic Wallet
→ Testnet Transaction
→ Audit Report
```

### 第 7 页：未来扩展

- 接入 Request Network 做发票和账单。
- 接入 Sablier Flow 做长期 payroll。
- 接入 Safe / Module 做更复杂的 DAO Treasury 权限。
- 扩展到 Agent 采购数据、API、GPU、LLM 服务。
- 变成 DAO 的 Agentic Finance Layer。

## 十五、5 分钟路演稿结构

### 0:00–0:30 开场

大家好，我们的项目是 AgentCFO，一个面向 Web3 小团队和 DAO 的 AI 财务官。

今天很多 DAO 的贡献者结算还是靠表格、人工核对和多签转账。这个流程很低效，也容易出现漏付、错付和重复付款。

### 0:30–1:20 问题

Web3 小团队有一个很典型的矛盾：

一方面，小额付款非常频繁，例如内容贡献、设计任务、社群运营、工具订阅。

另一方面，传统多签流程对于这些小额付款又太重。如果完全自动化，又会带来资金风险。

所以我们想解决的问题是：

**能不能让 AI Agent 帮 DAO 处理财务工作，但又不能让它无限制地乱花钱？**

### 1:20–2:00 方案

AgentCFO 的做法是：

AI 负责理解贡献记录、生成付款计划、解释付款原因和发现异常。

Cobo Agentic Wallet 负责真正的资金执行，并且通过预算、白名单、单笔限额和人工确认来限制 Agent 的权限。

所以 AgentCFO 不是一个普通财务后台，而是一个具备受控资金执行能力的 AI Agent。

### 2:00–3:40 Demo

在 Demo 里，我们准备了一个 DAO 本月结算场景。

有 3 个贡献者和 1 个工具订阅费用。

AgentCFO 会读取这份贡献记录，自动生成付款计划。

它会检查：

- 总金额是否超过预算；
- 单笔付款是否超过限额；
- 地址是否在白名单；
- 是否存在重复付款。

其中一笔付款因为地址不在白名单，会被 AgentCFO 标记为 blocked。

其他通过检查的付款，在人类确认后，会通过 Cobo Agentic Wallet 执行测试网转账。

最后系统会输出 tx hash、Agent Wallet 地址和完整审计报告。

### 3:40–4:30 CAW 价值

在这个项目里，CAW 是核心组件，不是附属展示。

因为 AgentCFO 的资金动作不是 mock 的，而是通过 CAW 完成真实测试网付款。

同时，CAW 提供了 Agent 钱包管理、权限控制和安全隔离，让 Agent 可以执行付款，但不能越权花钱。

### 4:30–5:00 结尾

未来，AgentCFO 可以扩展成 DAO 的 Agentic Finance Layer。

它不仅可以做贡献者结算，还可以支付工具订阅、管理部门预算、接入 Request Network 发票系统，或者用 Sablier 做长期 payroll。

我们的目标是：

**Give every DAO an AI CFO with a controlled wallet.**

谢谢大家。

## 十六、风险边界说明

为了符合赛道要求，也为了避免评委担心安全问题，需要明确说明：

1. 本次 Demo 使用测试网资金。
2. Agent 不能无限制转账。
3. 所有付款都受到预算限制。
4. 所有收款地址必须在白名单内。
5. 单笔付款有金额上限。
6. 付款前需要人类确认。
7. 异常付款会被暂停。
8. 所有付款结果都有 tx hash 可验证。
9. Agent 只生成计划和执行授权范围内的付款，不接触用户私钥。
10. 未来可扩展多签审批、Sablier 流式付款、Request Network 发票记录等能力。

## 十七、最终提交清单

| 提交物                  | 是否必须 |
| ----------------------- | -------- |
| GitHub Repo             | 必须     |
| README                  | 必须     |
| 项目说明文档            | 必须     |
| Demo 视频 3–5 分钟      | 必须     |
| 项目演示链接            | 有最好   |
| CAW 关键代码或配置说明  | 必须     |
| Agent Wallet 地址       | 强烈建议 |
| 测试网 Transaction Hash | 强烈建议 |
| 流程截图                | 强烈建议 |
| 操作记录                | 强烈建议 |
| PPT                     | 路演必须 |
| README 头图             | 建议     |
| 风险边界说明            | 必须写   |

## 十八、最终

真正的核心表达应该是：

**AgentCFO 是一个可以参与 DAO 经济活动的 AI Agent。它能理解付款需求，生成付款计划，检查风险，并通过 Cobo Agentic Wallet 在受控权限内执行真实资金操作。**

项目关键词：

```
Agentic Commerce
DAO Treasury
AI CFO
Controlled Wallet
Cobo Agentic Wallet
Payment Plan
Risk Check
Audit Report
```

最重要的 Demo 主线：