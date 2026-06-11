# Handoff — Landing Redesign Batch (Team + Timeline + Web3)

> 生成时间：2026-06-11  
> 分支：`feat/console-aceternity-upgrade`  
> 提交链：`060daeb` → `e6bd006` → `e3e31b4`

---

## 已完成工作

### 1. TeamShowcase — Constellation Pentagon 布局 ✅

**文件：** `frontend/components/landing/team-showcase.tsx`

- 5 位核心成员环绕中心导师（ZanyK）的正五边形布局
- SVG 连接线：中心 ↔ 各顶点，hover 时发光
- 外围卡片 160×220px，中心导师卡 200×280px
- 头像带旋转 conic gradient ring，各角色有独立 accent 色
- Hover 交互：聚焦卡片放大 + 其他淡化 + 连线高亮
- 入场动画：Framer Motion stagger 扩散 + 中心弹性出现
- 响应式降级：`lg` 五边形 / `md` 3×2 grid（导师置顶） / `sm` 单列
- `prefers-reduced-motion` 降级支持
- 双语（zh/en）通过 `useApp()` i18n context

**导师信息确认（当前值）：**
- 名字：ZanyK
- 角色标签：MENTOR / 导师（✦ 金色徽章）
- 描述："Last year's hackathon veteran, guiding the team through the chaos"
- 颜色：`#FFD700`

### 2. BuildTimeline — 胶片图片接入 ✅

**文件：** `frontend/components/landing/build-timeline.tsx`

- 4 个 phase frame 各加载对应背景图片：
  - Phase 0 (01): `/timeline/phase-01-kickoff.png`
  - Phase 1 (02): `/timeline/phase-02-integration.png`
  - Phase 2 (03): `/timeline/phase-03-polish.png`
  - Phase 3 (04): `/timeline/phase-04-submit.png`
- 图片 opacity `0.75` + `bg-black/20` 轻量遮罩 + vignette 边缘渐变
- 胶片颗粒、齿孔、暗角效果保留
- ScrollTrigger snap 驱动的帧切换动画正常

**⚠️ 已知修复（commit `e6bd006`）：**
- 根因：`absolute inset-x-[28px] inset-y-3 relative` 中 `relative` 覆盖了 `absolute`，导致容器高度为 1px
- 修复：移除 `relative`，容器高度恢复 ~460px，图片正常显示

### 3. Web3 Trusted Infrastructure — 星座网络重构 ✅

**文件：** `frontend/components/landing/web3-node-cloud.tsx`（commit `e3e31b4`）

- **有机分布**（非等距圆环）：
  - 内圈核心：Cobo（80px）、Gnosis（80px）
  - 中圈：MetaMask（145px）、Sepolia（140px）、Sablier（150px）
  - 外圈工具：Drizzle（210px）、Framer（205px）、GitHub（215px）
- **品牌色**：每个节点用真实品牌主色（Cobo `#0056D2`、MetaMask `#F6851B`、Sepolia `#627EEA` 等）
- **节点大小分级**：core 48px / mid 34px / tool 26px
- **连线系统**：
  - 平时：细线 + SMIL 呼吸脉冲动画
  - Hover：连线发光 + drop-shadow，其他连线 dim 到 0.08
- **Cobo Core 中心**：双环脉冲扩散动画 + 径向 glow
- **背景**：20 个 nebula 粒子缓慢呼吸 + vignette 暗角
- **Hover 信息卡**：圆角卡片，品牌色边框 + 分隔线 + 描述
- **鼠标视差**：整个星座随鼠标轻微偏移

### 4. 素材就位 ✅

| 类型 | 数量 | 路径 |
|---|---|---|
| 团队头像 | 6 张 | `frontend/public/team/avatar-*.jpg` |
| Timeline 图片 | 4 张 | `frontend/public/timeline/phase-0*.png` |

---

## 验证结果

| 检查项 | 状态 |
|---|---|
| `pnpm typecheck` | ✅ 通过 |
| `pnpm build` | ✅ 通过 |
| Console 无报错 | ✅ 干净 |
| Desktop Team 截图 | ✅ `screenshot-team.png` |
| Desktop Timeline 截图 | ✅ `screenshot-timeline.png` |
| Mobile Team 截图 | ✅ `screenshot-team-mobile.png` |
| Mobile Timeline 截图 | ✅ `screenshot-timeline-mobile.png` |
| Desktop Web3 初始态 | ✅ `screenshot-web3-constellation.png` |
| Desktop Web3 Hover 态 | ✅ `screenshot-web3-hover.png` |

---

## 待确认 / 可优化项

1. **导师描述文案**：当前为 "Last year's hackathon veteran..."，如需调整请提供
2. **正五边形顶点角色分配**：顶部放 PM（San-Y108），如需重新排列请告知
3. **头像显示**：`object-fit: cover` 圆形裁剪，如果某张头像脸不在中心可能需要替换
4. **Timeline 图片色调**：当前 4 张图片风格统一度未知（截图已取可审查）
5. **Hover 动画参数**：stagger delay、scale 倍数、连线粗细等可根据实际视觉效果微调

---

## 下一步建议

| 优先级 | 事项 | 说明 |
|---|---|---|
| P1 | 截图审查 | Team / Timeline / Web3 三张 desktop 截图，确认视觉效果 |
| P2 | 部署到 Vercel | `vercel --prod` 更新生产环境 |
| P3 | 继续 Landing 其他 section | Hero 下方 scroll 板块、Problem、Workflow 等 |
| P4 | 文案微调 | 导师描述、节点描述等按需调整 |

---

## 相关文件

- `frontend/components/landing/team-showcase.tsx`
- `frontend/components/landing/build-timeline.tsx`
- `frontend/docs/plans/team-timeline-redesign-plan.md`
- `frontend/public/team/avatar-*.jpg`（6 张）
- `frontend/public/timeline/phase-0*.png`（4 张）

---

*Claude Code 执行层 | 等待 GPT/用户决策层确认下一步*
