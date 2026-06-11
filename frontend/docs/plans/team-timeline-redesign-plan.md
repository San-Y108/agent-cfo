# AgentCFO — Team & Timeline Redesign Plan

> 状态：待审阅 | 创建：2026-06-11

---

## 一、素材清单（已就位）

### 1.1 Timeline 胶片图片（4 张）

| Phase | 文件路径 | 尺寸 | 内容 |
|---|---|---|---|
| 01 Kickoff | `/timeline/phase-01-kickoff.png` | 1024x1536 | kickoff-day |
| 02 Integration | `/timeline/phase-02-integration.png` | 1024x1536 | build-period |
| 03 Polish | `/timeline/phase-03-polish.png` | 1024x1536 | submission-deadline |
| 04 Submit | `/timeline/phase-04-submit.png` | 1024x1536 | demo-day |

### 1.2 团队头像（6 张）

| 角色 | Handle | 昵称 | 职能 | 颜色 | 头像路径 | 尺寸 |
|---|---|---|---|---|---|---|
| PM / 交付 | San-Y108 | 欢 | 项目统筹、路演 | `#B5FF4D` | `/team/avatar-san-y108.jpg` | 1075x1080 |
| 后端 / Agent | W5W8L9jlu | 九九八乂 | FastAPI、风险引擎 | `#5EEAD4` | `/team/avatar-w5w8l9jlu.jpg` | 292x292 |
| 前端 | Aafff623 | threetwoa | 产品界面 | `#60A5FA` | `/team/avatar-aafff623.jpg` | 940x940 |
| 合约 / CAW | gitgdut | purple sun | Cobo 测试网执行 | `#C084FC` | `/team/avatar-gitgdut.jpg` | 400x400 |
| 物料 / 设计 | Eloise-qiu | 呱呱 | PPT、视频、视觉 | `#FB7185` | `/team/avatar-eloise-qiu.jpg` | 940x940 |
| **导师** | **ZanyK** | — | 去年 Hackathon 参赛经验指导 | `#FFD700` | `/team/avatar-mentor-zanyk.jpg` | 1024x1024 |

---

## 二、Team 区块新布局：Constellation Pentagon（星座五边形）

### 2.1 设计理念

把团队从"一排卡片"升级为**星座图**——5 位核心成员像星星一样环绕在导师周围，彼此之间有发光的连接线。隐喻：导师是引力中心，5 位成员围绕核心目标运转，彼此相连形成完整的系统。

### 2.2 线框图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         Built by the team                               │
│              Five roles, one mentor, one controlled money pipeline      │
│                                                                         │
│                                                                         │
│                              [Cap]                                      │
│                         ┌───────────┐                                   │
│                         │  San-Y108 │                                   │
│                         │   (PM)    │                                   │
│                         └─────┬─────┘                                   │
│                               │                                         │
│                               │ 连接线                                  │
│                               │                                         │
│    [Ink] ───────┬─────────────┼─────────────┬─────── [Node]            │
│  ┌───────────┐  │             │             │  ┌───────────┐           │
│  │ Eloise-qiu│  │             │             │  │ W5W8L9jlu │           │
│  │ (Design)  │──┘             │             └──│ (Backend) │           │
│  └───────────┘                │                └───────────┘           │
│                               │                                         │
│                               │                                         │
│                         ┌───────────┐                                   │
│                         │   ZanyK   │                                   │
│                         │  MENTOR   │  ← 金色光环 + 尺寸最大            │
│                         │  (Advisor)│                                   │
│                         └───────────┘                                   │
│                               │                                         │
│                               │                                         │
│  ┌───────────┐                │                ┌───────────┐           │
│  │  gitgdut  │──┐             │             ┌──│ Aafff623  │           │
│  │ (Contract)│  │             │             │  │(Frontend) │           │
│  └───────────┘  │             │             │  └───────────┘           │
│                 │             │             │                          │
│    [Vault] ─────┴─────────────┼─────────────┴─────── [Pixel]           │
│                               │                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 尺寸与位置（Desktop lg+）

