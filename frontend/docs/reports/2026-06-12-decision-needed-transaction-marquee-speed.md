# Decision Needed — Transaction Marquee 滚动速度异常

## 当前状态

- 接到反馈：landing 页 `VelorixHero` 下方紧接的 `TransactionMarquee` 传送带**滚动速度异常快**，视觉上"以惊人的速度一直在滚"，内容基本看不清。
- 用户要求**先做问题分析，不动代码**。
- 已读取：
  - `frontend/components/landing/transaction-marquee.tsx`（完整 318 行）
  - `frontend/components/landing/velorix-hero.tsx`（用于确认 hero 与 marquee 的位置关系 —— hero 中并未引用 marquee，由 landing 页面文件直接拼接）
- 已确认：传送带就是 `<TransactionMarquee />`，紧接 hero 渲染。

## 已确认事实

1. **滚动驱动方式**：使用 `framer-motion` 的 `useMotionValue + useSpring + useAnimationFrame` 自定义 RAF 循环，**不是** CSS `@keyframes` 动画。
   文件：`frontend/components/landing/transaction-marquee.tsx:215-233`

2. **关键代码段**（速度相关的全部逻辑）：
   ```tsx
   const targetVelocity = reduce ? 0 : hovered ? 1.2 : 3.5;  // L221
   const velocity = useSpring(targetVelocity, { stiffness: 28, damping: 18, mass: 1.2 });  // L222

   const x = useMotionValue(0);                              // L224
   const xPercent = useTransform(x, (v) => `${v}%`);          // L225  ← 单位是 %

   useAnimationFrame((_, delta) => {                          // L228
     const v = velocity.get();
     const step = (v * delta) / 35;                          // L230  ← 步进公式
     const next = x.get() - step;
     x.set(next <= -33.333 ? 0 : next);                      // L232  ← 归零边界
   });
   ```

3. **DOM 渲染结构**（L284-312）：`motion.div` 的容器是
   `style={{ width: "max-content", x: xPercent }}`，`items` 被**三倍复制**（`[...marqueeItems, ...marqueeItems, ...marqueeItems]`，L218），所以 `motion.div` 的实际宽度 ≈ **3 × 一份内容宽度**。

4. **`x: "33.333%"` 的 CSS 语义**：
   - framer-motion 把 `xPercent` 拼到 `transform: translate3d(...)` 上
   - CSS 标准的 `translate3d(<percentage>, ...)` **百分比相对的是元素自身宽度**
   - 元素的 `width: max-content` 让它**等于全部内容宽度**（≈ 3 × 一份内容）
   - 粗略估算一份内容宽 ≈ 3 500–4 000px（10 个 pill + 10 个 arrow，每个 pill ≈ 320–380px），所以元素宽度 ≈ **12 000px**

5. **速度量化（按 60fps、视口 1500px、目标 velocity = 3.5 估算）**：
   - `step = 3.5 × 16 / 35 ≈ 1.6` 每帧
   - x 是 number，转成 `${v}%` 后应用于元素自身
   - **每帧位移 = 1.6% × 12 000px ≈ 192px / 帧 ≈ 11 520 px/s**
   - 一份内容 ≈ 4 000px → **~0.35s 滚过一份**
   - 一份内容里 10 个 pill → **~28 个 pill / 秒**
   - 这是**完全无法阅读**的速度

6. **归零边界 `-33.333` 的设计意图**：作者原本期望"滚过自身宽度的 33.333%（≈ 一份内容）就归零"，靠三倍内容实现无缝循环。逻辑方向是对的，但**速度常量 `v = 3.5` 和 `/35` 这个除数明显没有按"自身宽度是 ~12 000px"这个事实来标定**。

7. **周边还存在的次要问题**（仅记录，不在本任务解决范围）：
   - `TopBottomRail` 上下两条装饰带用 `driftX = [-16, 0] / [16, 0]` + duration 14s 缓慢漂移，这个速度看起来正常。
   - 中间**正弦波**用 `motion.div animate x: ["0%", "-50%"] duration 2.2`，速度也偏快（2.2s 走 50% 视口宽），但**不是用户当前反馈的问题**，可以后续单独评估。

## 卡住的问题

**用户的诉求是"传送带滚动太快"，但要按"多快合适"做修复，需要在以下方向上决策**：

