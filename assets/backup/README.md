# Asset backups

这里存放不可重建的外部上游二进制原件。

## 当前批次

| 批次 | 内容 | Canonical 结果 |
| --- | --- | --- |
| [`inbox-sources-20260613/`](inbox-sources-20260613/) | 3 个 Agent 3D 原图和 1 个差异化 Wallets 模块原图 | `assets/images/` 与 `frontend/public/` |
| [`console-audit-sources-20260719/`](console-audit-sources-20260719/) | 2 张差异化审计拦截原始生成图 | 待后续设计任务产出 canonical Console 资产 |

## 接收条件

- 来源、负责人和许可明确；
- 原件需要长期保留；
- 已有 canonical 归档目标；
- 不含密钥、私钥、访问 token 或未脱敏账户信息。

## 批次清单

每个备份附同名 Markdown：

```markdown
- Source:
- Received at:
- Owner:
- License:
- SHA-256:
- Canonical path:
- Reason for retention:
```

可重新导出的 PPT、SVG、构建缓存和运行时镜像不放在这里。
