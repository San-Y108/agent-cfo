"use client";

import React, { useState } from "react";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { ConsoleTopbar } from "@/components/console/topbar";
import { ConsoleDrawer } from "@/components/console/drawer";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]"
    >
      {/* Sidebar */}
      <ConsoleSidebar />

      {/* Main content area */}
      <div className="ml-[260px] flex flex-1 flex-col"
      >
        <ConsoleTopbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-auto"
        >
          {children}
        </main>
      </div>

      {/* Global right drawer */}
      <ConsoleDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
