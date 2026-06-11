# GSAP 动画调研报告 — AgentCFO Console 升级

> 生成日期：2026-06-11
> 调研范围：GSAP 高级插件 + 创意用法 + 5 页面匹配方案
> 执行 Agent：GSAP Animation Deep Research

---

## 1. 推荐引入的 GSAP 插件（按优先级排序）

| 插件 | 优先级 | 适用场景 | 引入成本 | 创意用法 |
|------|--------|----------|----------|----------|
| **Flip** | P0 — 最高 | 卡片重排、列表过滤、网格切换、Comparison Matrix 重排 | 低（仅需 `gsap.registerPlugin(Flip)` + `Flip.getState`/`Flip.from`） | Wallet List 过滤时卡片平滑飞入新位置；Analytics Comparison Matrix 切换视图时卡片物理级重排；Policy Whitelist 增删行时的列表流体重排 |
| **SplitText** | P0 — 最高 | 字符级/单词级/行级文字动画、标题进入效果 | 低（`SplitText.create()` + `gsap.from`） | Treasury 页面标题 "Payment Execution Center" 逐字飞入；Agent 页面 Chat 消息逐词淡入；Policy 5 Rules 数字标题字符级 stagger 揭示 |
| **ScrambleText** | P1 — 高 | 文字扰乱解码效果、状态切换、数据更新 | 低（`scrambleText: { text, chars, speed }`） | Agent 页面状态文字从 "Analyzing..." 解码切换；Treasury txHash 生成时的十六进制字符扰乱；Wallets 余额更新时的数字扰乱过渡 |
| **DrawSVG** | P1 — 高 | SVG 路径绘制动画、连接线绘制、图标描边 | 中（需 SVG 元素有 `stroke` 属性） | Wallets Topology 节点连接线绘制动画（替代现有静态线条）；Flow Timeline 连接器线条绘制；Policy 规则卡片边框描边揭示 |
| **MotionPath** | P1 — 高 | 沿路径运动动画、数据包流动、粒子轨迹 | 中（需定义 SVG path） | Wallets Topology 数据包沿贝塞尔曲线从 CAW Core 飞向各 Vault（替代现有直线运动）；Transfer 流程中资金流动路径动画 |
| **Observer** | P2 — 中 | 统一手势观测、滑动手势、滚轮事件 | 低（`Observer.create({ type, onUp, onDown })`） | Agent 页面 Chat 区域滑动手势快速切换历史会话；Console 全局手势导航（左滑打开 Drawer） |
| **3D Transforms** | P2 — 中 | rotateX/Y/Z、perspective、transformOrigin | 低（GSAP 内置，无需额外插件） | Treasury KPI 卡片 3D 翻转进入；Agent 角色状态切换时的 rotateY 180° 翻转；Wallet HoloCard 增强 3D 透视 |
| **ScrollTrigger (高级)** | P2 — 中 | scrub、pin、snap、onEnter/onLeave 回调组合 | 低（已注册） | Treasury 页面滚动时 Action Panel 分步 sticky 揭示；Analytics 图表滚动进入视口时的数据绘制动画 |
| **Draggable** | P3 — 低 | 可拖拽交互、滑块、卡片排序 | 中（`Draggable.create()`） | Policy Threshold Slider 拖拽增强（带惯性回弹）；Wallets 列表手动排序 |
| **ScrollSmoother** | P3 — 低 | 平滑滚动 | 中（需包裹内容，与现有 ScrollTrigger 配合） | **不建议引入** — Console 是多页路由应用（非单页长滚动），ScrollSmoother 更适合 Landing Page 的长滚动体验。且与现有 ScrollTrigger pin 可能冲突 |
| **MorphSVG** | P3 — 低 | SVG 形状变形、图标变换 | 中（需 SVG path 数据匹配） | Agent 角色图标状态变形（Bot → Shield → Check）；Risk Gate 图标从 ShieldAlert 变形为 CheckCircle |
| **Physics2D** | P3 — 低 | 物理模拟、粒子弹跳 | 高（Club GSAP 付费插件） | **不建议** — 引入成本高（付费），且 AgentCFO 是财务控制台，物理弹跳效果与"严谨财控"气质不符 |

