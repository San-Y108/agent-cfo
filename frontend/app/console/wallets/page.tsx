"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { useConsoleState } from "@/lib/console/console-state";
import { WalletHoloCard, WalletTopology } from "@/components/console/wallet-hologram";
import { HolographicButton } from "@/components/ui/holographic-button";
import { GradientText } from "@/components/ui/aceternity/colourful-text";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
} from "@/components/console/command-deck";

const BLUE = "#60A5FA";
const ETH_PRICE_USD = 3400;

function tokenValueUsd(symbol: string, balance: number): number {
  if (symbol === "USDC" || symbol === "USDT") return balance;
  if (symbol === "ETH") return balance * ETH_PRICE_USD;
  return balance;
}

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
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

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
    <div className="relative w-full min-h-full">
      {/* ─── Header ─── */}
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/10 border border-[#60A5FA]/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#60A5FA] font-mono">
              CWD Wallet Console
            </span>
          </div>
          <div className="relative inline-block">
            <GradientText className="text-2xl font-semibold leading-tight tracking-tight">
              {t("console.wallets.title" as any)}
            </GradientText>
            <SparklesFX
              count={8}
              className="absolute -right-8 -top-2 w-16 h-16"
              color="#60A5FA"
            />
          </div>
          <p className="mt-2 text-sm text-fg-subtle max-w-xl">
            {t("console.wallets.desc" as any)}
          </p>
        </motion.div>
      </div>

      {/* ─── Blocked Alert (floating satellite) ─── */}
      <AnimatePresence>
        {showBlockedAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="px-6 lg:px-10 pb-6 flex justify-end"
          >
            <FrostedPanel glowColor="coral" scanline className="w-full max-w-md p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-hud-coral shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-hud-coral">
                    {lang === "zh" ? "转账被拦截" : "Transfer Blocked"}
                  </div>
                  <div className="text-xs text-fg-subtle mt-0.5">
                    {lang === "zh"
                      ? `单笔限额 25 USDC，您尝试转账 ${transferAmount} USDC 已超出安全边界。`
                      : `Single payment limit is 25 USDC. Your attempt to transfer ${transferAmount} USDC exceeds the safety boundary.`}
                  </div>
                </div>
                <button
                  onClick={() => { setShowBlockedAlert(false); setTransferAmount(""); }}
                  className="text-fg-subtle hover:text-fg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </FrostedPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Command Deck Layout ─── */}
      <div className="px-6 lg:px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Wallet List satellite */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <WalletListSatellite
              wallets={wallets}
              activeWalletId={activeWalletId}
              onSelect={(id) => { setActiveWalletId(id); setTransferSuccess(false); setShowBlockedAlert(false); }}
              onAdd={() => setIsAddingWallet(true)}
              _={_}
            />
          </motion.div>

          {/* Center: Vault Topology Hero */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FrostedPanel
              glowColor="blue"
              scanline
              sheen
              className="relative h-full min-h-[520px] p-6 flex flex-col"
            >
              <CornerGlow color="blue" className="-top-24 -right-24" intensity={0.2} />

              <div className="relative z-10 flex items-start justify-between mb-4">
                <div>
                  <HudLabel prefix="VAULT::" value={activeWallet.name} color="blue" size="md" />
                  <h2 className="mt-1 text-lg font-semibold text-fg">
                    {_("金库拓扑", "Vault Topology")}
                  </h2>
                </div>
                <StatusPulse color="blue" label="HSM SECURED" size="sm" />
              </div>

              <Scanline color="blue" className="relative z-10 mb-4" />

              <div className="relative z-10 flex-1">
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
              </div>
            </FrostedPanel>
          </motion.div>

          {/* Right: Active wallet detail satellite */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <WalletDetailSatellite
              wallet={activeWallet}
              totalValue={totalWalletValue}
              copiedText={copiedText}
              onCopy={handleCopy}
              _={_}
            />
          </motion.div>
        </div>

        {/* Bottom: Signers Matrix strip */}
        <div className="mt-6">
          <SignersMatrixStrip _={_} />
        </div>
      </div>

      {/* ─── Transfer floating satellite ─── */}
      <TransferFloating
        activeWallet={activeWallet}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        transferAmount={transferAmount}
        setTransferAmount={setTransferAmount}
        transferRecipient={transferRecipient}
        setTransferRecipient={setTransferRecipient}
        isTransferring={isTransferring}
        transferSuccess={transferSuccess}
        showBlockedAlert={showBlockedAlert}
        onSubmit={handleTransferSubmit}
        _={_}
      />

      {/* ─── Add Wallet Modal ─── */}
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

/* =============================================================================
 * WALLET LIST SATELLITE — Left-side collapsible vault selector.
 * ===========================================================================*/

function WalletListSatellite({
  wallets,
  activeWalletId,
  onSelect,
  onAdd,
  _,
}: {
  wallets: WalletItem[];
  activeWalletId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  _: (zh: string, en: string) => string;
}) {
  const { t } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <FrostedPanel glowColor="blue" sheen className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-hud-blue" />
          <span className="text-sm font-semibold text-fg">
            {_("注册金库", "Vaults")}
          </span>
          <span className="text-[10px] text-fg-subtle font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04]">
            {wallets.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAdd}
            className="text-fg-subtle hover:text-fg transition-colors"
            title={t("console.wallets.addBtn" as any)}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-fg-subtle hover:text-fg transition-colors lg:hidden"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto p-2 space-y-1", collapsed && "hidden lg:block")}>
        {wallets.map((w, i) => {
          const isActive = w.id === activeWalletId;
          const totalVal = w.tokens.reduce((acc, tok) => acc + tok.valueUsd, 0);
          return (
            <motion.button
              key={w.id}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => onSelect(w.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                isActive
                  ? "bg-hud-blue/10 border-hud-blue/30"
                  : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[13px] font-medium text-fg truncate">{w.name}</span>
                <span
                  className={cn(
                    "shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono border",
                    w.type === "Agent Vault"
                      ? "bg-hud-blue/10 text-hud-blue border-hud-blue/20"
                      : w.type === "Multi-sig"
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  )}
                >
                  {w.type}
                </span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-fg-subtle truncate">
                {w.address.substring(0, 8)}...{w.address.substring(w.address.length - 6)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-fg-subtle truncate max-w-[110px]">{w.threshold}</span>
                <span className="text-[12px] font-mono font-semibold text-fg">
                  ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </FrostedPanel>
  );
}

/* =============================================================================
 * WALLET DETAIL SATELLITE — Right-side active vault summary + token grid.
 * ===========================================================================*/

function WalletDetailSatellite({
  wallet,
  totalValue,
  copiedText,
  onCopy,
  _,
}: {
  wallet: WalletItem;
  totalValue: number;
  copiedText: string | null;
  onCopy: (text: string) => void;
  _: (zh: string, en: string) => string;
}) {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <FrostedPanel glowColor="blue" sheen className="p-4">
        <HudLabel prefix="ACTIVE::" value={wallet.name} color="blue" size="sm" />
        <div className="mt-2 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-white/[0.05] text-fg-subtle">
            {wallet.type}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-fg">{t("console.hsmClientOk" as any)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-fg-subtle">
          <span className="truncate">{wallet.address}</span>
          <button
            onClick={() => onCopy(wallet.address)}
            className="p-1 rounded transition-all hover:bg-white/[0.06] text-hud-blue shrink-0"
            title="Copy"
          >
            {copiedText === wallet.address ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </FrostedPanel>

      <FrostedPanel glowColor="blue" sheen className="p-4">
        <div className="text-[10px] font-mono uppercase text-fg-subtle mb-3">
          {t("console.wallets.assetPortfolio" as any)}
        </div>
        <div className="space-y-2">
          {wallet.tokens.map((token, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02]"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      token.symbol === "USDC"
                        ? "#60A5FA"
                        : token.symbol === "USDT"
                        ? "#34d399"
                        : "#C084FC",
                  }}
                />
                <span className="text-[13px] font-semibold text-fg">{token.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-mono font-semibold text-fg">
                  {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </div>
                <div className="text-[10px] font-mono text-fg-subtle">
                  ${token.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg border border-hud-blue/20 bg-hud-blue/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-fg-subtle">
              {t("console.wallets.totalVal" as any)}
            </div>
            <div className="text-xl font-extrabold tracking-tight mt-0.5 text-hud-blue">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </div>
          </div>
          <Wallet className="w-6 h-6 text-hud-blue/30" />
        </div>
      </FrostedPanel>
    </div>
  );
}

/* =============================================================================
 * TRANSFER FLOATING SATELLITE — Bottom-right disbursement card.
 * ===========================================================================*/

function TransferFloating({
  activeWallet,
  selectedToken,
  setSelectedToken,
  transferAmount,
  setTransferAmount,
  transferRecipient,
  setTransferRecipient,
  isTransferring,
  transferSuccess,
  showBlockedAlert,
  onSubmit,
  _,
}: {
  activeWallet: WalletItem;
  selectedToken: string;
  setSelectedToken: (v: string) => void;
  transferAmount: string;
  setTransferAmount: (v: string) => void;
  transferRecipient: string;
  setTransferRecipient: (v: string) => void;
  isTransferring: boolean;
  transferSuccess: boolean;
  showBlockedAlert: boolean;
  onSubmit: (e: React.FormEvent) => void;
  _: (zh: string, en: string) => string;
}) {
  const { t, lang } = useApp();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-6 lg:px-10 pb-6 flex justify-end">
      <FrostedPanel glowColor="blue" scanline sheen className="w-full max-w-lg p-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-hud-blue" />
            <span className="text-sm font-semibold text-fg">
              {t("console.wallets.disburseTitle" as any)}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-fg-subtle" /> : <ChevronDown className="w-4 h-4 text-fg-subtle" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={onSubmit} className="mt-4 space-y-4 relative">
                {isTransferring && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
                  >
                    <motion.div
                      className="absolute w-2 h-2 rounded-full shadow-[0_0_14px_rgba(96,165,250,0.9)]"
                      style={{ backgroundColor: BLUE }}
                      initial={{ left: "18%", top: "58%", opacity: 0, scale: 0.6 }}
                      animate={{
                        left: ["18%", "48%", "82%"],
                        top: ["58%", "26%", "54%"],
                        opacity: [0, 1, 0],
                        scale: [0.6, 1.1, 0.8],
                      }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute w-1 h-1 rounded-full opacity-60"
                      style={{ backgroundColor: BLUE }}
                      initial={{ left: "18%", top: "58%" }}
                      animate={{
                        left: ["18%", "48%", "82%"],
                        top: ["58%", "26%", "54%"],
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.12 }}
                    />
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-subtle">
                      {t("console.wallets.assetToken" as any)}
                    </label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-semibold bg-surface/50 text-fg focus:border-hud-blue focus:outline-none"
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
                      className="w-full border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-surface/50 text-fg focus:border-hud-blue focus:outline-none"
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
                      className="w-full border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-surface/50 text-fg focus:border-hud-blue focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
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
            </motion.div>
          )}
        </AnimatePresence>
      </FrostedPanel>
    </div>
  );
}

/* =============================================================================
 * SIGNERS MATRIX STRIP — Bottom horizontal satellite bar.
 * ===========================================================================*/

function SignersMatrixStrip({
  _,
}: {
  _: (zh: string, en: string) => string;
}) {
  const { t } = useApp();

  const signers = [
    { label: t("console.wallets.signerRole1" as any), addr: "0x76B5A1Aad9040C58A91E1EdE...", status: "ACTIVE AGENT_KEY", color: "emerald" },
    { label: t("console.wallets.signerRole2" as any), addr: "0x09FCD8a280cE1dEFeE90eaD20ee...", status: "ACTIVE MASTER_KEY", color: "indigo" },
  ];

  return (
    <FrostedPanel glowColor="blue" sheen className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-hud-blue" />
          <span className="text-sm font-semibold text-fg">
            {t("console.wallets.activeSignersMatrix" as any)}
          </span>
        </div>
        <StatusPulse color="blue" label="HSM SECURED" size="sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {signers.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="group relative flex items-center justify-between p-3 rounded-lg border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center font-bold font-mono text-xs",
                  s.color === "emerald"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                )}
              >
                0{i + 1}
              </div>
              <div>
                <div className="font-bold text-xs text-fg">{s.label}</div>
                <div className="text-[11px] font-mono mt-0.5 text-fg-subtle">{s.addr}</div>
              </div>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-bold border px-2 py-0.5 rounded font-mono",
                s.color === "emerald"
                  ? "text-green-400 bg-green-500/10 border-green-500/20"
                  : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
              )}
            >
              {s.status}
            </div>
          </motion.div>
        ))}
      </div>
    </FrostedPanel>
  );
}