1. **"合适的速度"主观性很强**：是"慢到能逐条读完每条交易信息"？还是"快到只是氛围、不强求看清"？这两种是不同产品意图。
2. **是否同时改 hover 减速行为**：当前 hover 时 `targetVelocity = 1.2`（约为默认的 1/3），保留还是取消？
3. **是否调整归零边界 `33.333` 的语义**（不推荐动，因为三倍复制配合 33.333 是个成熟无缝 loop 套路，动它可能引入接缝）。

## 可选方案

### 方案 A — 只调速度常量，最小改动（推荐基线）
- 把 `targetVelocity` 从 `3.5` 改为 `~0.6`，hover 从 `1.2` 改为 `~0.25`。
- 把步进公式分母 `/35` 改成 `/200`（更稳，与 viewport 宽度解耦）。
- 一行 ~2 个常量修改，行为与原设计意图最接近。
- 风险：只能"凭感觉"调，没有"设计目标速度（px/s）"的硬指标。可能需要再迭代一两次。

### 方案 B — 改用 px/秒为单位的语义
- 把 `useTransform(x, v => \`${v}%\`)` 去掉，**直接用 `x` 数值当 px**。
- `motion.div style={{ x }}` 直接接收 number（framer-motion 默认 px）。
- `useAnimationFrame` 步进改为 `step = v * delta`（v 即 px/秒，delta 为秒/帧）。
- 归零边界改为"x <= -一份内容实际 px"，需要先 `useRef + useEffect` 测量内容宽度（或用 `useElementSize`）。
- 优势：速度"所见即所得"，写 30 就是 30 px/s，零心智负担。
- 风险：需测 DOM 宽度 + 重置条件；改动 ~10 行；多了一份 `useElementSize` 之类的依赖或自实现。

### 方案 C — 替换为 CSS keyframes（最简）
- 完全去掉 `useMotionValue + useSpring + useAnimationFrame`。
- 用 `transform: translateX(-33.333%)` + `animation: marquee 30s linear infinite` 的纯 CSS 方案。
- 优势：性能最好、代码最少、行为最确定。
- 风险：失去"hover 减速"的交互（CSS 也能做但需要切 class，逻辑会变）；同时移除 `useSpring` 弹簧行为（这里其实**根本不需要弹簧**——速度是匀速的更合理，弹簧只让首屏启停看起来"软"，但对匀速传送带意义不大）。

## 风险

- **方案 A**：可能调不准，需要再迭代。
- **方案 B**：测内容宽度 + 滚动边界是新增的逻辑边界，需要小心 SSR/hydration 与动态内容长度。
- **方案 C**：移除 `useSpring` 意味着启动/hover 时**速度会硬切换**而非平滑过渡，可接受度需要用户拍板。
- **共性**：三种方案都**只动 `transaction-marquee.tsx` 一个文件**，不会波及其他组件；但都属于"UI/motion"调整，按 `CLAUDE.md` 第 8 节是建议 Codex review 的场景。

## Claude Code 执行层初步判断

倾向 **方案 C**：
- 当前的 `useSpring` 在"匀速传送带"上**没有产品价值**——传送带天然是匀速，弹簧软启动反而让首屏感觉"延迟"且"突然加速"。
- CSS keyframes 在 GPU 合成层、vsync 对齐、will-change 优化上都比 RAF + spring 强，性能更稳。
- 代码量减少 ~20 行，可读性显著提升。
- 唯一需要保留的是 hover 减速（`hovered` state），可以用 `group-hover: animation-play-state: paused` 或切 className 两种 CSS 思路实现，~5 行 CSS 即可。

但**这是 UI/motion 改动，按宪法走"先报告、后决策、不替用户拍板"**。

## 需要用户 / GPT 决策的问题

1. **目标速度产品语义**：传送带是"氛围背景"（快，无所谓看清）还是"信息展示"（慢，能逐条阅读）？这决定了方案 C 的 duration 用 30s 还是 60s。
2. **是否同意方案 C**（CSS keyframes 替换 RAF 弹簧）？还是倾向最小改动走方案 A？
3. **hover 减速是否保留**？当前是"hover 速度降为 1/3"，建议保留为"hover 暂停"（更直观）。

## 决策后可执行下一步

1. 按选定方案修改 `frontend/components/landing/transaction-marquee.tsx`（仅此一文件）。
2. 跑 `pnpm typecheck && pnpm build` 验证未引入类型 / 构建错误。
3. 用 `pnpm dev` 起本地 3100 端口，肉眼 / 录屏核对滚动速度与 hover 行为。
4. 准备 git diff + 验证结果 + 风险点 → 走 Codex review（motion 改动按宪法默认建议）。
5. 报告内容同步进 `docs/handoff/2026-06-12-...` 收尾 handoff。
