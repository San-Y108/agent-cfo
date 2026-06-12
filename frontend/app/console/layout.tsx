"use client";

import React, { useState } from "react";
import {
  SquaresFour,
  Wallet,
  ChartBar,
  Shield,
  Robot,
} from "@phosphor-icons/react";
import { ConsoleTopbar } from "@/components/console/topbar";
import { ConsoleDrawer } from "@/components/console/drawer";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { EdgeCapsuleGroup, type CapsuleItem } from "@/components/console/edge-capsule";
import { ModulePanel } from "@/components/console/module-panel";
import { TreasuryModule, WalletsModule, AnalyticsModule, PolicyModule } from "@/components/console/modules";
import { NoiseOverlay, GridBackground } from "@/components/ui/aceternity/background";

const LEFT_CAPSULES: CapsuleItem[] = [
  {
    id: "treasury",
    href: "/console",
    labelKey: "console.tab.treasury" as const,
    icon: SquaresFour,
    color: "#B5FF4D",
  },
  {
    id: "policy",
    href: "/console/policy",
    labelKey: "console.tab.policy" as const,
    icon: Shield,
    color: "#FB7185",
  },
];

const RIGHT_CAPSULES: CapsuleItem[] = [
  {
    id: "wallets",
    href: "/console/wallets",
    labelKey: "console.tab.wallets" as const,
    icon: Wallet,
    color: "#60A5FA",
  },
  {
    id: "analytics",
    href: "/console/analytics",
    labelKey: "console.tab.analytics" as const,
    icon: ChartBar,
    color: "#C084FC",
  },
];

const MODULE_META: Record<
  string,
  {
    title: string;
    subtitle: string;
    color: string;
    glowColor: "lime" | "cyan" | "coral" | "amber" | "blue" | "violet";
    component: React.ComponentType;
  }
> = {
  treasury: {
    title: "Payment Execution",
    subtitle: "Treasury workflow & risk checks",
    color: "#B5FF4D",
    glowColor: "lime",
    component: TreasuryModule,
  },
  policy: {
    title: "Neural Guardrails",
    subtitle: "Security rules & whitelist",
    color: "#FB7185",
    glowColor: "coral",
    component: PolicyModule,
  },
  wallets: {
    title: "Holographic Vaults",
    subtitle: "Wallet topology & transfers",
    color: "#60A5FA",
    glowColor: "blue",
    component: WalletsModule,
  },
  analytics: {
    title: "Living Analytics",
    subtitle: "Volume, gas & performance",
    color: "#C084FC",
    glowColor: "violet",
    component: AnalyticsModule,
  },
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leftPanel, setLeftPanel] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<string | null>(null);

  const toggleLeft = (id: string) => {
    setLeftPanel((current) => (current === id ? null : id));
  };

  const toggleRight = (id: string) => {
    setRightPanel((current) => (current === id ? null : id));
  };

  const LeftComponent = leftPanel ? MODULE_META[leftPanel].component : null;
  const RightComponent = rightPanel ? MODULE_META[rightPanel].component : null;

  return (
    <div className="relative min-h-[100dvh] bg-surface dark:bg-[#0D0D0D] dark">
      {/* ─── Global background layer (dark mode only) ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:block hidden">
        <GridBackground />
        <NoiseOverlay className="opacity-[0.03]" />
      </div>

      {/* ─── Mobile top nav ─── */}
      <ConsoleSidebar />

      {/* ─── Desktop edge capsules ─── */}
      <EdgeCapsuleGroup
        side="left"
        items={LEFT_CAPSULES}
        activeId={leftPanel}
        onActivate={toggleLeft}
      />
      <EdgeCapsuleGroup
        side="right"
        items={RIGHT_CAPSULES}
        activeId={rightPanel}
        onActivate={toggleRight}
      />

      {/* ─── Left module panel ─── */}
      {leftPanel && (
        <ModulePanel
          side="left"
          isOpen={!!leftPanel}
          onClose={() => setLeftPanel(null)}
          title={MODULE_META[leftPanel].title}
          subtitle={MODULE_META[leftPanel].subtitle}
          color={MODULE_META[leftPanel].color}
          glowColor={MODULE_META[leftPanel].glowColor}
        >
          {LeftComponent && <LeftComponent />}
        </ModulePanel>
      )}

      {/* ─── Right module panel ─── */}
      {rightPanel && (
        <ModulePanel
          side="right"
          isOpen={!!rightPanel}
          onClose={() => setRightPanel(null)}
          title={MODULE_META[rightPanel].title}
          subtitle={MODULE_META[rightPanel].subtitle}
          color={MODULE_META[rightPanel].color}
          glowColor={MODULE_META[rightPanel].glowColor}
        >
          {RightComponent && <RightComponent />}
        </ModulePanel>
      )}

      {/* ─── Main content area ─── */}
      <div
        className="flex flex-1 flex-col relative z-10 transition-all duration-500"
        style={{
          marginLeft: leftPanel ? 420 : 0,
          marginRight: rightPanel ? 420 : 0,
        }}
      >
        <ConsoleTopbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Global right drawer */}
      <ConsoleDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
