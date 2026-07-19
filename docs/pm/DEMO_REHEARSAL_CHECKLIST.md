# AgentCFO Demo 彩排检查清单

> 目标：路演当天 5 分钟内完整走完主流程，不出意外
> 要求：至少彩排 2 次，每次录像回看

---

## 一、Demo 主流程检查（逐项打勾）

### 第一步：贡献记录输入

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | 前端页面能正常加载，不白屏 | ☐ |
| 2 | 贡献记录输入区可见且可用 | ☐ |
| 3 | 支持输入或上传 mock 数据（Alice/Bob/Charlie/Data API） | ☐ |
| 4 | 输入完成后点击按钮有响应 | ☐ |
| 5 | Bob 的地址故意设置为不在白名单内 | ☐ |

### 第二步：Agent 生成付款计划

| # | 检查项 | 状态 |
|---|--------|------|
| 6 | 点击"Generate Payment Plan"后有 loading 状态 | ☐ |
| 7 | 返回 4 条付款计划（Alice/Charlie/Data API + Bob） | ☐ |
| 8 | 每条计划显示：收款人、金额、付款原因、状态 | ☐ |
| 9 | 金额正确：Alice 20, Bob 15, Charlie 10, Data API 5 | ☐ |
| 10 | 总金额 = 50 USDC | ☐ |

### 第三步：风险检查

| # | 检查项 | 状态 |
|---|--------|------|
| 11 | 风险检查结果页面可见 | ☐ |
| 12 | Bob 被标记为 Blocked | ☐ |
| 13 | Blocked 原因显示"Recipient address is not in whitelist" | ☐ |
| 14 | Alice/Charlie/Data API 状态为 Ready | ☐ |
| 15 | 如果触发预算/限额/重复付款检查，结果正确 | ☐ |

### 第四步：人工确认

| # | 检查项 | 状态 |
|---|--------|------|
| 16 | 有明确的"Approve & Execute"按钮 | ☐ |
| 17 | 有"Reject"按钮 | ☐ |
| 18 | Blocked 的付款不能被 Approve（灰色/禁用/不显示） | ☐ |
| 19 | 点击 Approve 后有"执行中"状态变化 | ☐ |

### 第五步：CAW 执行付款

> 彩排口径：默认 mock flow 的 `txHash=null` 是正常兜底；Phase 4C 已有 **2 笔**真实 CAW testnet evidence（demo payment + internal transfer，Sepolia / SETH / 0.001 SETH，来源 Agent Wallet `0x2cda...76da`）。前端应分开展示 Audit Report snapshot 与 Latest CAW Status。若 refresh 后拿到真实 txHash，只展示在 Latest CAW Status 区域，不改写历史 Audit Report 快照。

| # | 检查项 | 状态 |
|---|--------|------|
| 20 | 执行过程中页面显示"Executing via Cobo Agentic Wallet"或明确 mock execution mode | ☐ |
| 21 | 使用已记录 evidence 或已批准 real transfer 时，Latest CAW Status 区域能展示真实 tx hash；mock flow 明确显示 txHash=null | ☐ |
| 22 | tx hash 可以复制 | ☐ |
| 23 | 真实 evidence 的 tx hash 可在区块浏览器上查到；mock flow 不伪造链接 | ☐ |
| 24 | 显示 Agent Wallet：`0x2cda...76da`（脱敏）；完整地址与 UUID 见 README / `docs/backend/CAW_ADAPTER.md` | ☐ |
| 25 | 付款状态显示"Completed" | ☐ |

### 第六步：审计报告

| # | 检查项 | 状态 |
|---|--------|------|
| 26 | 审计报告页面可见 | ☐ |
| 27 | 每笔付款有：收款人、金额、原因、状态、Audit snapshot txHash；Latest CAW Status 单独展示 | ☐ |
| 28 | Bob 的付款显示 Blocked + 原因 | ☐ |
| 29 | 有剩余预算信息 | ☐ |
| 30 | 报告整体像一份正式财务结算报告 | ☐ |

---

## 二、Edge Case 检查

| # | 场景 | 预期行为 | 状态 |
|---|------|----------|------|
| 31 | 全部付款被 Blocked | 页面正常展示，不报错 | ☐ |
| 32 | 总金额超过预算 | Agent 拒绝生成计划或标记超预算 | ☐ |
| 33 | 单笔超过限额 | Agent 标记该笔为 Blocked | ☐ |
| 34 | 重复地址出现在贡献记录中 | Agent 检测到重复付款 | ☐ |
| 35 | 用户点击 Reject | 不执行付款，返回到计划页 | ☐ |
| 36 | CAW 执行失败 | 前端显示错误信息，不崩溃 | ☐ |

---

## 三、环境准备检查

| # | 检查项 | 状态 |
|---|--------|------|
| 37 | 前端 Demo 链接可以访问 | ☑ |
| 38 | 后端 API 可以访问 | ☑ |
| 39 | 测试网钱包余额足够（至少 1 ETH + 50 USDC） | ☐ |
| 40 | 浏览器已登录钱包（或已配置好 Provider） | ☐ |
| 41 | 网络连接稳定 | ☐ |
| 42 | 浏览器书签栏已隐藏 | ☐ |
| 43 | 通知已关闭 | ☐ |

---

## 四、备用方案检查

| # | 检查项 | 状态 |
|---|--------|------|
| 44 | 本地录屏版本已保存 | ☐ |
| 45 | 全流程截图包已准备（每步至少 1 张） | ☐ |
| 46 | 备用浏览器已安装（Chrome + Firefox） | ☐ |
| 47 | 离线 PPT 已保存到桌面 | ☐ |
| 48 | 视频文件已下载到本地（不依赖网络播放） | ☐ |
| 49 | 如果 Demo 现场崩溃，有截图 + 讲解的 B 方案 | ☐ |

---

## 五、彩排记录

### 彩排 1

| 字段 | 内容 |
|------|------|
| 日期 | |
| 时长 | |
| 发现的问题 | |
| 需要修复 | |

### 彩排 2

| 字段 | 内容 |
|------|------|
| 日期 | |
| 时长 | |
| 发现的问题 | |
| 需要修复 | |

### 最终彩排（路演前 1 天）

| 字段 | 内容 |
|------|------|
| 日期 | |
| 时长 | |
| 是否可以流畅走完全流程 | |
| 备用方案是否就绪 | |
| 是否准备好路演 | |
