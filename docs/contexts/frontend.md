# Frontend context

## 范围

产品层根：`frontend/`

入口顺序：

1. `frontend/CLAUDE.md`
2. `frontend/HANDOFF.md`
3. 当前 `frontend/docs/plans/` checklist
4. 联调时读取 `frontend/backend-integration.md`

## 技术栈

Next.js 16、React 19、TypeScript strict、Tailwind CSS v4、Framer Motion、GSAP、Recharts、pnpm。

## 契约边界

- 组件不得直接发明 endpoint 或字段；
- API 类型镜像后端契约；
- mock 路径不得伪造可被理解为真实链上证据的 tx hash；
- real mode 必须显示后端返回的 mode、network、status 和 txHash；
- Agent Chat 与 Treasury 的 mock/real 行为应分别说明。

## 验证

```bash
cd frontend
pnpm typecheck
pnpm build
```

浏览器验证至少覆盖中英文、亮暗主题、Bob blocked、执行失败和 audit 只读状态。
