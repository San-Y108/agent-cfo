# Codex Review Material — Transaction Marquee 速度修复

> 路径：`frontend/docs/reports/2026-06-12-codex-review-transaction-marquee-fix.md`
> 配套报告：`frontend/docs/reports/2026-06-12-decision-needed-transaction-marquee-speed.md`（决策依据）

## 本轮目标

修复 landing 页 `<TransactionMarquee />` 传送带滚动速度异常快、内容无法看清的问题。原实现用 `useMotionValue + useSpring + useAnimationFrame` 自定义 RAF 循环，但步进公式的 `velocity × delta / 35` 与 `x: "${v}%"` 的百分比语义（相对元素自身宽度 ≈ 12 000px）配错，实际速度是设计预期的几十倍（≈ 11 500 px/s，~28 pill/s）。

## 改动摘要

把自定义 RAF 弹簧循环替换为 CSS keyframes 动画，速度改 30s/份（hover 90s），删除不再需要的 framer-motion hook 导入。**仅修改 1 个文件**。

## 关键文件

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `frontend/components/landing/transaction-marquee.tsx` | 改 4 处 | 替换 RAF 弹簧为 CSS animation；删除 4 个未用 hook 导入；新增 `<style>` 块定义 keyframes |

## 本轮 git diff（仅本轮 4 处 Edit）

```diff
@@ -1,7 +1,7 @@
-import { motion, useReducedMotion, useMotionValue, useSpring, useTransform, useAnimationFrame } from "framer-motion";
+import { motion, useReducedMotion } from "framer-motion";

@@ -218,18 +218,14 @@ export function TransactionMarquee() {
-  const targetVelocity = reduce ? 0 : hovered ? 0.45 : 1.9;
-  const velocity = useSpring(targetVelocity, { stiffness: 28, damping: 18, mass: 1.2 });
-
-  const x = useMotionValue(0);
-
-  // Each copy of the list is 33.333% of the total width, so reset at that boundary.
-  useAnimationFrame((_, delta) => {
-    const v = velocity.get();
-    const step = (v * delta) / 35;
-    const next = x.get() - step;
-    x.set(next <= -33.333 ? 0 : next);
-  });
+  // 传送带改用 CSS keyframes（见下方 <style> 块）。30s/份 适合逐条阅读；
+  // hover 慢 3 倍便于停留；reduce-motion 用户禁用。-33.333% 是相对元素自身宽度，
+  // 而元素 width: max-content ≈ 3 × 一份内容宽度，所以 to 状态正好是滚过一份内容，
+  // 下一帧回到 0 时视觉上是第二份内容无缝接位——实现无缝循环。
+  const scrollDuration = hovered ? 90 : 30;
+  const scrollAnimation = reduce
+    ? "none"
+    : `transaction-marquee-scroll ${scrollDuration}s linear infinite`;

@@ -239,6 +235,12 @@ export function TransactionMarquee() {
+      <style>{`
+        @keyframes transaction-marquee-scroll {
+          from { transform: translate3d(0, 0, 0); }
+          to   { transform: translate3d(-33.333%, 0, 0); }
+        }
+      `}</style>
       <TopBottomRail direction="left" ornaments={ORNAMENTS_TOP} />

@@ -274,8 +283,8 @@ export function TransactionMarquee() {
-          className="flex items-center gap-2"
-          style={{ width: "max-content", x: `${x}%` }}
+          className="flex items-center gap-2 will-change-transform"
+          style={{ width: "max-content", animation: scrollAnimation }}
```

> 备注：`git diff` 完整输出里**还有** sine-wave dashed → SVG 改造、`targetVelocity` 数值 `0.45/1.9 → 1.2/3.5` 等差异，**这些是预先存在的本地修改，不在本轮 scope**，Codex 可忽略或单独 review。

## 验证结果

