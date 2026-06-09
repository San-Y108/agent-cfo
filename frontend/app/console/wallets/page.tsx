"use client";

import React from "react";
import { useApp } from "@/lib/i18n/context";

export default function WalletsPage() {
  const { t } = useApp();

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
      <div className="text-center">
        <span
          className="block text-[120px] font-bold leading-none tracking-tighter text-fg/[0.04] dark:text-white/[0.04]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          02
        </span>
        <h2
          className="mt-2 text-2xl font-semibold text-fg"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {t("console.tab.wallets" as any)}
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Multi-wallet management + topology graph — coming in Phase 2
        </p>
        <div
          className="mx-auto mt-4 h-1 w-16 rounded-full"
          style={{ backgroundColor: "#60A5FA" }}
        />
      </div>
    </div>
  );
}