---

## 2. 各页面 GSAP 升级方案

### Treasury 页 — "付款执行中心"

**为什么适合**：Treasury 是核心操作页面，需要强调"AI 扫描 → 风险检查 → 人工确认 → 执行"的流水线仪式感。

- **KPI 卡片进入**：`SplitText` + `staggerReveal` 组合。4 个 KPI 卡片（预算/待付款/已拦截/剩余）用 `staggerReveal` 从下方滑入，卡片内数字用 `SplitText` 逐位揭示，配合 `ScrambleText` 从 `0000` 扰乱解码到真实数值。
- **Records Table 行进入**：现有 `motion.tr` 的 Framer Motion stagger 可保留，但新增 **DrawSVG** 给每行左侧状态指示线（Ready=lime, Blocked=coral, Executed=emerald）一个从顶部绘制到底部的描边动画，象征"审核通过"的仪式感。
- **Action Panel 分步切换**：用 **Flip** 捕获面板状态变化。Step 0→1→2→3→4 切换时，面板内容（Generate → Scanning → Review → Executing → Done）通过 `Flip.getState` + `Flip.from` 实现平滑的 DOM 重排动画，而非当前的硬切换。Step 3 "Executing" 中的旋转 loader 可叠加 **3D rotateY** 让加密广播感更强。
- **Risk Gate Alert**：现有 Framer Motion shake 保留，但新增 **ScrambleText** 让拦截原因文字从乱码解码为 "Address not whitelisted"，强化"安全系统解码中"的科技感。

### Wallets 页 — "资金拓扑"

**为什么适合**：Wallets 页面已有 WalletTopology 和 WalletHoloCard，GSAP 可以将其从"静态展示"升级为"动态资金流动可视化"。

- **Wallet List 过滤/重排**：**Flip** 核心场景。当用户切换 active wallet 或过滤列表时，卡片通过 `Flip.from` 平滑飞入新位置，而非瞬间切换。新增钱包时卡片从中心 scale 0 放大进入。
- **Transfer 流程动画**：用 **MotionPath** 替代现有静态转账流程。当用户点击 "Broadcast" 后，一个发光粒子沿贝塞尔曲线路径从 Sender Wallet 飞向 Recipient，路径用 **DrawSVG** 实时绘制，到达时触发 **ScrambleText** 显示 txHash。
- **Topology 节点连接**：现有 WalletTopology 的数据包沿直线运动可升级为 **MotionPath** 沿曲线路径运动，配合 **DrawSVG** 让连接线从 CAW Core 向外逐条绘制，营造"网络激活"的仪式感。节点 hover 时用 **3D rotateY** 翻转显示详细信息。
- **Wallet HoloCard 增强**：在现有 Framer Motion 3D tilt 基础上，用 GSAP `transformOrigin: "50% 50% -200px"` 增加深度透视，hover 时卡片产生更强烈的"浮出屏幕"效果。

### Analytics 页 — "数据洞察"

**为什么适合**：Analytics 是数据展示页面，GSAP 可以让"死数据"变成"活故事"。

- **图表数据更新动画**：AreaChart 数据切换时（30d/90d/1y），用 **ScrambleText** 让 KPI 数字从旧值扰乱过渡到新值。PieChart 扇区切换时用 **Flip** 让图例卡片重排。
- **Comparison Matrix 卡片重排**：**Flip** 核心场景。3 个对比卡片在数据更新时通过 `Flip.getState` + `Flip.from` 实现物理级重排，配合 `stagger` 让卡片依次落入新位置。
- **Range Pills 切换**：现有 Framer Motion `layoutId` 的 pill 滑动效果保留，但新增 **SplitText** 让切换后的图表标题逐词淡入。
- **滚动进入动画**：图表区域滚动进入视口时，用 **ScrollTrigger** + **DrawSVG** 让 AreaChart 的渐变填充区域从上往下"绘制"展开，而非直接显示。

### Policy 页 — "规则引擎"

