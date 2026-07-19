"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
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
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import {
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
  ConsolePanelHeader,
  ConsoleGhostButton,
  ConsoleTelemetryGrid,
  ConsoleModal,
  HudLabel,
  StageCornerAccent,
  DetailDeckShell,
  PreflightRow,
} from "@/components/console/command-deck";
import { ModuleStageLayout } from "@/components/console/module-stage-layout";
import { useConsoleFlowHighlight } from "@/lib/console/use-console-flow-highlight";
import { useFlipLayout } from "@/lib/console/motion/use-flip-layout";

const BLUE = "#60A5FA";
const ETH_PRICE_USD = 3400;
const WALLETS_GUARDIAN_ROBOT_SRC = "/console/mascots/treasury-audit-robot.png";

/** HSM guardian robot — bottom-right of Controlled Disbursement stage panel. */
function WalletsGuardianRobotAccent() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute bottom-1.5 right-1.5 z-[5] h-[min(30%,155px)] w-[min(28%,132px)] min-h-[96px] min-w-[84px]">
      <div
        className="absolute inset-x-[-20%] bottom-0 h-[90%]"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 55% 100%, rgba(96,165,250,0.35) 0%, rgba(192,132,252,0.1) 42%, transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[-8px] h-[48%]"
        style={{
          background:
            "radial-gradient(ellipse 80% 42% at 50% 100%, rgba(96,165,250,0.3) 0%, transparent 70%)",
          filter: "blur(14px)",
        }}
      />
      <motion.img
        src={WALLETS_GUARDIAN_ROBOT_SRC}
        alt="Wallet guardian robot"
        className="absolute bottom-0 right-0 h-[min(100%,116px)] w-auto max-w-none select-none object-contain object-bottom sm:h-[122px]"
        draggable={false}
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          filter:
            "drop-shadow(0 12px 22px rgba(96,165,250,0.26)) drop-shadow(0 0 12px rgba(192,132,252,0.22))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background:
            "linear-gradient(to top, var(--surface) 0%, color-mix(in srgb, var(--surface) 55%, transparent) 48%, transparent 100%)",
        }}
      />
    </div>
  );
}

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

