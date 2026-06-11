"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Shield,
  Plus,
  Key,
  ArrowUpRight,
  Copy,
  CheckCircle,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  X,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { WalletHoloCard, WalletTopology } from "@/components/console/wallet-hologram";
import { HolographicButton } from "@/components/ui/holographic-button";
import { GradientOrb } from "@/components/ui/aceternity/background";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";

const BLUE = "#60A5FA";

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  valueUsd: number;
}

interface WalletItem {
  id: string;
  name: string;
  address: string;
  type: "Multi-sig" | "Agent Vault" | "Cold Storage";
  threshold: string;
  tokens: TokenBalance[];
  activeAgentsCount: number;
}

const INITIAL_WALLETS: WalletItem[] = [
  {
    id: "w-1",
    name: "AgentCFO Master Treasury",
    address: "0xAgentCFO_CAW_f39A1Ceed5243167D024B38A2",
    type: "Agent Vault",
    threshold: "1 / 2 Agents + Multi-sig",
    activeAgentsCount: 2,
    tokens: [
      { symbol: "USDC", name: "USD Coin", balance: 12450.0, valueUsd: 12450.0 },
      { symbol: "USDT", name: "Tether USD", balance: 5000.0, valueUsd: 5000.0 },
      { symbol: "ETH", name: "Ethereum", balance: 4.85, valueUsd: 16490.0 },
    ],
  },
  {
    id: "w-2",
    name: "Gnosis Safe Operations",
    address: "0xSafeOps7127bF3490bFcecd9018e102FFD123",
    type: "Multi-sig",
    threshold: "2 / 3 Owners",
    activeAgentsCount: 1,
    tokens: [
      { symbol: "USDC", name: "USD Coin", balance: 25000.0, valueUsd: 25000.0 },
      { symbol: "ETH", name: "Ethereum", balance: 12.0, valueUsd: 40800.0 },
    ],
  },
  {
    id: "w-3",
    name: "Cobo Backup Cold Storage",
    address: "0xColdBackup879FCD90881bCDeEa901C98B6a1",
    type: "Cold Storage",
    threshold: "3 / 4 Heavy Multi-sig",
    activeAgentsCount: 0,
    tokens: [
      { symbol: "USDC", name: "USD Coin", balance: 150000.0, valueUsd: 150000.0 },
    ],
  },
];

