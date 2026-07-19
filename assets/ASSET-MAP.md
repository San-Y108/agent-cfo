# Asset directory map

AgentCFO 的资产 canonical 路径已统一为 Project Init 结构。

| 类型 | Canonical 路径 | 旧路径兼容 |
| --- | --- | --- |
| 上游只读备份 | `assets/backup/` | 新目录 |
| README 图 | `assets/images/readme/` | 未变 |
| 团队头像与吉祥物 | `assets/images/avatar/` | `assets/images/readme/team/README.md` |
| Logo 与品牌图标 | `assets/images/icon/` | `assets/design/README.md` |
| 视频 | `assets/video/` | 未变 |
| PPT、PDF 与源工程 | `assets/theme/ppt/` | `assets/ppt/README.md` |
| 路演稿与 Demo 文案 | `assets/theme/script/` | `docs/speak/README.md` |

## 资产进入流程

```text
inbox
→ 核对来源、许可、隐私与用途
→ 规范命名
→ 移入 canonical 路径
→ 更新 assets/README.md 和相关交付清单
→ 验证引用
→ 删除 inbox 原文件
```

## 维护规则

- 新资产只写 canonical 路径；
- 旧目录只保留跳转 README，不放二进制副本；
- 运行时镜像放 `frontend/public/`，源资产仍以 `assets/` 为准；
- 文档引用使用仓库相对路径；
- 不提交 API key、私钥、访问 token、未脱敏钱包后台截图；
- mock、testnet、real 证据必须分开命名和描述。