| 元素 | 尺寸 | 位置 | 说明 |
|---|---|---|---|
| 外围卡片 | 160 x 220px | 正五边形顶点，R=200px | 较小，突出中心 |
| 中心导师卡 | 200 x 280px | 正中央 (0, 0) | 最大，视觉焦点 |
| 连接线 | 1px dashed | 中心 ↔ 各顶点 | 默认 `white/5%`，hover 时发光 |
| 头像尺寸 | 56px（外围）/ 72px（中心） | 卡片顶部 | `object-fit: cover`，圆形遮罩 |

**正五边形坐标计算**（以中心为原点）：
```
Cap (顶部):     (0, -200)
Node (右上):    (190, -62)
Pixel (右下):   (118, 162)
Vault (左下):   (-118, 162)
Ink (左上):     (-190, -62)
```

### 2.4 卡片内容结构

**外围卡片（5 张）默认态：**
```
┌─────────────────────┐
│   ┌─────┐           │
│   │Avatar│  ← 56px  │
│   └─────┘           │
│                     │
│  ROLE_LABEL         │  ← 10px mono, accent color
│  Handle             │  ← 14px bold, white
│                     │
│  ─────────          │  ← accent divider
│                     │
│  Short desc...      │  ← 11px, white/40
└─────────────────────┘
```

**中心导师卡（始终）：**
```
┌─────────────────────────┐
│   ┌───────┐             │
│   │Avatar │  ← 72px     │
│   │(光环) │  ← 金色旋转  │
│   └───────┘             │
│                         │
│  ✦ MENTOR / 导师        │  ← 10px mono, gold
│  ZanyK                  │  ← 18px bold, white
│                         │
│  ───────────            │  ← gold divider
│                         │
│  Hackathon veteran      │
│  guiding the team...    │  ← 12px, white/50
└─────────────────────────┘
```

### 2.5 交互设计

| 操作 | 效果 |
|---|---|
| **Hover 外围卡片** | 该卡片 `scale: 1.15` + `z-index: 50` + 微光边框；与中心的连线变为 `accent color` + `opacity: 0.6`；其他 4 张外围卡片 `opacity: 0.35`；中心导师 `opacity: 0.7` |
| **Hover 中心导师** | 中心 `scale: 1.08` + 金色光环加强（`opacity: 1` → `1.5`）；所有 5 条连线同时发光；外围 5 张卡片 `opacity: 0.4` |
| **无 Hover** | 全部正常显示；连线呼吸动画（`opacity: 0.03 → 0.08`，3s 循环）|
| **页面进入** | 5 张外围卡片从中心向外扩散（`scale: 0 → 1`，stagger 0.1s）；中心导师最后出现（`scale: 0.5 → 1`，带弹性 easing）|

### 2.6 响应式降级

| 断点 | 布局 |
|---|---|
| `lg+` (≥1024px) | 正五边形 + 中心导师（完整 Constellation） |
| `md` (768-1023px) | 3x2 网格（导师占 2 列居中） |
| `sm` (<768px) | 单列滑动，导师置顶 |

### 2.7 配色方案

| 角色 | 主色 | 用途 |
|---|---|---|
| San-Y108 | `#B5FF4D` | 卡片边框 glow、连线、头像 ring |
| W5W8L9jlu | `#5EEAD4` | 同上 |
| Aafff623 | `#60A5FA` | 同上 |
| gitgdut | `#C084FC` | 同上 |
| Eloise-qiu | `#FB7185` | 同上 |
| **ZanyK (导师)** | `#FFD700` | **金色光环**、边框 glow、连线 |

---

## 三、Timeline 胶片图片接入方案

### 3.1 接入方式

在 `build-timeline.tsx` 的每个 frame `div` 中加入 `<img>` 作为背景层：

