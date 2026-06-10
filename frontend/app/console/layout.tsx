"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { ConsoleTopbar } from "@/components/console/topbar";
import { ConsoleDrawer } from "@/components/console/drawer";
import { NoiseOverlay, GridBackground } from "@/components/ui/aceternity/background";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-screen bg-[#0D0D0D]"
    >
      {/* ─── Global background layer ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none"
      >
        <GridBackground />
        <NoiseOverlay className="opacity-[0.03]" />
      </div>

      {/* ─── Sidebar ─── */}
      <ConsoleSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* ─── Main content area ─── */}
      <motion.div
        className="flex flex-1 flex-col relative z-10"
        animate={{ marginLeft: sidebarOpen ? 260 : 72 }}
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
