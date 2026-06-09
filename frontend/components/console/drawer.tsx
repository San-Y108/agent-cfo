"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FlaskConical,
  SlidersHorizontal,
  Wifi,
  AlertTriangle,
  Trash2,
  Save,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";

type DrawerTab = "sandbox" | "rules";

export function ConsoleDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("sandbox");
  const { t } = useApp();

  // Sandbox state
  const [latency, setLatency] = useState(0);
  const [simulateError, setSimulateError] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[sandbox] init — latency 0ms",
    "[sandbox] ready",
  ]);

  // Live Rules state
  const [monthlyBudget, setMonthlyBudget] = useState(50);
  const [singleLimit, setSingleLimit] = useState(25);
  const [whitelistInput, setWhitelistInput] = useState("");
  const [whitelist, setWhitelist] = useState<string[]>([
    "0xAlice1234567890abcdef1234567890abcdef12",
    "0xCharlie1234567890abcdef1234567890abcdef",
    "0xDataAPI1234567890abcdef1234567890abcde",
  ]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleLatencyChange = (v: number) => {
    setLatency(v);
    addLog(`latency set to ${v}ms`);
  };

  const handleSimErrorToggle = (v: boolean) => {
    setSimulateError(v);
    addLog(v ? "simulate error ENABLED" : "simulate error disabled");
  };

  const handleAddWhitelist = () => {
    if (whitelistInput.trim() && !whitelist.includes(whitelistInput.trim())) {
      setWhitelist([...whitelist, whitelistInput.trim()]);
      addLog(`whitelist added: ${whitelistInput.trim().slice(0, 16)}...`);
      setWhitelistInput("");
    }
  };

  const handleRemoveWhitelist = (addr: string) => {
    setWhitelist(whitelist.filter((w) => w !== addr));
    addLog(`whitelist removed: ${addr.slice(0, 16)}...`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 h-screen w-[380px] border-l border-border-token dark:border-white/[0.06] bg-surface dark:bg-[#0D0D0D] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-token dark:border-white/[0.06] px-5 py-4">
              <div className="flex gap-1 rounded-lg border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] p-0.5">
                <button
                  onClick={() => setActiveTab("sandbox")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "sandbox"
                      ? "bg-surface-hover dark:bg-white/10 text-[#5EEAD4]"
                      : "text-fg-subtle dark:text-white/40 hover:text-fg-muted dark:hover:text-white/70"
                  }`}
                >
                  <FlaskConical size={13} />
                  Sandbox
                </button>
                <button
                  onClick={() => setActiveTab("rules")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "rules"
                      ? "bg-surface-hover dark:bg-white/10 text-[#FB7185]"
                      : "text-fg-subtle dark:text-white/40 hover:text-fg-muted dark:hover:text-white/70"
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  Live Rules
                </button>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle dark:text-white/40 transition-colors hover:bg-surface-hover dark:hover:bg-white/5 hover:text-fg dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(100vh-65px)] overflow-y-auto px-5 py-5">
              {activeTab === "sandbox" ? (
                <div className="space-y-6">
                  {/* Latency slider */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-fg-muted">
                      <Wifi size={13} className="text-[#5EEAD4]" />
                      Network Latency
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={5000}
                      step={100}
                      value={latency}
                      onChange={(e) => handleLatencyChange(Number(e.target.value))}
                      className="mt-2 w-full accent-[#5EEAD4]"
                    />
                    <div className="mt-1 text-right text-[10px] font-mono text-fg-subtle">
                      {latency}ms
                    </div>
                  </div>

                  {/* Error toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-[#FB7185]" />
                      <span className="text-xs text-fg-muted">Simulate Error</span>
                    </div>
                    <button
                      onClick={() => handleSimErrorToggle(!simulateError)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        simulateError ? "bg-[#FB7185]" : "bg-surface-hover dark:bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          simulateError ? "left-4.5" : "left-0.5"
                        }`}
                        style={{
                          transform: simulateError ? "translateX(14px)" : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Terminal logs */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-fg-muted">Live Logs</span>
                      <button
                        onClick={() => setLogs(["[sandbox] cleared"])}
                        className="flex items-center gap-1 text-[10px] text-fg-subtle transition-colors hover:text-fg-muted"
                      >
                        <Trash2 size={10} />
                        Clear
                      </button>
                    </div>
                    <div className="rounded-lg border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-black/40 p-3">
                      <div className="h-48 overflow-y-auto font-mono text-[10px] leading-relaxed text-fg-subtle">
                        {logs.map((log, i) => (
                          <div key={i} className="py-0.5">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Monthly Budget */}
                  <div>
                    <label className="text-xs font-medium text-white/70">Monthly Budget (USDC)</label>
                    <input
                      type="range"
                      min={10}
                      max={200}
                      step={5}
                      value={monthlyBudget}
                      onChange={(e) => {
                        setMonthlyBudget(Number(e.target.value));
                        addLog(`budget updated: ${e.target.value} USDC`);
                      }}
                      className="mt-2 w-full accent-[#B5FF4D]"
                    />
                    <div className="mt-1 text-right text-lg font-semibold text-[#B5FF4D]">
                      {monthlyBudget}
                    </div>
                  </div>

                  {/* Single Payment Limit */}
                  <div>
                    <label className="text-xs font-medium text-white/70">Single Payment Limit (USDC)</label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={singleLimit}
                      onChange={(e) => {
                        setSingleLimit(Number(e.target.value));
                        addLog(`single limit updated: ${e.target.value} USDC`);
                      }}
                      className="mt-2 w-full accent-[#60A5FA]"
                    />
                    <div className="mt-1 text-right text-lg font-semibold text-[#60A5FA]">
                      {singleLimit}
                    </div>
                  </div>

                  {/* Whitelist CRUD */}
                  <div>
                    <label className="text-xs font-medium text-white/70">Whitelist</label>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={whitelistInput}
                        onChange={(e) => setWhitelistInput(e.target.value)}
                        placeholder="0x..."
                        className="flex-1 rounded-lg border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] px-3 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong dark:focus:border-white/20 focus:outline-none"
                        style={{ fontFamily: "'Courier New', Courier, monospace" }}
                        onKeyDown={(e) => e.key === "Enter" && handleAddWhitelist()}
                      />
                      <button
                        onClick={handleAddWhitelist}
                        className="rounded-lg bg-[#B5FF4D]/10 px-3 py-2 text-xs font-medium text-[#B5FF4D] transition-colors hover:bg-[#B5FF4D]/20"
                      >
                        Add
                      </button>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {whitelist.map((addr) => (
                        <li
                          key={addr}
                          className="flex items-center justify-between rounded-md border border-border-token dark:border-white/[0.04] bg-surface-2 dark:bg-white/[0.02] px-2.5 py-1.5"
                        >
                          <span
                            className="truncate text-[10px] text-fg-subtle"
                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                          >
                            {addr.slice(0, 14)}...{addr.slice(-8)}
                          </span>
                          <button
                            onClick={() => handleRemoveWhitelist(addr)}
                            className="ml-2 text-fg-subtle transition-colors hover:text-[#FB7185]"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => addLog("rules saved to global state")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-hover dark:bg-white/[0.06] py-2.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-2 dark:hover:bg-white/10 hover:text-fg dark:hover:text-white"
                  >
                    <Save size={13} />
                    Save Rules
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
