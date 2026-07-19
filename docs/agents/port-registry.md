# Port registry

| Service | Port | URL | Notes |
| --- | --- | --- | --- |
| Frontend dev | 3100 | `http://127.0.0.1:3100` | 避免历史 Service Worker 影响 |
| Backend API | 8000 | `http://127.0.0.1:8000` | FastAPI |
| README preview shell | 4173 | `http://127.0.0.1:4173/preview-readme.html` | 根目录静态服务器 |

README 预览：

```bash
python -m http.server 4173
```

端口冲突时先更新本文件，再同步 `preview-readme.html` 中的错误提示和根入口文档。