**为什么适合**：Policy 是"规则守护"页面，需要强调"5 道安全闸门"的威严感和不可侵犯性。

- **5 Rules 数字滚动**：现有静态大数字（01-05）升级为 **ScrambleText** 从乱码解码为最终数字，配合 **SplitText** 让规则标题逐字砸入（`y: 40 → 0`, `power4.out` 重击感）。每个规则卡片进入视口时，边框用 **DrawSVG** 从左上角顺时针绘制一圈，象征"规则封印激活"。
- **Threshold Slider 动画**：Slider 拖动时用 **Observer** 统一手势检测，释放时用 GSAP `elastic.out(1, 0.5)` 让数值标签产生弹性回弹。数值变化时用 **ScrambleText** 从旧值扰乱到新值，配合 `gsap.utils.mapRange` 将 slider 值映射到颜色渐变（低=lime, 高=coral）。
- **Whitelist 行进入**：新增行时用 **Flip** 让列表平滑展开，删除行时用 `absoluteOnLeave: true` 让行向上飘出后消失。每行进入时左侧类别标签用 **SplitText** 逐字符淡入。
- **Security Gateway 卡片**：用 **3D rotateX** 让卡片从水平翻转立起进入，配合 **DrawSVG** 绘制盾牌图标轮廓。

### Agent 页 — "AI 财控助手"

**为什么适合**：Agent 是"人机交互"页面，需要让 AI 显得"有思想、有情绪、有动作"。

- **Chat 消息进入**：现有 Framer Motion 的 `scale: 0.97 → 1` 保留，但新增 **SplitText** 让 Agent 回复消息逐词淡入（`y: 10, opacity: 0 → y: 0, opacity: 1, stagger: 0.02`），模拟"AI 正在打字"的错觉。用户消息用 **ScrambleText** 从 `••••••` 解码为真实文本。
- **3D 角色状态切换**：现有 `AgentCharacter` 的呼吸动画保留，但状态切换时（idle → thinking → speaking → happy → warning）用 **3D rotateY: 180°** 翻转角色圆盘，翻转过程中用 **MorphSVG** 将 Bot 图标变形为对应状态图标（Shield/Check/Alert），翻转回来显示新状态。
- **Quick Actions 点击反馈**：点击 Quick Action 按钮时，用 **Flip** 捕获按钮状态，点击后按钮缩小并飞向 Chat 输入区，模拟"指令已发送"的物理感。按钮 hover 时用 **3D rotateX: 5°** 产生倾斜按压感。
- **Sparkle 粒子升级**：现有 Framer Motion 粒子保留，但新增 **gsap.utils.random** 让粒子大小、速度、角度随机化，产生更自然的"AI 思维火花"效果。

---

## 3. 代码示例（关键特效的最简实现）

### 示例 1：Flip 卡片重排（Analytics Comparison Matrix / Wallets List）

```typescript
// frontend/lib/gsap.ts — 注册 Flip
import { Flip } from "gsap/Flip";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

// 使用：在组件中捕获状态变化前后
function useFlipAnimation<T extends HTMLElement>(containerRef: React.RefObject<T | null>) {
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const capture = () => {
    if (containerRef.current) {
      flipStateRef.current = Flip.getState(containerRef.current.children);
    }
  };

  const animate = (opts?: Flip.FromToVars) => {
    if (flipStateRef.current && containerRef.current) {
      Flip.from(flipStateRef.current, {
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.05,
        absolute: true,
        ...opts,
      });
    }
  };

  return { capture, animate };
}

// 在 Wallets 列表过滤时：
const { capture, animate } = useFlipAnimation(listRef);

const handleFilter = (filter: string) => {
  capture(); // 捕获当前布局
  setFilteredWallets(wallets.filter(w => w.type === filter)); // DOM 变化
  requestAnimationFrame(() => animate()); // 动画到新布局
};
```

**为什么适合 AgentCFO**：财务控制台的卡片重排不是"花哨"，而是"资金在不同账户间流动"的可视化隐喻。Flip 的物理级平滑过渡让用户直观感受到"资产在重新配置"。

---