```tsx
<div className="absolute inset-0 ...">
  {/* Background image */}
  <img
    src={`/timeline/phase-0${i+1}-${phaseKey}.png`}
    className="absolute inset-0 w-full h-full object-cover"
    style={{ opacity: 0.45 }}
  />
  {/* Dark overlay for text readability */}
  <div className="absolute inset-0 bg-black/40" />
  {/* Content: number + label + title */}
  <span className="text-[64px] ...">{number}</span>
  ...
</div>
```

### 3.2 视觉处理

| 处理 | 值 | 目的 |
|---|---|---|
| 图片 opacity | `0.45` | 淡化背景，不抢文字焦点 |
| 暗色遮罩 | `bg-black/40` | 确保白色文字可读 |
| Vignette | 已有 | 边缘暗化，聚焦中心 |
| Film Grain | 已有 | 胶片颗粒质感 |
| object-fit | `cover` | 填满 frame，允许裁剪 |

### 3.3 图片映射

| Frame | 图片路径 |
|---|---|
| Phase 0 (01) | `/timeline/phase-01-kickoff.png` |
| Phase 1 (02) | `/timeline/phase-02-integration.png` |
| Phase 2 (03) | `/timeline/phase-03-polish.png` |
| Phase 3 (04) | `/timeline/phase-04-submit.png` |

---

## 四、执行计划（Phase 分解）

### Phase 1: Timeline 图片接入（30 min）
- [ ] 修改 `build-timeline.tsx`
- [ ] 每个 frame 添加 `<img>` 背景层
- [ ] 调整文字层级（z-index）确保在图片之上
- [ ] 添加暗色遮罩保证可读性
- [ ] 验证 build

### Phase 2: TeamShowcase 数据层更新（15 min）
- [ ] 在 `MEMBERS` 数组中加入导师 ZanyK
- [ ] 为每个成员添加 `avatar` 字段（头像路径）
- [ ] 更新类型定义 `Member`

### Phase 3: TeamShowcase 布局重构（90 min）
- [ ] 删除现有 fan-spread 布局
- [ ] 实现正五边形坐标计算
- [ ] 实现中心导师卡片（大尺寸 + 金色光环）
- [ ] 实现外围 5 张卡片（头像 + 文字）
- [ ] 实现连接线（中心 ↔ 顶点）
- [ ] 实现 Hover 交互（scale + opacity + 连线高亮）
- [ ] 实现入场动画（stagger 扩散）
- [ ] 实现响应式降级（md: 3x2 grid, sm: 单列）

### Phase 4: 打磨与验证（30 min）
- [ ] 检查所有头像 `object-fit: cover` 显示正常
- [ ] 检查导师金色光环效果
- [ ] 检查 hover 交互流畅度
- [ ] `pnpm typecheck` ✅
- [ ] `pnpm build` ✅
- [ ] 浏览器截图验证（desktop + mobile）

**总预估时间：~2.5 小时**

---

## 五、技术约束

- 不引入新依赖（继续用 framer-motion + gsap）
- 所有动效组件必须 `"use client"`
- `prefers-reduced-motion` 降级：静态五边形，无连线动画
- 移动端头像尺寸适当缩小
- 连线使用 CSS/SVG，不用 Canvas

---

## 六、待确认事项

1. **导师信息确认**：
   - 名字：ZanyK ✅
   - 角色标签："Mentor / 导师" 或 "Advisor / 顾问"？
   - 描述文案：目前是 "Hackathon veteran guiding the team..."，需要你的版本

2. **布局偏好确认**：
   - 正五边形方向：顶部放 PM（San-Y108）是否合适？
   - 中心导师卡片是否需要显示去年参赛的具体信息（如"2025 Hackathon Participant"）？

3. **头像裁剪**：
   - 头像将用 `object-fit: cover` 圆形裁剪，如果某张头像的脸不在中心请告诉我

---

请审阅以上 plan，确认后我立即开始执行。
