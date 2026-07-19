# assets/video/ — 团队 Demo 视频（全队投放点）

答辩 / Demo 视频是**全队共同交付资产**，与 `assets/theme/ppt/`、`assets/images/` 同级。

## 你怎么做（录完只需一步）

1. 把成品命名为 **`agentcfo-demo.mp4`**
2. **拖进本目录** `assets/video/`（仓库根下，不是 frontend 里）
3. 对 Agent 说：**「按 demo-video-landing-integration-plan 适配」**

Agent 会跑同步脚本、改 Landing 配置、更新 README。**你不需要碰 `frontend/` 文件夹。**

## 文件规范

| 文件 | 说明 |
|---|---|
| `agentcfo-demo.mp4` | 主视频（必交） |
| `agentcfo-demo-poster.jpg` | 封面（可选） |
| `agentcfo-demo-backup.mp4` | 备用录屏（可选，不上 Landing） |

## Landing 怎么播

Next.js 不能直接读 `assets/`。构建时会自动执行：

```text
assets/video/agentcfo-demo.mp4
    → frontend/scripts/sync-demo-video.mjs
    → frontend/public/video/agentcfo-demo.mp4（镜像，自动生成）
    → Landing #guardrails 播放器
```

本地 `pnpm dev` / 部署 `pnpm build` 前都会自动同步。

## 完整 Agent 规划

[`docs/plans/demo-video-landing-integration-plan.md`](../../docs/plans/demo-video-landing-integration-plan.md)

## 状态

✅ 已录制 · `agentcfo-demo.mp4` · 11.2 MB · <2 min