### 示例 2：SplitText + ScrambleText 组合（Treasury KPI / Agent 状态）

```typescript
// frontend/components/ui/gsap-text-effects.tsx
import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

/** 标题逐字砸入 — 适合页面大标题 */
export function SlamText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const split = SplitText.create(ref.current, { type: "chars" });
    gsap.from(split.chars, {
      y: 60,
      opacity: 0,
      rotateX: -90,
      stagger: 0.04,
      duration: 0.8,
      ease: "power4.out",
      transformOrigin: "50% 50% -30px",
    });
    return () => { split.revert(); };
  }, [children]);

  return <h2 ref={ref} className={className}>{children}</h2>;
}

/** 数字扰乱解码 — 适合金额/txHash 更新 */
export function ScrambleValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      duration: 1.2,
      scrambleText: {
        text: value,
        chars: "0123456789ABCDEF",
        revealDelay: 0.1,
        speed: 0.4,
      },
    });
  }, [value]);

  return <span ref={ref} className={className}>{value}</span>;
}
```

**为什么适合 AgentCFO**：财务数据的变化需要"仪式感"。SplitText 的逐字砸入让"月度贡献结算"标题像判决书一样庄重落下；ScrambleText 的十六进制扰乱让 txHash 生成过程像加密机在工作，强化"区块链不可篡改"的心理暗示。

---

### 示例 3：MotionPath + DrawSVG 资金流动（Wallets Transfer / Topology）

```typescript
// 在 WalletTopology 中升级数据包运动
function DataPacket({ pathId, delay }: { pathId: string; delay: number }) {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;
    // 沿曲线路径运动
    gsap.to(circleRef.current, {
      duration: 2,
      repeat: -1,
      delay,
      ease: "power1.inOut",
      motionPath: {
        path: `#${pathId}`,
        align: `#${pathId}`,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
      },
    });
  }, [delay, pathId]);

  return <circle ref={circleRef} r={3} fill="#60A5FA" />;
}

