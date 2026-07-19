# Demo 视频 · Landing 嵌入集成规划

> **状态**：🟢 可执行 · 录完视频后交给 Agent「适配一下」即可  
> **最后更新**：2026-06-13（团队资产统一放 `assets/video/`）  
> **触发词**：`适配 demo 视频` · `integrate demo video` · `把视频接到 Landing`

---

## 0. 团队资产原则（必读）

**Demo 视频是全队共同交付物，不是前端私货。**

| 原则 | 说明 |
|---|---|
| **唯一投放点（人）** | 仓库根目录 **`assets/video/agentcfo-demo.mp4`** |
| **与 PPT / 海报同级** | 和 `assets/theme/ppt/`、`assets/images/` 一样，归团队交付资产 |
| **禁止要求队友拖进 `frontend/`** | 前端目录只放**构建时自动同步的镜像**，不由人手动维护 |
| **Agent 适配时** | 只认 `assets/video/` 为源；运行 `scripts/sync-demo-video.mjs` 同步到 `frontend/public/video/` |

```text
你拖入 ──► assets/video/agentcfo-demo.mp4     （团队真相源 · 你只管这里）
                │
                │  scripts/sync-demo-video.mjs（pnpm dev / pnpm build 自动跑）
                ▼
           frontend/public/video/…            （Next.js 静态镜像 · 勿手改）
                │
                ▼
           Landing #guardrails  <video controls>
```

---

## 1. 调研结论（Agent 必读）

### 1.1 视频模块在哪

| 项 | 值 |
|---|---|
| **页面** | Landing `/` |
| **区块** | `GuardrailsCTA`（锚点 `#guardrails`） |
| **组件文件** | `frontend/components/landing/guardrails-cta.tsx` |
| **子组件** | `DemoVideoCard()` — 右侧终端框 `agentcfo — demo.mp4` |

`DEMO_VIDEO_SRC` 为空 → 占位「coming soon」；非空 → 可点击播放的 `<video controls>`。

### 1.2 播放行为

- ✅ 配置后 Guardrails 区显示播放器，**访客手动点播放**
- ❌ **不会自动播放**（无 `autoPlay`）
- ❌ 浏览器无法直接读 `assets/video/` 路径——必须经过同步到 `frontend/public/` 或外链 CDN

### 1.3 与 Hero 背景视频无关

`velorix-hero.tsx` 远程装饰视频 ≠ Demo 视频。适配只动 `guardrails-cta.tsx` + 同步脚本 + 文档。

---

## 2. 标准路径（修订版）

| 角色 | 路径 | 谁操作 |
|---|---|---|
| **团队主文件（唯一投放）** | `assets/video/agentcfo-demo.mp4` | **人拖这里** |
| **封面（可选）** | `assets/video/agentcfo-demo-poster.jpg` | 人拖这里 |
| **备用录屏（可选）** | `assets/video/agentcfo-demo-backup.mp4` | 不接入 Landing |
| **构建镜像（自动生成）** | `frontend/public/video/agentcfo-demo.mp4` | **脚本同步，勿手拖** |
| **同步脚本** | `scripts/sync-demo-video.mjs` | Agent / `pnpm dev` / `pnpm build` |

Landing 引用 URL 固定为：`/video/agentcfo-demo.mp4`（指向 public 镜像）。

### 格式建议

- MP4（H.264 + AAC）· 3–5 分钟 · 建议 &lt; 50MB

---

## 3. Agent 执行清单（用户说「适配一下」）

### Phase A — 确认团队资产已就位

```text
必须存在：assets/video/agentcfo-demo.mp4
若用户在 inbox/ 或其他路径 → 移动到 assets/video/ 并规范命名
禁止：要求用户把文件放进 frontend/public/
```

```powershell
# 仓库根目录
New-Item -ItemType Directory -Force -Path "assets\video"
# 若从 inbox 迁入：
# Move-Item "inbox\你的视频.mp4" "assets\video\agentcfo-demo.mp4"
```

### Phase B — 同步到前端 public（自动）

```bash
node scripts/sync-demo-video.mjs
# 或在 frontend/ 下：
pnpm sync:demo-video
```

`frontend/package.json` 已在 `predev` / `prebuild` 挂钩，正常 `pnpm dev` / `pnpm build` 会自动同步。

### Phase C — 改播放配置

**文件：** `frontend/components/landing/guardrails-cta.tsx`

```ts
const DEMO_VIDEO_SRC = "/video/agentcfo-demo.mp4";
const DEMO_VIDEO_POSTER = "/video/agentcfo-demo-poster.jpg"; // 无则 ""
```

### Phase D — 更新 i18n（去掉 coming soon）

**文件：** `frontend/lib/i18n/dict.ts`

- `guardrails.demo.subtitle` en → `3–5 min walkthrough · play below`
- `guardrails.demo.subtitle` zh → `3–5 分钟全流程 · 点击下方播放`

### Phase E — README + 提交清单

**README.md § Demo Video** 应写团队资产路径，例如：

```markdown
- **团队归档**：`assets/video/agentcfo-demo.mp4`
- **Landing 播放**：https://agentcfo-frontend.vercel.app/#guardrails
- **直链**：https://agentcfo-frontend.vercel.app/video/agentcfo-demo.mp4
```

勾选 `docs/pm/SUBMISSION_CHECKLIST.md` 相关项。

### Phase F — 验证

```bash
cd frontend && pnpm dev
# 打开 http://localhost:3100/#guardrails → 可播放
```

**Vercel：** 部署前确保 `assets/video/agentcfo-demo.mp4` 已 commit；`prebuild` 会把镜像打进构建产物。

### Phase G — Git 提交范围建议

```text
git add assets/video/agentcfo-demo.mp4
git add assets/video/agentcfo-demo-poster.jpg   # 如有
# frontend/public/video/* 可提交也可依赖 prebuild；建议一并提交镜像方便审查
git add frontend/components/landing/guardrails-cta.tsx
git add frontend/lib/i18n/dict.ts
git add README.md
```

---

## 4. 用户操作（给人看 · 只需一步）

```text
1. 录完视频，命名为 agentcfo-demo.mp4
2. 拖到仓库根目录的 assets/video/     ← 只这一步，全队统一
3. 对 Agent 说：「按 demo-video-landing-integration-plan 适配」
```

**不要**拖进 `frontend/`。那是前端构建自动处理的镜像目录。

---

## 5. 边界与禁止项

| 禁止 | 原因 |
|---|---|
| 让人拖视频到 `frontend/public/` | 违反团队资产归 `assets/` 的约定 |
| 只放 assets 不同步就改 DEMO_VIDEO_SRC | 构建/本地无 public 镜像会 404 |
| 承诺自动播放 | 实现为 `controls` 手动播放 |
| 用 YouTube 页面 URL 作 video src | 无法嵌入 |

---

## 6. Agent 一句话摘要

> 视频只在 **`assets/video/agentcfo-demo.mp4`** → 跑 **`scripts/sync-demo-video.mjs`** → 设 **`DEMO_VIDEO_SRC="/video/agentcfo-demo.mp4"`** → 更新 dict/README/清单 → 验证 `/#guardrails`。

---

## 7. 相关文件

| 文件 | 角色 |
|---|---|
| `assets/video/README.md` | **团队投放说明（主入口）** |
| `scripts/sync-demo-video.mjs` | assets → public 同步 |
| `frontend/package.json` | predev / prebuild 挂钩 |
| `frontend/public/video/README.md` | 说明此为自动镜像，非投放点 |
| `frontend/components/landing/guardrails-cta.tsx` | 播放 URL 配置 |
