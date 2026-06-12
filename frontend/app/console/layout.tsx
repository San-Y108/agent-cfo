"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
import { ConsoleStateProvider } from "@/lib/console/console-state";
import { NoiseOverlay, GridBackground } from "@/components/ui/aceternity/background";

const PANEL_WIDTH = 420;

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

  const desktopGridCols = `${leftPanel ? PANEL_WIDTH : 0}px minmax(320px, 1fr) ${rightPanel ? PANEL_WIDTH : 0}px`;

  return (
    <ConsoleStateProvider>
      <div className="relative min-h-[100dvh] bg-surface dark:bg-[#0D0D0D]">
      {/* ─── Global background layer (dark mode only) ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:block hidden">
        <GridBackground />
        <NoiseOverlay className="opacity-[0.03]" />
      </div>

      {/* ─── Mobile top nav ─── */}
      <ConsoleSidebar />

      {/* ─── Desktop layout grid ─── */}
      <div
        className="hidden md:grid min-h-[100dvh] transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateColumns: desktopGridCols }}
      >
        {/* Left panel area */}
        <div className="relative min-w-0 h-full">
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
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col min-w-0 min-h-[100dvh]">
          <ConsoleTopbar onOpenDrawer={() => setDrawerOpen(true)} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>

        {/* Right panel area */}
        <div className="relative min-w-0 h-full">
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
        </div>
      </div>

      {/* ─── Mobile layout stack ─── */}
      <div className="flex md:hidden min-h-[100dvh] flex-col pt-14">
        <ConsoleTopbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

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

      {/* ─── Mobile panel sheets ─── */}
      <AnimatePresence>
        {leftPanel && (
          <MobileModuleSheet
            key="left-sheet"
            title={MODULE_META[leftPanel].title}
            onClose={() => setLeftPanel(null)}
          >
            {LeftComponent && <LeftComponent />}
          </MobileModuleSheet>
        )}
        {rightPanel && (
          <MobileModuleSheet
            key="right-sheet"
            title={MODULE_META[rightPanel].title}
            onClose={() => setRightPanel(null)}
          >
            {RightComponent && <RightComponent />}
          </MobileModuleSheet>
        )}
      </AnimatePresence>

      {/* Global right drawer */}
      <ConsoleDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
    </ConsoleStateProvider>
  );
}

function MobileModuleSheet({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-2xl border-t border-white/[0.06] bg-surface dark:bg-[#0D0D0D] md:hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-fg">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-white/[0.06] transition-colors"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {children}
        </div>
      </motion.div>
    </>
  );
}
