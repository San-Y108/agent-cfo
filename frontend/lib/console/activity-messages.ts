import type { Lang } from "@/lib/i18n/dict";

/** Bilingual activity-log copy — used by console-state and display fallbacks. */
export function activitySessionStarted(lang: Lang): string {
  return lang === "zh"
    ? "Console 会话已启动 · 风控护栏已加载"
    : "Console session started · guardrails loaded";
}

export function activityRecordsAdded(count: number, lang: Lang): string {
  return lang === "zh"
    ? `新增 ${count} 条贡献记录`
    : `${count} contribution record(s) added`;
}

export function activityWhitelistUpdated(count: number, lang: Lang): string {
  return lang === "zh"
    ? `白名单已更新 · ${count} 个地址`
    : `Whitelist updated · ${count} address(es)`;
}

export function activitySingleLimitSet(limit: number, lang: Lang): string {
  return lang === "zh"
    ? `单笔限额设为 ${limit} USDC`
    : `Single payment limit set to ${limit} USDC`;
}

export function activityMonthlyBudgetSet(budget: number, lang: Lang): string {
  return lang === "zh"
    ? `月预算设为 ${budget} USDC`
    : `Monthly budget set to ${budget} USDC`;
}

export function activityFlowReset(lang: Lang): string {
  return lang === "zh"
    ? "流程已重置 · 记录与规则已恢复"
    : "Flow reset · records and rules restored";
}

export function activityPlanGenerated(ready: number, blocked: number, lang: Lang): string {
  return lang === "zh"
    ? `付款计划已生成 · ${ready} 笔就绪，${blocked} 笔拦截`
    : `Payment plan generated · ${ready} ready, ${blocked} blocked`;
}

export function activityPlanApi(
  planId: string,
  ready: number,
  blocked: number,
  lang: Lang
): string {
  return lang === "zh"
    ? `真实 API · 计划 ${planId.slice(0, 8)}… · ${ready} 笔就绪，${blocked} 笔拦截`
    : `Real API · plan ${planId.slice(0, 8)}… · ${ready} ready, ${blocked} blocked`;
}

export function activityPlanFailed(message: string, lang: Lang): string {
  return lang === "zh" ? `计划失败 · ${message}` : `Plan failed · ${message}`;
}

export function activityExecuteComplete(total: number, sum: number, lang: Lang): string {
  return lang === "zh"
    ? `CAW 执行完成 · ${total} 笔付款，${sum} USDC 已结算`
    : `CAW execution complete · ${total} payment(s), ${sum} USDC settled`;
}

export function activityExecuteReal(
  executionId: string,
  total: number,
  sum: number,
  lang: Lang
): string {
  return lang === "zh"
    ? `真实 CAW · ${executionId.slice(0, 8)}… · ${total} 笔付款，${sum} USDC`
    : `Real CAW · ${executionId.slice(0, 8)}… · ${total} payment(s), ${sum} USDC`;
}

export function activityExecuteFailed(message: string, lang: Lang): string {
  return lang === "zh" ? `执行失败 · ${message}` : `Execute failed · ${message}`;
}

export function activityCawRefreshed(lang: Lang): string {
  return lang === "zh"
    ? "CAW 状态已从提供方刷新"
    : "CAW status refreshed from provider";
}

export function activityCawRefreshFailed(message: string, lang: Lang): string {
  return lang === "zh"
    ? `CAW 刷新失败 · ${message}`
    : `CAW refresh failed · ${message}`;
}

/** Re-localize legacy English log lines when user switches to Chinese mid-session. */
export function localizeActivityMessage(message: string, lang: Lang): string {
  if (lang === "en") return message;

  const exact: Record<string, string> = {
    "Console session started · guardrails loaded": activitySessionStarted("zh"),
    "Flow reset · records and rules restored": activityFlowReset("zh"),
    "CAW status refreshed from provider": activityCawRefreshed("zh"),
  };
  if (exact[message]) return exact[message];

  const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
    [
      /^(\d+) contribution record\(s\) added$/,
      (m) => activityRecordsAdded(Number(m[1]), "zh"),
    ],
    [
      /^Whitelist updated · (\d+) address\(es\)$/,
      (m) => activityWhitelistUpdated(Number(m[1]), "zh"),
    ],
    [
      /^Single payment limit set to ([\d.]+) USDC$/,
      (m) => activitySingleLimitSet(Number(m[1]), "zh"),
    ],
    [
      /^Monthly budget set to ([\d.]+) USDC$/,
      (m) => activityMonthlyBudgetSet(Number(m[1]), "zh"),
    ],
    [
      /^Payment plan generated · (\d+) ready, (\d+) blocked$/,
      (m) => activityPlanGenerated(Number(m[1]), Number(m[2]), "zh"),
    ],
    [
      /^Real API · plan ([\w]+)… · (\d+) ready, (\d+) blocked$/,
      (m) => activityPlanApi(m[1], Number(m[2]), Number(m[3]), "zh"),
    ],
    [/^Plan failed · (.+)$/, (m) => activityPlanFailed(m[1], "zh")],
    [
      /^CAW execution complete · (\d+) payment\(s\), ([\d.]+) USDC settled$/,
      (m) => activityExecuteComplete(Number(m[1]), Number(m[2]), "zh"),
    ],
    [
      /^Real CAW · ([\w]+)… · (\d+) payment\(s\), ([\d.]+) USDC$/,
      (m) => activityExecuteReal(m[1], Number(m[2]), Number(m[3]), "zh"),
    ],
    [/^Execute failed · (.+)$/, (m) => activityExecuteFailed(m[1], "zh")],
    [/^CAW refresh failed · (.+)$/, (m) => activityCawRefreshFailed(m[1], "zh")],
  ];

  for (const [re, fn] of patterns) {
    const match = message.match(re);
    if (match) return fn(match);
  }

  return message;
}