| 项 | 状态 | 备注 |
|---|---|---|
| `pnpm typecheck` | ✅ 通过 | tsc --noEmit 干净退出 |
| `pnpm build` | ✅ 通过 | 9 个静态页面全过，compiled in 4.6s |
| 肉眼/录屏核对 | ⚠️ 未执行 | 需要本地 dev（`PORT=3100 pnpm dev`），由用户起服务核对；按宪法"未运行就是未验证"，本项明确标记 |
| Reduce-motion 路径 | ✅ 代码路径确认 | `reduce` 为 true 时 `animation: "none"`，元素静止，符合 a11y 预期 |
| Hover 切换 | ✅ 代码路径确认 | 切换 `animation` 字符串中的 duration 字段（30s ↔ 90s），注意是**硬切换**而非平滑过渡 |

## 风险点

1. **animationDuration 切换是"硬切"**：hover 改变 duration 时，浏览器会**重新启动 keyframes 动画**（CSS 行为），可能出现"跳一下"。可能需要在切到 90s 后等下一帧再 apply，**或者用两条 keyframes + toggle className**。当前实现接受"硬切"为可接受折衷。
2. **`<style>` 块放在 div 内部**：React 19 支持 `<style>` 作为子元素，但样式作用域是全局。如果将来有第二个 `<TransactionMarquee />` 实例（不太可能），同名 keyframes 会被覆盖——同名 OK 不会冲突，但**未来若需要差异化速度**就有耦合风险。当前组件是 landing 唯一实例，可接受。
3. **`will-change-transform` 长期挂载**：传送带元素全程在视口内，`will-change` 一直生效会持续占用 GPU 层（轻微内存开销）。业界最佳实践是 hover/visible 时才加。**当前为简化保留**，但值得 Codex 评估是否要优化。
4. **整段 `useSpring` 删除**：`useSpring` 在原代码里"软启动"传送带（首屏速度从 0 渐入到 3.5）。**新方案没有软启动**，首屏会立即满速。30s/份 在视觉上不会"惊"用户，但**理论上"软启动"是更精致的体验**——Codex 可判断是否值得用 `animation-delay` 或其他技巧补回。
5. **未对 sine-wave 装饰动画**（中间正弦波）做评估：HEAD 版本 duration 1.2s，working tree 已改为 2.2s，**不在本轮 scope**。Codex 可独立 review 此动画速度。

## 希望 Codex 重点审查的问题

1. **无缝循环的数学正确性**：`@keyframes` 的 `to: -33.333%` 相对元素自身宽度（max-content ≈ 3 × 一份内容），所以 from 0 → to -33.333% 实际位移正好是一份内容宽度。下一帧从 0 重新开始时，第二份内容无缝接位。**这个数学闭环是否在所有视口宽度下都成立**？特别是窄屏（< 480px）下，父容器 ≤ 一份内容时会发生什么？
2. **CSS `transform: translate3d` 与父级 `clipPath: polygon(...)` 的渲染顺序**：外层有八角切角，CSS animation 在被 clipPath 裁剪的元素内部，浏览器 compositor 是否会先 clip 再 transform？视觉效果是否符合预期？
3. **`reduce-motion` 的 `animation: "none"`** 是否真的会让元素**静止于初始位置**？还是要用 `animation-play-state: paused` 更稳妥？`none` 实际是"未应用动画"——元素应当停在 `from` 状态（0 偏移）。
4. **是否有更标准的 Tailwind v4 写法**：项目用 Tailwind v4（见 `frontend/CLAUDE.md` 第 4 行），是否应把 keyframes 抽到 `globals.css` 或 `@layer utilities` 里？组件内联 `<style>` 是否违反项目惯例？项目内是否有 `tailwind.config` / `@theme` 块管理自定义动画的现成模式？
5. **关键帧 `to: -33.333%` 与 `items` 是 `[...x3]` 三倍复制**的对应关系：若未来 `marqueeItems` 数量变化（如 10 → 12），三倍复制依然成立，但**一份内容宽度仍占 1/3 总体宽度**——CSS 33.333% 永远等于"一份内容宽度"，**这与 item 数量无关**，是否 Codex 同意这个 invariant？

## 决策后可执行下一步

- Codex review 通过后，本轮可直接 commit：
  ```
  fix(landing): transaction-marquee 滚动速度异常修复
  ```
- 若 Codex 指出数学不严密（窄屏边界），考虑回退到方案 B（px/秒 + 测内容宽度）。
- sine-wave 等其他预先存在的本地修改**单独 commit**，不与本修复混在一起。
