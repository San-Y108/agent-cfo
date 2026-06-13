"use client";

import React from "react";
import { ConsoleNavbar } from "@/components/console/navbar";
import { ConsoleMain } from "@/components/console/console-main";
import { ConsoleDrawer } from "@/components/console/drawer";
import { ConsoleStateProvider } from "@/lib/console/console-state";
import { NoiseOverlay, GridBackground } from "@/components/ui/aceternity/background";

/**
 * Console layout — top pill navigation (mirrors the landing nav) over a
 * full-width workspace. Each module owns a dedicated route.
 */
export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleStateProvider>
      <div className="console-workspace relative h-[100dvh] min-h-[100dvh] overflow-hidden bg-bg text-fg">
        {/* ─── Global background layer ─── */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <GridBackground />
          <NoiseOverlay className="opacity-[0.015] dark:opacity-[0.03]" />
        </div>

        <ConsoleNavbar />

        <ConsoleMain>{children}</ConsoleMain>

        <ConsoleDrawer />
      </div>
    </ConsoleStateProvider>
  );
}