// 连接线绘制动画
function ConnectionLine({ pathD }: { pathD: string }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    gsap.fromTo(
      pathRef.current,
      { drawSVG: "0%" },
      {
        drawSVG: "100%",
        duration: 1.5,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: pathRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <path
      ref={pathRef}
      d={pathD}
      stroke="url(#walletLineGrad)"
      strokeWidth={1.5}
      fill="none"
    />
  );
}
```

**为什么适合 AgentCFO**：资金流动是财务控制台的核心叙事。MotionPath 让"数据包"沿真实曲线路径飞行，而非生硬的直线；DrawSVG 让连接线像电路板上的导线一样被"激活点亮"。这不是装饰，而是"资金在受控路径中流动"的可视化表达。

---

## 4. 风险评估

### 性能影响

| 风险项 | 等级 | 说明 | 缓解策略 |
|--------|------|------|----------|
| **Flip DOM 计算** | 中 | `Flip.getState()` 读取大量元素的 `getBoundingClientRect`，大数据量列表可能卡顿 | 限制 Flip 动画的元素数量（最多 20 个）；对长列表使用虚拟滚动 + Flip |
| **SplitText DOM 膨胀** | 中 | 每个字符拆分为独立 `<div>`，长文本会大量增加 DOM 节点 | 仅对短标题（< 50 字符）使用；长文本用 `type: "words"` 而非 `chars` |
| **DrawSVG 重绘** | 低 | SVG 路径动画本身性能良好，但大量并发路径可能触发重排 | 限制同时动画的路径数量；使用 `will-change: stroke-dashoffset` |
| **MotionPath 计算** | 低 | 路径点计算在初始化时完成，运行时性能开销小 | 预计算复杂路径；避免在 `requestAnimationFrame` 中动态修改 path |
| **ScrollTrigger 内存** | 中 | 大量 ScrollTrigger 实例未清理会导致内存泄漏 | 组件卸载时调用 `ScrollTrigger.getAll().forEach(st => st.kill())` |

### 与 Framer Motion 的冲突/共存策略

**现状**：AgentCFO 大量使用 Framer Motion（`motion.div`、`AnimatePresence`、`useSpring`、`layoutId` 等）。

**策略：互补而非替代**

| 场景 | 使用 Framer Motion | 使用 GSAP |
|------|-------------------|-----------|
| React 组件级进入/退出动画（mount/unmount） | ✅ `AnimatePresence` + `motion.div` | ❌ GSAP 不擅长处理 unmount |
| 布局动画（layoutId 共享布局） | ✅ `layoutId` 自动处理 | ❌ Flip 需要手动捕获状态 |
| 复杂时间线编排（多元素协同） | ❌ 代码冗长 | ✅ `gsap.timeline()` |
| SVG 路径/描边动画 | ❌ 不支持 | ✅ DrawSVG / MotionPath |
| 文字拆分/扰乱效果 | ❌ 不支持 | ✅ SplitText / ScrambleText |
| 滚动驱动动画 | ⚠️ `useScroll` 有限 | ✅ ScrollTrigger 强大 |
| 手势/拖拽 | ✅ `useDragControls` | ✅ Draggable（更强大） |

**具体共存规则**：
1. **保留 Framer Motion**：所有 `AnimatePresence` 进入/退出动画、sidebar `layoutId` 指示器、RangePills `layoutId` 滑动、WalletHoloCard 的 `useSpring` 3D tilt。
2. **引入 GSAP 补强**：文字效果（SplitText/ScrambleText）、SVG 动画（DrawSVG/MotionPath）、复杂时间线（Timeline choreography）、滚动驱动（ScrollTrigger）。
3. **避免混用同一元素**：不要对同一个 DOM 节点同时应用 Framer Motion `animate` 和 GSAP `gsap.to`，会产生冲突。选择一方主导。
4. **统一缓动曲线**：定义共享的 easing 映射，让 Framer Motion 的 `ease: [0.23, 1, 0.32, 1]` 与 GSAP 的 `"power3.out"` 在视觉上保持一致。

### 移动端降级方案

```typescript
// frontend/lib/gsap.ts — 统一降级检测
export function useGsapReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// 在组件中使用
const reduced = useGsapReduced();

// SplitText: 降级为直接显示
const split = !reduced && SplitText.create(el, { type: "chars" });

// Flip: 降级为无动画直接切换
Flip.from(state, { duration: reduced ? 0 : 0.6 });

// MotionPath: 降级为直线运动或静态
gsap.to(el, {
  motionPath: reduced ? undefined : { path: "#curve" },
  x: reduced ? targetX : undefined,
  duration: reduced ? 0 : 2,
});
```

**移动端特殊处理**：
- **触摸设备禁用 3D tilt**：`WalletHoloCard` 的鼠标跟踪在触摸设备上无意义，降级为静态卡片。
- **简化粒子效果**：Agent 页面 sparkle 粒子在移动端减少数量（从 5 个减到 2 个）。
- **禁用 ScrollTrigger pin**：移动端 pin 会导致滚动卡顿，改用简单的 `fadeInUp` 进入动画。
- **Observer 替代复杂手势**：用 `Observer.create({ type: "touch" })` 统一处理滑动手势，避免多个 touch 事件监听器冲突。

---

## 5. 总结

AgentCFO 不是普通的管理后台，它是一个 **"有权威感的 AI 财务官工作台"**。GSAP 的引入不是为了"让页面动起来"，而是为了：

1. **强化"资金流动"的物理隐喻** — MotionPath + DrawSVG 让资金像真实液体一样在管道中流动
2. **强化"安全规则"的封印感** — SplitText + DrawSVG 让规则像法律文书一样逐字敲下、逐条封印
3. **强化"AI 思考"的解码感** — ScrambleText 让 AI 的输出像加密机解码一样充满科技感
4. **强化"资产重配"的物理感** — Flip 让卡片重排像真实物体在桌面上被重新整理
5. **保持"控制台"的专业冷静** — 所有动画都是克制的、有目的的、服务于信息传达的，而非炫技

GSAP 是 AgentCFO 从"好看的控制台"升级为"有电影感的财控指挥中心"的关键技术杠杆。
