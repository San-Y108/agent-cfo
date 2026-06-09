"use client";

import React from "react";
import { useApp } from "@/lib/i18n/context";

export default function AnalyticsPage() {
  const { t } = useApp();

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
      <div className="text-center">
        <span
          className="block text-[120px] font-bold leading-none tracking-tighter text-white/[0.04]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          03
        </span>
        <h2
          className="mt-2 text-2xl font-semibold text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {t("console.tab.analytics" as any)}
        </h2>
        <p className="mt-2 text-sm text-white/40">
          Gas optimization & efficiency charts — coming in Phase 3
        </p>
        <div
          className="mx-auto mt-4 h-1 w-16 rounded-full"
          style={{ backgroundColor: "#C084FC" }}
        />
      </div>
    </div>
  );
}