export default function WalletsPage() {
  const { t, lang } = useApp();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [wallets, setWallets] = useState<WalletItem[]>(INITIAL_WALLETS);
  const [activeWalletId, setActiveWalletId] = useState<string>("w-1");
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [showBlockedAlert, setShowBlockedAlert] = useState(false);

  // New wallet form
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletType, setNewWalletType] = useState<"Multi-sig" | "Agent Vault">("Agent Vault");
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [newWalletThreshold, setNewWalletThreshold] = useState("1 / 2 Agents");

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || wallets[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName || !newWalletAddress) return;
    const newW: WalletItem = {
      id: `w-${Date.now()}`,
      name: newWalletName,
      address: newWalletAddress,
      type: newWalletType,
      threshold: newWalletThreshold,
      activeAgentsCount: newWalletType === "Agent Vault" ? 1 : 0,
      tokens: [{ symbol: "USDC", name: "USD Coin", balance: 0, valueUsd: 0 }],
    };
    setWallets([...wallets, newW]);
    setActiveWalletId(newW.id);
    setIsAddingWallet(false);
    setNewWalletName("");
    setNewWalletAddress("");
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || !transferRecipient) return;

    // Check if transfer exceeds single limit (mock rule: 25 USDC)
    const amount = Number(transferAmount);
    if (amount > 25) {
      setShowBlockedAlert(true);
      return;
    }

    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setTransferSuccess(true);
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === activeWalletId) {
            return {
              ...w,
              tokens: w.tokens.map((tok) => {
                if (tok.symbol === selectedToken) {
                  const updatedBal = Math.max(0, tok.balance - amount);
                  return { ...tok, balance: updatedBal, valueUsd: tok.symbol === "ETH" ? updatedBal * 3400 : updatedBal };
                }
                return tok;
              }),
            };
          }
          return w;
        })
      );
      setTimeout(() => {
        setTransferSuccess(false);
        setTransferAmount("");
        setTransferRecipient("");
      }, 3000);
    }, 2000);
  };

  const totalWalletValue = activeWallet.tokens.reduce((acc, tok) => acc + tok.valueUsd, 0);

  return (
    <div className="p-6 space-y-6 relative">
      {/* ─── Ambient orb: Wallets = blue ─── */}
      <GradientOrb color="blue" className="-top-32 -right-32" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.03]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-fg">
            {t("console.wallets.title" as any)}
          </h2>
          <p className="text-xs mt-1 text-fg-subtle">{t("console.wallets.desc" as any)}</p>
        </div>
        <HolographicButton
          onClick={() => setIsAddingWallet(true)}
          variant="blue"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          {t("console.wallets.addBtn" as any)}
        </HolographicButton>
      </div>

      {/* Blocked Alert (Guardrails-style) */}
      <AnimatePresence>
        {showBlockedAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-400">
                {lang === "zh" ? "转账被拦截" : "Transfer Blocked"}
              </div>
              <div className="text-xs text-red-300/70 mt-0.5">
                {lang === "zh"
                  ? `单笔限额 25 USDC，您尝试转账 ${transferAmount} USDC 已超出安全边界。`
                  : `Single payment limit is 25 USDC. Your attempt to transfer ${transferAmount} USDC exceeds the safety boundary.`}
              </div>
            </div>
            <button
              onClick={() => { setShowBlockedAlert(false); setTransferAmount(""); }}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Wallet List */}
        <div className="space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-fg-subtle px-1">
            {t("console.wallets.registeredVaults" as any).replace("{count}", wallets.length.toString())}
          </div>

          <div className="space-y-3">
            {wallets.map((w) => {
              const isActive = w.id === activeWalletId;
              const totalVal = w.tokens.reduce((acc, tok) => acc + tok.valueUsd, 0);
              return (
                <div
                  key={w.id}
                  onClick={() => { setActiveWalletId(w.id); setTransferSuccess(false); setShowBlockedAlert(false); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-surface-hover dark:bg-white/[0.05] border-[#60A5FA] shadow-sm"
                      : "bg-surface dark:bg-white/[0.02] border-border-token dark:border-white/[0.04] hover:border-[#60A5FA]/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-[14px] text-fg">{w.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none border ${
                        w.type === "Agent Vault"
                          ? "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20"
                          : w.type === "Multi-sig"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}
                    >
                      {w.type}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] truncate mb-3 text-fg-subtle" title={w.address}>
                    {w.address.substring(0, 10)}...{w.address.substring(w.address.length - 8)}
                  </div>
                  <div className="flex justify-between items-end border-t border-border-token dark:border-white/[0.04] pt-2.5">
                    <div className="text-[11px] text-fg-subtle">
                      {t("console.wallets.authThreshold" as any)}{" "}
                      <span className="font-bold text-fg">{w.threshold}</span>
                    </div>
                    <div className="font-mono font-bold text-sm text-fg">
                      ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Treasury topology — CAW core + vault nodes */}
          <WalletTopology
            wallets={wallets.map((w) => ({
              id: w.id,
              name: w.name,
              type: w.type,
              valueUsd: w.tokens.reduce((acc, tok) => acc + tok.valueUsd, 0),
            }))}
            activeId={activeWalletId}
            onSelect={(id) => { setActiveWalletId(id); setTransferSuccess(false); setShowBlockedAlert(false); }}
          />

          {/* Guide Card */}
          <div className="p-4 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.03]">
            <div className="flex items-center gap-2 font-bold text-xs text-fg">
              <ShieldCheck className="w-4 h-4 text-[#60A5FA]" />
              {t("console.wallets.walletGuideTitle" as any)}
            </div>
            <p className="text-xs leading-relaxed mt-2.5 text-fg-subtle">
              {t("console.wallets.walletGuideDesc" as any)}
            </p>
          </div>
        </div>

        {/* Right: Active Wallet Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail Card — 3D tilt + cursor glare */}
          <WalletHoloCard>
          <div className="border border-border-token dark:border-white/[0.06] rounded-xl shadow-sm p-6 space-y-6 bg-surface dark:bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-token dark:border-white/[0.04] pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold tracking-tight text-fg">{activeWallet.name}</h3>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-surface-2 dark:bg-white/[0.05] text-fg-subtle">
                    {activeWallet.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 font-mono text-xs text-fg-subtle">
                  <span>{activeWallet.address}</span>
                  <button
                    onClick={() => handleCopy(activeWallet.address)}
                    className="p-1 rounded transition-all hover:bg-surface-hover text-[#60A5FA]"
                    title="Copy"
                  >
                    {copiedText === activeWallet.address ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.03] shrink-0 self-start sm:self-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-fg">{t("console.hsmClientOk" as any)}</span>
              </div>
            </div>

            {/* Token Grid */}
            <div className="space-y-3">
              <div className="font-mono text-[10px] font-bold uppercase text-fg-subtle">
                {t("console.wallets.assetPortfolio" as any)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeWallet.tokens.map((token, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border-token dark:border-white/[0.04] bg-surface-2 dark:bg-white/[0.03] flex flex-col justify-between h-28"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-fg">{token.symbol}</span>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            token.symbol === "USDC"
                              ? "#60A5FA"
                              : token.symbol === "USDT"
                              ? "#34d399"
                              : "#C084FC",
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-mono text-base font-extrabold text-fg">
                        {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </div>
                      <div className="text-[11px] mt-0.5 font-mono text-fg-subtle">
                        ${token.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Valuation */}
            <div className="flex justify-between items-center p-4 rounded-xl border border-[#60A5FA]/20 bg-[#60A5FA]/5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-fg-subtle">
                  {t("console.wallets.totalVal" as any)}
                </span>
                <div className="text-2xl font-extrabold tracking-tight mt-0.5 text-[#60A5FA]">
                  ${totalWalletValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <Wallet className="w-8 h-8 text-[#60A5FA]/30 shrink-0" />
            </div>
          </div>
          </WalletHoloCard>

          {/* Transfer Panel */}
          <div className="border border-border-token dark:border-white/[0.06] rounded-xl shadow-sm p-6 bg-surface dark:bg-white/[0.02]">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-fg">
              <ArrowUpRight className="w-4 h-4 text-[#60A5FA]" />
              {t("console.wallets.disburseTitle" as any)}
            </h3>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                    {t("console.wallets.assetToken" as any)}
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-semibold bg-surface dark:bg-black/30 text-fg focus:border-[#60A5FA] focus:outline-none"
                  >
                    {activeWallet.tokens.map((tok) => (
                      <option key={tok.symbol} value={tok.symbol}>
                        {tok.symbol} (Avail: {tok.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                    {t("console.wallets.outAmount" as any)}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="any"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-surface dark:bg-black/30 text-fg focus:border-[#60A5FA] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                    {t("console.wallets.recipientKey" as any)}
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-surface dark:bg-black/30 text-fg focus:border-[#60A5FA] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-[11px] italic text-fg-subtle">
                  {lang === "zh"
                    ? "注意：划拨行为必须完全契合白名单配置，否则将中断并直接回落到多签防线。"
                    : "Note: Disbursals must conform to whitelisted destinations or trigger multi-signed holds."}
                </p>
                <HolographicButton
                  type="submit"
                  disabled={isTransferring}
                  variant="blue"
                  size="sm"
                  icon={
                    isTransferring ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {isTransferring
                    ? t("console.wallets.broadcasting" as any)
                    : t("console.wallets.broadcastBtn" as any)}
                </HolographicButton>
              </div>
            </form>

            <AnimatePresence>
              {transferSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 rounded-lg text-xs flex items-center gap-2 border border-green-500/20 bg-green-500/10 text-green-500"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{t("console.wallets.broadcastSuccess" as any)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Signers Matrix */}
          <div className="border border-border-token dark:border-white/[0.06] rounded-xl shadow-sm p-6 space-y-4 bg-surface dark:bg-white/[0.02]">
            <div className="flex justify-between items-center border-b border-border-token dark:border-white/[0.04] pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-fg">
                <Key className="w-4 h-4 text-[#60A5FA]" />
                {t("console.wallets.activeSignersMatrix" as any)}
              </h3>
              <span className="text-[10px] font-mono bg-surface-2 dark:bg-white/[0.05] text-[#60A5FA] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                HSM SECURED
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: t("console.wallets.signerRole1" as any), addr: "0x76B5A1Aad9040C58A91E1EdE...", status: "ACTIVE AGENT_KEY", color: "emerald" },
                { label: t("console.wallets.signerRole2" as any), addr: "0x09FCD8a280cE1dEFeE90eaD20ee...", status: "ACTIVE MASTER_KEY", color: "indigo" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-token dark:border-white/[0.04] bg-surface-2 dark:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold font-mono text-xs ${
                      s.color === "emerald"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    }`}>
                      0{i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-fg">{s.label}</div>
                      <div className="text-[11px] font-mono mt-0.5 text-fg-subtle">{s.addr}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold border px-2 py-0.5 rounded font-mono ${
                    s.color === "emerald"
                      ? "text-green-400 bg-green-500/10 border-green-500/20"
                      : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                  }`}>
                    {s.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {isAddingWallet && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-border-token dark:border-white/[0.06] rounded-xl max-w-md w-full p-6 shadow-2xl bg-surface dark:bg-[#0D0D0D]"
            >
              <h3 className="text-base font-bold text-fg">{t("console.wallets.dialogTitle" as any)}</h3>
              <p className="text-xs mb-4 text-fg-subtle">{t("console.wallets.dialogDesc" as any)}</p>
              <form onSubmit={handleCreateWallet} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                    {t("console.wallets.dialogName" as any)}
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Marketing Multisig"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs bg-surface dark:bg-black/30 text-fg focus:border-[#60A5FA] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                    {t("console.wallets.dialogType" as any)}
                  </label>
                  <select
                    value={newWalletType}
                    onChange={(e) => setNewWalletType(e.target.value as "Multi-sig" | "Agent Vault")}
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-semibold bg-surface dark:bg-black/30 text-fg focus:border-[#60A5FA] focus:outline-none"
                  >
                    <option value="Agent Vault">{t("console.wallets.dialogType1" as any)}</option>
                    <option value="Multi-sig">{t("console.wallets.dialogType2" as any)}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                    {t("console.wallets.dialogAddr" as any)}
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-surface dark:bg-black/30 text-fg focus:border-[#60A5FA] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                    {t("console.wallets.dialogThresh" as any)}
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. 1 / 2 Agents"
                    value={newWalletThreshold}
                    onChange={(e) => setNewWalletThreshold(e.target.value)}
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs bg-surface dark:bg-black/30 text-fg focus:border-[#60A5FA] focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <HolographicButton
                    type="button"
                    onClick={() => setIsAddingWallet(false)}
                    variant="cyan"
                    size="sm"
                  >
                    {t("console.wallets.dialogCancel" as any)}
                  </HolographicButton>
                  <HolographicButton
                    type="submit"
                    variant="blue"
                    size="sm"
                  >
                    {t("console.wallets.dialogConfirm" as any)}
                  </HolographicButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
