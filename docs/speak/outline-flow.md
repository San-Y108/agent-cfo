# AgentCFO 演示大纲（流程体）

> 无序号 · 按讲述自然流动 · 覆盖故事背景、分工、GitHub、Landing、Console、PPT  
> 建议总时长 3–5 分钟 · 可从 Landing 首屏开录

---

## 开场 · 我们是谁、为什么做

→ 队名 **AgentCFO | 链上财务官小队**，参加 **AI × Web3 Agentic Builders Hackathon**，**Cobo 赛道**

→ 故事从一个很土但很真的场景开始：几个网友一起搞 DAO，月底要给 Alice、Bob、Charlie 发 USDC，还有一笔 Data API 订阅费

→ 现在靠 Excel，容易漏发错发；用多签，每笔都要人点，太慢；全自动又怕 AI 乱转账

→ 所以我们做 **AgentCFO**：给每个 DAO 一个**带受控钱包的 AI 财务官**——AI 帮忙列清单，**保安（风控）**说了算，**你点头**才付钱，**Cobo 钱包**才真正动钱，最后留一份**审计报告**

---

## 分工 · 六个人怎么拆开干

→ **ZanyK（总控）**：我是值班长。建 GitHub、写 README、盯看板、对提交清单，把后端/前端/CAW 三条线拧成一股绳；还推动了 14 页路演 PPT 落地

→ **欢（PM）**：我管节奏和验收。需求拆成能打勾的任务，Demo 四人场景全队统一，Bob 必须 blocked，README 和界面不能两套说法

→ **呱呱（物料）**：我管「好看和好懂」。Banner、截图、团队头像、PPT 视觉、视频文案——让评委愿意看下去，Mock 和真链上也必须标清楚

→ **threetwoa（前端）**：我管你们点开的每一个页面。Landing 讲故事，Console 走流程，Vercel 线上能稳定演示；Navbar 有 Mock 徽章，不骗人

→ **九九八乂（后端）**：我管规则和 API。六条风控写死在代码里，LLM 只能建议不能拍板；FastAPI 部署在 Render，契约在 `app/models.py`

→ **purple sun（CAW）**：我管真动钱。Cobo Agentic Wallet 在 Sepolia 跑出两笔低额 testnet 证据；API Key 不进仓库，线上默认还是 Mock 兜底

---

## GitHub · 仓库里有什么、怎么维护的

→ 仓库地址：**https://github.com/San-Y108/agent-cfo**（公开）

→ **6 月 8 日** 建仓：后端 P0 API 同一天 scaffold 完成，管理文档进 `docs/pm/`

→ **6 月 9–10 日** 前端 Landing 重设计 + Console 工作台；双端部署 Vercel + Render

→ **6 月 10 日** CAW Phase 4C 联调，Sepolia tx 写入 README；demo-sample 修到四人场景对齐

→ **6 月 13 日** README 首页 polish：技术细节下沉 `docs/backend/`，备份在 `docs/backup/`，路演陈述在 `docs/speak/`

→ 评委若要深挖：PPT 在 `assets/ppt/`，深文档在 `docs/backend/CAW_ADAPTER.md`，彩排清单在 `docs/pm/DEMO_REHEARSAL_CHECKLIST.md`

---

## Landing Page · 先讲产品故事（约 1 分钟）

→ 打开 **https://agentcfo-frontend.vercel.app**

→ 首屏：**让 DAO 金库决策变成可执行的付款流**——副标题强调风险已检查、人工已批准、可审计

→ 滚到 **工作流**：五步一张图——计划 → 风控 → 人工批准 → CAW → 审计

→ 指 **Guardrails**：预算 50、单笔 25、白名单、Human Approval，fail-closed

→ 可快速带过 Platform / Pipeline / FAQ，Footer 点 **进入 Console**

---

## Console · 再走一遍付款流程（约 1.5–2 分钟）

→ 进入 **/console**，顶栏看到 **Mock** 徽章——口播：当前稳定演示模式，真 CAW 证据在 README

→ **Agent Hub**：聊天里已有种子对话；依次点 **生成计划 → 检查风险 → 查看审计**

→ 口播重点：**Bob 被拦，因为不在白名单；这不是 AI 任性，是规则写死的**

→ （可选）切 **Treasury**：时间轴里再看一眼 Bob 红字 + 三笔 Executed

→ 不要假装 Mock 里的 txHash 是真的

---

## PPT · 路演幻灯片与仓库叙事对齐（约 30–45 秒）

→ 文件：**assets/ppt/agentcfo-pitch.pptx**，共 14 页

→ **封面 + 痛点**：30 秒建立共鸣

→ **方案 + 流程 + 架构**：五层边界，LLM 不是老板

→ **Demo 页**：Alice / Charlie / Data API 可付，**Bob blocked**——和 Console 同一故事

→ **CAW Evidence 页**：Sepolia 两笔 tx；口播「证据已有，线上默认 Mock」

→ **Why Cobo + Team + Ending**：赛道匹配，六人分工，甩链接 GitHub + Vercel

→ 物料 PDF 同稿：**agentcfo-pitch-material-team-v1.pdf**

---

## CAW 证据 · 切屏 GitHub（约 30 秒）

→ 打开 README **CAW Testnet 证据** 章节

→ 一笔 demo payment + 一笔 internal transfer，均在 Sepolia

→ Masked wallet `0x2cda...76da`，不展示密钥

→ 收尾句：**演示可 Mock，能力已验证；Human Approval 和风控是硬边界**

---

## 收场 · 一句带走

→ AgentCFO：**AI 帮忙算账，规则决定放行，人类按下确认，CAW 才真正动钱**

→ 欢迎访问在线 Demo 和 GitHub，谢谢

---

## 附录 · 各角色独立陈述入口

| 角色 | 文件 |
|---|---|
| ZanyK | [`members/zanyk.md`](members/zanyk.md) |
| 欢 | [`members/huan.md`](members/huan.md) |
| 呱呱 | [`members/guagua.md`](members/guagua.md) |
| threetwoa | [`members/threetwoa.md`](members/threetwoa.md) |
| 九九八乂 | [`members/jiujiu.md`](members/jiujiu.md) |
| purple sun | [`members/purple-sun.md`](members/purple-sun.md) |

合集与总稿：[`dialogue-collection.md`](dialogue-collection.md) · [`master-narrative.md`](master-narrative.md)
