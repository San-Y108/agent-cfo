"use client";

import React from "react";
import { useApp } from "@/lib/i18n/context";

export default function PolicyPage() {
  const { t } = useApp();

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
      <div className="text-center">
        <span
          className="block text-[120px] font-bold leading-none tracking-tighter text-fg/[0.04] dark:text-white/[0.04]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          04
        </span>
        <h2
          className="mt-2 text-2xl font-semibold text-fg"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {t("console.tab.policy" as any)}
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Rules engine & whitelist manager — coming in Phase 4
        </p>
        <div
          className="mx-auto mt-4 h-1 w-16 rounded-full"
          style={{ backgroundColor: "#FB7185" }}
        />
      </div>
    </div>
  );
}
