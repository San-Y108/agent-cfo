# 图片与截图资产

## README 展示用图（优先）

根目录 [`README.md`](../../README.md) 引用的图片统一放在 **`readme/`** 子目录：

```
assets/images/readme/
├── banner.png              # Hero Banner（3:1）
├── landing-hero.png        # Landing Showcase
├── landing-pipeline.png
├── landing-platform.png
├── landing-guardrails.png
├── landing-timelines.png
├── landing-built-by-teams.png
├── landing-faq.png
├── landing-footer.png
└── console-*.png          # Console 五模块 Showcase
```

归类来源：队友投递 [`inbox/`](../../inbox/) → 复制/重命名到本目录 → 更新 README → 删除 `inbox/` 原文件。

## 团队头像与品牌图标

- 团队角色头像与 3D 吉祥物：[`avatar/`](avatar/)
- Logo 与品牌图标源文件：[`icon/`](icon/)

## Console 设计资产

模块吉祥物与多模块聚合参考页见 **[`console/README.md`](console/README.md)**：

```text
assets/images/console/
├── module-mascots/     # 五模块页 3D 吉祥物（Agent / Treasury / Wallets / Analytics / Policy）
└── references/         # 四张多模块混排参考页（非单页截图）
```

运行时镜像：`frontend/public/console/mascots/modules/*.png`

## 其他截图（可选）

- Demo 流程分步图（低优先级）
- API / 终端操作记录
- CAW 测试网证据截图（脱敏后）

## 命名建议（流程分步，若需要）

```
01-contribution-input.png
02-payment-plan.png
03-risk-check.png
04-human-approval.png
05-execution-result.png
06-audit-report.png
```

## 相关

- 合并规划：[`docs/plans/README-merge-plan.md`](../../docs/plans/README-merge-plan.md)
- 投递规则：[`inbox/README.md`](../../inbox/README.md)
