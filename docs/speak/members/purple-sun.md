# purple sun · 合约 / CAW

> 第一人称陈述

---

我是 purple sun，负责合约和 **Cobo Agentic Wallet（CAW）**——全队里真正碰「链上动钱」的人。

赛方规则写得很清楚：Agent 的资金操作必须走 CAW，不能只画流程图。我的任务就是把这个要求变成**可验证的证据**，同时不把 API Key、私钥、完整钱包地址泄露到仓库。

**我完成的关键交付：**

- 通读 Cobo Agentic Wallet Quickstart，搞懂权限模型（Agent API Key、pact、policy、transfer）
- 申请并配置 CAW API Key（**仅环境变量，不入库**）
- 创建 Agent Wallet，公开文档使用脱敏 source：`0x2cda...76da`
- 确认 SDK 版本：`cobo-agentic-wallet==0.1.40`
- 在 Sepolia / `SETH` 完成低额测试转账，提供公开 tx hash：
  - Demo payment：`0x85a5a2e934ca0e34c7fb3e038ca06e54e15bd29b56b64e5b01ff80eb20ed4d98`
  - Internal transfer：`0x6bd793bc3030c995245b2e73a466898e46278be092aa9f7a3c86cad21cbbae8a`
- 交付 518 行量级后端对接说明，支撑 `RealCawAdapter` skeleton
- 和后端联调 Phase 4C：opt-in、`CAW_ENABLE_TRANSFERS=true` 才真转，默认 mock

**我在团队分工里的位置：**

- 九九八乂 定义 adapter 接口和 P0 行为不变
- 我填 CAW SDK 调用：submit pact → poll active → transfer_tokens → 归一化 status
- threetwoa 在 UI 分开展示 **Audit 快照** 和 **Latest CAW Status**，不伪造 tx
- ZanyK / 欢 把证据写进 README 和 PPT 第 8 页，口径统一

**安全边界（我必须反复强调）：**

- 线上 Render **默认 mock**，不发起真实转账
- 真实 testnet 只在显式批准 + env 齐全时本地或受控环境执行
- Mock tx **不能**冒充链上记录；视频和 README 必须分开讲

**GitHub 上：** CAW 相关实现主要在 `app/services/caw_adapter.py`、`app/services/real_caw_adapter.py`（及 observer）；细节见 `docs/backend/CAW_ADAPTER.md`。

**PPT 第 8 页 CAW Evidence** 就是我这边工作的浓缩：一笔对外 demo payment + 一笔同钱包内部划转验证，证明 SDK 通路打通，但不代表三笔商业付款都已产品化。

评委问「CAW 是不是摆设」——我的回答：**不是。它是执行层唯一出口；Mock 只是演示兜底，真证据在 Sepolia。**
