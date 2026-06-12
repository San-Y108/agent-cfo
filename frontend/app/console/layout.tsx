"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { ConsoleTopbar } from "@/components/console/topbar";
import { ConsoleDrawer } from "@/components/console/drawer";
import { NoiseOverlay, GridBackground } from "@/components/ui/aceternity/background";

const AUTO_COLLAPSE_DELAY_MS = 3200;

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  const [hasUserToggled, setHasUserToggled] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Default expanded on entry; auto-collapse once after a short delay
  // unless the user has already manually toggled the sidebar.
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!hasUserToggled && !autoCollapsed) {
        setSidebarOpen(false);
        setAutoCollapsed(true);
      }
    }, AUTO_COLLAPSE_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasUserToggled, autoCollapsed]);

  const handleToggleSidebar = () => {
    setHasUserToggled(true);
    setSidebarOpen((v) => !v);
  };

  const effectiveOpen = hoverExpanded || sidebarOpen;

  return (
    <div className="relative min-h-[100dvh] bg-surface dark:bg-[#0D0D0D] dark"
    >
      {/* ─── Global background layer (dark mode only) ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:block hidden"
      >
        <GridBackground />
        <NoiseOverlay className="opacity-[0.03]" />
      </div>

      {/* ─── Sidebar ─── */}
      <ConsoleSidebar
        open={effectiveOpen}
        onToggle={handleToggleSidebar}
        onHoverExpand={() => setHoverExpanded(true)}
        onHoverCollapse={() => setHoverExpanded(false)}
      />

      {/* ─── Main content area ─── */}
      <motion.div
        className="flex flex-1 flex-col relative z-10"
        animate={{ marginLeft: effectiveOpen ? 260 : 72 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <ConsoleTopbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-auto"
        >
          {children}
        </main>
      </motion.div>

      {/* Global right drawer */}
      <ConsoleDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
