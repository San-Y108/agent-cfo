# Good Idea 组件融合规划

> 分支：`feat/landing-optimization`
> 目标：把 good-idea-collection 中带 TODO 批注的组件「精髓」融入现有 Landing，大胆创新但服从既有暗色 + lime 主题，不做爆裂性重构。
> 创建：2026-06-10 · Opus 4.8

---

## 0. 设计宪法（不可破坏的边界）

| 锁定项 | 值 | 说明 |
|--------|-----|------|
| 主题 | dark-only `#0D0D0D` | 全页面锁死，导入组件一律重新着色 |
| 主 accent | lime `#B5FF4D` | 唯一主强调色 |
| 语义辅色 | cyan/coral/blue/violet | 仅 pipeline/状态语义沿用 |
| 字体 | Inter + Courier mono | 暂不换字体（避免大改） |
| 动效栈 | framer-motion + GSAP | 导入的原生 JS 改写为 motion |
| 现有组件 | Hero/Pipeline/Cards 全保留 | 只新增和增强，不重写 |

**融合原则：取其神，弃其形。** 把交互机制（扇形聚焦、弧线跳跃、方向感知）提炼出来，外壳全部换成 AgentCFO 暗色质感。不照搬原始配色、字体、图片。

---

## 1. 资产 → 意图映射（来自用户 TODO 批注）

| 组件 | 用户批注 | 机制精髓 | 融合目标 |
|------|---------|---------|---------|
| `05a` 3D 方向悬停卡 | 黑客松团队成员介绍卡片 | 扇形聚焦：悬停哪张哪张挺立 | **新增 Team 区块** |
| `05b` 旋转轮播时间线 | 配合 05a 的团队历史协作轴 | 旋转/轮播时间线 | **Build 时间轴** |
| `06a` 绳索照片 | 时间轴上的精彩图片合集 | 照片悬挂摆动 | 时间轴节点配图（轻量化） |
| `02` 滑动名片 | 个人介绍页 | 悬停展开详情 | 团队卡 hover 展开 |
| `11b` 弧线跳跃 Tabbar | 移植到导航栏 | SVG 抛物线跳点指示器 | **导航 active 指示器** |
| `09a` 方向感知按钮 | 装饰卡片光效 | 光效从鼠标方向进入 | CTA 按钮 hover 光效 |
| `09b` 轮盘按钮 | 惊艳轮盘组件 | 轮盘展开 | 备用（暂不排期） |
| `06b` 水波纹按钮 | 加载/装饰动画 | 水波扩散 | loading/按钮反馈 |
| `10a` 抽屉滚轴 | 抽屉卡片播放动画 | 滚轴式抽屉 | 备用（暂不排期） |
| `11a` 时钟时间线 | 备用时间滚轮 | 时钟滚动 | 备用（05b 的备选） |

---

## 2. 实施阶段（优先级阶梯）

### P0 — Team / Build Story 展示区块（核心 · 大胆新增）

**新文件：** `components/landing/build-story.tsx`

**子块 A：团队扇形卡（05a 精髓）**
- 5 张卡，对应 5 个真实角色（来自 TASK_BOARD）：
  - 交付 / 总控 · San-Y108
  - 后端 / Agent · W5W8L9jlu
  - 前端 · Aafff623
  - 合约 / CAW · gitgdut
  - 物料 / 设计 · Eloise-qiu
- 交互：容器 perspective，hover 某卡 → rotateY(0) scale(1.15)，其后卡片 rotateY(-18deg)，邻卡轻微偏转
- 外壳：暗色卡 `bg-surface` + 渐变，active 时 lime 边框 + 内发光
- 头像：生成 **monogram SVG**（角色首字 + lime 圆环），不用假照片
- hover 展开：贡献一句话（02 滑动名片精髓，文字滑入）

**子块 B：Build 时间轴（05b 精髓，轻量化）**
- 横向时间轴：Phase 0 启动 → Phase 1 联调 → Phase 2 打磨 → Phase 3 提交
- framer-motion `whileInView` scroll-reveal stagger
- 节点：lime 圆点 + 日期 + 阶段名，连线渐变
- 移动端：纵向堆叠

**插入位置：** `LandingSections` 中 `GuardrailsCTA` 之后、FAQ 之前（"meet the builders" 收尾叙事）

**验收：** typecheck 通过 + 截图三屏 + reduced-motion 降级 + 移动端单列

---

### P1 — 导航弧线跳跃指示器（11b 精髓）

**改造：** `velorix-hero.tsx` 的 pill 导航
- 在现有 pill nav 下方加 SVG 弧线指示器
- 切换/hover nav item 时，lime 小圆点沿抛物线跳到目标
- 改写原生 rAF → framer-motion `useAnimationFrame` 或保留 rAF 但隔离 cleanup
- stroke 改 lime，背景透明，融入暗色 nav

**风险：** 触碰 Hero 组件 → 仅新增指示器层，不动现有 nav 结构和文案

---

### P2 — 交互微打磨

- **09a 方向感知光效**：抽成 `<DirectionAwareGlow>` 包裹现有 CTA（Run demo / Open Console），hover 时 lime 光晕从鼠标进入方向扫入
- **06b 水波纹**：抽成 loading 态用的 `<RippleLoader>`，lime 水波，用于按钮 pending

---

## 3. 不做的事（防止爆裂性重构）

- 不换字体（Inter 保留，字体替换是另一个独立决策）
- 不改 Hero 布局结构（不强推 asymmetric split）
- 不动 Pipeline 的 GSAP 横向滚动机制
- 不引入 canvas 重物理（06a 绳索改用轻量 motion 摆动，不上 555 行 canvas）
- 不碰 Console / Wallets / Analytics / Policy 页面
- 不引入新依赖（用现有 framer-motion + GSAP + lucide）

---

## 4. taste-skill 合规检查（服从主题）

| taste 规则 | 本规划处理 |
|-----------|-----------|
| 无 Jane Doe 假名 | 用真实 GitHub handle + 角色 |
| 无假照片 | monogram SVG 头像 |
| 单 accent 锁定 | 全程 lime，语义色仅状态 |
| 主题锁定 dark | 导入组件全部重着色 |
| reduced-motion | 所有 3D/弧线动效降级 |
| 无 section 编号 eyebrow | Team 区块不用 "01/02" 标号 |
| 无 em-dash | 文案用 `-` 或换行 |

---

## 5. 交付顺序建议

1. 先做 **P0 子块 A 团队扇形卡**（最大展示亮点，独立可验收）
2. 再做 **P0 子块 B 时间轴**（与 A 同区块）
3. P1 弧线导航（独立增强）
4. P2 微打磨（锦上添花）

每完成一项：typecheck + 截图 + 更新本文件状态。
