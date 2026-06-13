# components/landing/

Landing 首页组件。**本目录锁定** — 除非明确授权，不要修改已有组件；Console 可借用。

## 主要组件

| 组件 | 用途 |
|---|---|
| `velorix-hero.tsx` | Hero 区（纯 CSS 动效，勿加 Framer Motion） |
| `landing-sections.tsx` | scroll sections 容器 |
| `pipeline-showcase.tsx` | GSAP 水平滚动流水线展示 |
| `pipeline-editorial.tsx` | 流水线编辑排版 |
| `holographic-card.tsx` | 3D 鼠标倾斜卡片（console 可复用） |
| `web3-node-cloud.tsx` | 拖拽节点拓扑（console 可复用） |
| `transaction-marquee.tsx` | 交易 pill 跑马灯 |
| `card-splitter.tsx` | 滚动炸裂效果 |
| `guardrails-cta.tsx` | 风险拦截 CTA |
| `faq-section.tsx` | FAQ |
| `landing-footer.tsx` | 页脚 |
| `build-timeline.tsx` | 团队时间线 |

## 设计约束

- Hero 保持 Velorix 黑色电影感 + 远程背景视频
- 动效：Hero 用纯 CSS；sections 可用 GSAP / framer-motion
- CTA 跳转目标：`/console`
