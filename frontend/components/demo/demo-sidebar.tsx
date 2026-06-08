"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  UserCheck,
  Wallet,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useT } from "@/lib/i18n/context";
import type { DictKey } from "@/lib/i18n/dict";

interface SidebarLink {
  labelKey: DictKey;
  icon: React.ReactNode;
}

const primaryLinks: SidebarLink[] = [
  { labelKey: "demo.sidebar.plan", icon: <ClipboardList className="h-5 w-5 flex-shrink-0" /> },
  { labelKey: "demo.sidebar.risk", icon: <ShieldCheck className="h-5 w-5 flex-shrink-0" /> },
  { labelKey: "demo.sidebar.approval", icon: <UserCheck className="h-5 w-5 flex-shrink-0" /> },
  { labelKey: "demo.sidebar.execution", icon: <Wallet className="h-5 w-5 flex-shrink-0" /> },
  { labelKey: "demo.sidebar.audit", icon: <FileText className="h-5 w-5 flex-shrink-0" /> },
];

export function DemoSidebar({
  activeIndex,
  onNavigate,
}: {
  activeIndex: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col border-r border-border-token bg-surface py-4">
        <Logo />
        <nav className="mt-6 flex flex-col gap-0.5 px-2">
          {primaryLinks.map((link, idx) => (
            <SidebarLinkItem
              key={idx}
              link={link}
              isActive={activeIndex === idx}
              onClick={() => onNavigate(idx)}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile */}
      <MobileSidebar activeIndex={activeIndex} onNavigate={onNavigate} />
    </>
  );
}

function SidebarLinkItem({
  link,
  isActive,
  onClick,
}: {
  link: SidebarLink;
  isActive: boolean;
  onClick: () => void;
}) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-surface-2 text-fg"
          : "text-fg-muted hover:bg-surface-2 hover:text-fg"
      )}
    >
      {link.icon}
      {t(link.labelKey)}
    </button>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-accent" />
      <span className="text-sm font-medium text-fg">AgentCFO</span>
    </div>
  );
}

function MobileSidebar({
  activeIndex,
  onNavigate,
}: {
  activeIndex: number;
  onNavigate: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-border-token bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-accent" />
          <span className="text-sm font-medium text-fg">AgentCFO</span>
        </div>
        <Menu
          className="h-5 w-5 text-fg-muted cursor-pointer"
          onClick={() => setOpen(true)}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-bg p-4"
          >
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <X
                className="h-5 w-5 text-fg-muted cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>
            <nav className="flex flex-col gap-1">
              {primaryLinks.map((link, idx) => (
                <SidebarLinkItem
                  key={idx}
                  link={link}
                  isActive={activeIndex === idx}
                  onClick={() => {
                    onNavigate(idx);
                    setOpen(false);
                  }}
                />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
