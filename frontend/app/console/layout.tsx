"use client";

import React from "react";
import { ConsoleNavbar } from "@/components/console/navbar";
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
      <div className="dark relative min-h-[100dvh] bg-[#0D0D0D]">
        {/* ─── Global background layer ─── */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <GridBackground />
          <NoiseOverlay className="opacity-[0.03]" />
        </div>

        <ConsoleNavbar />

        {/* pt accounts for h-16 navbar + mobile pill strip */}
        <main className="relative z-10 min-h-[100dvh] pt-[7.5rem] md:pt-16">
          {children}
        </main>

        <ConsoleDrawer />
      </div>
    </ConsoleStateProvider>
  );
}
