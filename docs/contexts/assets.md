# Assets and delivery context

## 路径

- 待归类：`inbox/`
- 已归类资产：`assets/`
- 路演文字稿：`docs/speak/`
- README 图片：`assets/images/readme/`
- 前端运行时静态资源：`frontend/public/`

## 兼容策略

现有资产不做物理搬迁。Project Init 标准目录通过 `assets/ASSET-MAP.md` 映射：

- `assets/ppt/` 对应 `assets/theme/ppt/`
- `docs/speak/` 对应 `assets/theme/script/`
- `assets/images/readme/team/` 对应 `assets/images/avatar/`
- `assets/design/` 对应 `assets/images/icon/` 与品牌设计资产
- `docs/backup/` 保存文档快照；`assets/backup/` 只用于上游二进制资产备份

## 归档流程

```text
inbox
→ 核对来源、许可、用途
→ 重命名
→ 归档至 assets 或 docs
→ 更新入口索引
→ 删除 inbox 原文件
```

不得把密钥、钱包私钥、API token 或未脱敏的账户截图放入资产目录。