export function WalletsStage() {
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
  const { hasExecuted } = useConsoleFlowHighlight();

  return (
    <>
      <ModuleStageLayout
        moduleColor="blue"
        moduleLabel={lang === "zh" ? "钱包" : "Wallets"}
        title={t("console.wallets.title" as any) as string}
        subtitle={t("console.wallets.desc" as any) as string}
        statusPulse={{
          color: "blue",
          label: hasExecuted
            ? lang === "zh"
              ? "已结算"
              : "SETTLED"
            : lang === "zh"
              ? "HSM 已保护"
              : "HSM SECURED",
        }}
        headerExtra={
          <ConsoleGhostButton
            accentHover="blue"
            className="px-2.5 py-2"
            onClick={() => setIsAddingWallet(true)}
            title={t("console.wallets.addBtn" as any) as string}
          >
            <Plus className="h-3.5 w-3.5" />
          </ConsoleGhostButton>
        }
        leftRailLabel={_("注册金库", "Vaults")}
        leftRail={
          <WalletListSatellite
            wallets={wallets}
            activeWalletId={activeWalletId}
            onSelect={(id) => {
              setActiveWalletId(id);
              setTransferSuccess(false);
              setShowBlockedAlert(false);
            }}
            onAdd={() => setIsAddingWallet(true)}
            _={_}
          />
        }
        rightRailLabel={_("金库摘要", "Vault Summary")}
        rightRail={
          <WalletDetailSatellite
            wallet={activeWallet}
            totalValue={totalWalletValue}
            copiedText={copiedText}
            onCopy={handleCopy}
            _={_}
          />
        }
        stage={
          <FrostedPanel
            glowColor="blue"
            scanline={isTransferring}
            sheen
            className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-card"
          >
            <CornerGlow color="blue" className="-top-24 -right-24" intensity={0.2} />
            <StageCornerAccent color="blue" />
            {isTransferring && (
              <SparklesFX count={6} color="#60A5FA" className="pointer-events-none absolute inset-0 opacity-50" />
            )}

            <AnimatePresence>
              {showBlockedAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-4 right-4 top-4 z-20"
                >
                  <FrostedPanel glowColor="coral" scanline className="p-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-hud-coral" />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-hud-coral">
                          {lang === "zh" ? "转账被拦截" : "Transfer Blocked"}
                        </div>
                        <div className="mt-0.5 text-fg-muted">
                          {lang === "zh"
                            ? `单笔限额 25 USDC，您尝试转账 ${transferAmount} USDC 已超出安全边界。`
                            : `Single payment limit is 25 USDC. Your attempt to transfer ${transferAmount} USDC exceeds the safety boundary.`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBlockedAlert(false);
                          setTransferAmount("");
                        }}
                        className="text-fg-subtle hover:text-fg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </FrostedPanel>
                </motion.div>
              )}
            </AnimatePresence>

            <ConsolePanelHeader
              title={_("受控划拨", "Controlled Disbursement")}
              hudPrefix="FLOW::"
              hudValue={activeWallet.name}
              hudColor="blue"
              trailing={
                <StatusPulse
                  color="blue"
                  label={
                    hasExecuted
                      ? _("已结算", "SETTLED")
                      : isTransferring
                        ? _("路由中", "ROUTING")
                        : _("就绪", "READY")
                  }
                  size="sm"
                />
              }
            />

            {isTransferring && <Scanline color="blue" className="relative z-10 shrink-0" />}

            <WalletsGuardianRobotAccent />

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto p-4 pt-0 md:p-5 md:pt-0">
              <WalletsDetailDeck
                activeWallet={activeWallet}
                selectedToken={selectedToken}
                setSelectedToken={setSelectedToken}
                transferAmount={transferAmount}
                setTransferAmount={setTransferAmount}
                transferRecipient={transferRecipient}
                setTransferRecipient={setTransferRecipient}
                isTransferring={isTransferring}
                transferSuccess={transferSuccess}
                onSubmit={handleTransferSubmit}
                _={_}
              />
            </div>

          </FrostedPanel>
        }
        detailLabel={_("拓扑与结算日志", "Topology & Settlement Log")}
        detailDefaultOpen={true}
        detail={
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <DetailDeckShell glowColor="blue" className="min-h-[120px]">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                {_("金库拓扑（概览）", "Vault topology (overview)")}
              </p>
              <WalletTopology
                compact
                wallets={wallets.map((w) => ({
                  id: w.id,
                  name: w.name,
                  type: w.type,
                  valueUsd: w.tokens.reduce((acc, tok) => acc + tok.valueUsd, 0),
                }))}
                activeId={activeWalletId}
                onSelect={(id) => {
                  setActiveWalletId(id);
                  setTransferSuccess(false);
                  setShowBlockedAlert(false);
                }}
              />
            </DetailDeckShell>
            <DetailDeckShell glowColor="blue">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                {_("结算预检", "Settlement preflight")}
              </p>
              <PreflightRow
                label={_("活跃金库", "Active vault")}
                value={activeWallet.name.split(" ")[0]}
                status="ok"
              />
              <PreflightRow
                label={_("HSM 状态", "HSM status")}
                value={hasExecuted ? _("已结算", "SETTLED") : _("已保护", "SECURED")}
                status={hasExecuted ? "ok" : "idle"}
              />
              <PreflightRow
                label={_("Policy 单笔限额", "Policy single limit")}
                value="25 USDC"
                status="ok"
              />
              <p className="mt-2 text-[10px] text-fg-muted">
                {_("提交划拨后，此处会追加 CAW 路由与 tx 摘要。", "After broadcast, CAW routing and tx summaries append here.")}
              </p>
            </DetailDeckShell>
          </div>
        }
      />

      {/* ─── Add Wallet Modal ─── */}
      <ConsoleModal
        open={isAddingWallet}
        onClose={() => setIsAddingWallet(false)}
        title={t("console.wallets.dialogTitle" as any)}
        description={t("console.wallets.dialogDesc" as any)}
        footer={
          <>
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
              form="add-wallet-form"
              variant="blue"
              size="sm"
            >
              {t("console.wallets.dialogConfirm" as any)}
            </HolographicButton>
          </>
        }
      >
        <form id="add-wallet-form" onSubmit={handleCreateWallet} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
              {t("console.wallets.dialogName" as any)}
            </label>
            <input
              type="text"
              placeholder="E.g. Marketing Multisig"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              className="console-field w-full focus:border-hud-blue"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
              {t("console.wallets.dialogType" as any)}
            </label>
            <select
              value={newWalletType}
              onChange={(e) => setNewWalletType(e.target.value as "Multi-sig" | "Agent Vault")}
              className="console-field w-full font-semibold focus:border-hud-blue"
            >
              <option value="Agent Vault">{t("console.wallets.dialogType1" as any)}</option>
              <option value="Multi-sig">{t("console.wallets.dialogType2" as any)}</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
              {t("console.wallets.dialogAddr" as any)}
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              className="console-field w-full font-mono focus:border-hud-blue"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
              {t("console.wallets.dialogThresh" as any)}
            </label>
            <input
              type="text"
              placeholder="E.g. 1 / 2 Agents"
              value={newWalletThreshold}
              onChange={(e) => setNewWalletThreshold(e.target.value)}
              className="console-field w-full focus:border-hud-blue"
              required
            />
          </div>
        </form>
      </ConsoleModal>
    </>
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
  type VaultFilter = "all" | WalletItem["type"];
  const [filter, setFilter] = useState<VaultFilter>("all");
  const { containerRef, captureThenAnimate } = useFlipLayout<HTMLDivElement>();

  const filterOptions: { id: VaultFilter; label: string }[] = [
    { id: "all", label: _("全部", "All") },
    { id: "Agent Vault", label: _("智能体", "Agent") },
    { id: "Multi-sig", label: "Multi-sig" },
    { id: "Cold Storage", label: _("冷存", "Cold") },
  ];

  const filteredWallets =
    filter === "all" ? wallets : wallets.filter((w) => w.type === filter);

  const applyFilter = (next: VaultFilter) => {
    if (next === filter) return;
    captureThenAnimate(() => setFilter(next));
  };

  return (
    <FrostedPanel glowColor="blue" sheen className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border-token flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-hud-blue" />
          <span className="text-sm font-semibold text-fg">
            {_("注册金库", "Vaults")}
          </span>
          <span className="text-[10px] text-fg-muted font-mono px-1.5 py-0.5 rounded-full bg-surface-hover">
            {filteredWallets.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ConsoleGhostButton
            onClick={onAdd}
            accentHover="blue"
            className="h-7 w-7 p-0"
            title={t("console.wallets.addBtn" as any)}
          >
            <Plus className="w-3.5 h-3.5" />
          </ConsoleGhostButton>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-fg-muted hover:text-fg transition-colors lg:hidden"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-1 px-2 pt-2", collapsed && "hidden lg:flex")}>
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => applyFilter(opt.id)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-semibold transition-colors",
              filter === opt.id
                ? "bg-hud-blue/20 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className={cn("flex-1 overflow-y-auto p-2 space-y-1", collapsed && "hidden lg:block")}
      >
        {filteredWallets.map((w) => {
          const isActive = w.id === activeWalletId;
          const totalVal = w.tokens.reduce((acc, tok) => acc + tok.valueUsd, 0);
          return (
            <motion.button
              key={w.id}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => onSelect(w.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                isActive
                  ? "bg-hud-blue/10 border-hud-blue/30"
                  : "bg-surface-2/40 border-border-token hover:bg-surface-hover hover:border-hud-blue/25"
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
                      ? "bg-hud-violet/10 text-hud-violet border-hud-violet/20"
                      : "bg-surface-2 text-fg-muted border-border-token"
                  )}
                >
                  {w.type}
                </span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-fg-muted truncate">
                {w.address.substring(0, 8)}...{w.address.substring(w.address.length - 6)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-fg-muted truncate max-w-[110px]">{w.threshold}</span>
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
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <FrostedPanel glowColor="blue" sheen className="shrink-0 rounded-card p-4">
        <div className="flex items-start justify-between gap-3">
          <HudLabel prefix="ACTIVE::" value={wallet.name} color="blue" size="sm" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded px-2 py-0.5 font-mono text-[10px] bg-surface-hover text-fg-muted">
            {wallet.type}
          </span>
          <div className="flex items-center gap-1.5 rounded-full border border-border-token bg-surface-2/40 px-2 py-0.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-fg">{t("console.hsmClientOk" as any)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-fg-muted">
          <span className="truncate">{wallet.address}</span>
          <button
            onClick={() => onCopy(wallet.address)}
            className="p-1 rounded transition-all hover:bg-surface-hover text-hud-blue shrink-0"
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

      <FrostedPanel
        glowColor="blue"
        sheen
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card p-4"
      >
        <p className="mb-2.5 text-[12px] font-medium text-fg-muted">
          {t("console.wallets.assetPortfolio" as any) as string}
        </p>
        <ConsoleTelemetryGrid
          columns={1}
          items={[
            {
              label: (t("console.wallets.totalVal" as any) as string).toUpperCase(),
              value: (
                <>
                  $<AnimatedNumber value={totalValue} />
                </>
              ),
              accent: "blue",
            },
          ]}
        />
        <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
          {wallet.tokens.map((token, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border-token bg-surface-2/40"
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
                <div className="text-[10px] font-mono text-fg-muted">
                  ${token.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </FrostedPanel>
    </div>
  );
}

/* =============================================================================
 * WALLETS DETAIL DECK — Signers + Transfer tabs
 * ===========================================================================*/

function WalletsDetailDeck({
  activeWallet,
  selectedToken,
  setSelectedToken,
  transferAmount,
  setTransferAmount,
  transferRecipient,
  setTransferRecipient,
  isTransferring,
  transferSuccess,
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
  onSubmit: (e: React.FormEvent) => void;
  _: (zh: string, en: string) => string;
}) {
  const { lang } = useApp();
  const [tab, setTab] = useState<"signers" | "transfer">("signers");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-border-token bg-surface-2/40 p-1">
        {(
          [
            { id: "signers" as const, label: lang === "zh" ? "签名矩阵" : "Signers" },
            { id: "transfer" as const, label: lang === "zh" ? "划拨" : "Transfer" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              tab === item.id ? "bg-hud-blue/20 text-fg" : "text-fg-muted hover:text-fg"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "signers" ? (
        <SignersMatrixStrip _={_} />
      ) : (
        <TransferPanel
          activeWallet={activeWallet}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          transferAmount={transferAmount}
          setTransferAmount={setTransferAmount}
          transferRecipient={transferRecipient}
          setTransferRecipient={setTransferRecipient}
          isTransferring={isTransferring}
          transferSuccess={transferSuccess}
          onSubmit={onSubmit}
          _={_}
        />
      )}
    </div>
  );
}

/* =============================================================================
 * TRANSFER PANEL — Disbursement form (DetailDeck)
 * ===========================================================================*/

function TransferPanel({
  activeWallet,
  selectedToken,
  setSelectedToken,
  transferAmount,
  setTransferAmount,
  transferRecipient,
  setTransferRecipient,
  isTransferring,
  transferSuccess,
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
  onSubmit: (e: React.FormEvent) => void;
  _: (zh: string, en: string) => string;
}) {
  const { t, lang } = useApp();

  return (
    <FrostedPanel glowColor="blue" scanline sheen className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <ArrowUpRight className="h-4 w-4 text-hud-blue" />
        <span className="text-sm font-semibold text-fg">
          {t("console.wallets.disburseTitle" as any)}
        </span>
      </div>
      <form onSubmit={onSubmit} className="relative space-y-4">
                {isTransferring && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-x-0 bottom-8 z-10 h-6 overflow-hidden"
                  >
                    <motion.div
                      className="absolute top-1/2 h-1 w-16 -translate-y-1/2 rounded-full shadow-[0_0_18px_rgba(96,165,250,0.85)]"
                      style={{ backgroundColor: BLUE }}
                      initial={{ left: "-4rem", opacity: 0 }}
                      animate={{
                        left: ["-4rem", "50%", "calc(100% + 4rem)"],
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute top-1/2 h-px w-24 -translate-y-1/2 rounded-full opacity-60"
                      style={{ backgroundColor: BLUE }}
                      initial={{ left: "-6rem", opacity: 0 }}
                      animate={{
                        left: ["-6rem", "50%", "calc(100% + 6rem)"],
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                    />
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
                      {t("console.wallets.assetToken" as any)}
                    </label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="console-field w-full font-semibold focus:border-hud-blue"
                    >
                      {activeWallet.tokens.map((tok) => (
                        <option key={tok.symbol} value={tok.symbol}>
                          {tok.symbol} (Avail: {tok.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
                      {t("console.wallets.outAmount" as any)}
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="any"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="console-field w-full font-mono focus:border-hud-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
                      {t("console.wallets.recipientKey" as any)}
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      className="console-field w-full font-mono focus:border-hud-blue"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                  <p className="text-[11px] italic text-fg-muted">
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
            className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-500"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{t("console.wallets.broadcastSuccess" as any)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </FrostedPanel>
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
            className="group relative flex items-center justify-between p-3 rounded-lg border border-border-token bg-surface-2/40 hover:bg-surface-hover transition-colors"
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
                <div className="text-[11px] font-mono mt-0.5 text-fg-muted">{s.addr}</div>
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
