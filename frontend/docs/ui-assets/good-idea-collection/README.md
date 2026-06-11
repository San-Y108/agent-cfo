# Good Idea UI 组件资产库

> 来源：`D:\OneDrive\Desktop\test-lib\good-idea`
> 收录时间：2026-06-10
> 用途：前端动效参考与移植素材

---

## 组件清单（21 个文件）

### 01 · 3D 翻转漫画
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `01-3d-flip-comic.html` | CSS 3D Transform | 63 | 基础 3D 翻页效果，`preserve-3d` + `perspective` |
| `01-3d-flip-comic-v2-online-images.html` | CSS 3D + Keyframes | 484 | **增强版**：在线图片 + 12 组关键帧动画 |

**移植建议**：Console Wallets 卡片的 3D 翻转交互

---

### 02 · 滑动名片
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `02-sliding-business-card.html` | CSS Transform + Transition | 135 | 滑动展开名片，悬停展开详细信息 |

**移植建议**：Policy 页面白名单卡片展开

---

### 03 · 优雅个人资料卡
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `03-elegant-profile-card.html` | CSS Transform + Transition | 154 | 渐变背景 + 悬停上浮效果 |

**移植建议**：Wallets 页面钱包持有者信息展示

---

### 05 · 3D 交互卡片
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `05a-3d-directional-hover-cards.html` | CSS 3D Transform | 160 | 方向感知悬停，鼠标进入方向决定翻转方向 |
| `05b-rotating-carousel-timeline.html` | CSS Transform + Keyframes | 285 | 旋转轮播时间线 |
| `05b-rotating-carousel-timeline-bg-variant.html` | CSS Transform + Keyframes | 295 | 同上，背景变体 |

**移植建议**：Landing Pipeline Showcase 的 3D 卡片增强

---

### 06 · 物理动效
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `06a-rope-string-photos.html` | Canvas 2D + 物理模拟 | 555 | **绳索物理**：照片悬挂在绳子上，可拖拽摆动 |
| `06b-water-ripple-button.html` | CSS Transform + Transition | 80 | 水波纹扩散按钮效果 |

**移植建议**：
- 绳索效果 → Landing 页面装饰性元素
- 水波纹 → Console 按钮交互反馈

---

### 07 · 粒子与视觉
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `07a-particle-heart.html` | Canvas 2D + 粒子系统 | 240 | **粒子爱心**：2000 粒子组成爱心形状，鼠标交互 |
| `07b-visual-impact-cards.html` | CSS 3D + Transition | 148 | 视觉冲击卡片，悬停翻转 |
| `07b-visual-impact-cards-minified.html` | CSS 3D + Transition | 132 | 压缩版 |

**移植建议**：
- 粒子爱心 → Landing Hero 背景或 Console 空状态
- 冲击卡片 → Treasury 执行结果展示

---

### 09 · 按钮集合
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `09a-cool-buttons-direction-aware.html` | CSS Transform + Transition | 182 | 方向感知按钮，悬停光效从鼠标方向进入 |
| `09b-cool-buttons-wheel.html` | CSS Transform + Keyframes | 230 | 轮盘式按钮展开 |
| `09c-rotating-profile-card.html` | CSS Transform + Keyframes | 814 | **复杂**：旋转资料卡，40+ transform，20 组动画 |

**移植建议**：Console 全局按钮交互增强

---

### 10 · 抽屉效果
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `10a-drawer-slide-show.html` | CSS Transform + Transition | 328 | 抽屉式幻灯片展示 |
| `10b-drawer-slide-show-copy.html` | CSS Transform + Transition | 328 | 同上副本 |

**移植建议**：Console Drawer 的展开动画参考

---

### 11 · 导航与时间线
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `11a-clock-scroll-timeline.html` | CSS Transform + Transition | 301 | 时钟滚动时间线 |
| `11b-tab-nav-arc.html` | CSS Transform + Transition | 279 | 弧形 Tab 导航 |

**移植建议**：Console 顶部导航或时间线组件

---

### 13 · 3D 卡片展示
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `13-3d-card-showcase.html` | CSS 3D Transform | 120 | 3D 卡片悬停展示，`preserve-3d` |

**移植建议**：Wallets 钱包卡片 3D 效果

---

### 14 · 加载动画
| 文件 | 技术 | 行数 | 亮点 |
|---|---|---|---|
| `14-cube-rolling-loader.html` | CSS 3D Transform + Keyframes | 476 | **立方体滚动加载**，18 处 3D 变换 |

**移植建议**：Console 数据加载状态指示器

---

## 技术分类统计

| 技术类型 | 数量 | 代表组件 |
|---|---|---|
| **CSS 3D Transform** | 8 | 3D 翻转、立方体、卡片 |
| **Canvas 2D** | 2 | 粒子爱心、绳索物理 |
| **CSS Keyframes** | 7 | 轮播、旋转、加载 |
| **纯 CSS Transition** | 12 | 按钮、名片、抽屉 |

---

## 按 AgentCFO 场景分类

### 🏠 Landing 页面适用
- `07a-particle-heart` — Hero 背景装饰
- `06a-rope-string-photos` — 装饰性元素
- `05b-rotating-carousel-timeline` — Pipeline 时间线

### 🎛️ Console 工作台适用
- `13-3d-card-showcase` — Wallets 3D 卡片
- `09a-cool-buttons-direction-aware` — 按钮交互
- `10a-drawer-slide-show` — Drawer 动画
- `14-cube-rolling-loader` — 加载状态
- `06b-water-ripple-button` — 按钮反馈

### 📋 Policy / Treasury 适用
- `02-sliding-business-card` — 白名单卡片展开
- `07b-visual-impact-cards` — 执行结果卡片
- `11a-clock-scroll-timeline` — 审计时间线

---

## 使用说明

1. 每个文件都是**独立的单文件 HTML**，直接用浏览器打开即可预览
2. 无外部依赖，纯 CSS/JS 实现
3. 移植到 Next.js + Tailwind 时需要：
   - 提取 `<style>` 中的 CSS 到 Tailwind 类或 CSS Module
   - 提取 `<script>` 到 React 组件
   - 将 DOM 操作改为 React 状态管理
