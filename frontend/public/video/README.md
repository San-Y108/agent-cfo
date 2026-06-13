# frontend/public/video/ — 构建镜像（勿手拖）

此目录由 **`scripts/sync-demo-video.mjs`** 从团队资产自动同步，**不是**视频投放点。

## 团队投放点（唯一）

```text
assets/video/agentcfo-demo.mp4    ← 全队拖这里
```

## 本目录作用

| 文件 | 来源 |
|---|---|
| `agentcfo-demo.mp4` | 自动从 `assets/video/` 复制 |
| `agentcfo-demo-poster.jpg` | 自动从 `assets/video/` 复制（如有） |

同步时机：`pnpm dev` / `pnpm build` 前（`predev` / `prebuild`），或手动：

```bash
pnpm sync:demo-video
```

## 请勿

- 手动把视频拖进 `frontend/public/video/` 当作主存放点
- 只改本目录而不更新 `assets/video/`（团队资产会丢失）

规划文档：[`docs/plans/demo-video-landing-integration-plan.md`](../../../docs/plans/demo-video-landing-integration-plan.md)
