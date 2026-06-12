"use client";

import React from "react";
import { TreasuryModule } from "@/components/console/modules";
import { useApp } from "@/lib/i18n/context";
import { HudLabel, StatusPulse } from "@/components/console/command-deck";
import { useConsoleState, FlowStep } from "@/lib/console/console-state";

export default function TreasuryPage() {
  const { lang } = useApp();
  const { step } = useConsoleState();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <HudLabel prefix="MODULE::" value="Treasury" color="cyan" size="md" />
          <h1 className="mt-1 text-xl font-bold tracking-tight text-fg">
            {lang === "zh" ? "国库支出工作区" : "Treasury Workspace"}
          </h1>
          <p className="mt-1 max-w-md text-xs text-fg-subtle">
            {lang === "zh"
              ? "生成付款计划 → 风险检查 → 人工确认 → CAW 受控执行"
              : "Generate plan, run risk checks, approve, then execute within CAW guardrails."}
          </p>
        </div>
        <StatusPulse
          color={step === FlowStep.Executing ? "coral" : step === FlowStep.Done ? "cyan" : "lime"}
          label={["STANDBY", "SCANNING", "REVIEW", "EXECUTING", "AUDIT"][step]}
          size="sm"
        />
      </div>

      <TreasuryModule />
    </div>
  );
}
