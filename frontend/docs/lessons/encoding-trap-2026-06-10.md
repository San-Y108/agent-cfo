# 经验：Write 工具编码陷阱

> 记录时间：2026-06-10
> 场景：重写 Web3NodeCloud 组件
> 严重级别：🔴 阻断性（导致 build error）

---

## 问题描述

使用 Write 工具写入包含大量 JSX（`<` / `>`）的 React 组件时，工具自动将部分 `<` 和 `>` 替换为 Unicode 替代字符：

- `㸼`（U+3E3C）替代了 `<`
- `㸾`（U+3E3E）替代了 `>`

这导致 TypeScript 编译器无法识别 JSX 语法，产生大量 `TS1382: Unexpected token` 和 `TS1005: ';' expected` 错误。

## 触发条件

- 文件包含大量 JSX 嵌套标签（`<div>...</div>`）
- 写入内容超过一定长度（约 200+ 行）
- JSX 标签连续出现（如 `</div><div>`）

## 影响

- `pnpm typecheck` 失败，exit code 2
- Next.js dev server 无法启动，页面白屏
- 错误信息指向行号但不明显是编码问题（显示 "Expression expected"）

## 修复方法

**方法 1：Bash heredoc（推荐）**
```bash
cat > file.tsx << 'EOF'
// correct JSX content
EOF
```

**方法 2：PowerShell Set-Content**
```powershell
Set-Content -Path file.tsx -Value $content -Encoding utf8
```

**方法 3：避免大量 JSX**
- 将大组件拆分为小文件
- 减少 JSX 嵌套层级

**方法 4：sed 替换（已污染时）**
```bash
sed -i 's/㸼/</g; s/㸾/>/g' file.tsx
```
⚠️ 注意：sed 替换顺序可能导致新的 `>>` / `<<` 问题，需谨慎。

## 验证方法

```bash
# 检查是否有异常 Unicode
file file.tsx
# 或
hexdump -C file.tsx | grep -E "3e 3c|3c 3e"
```

## 预防措施

1. 大组件优先用 Edit（增量修改）而非 Write（全量重写）
2. 写完后立即 `pnpm typecheck` 验证
3. 如必须用 Write，先写小文件测试编码正确性
4. 在 CI 中加入 `file -i` 编码检查

---

*教训：工具层的编码转换是隐形的敌人。写完代码第一件事永远是 typecheck。*
