"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Shield,
  Sliders,
  CheckCircle,
  Workflow,
  X,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { useConsoleState } from "@/lib/console/console-state";
import { HolographicButton } from "@/components/ui/holographic-button";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import { NeuralGuardrailsGraph } from "@/components/console/neural-guardrails-graph";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
} from "@/components/console/command-deck";

const CORAL = "#FB7185";
const CORAL_LIGHT = "#F43F5E";
const LIME = "#B5FF4D";

const RULES = [
  { num: "0x1A", titleKey: "risk.1.title", bodyKey: "risk.1.body", color: "#5EEAD4", icon: ShieldCheck },
  { num: "0x2B", titleKey: "risk.2.title", bodyKey: "risk.2.body", color: "#FB7185", icon: ShieldAlert },
  { num: "0x3C", titleKey: "risk.3.title", bodyKey: "risk.3.body", color: "#B5FF4D", icon: FileCheck },
  { num: "0x4D", titleKey: "risk.4.title", bodyKey: "risk.4.body", color: "#60A5FA", icon: Bot },
  { num: "0x5E", titleKey: "risk.5.title", bodyKey: "risk.5.body", color: "#C084FC", icon: AlertTriangle },
];

interface WhitelistItem {
  id: string;
  name: string;
  address: string;
  category: "Developer" | "Ad Network" | "API Provider" | "SaaS";
  dateRegistered: string;
}

const INITIAL_WHITELIST: WhitelistItem[] = [
  {
    id: "wl-1",
    name: "Alice Core Dev Wallet",
    address: "0xAlice1234567890abcdef1234567890abcdef12",
    category: "Developer",
    dateRegistered: "2026-05-12",
  },
  {
    id: "wl-2",
    name: "Charlie QA Lead Wallet",
    address: "0xCharlie1234567890abcdef1234567890abcdef",
    category: "Developer",
    dateRegistered: "2026-05-15",
  },
  {
    id: "wl-3",
    name: "Web3 Indexing Node Key",
    address: "0xDataAPI1234567890abcdef1234567890abcde",
    category: "API Provider",
    dateRegistered: "2026-06-01",
  },
  {
    id: "wl-4",
    name: "Discord Webhook Bot Relayer",
    address: "0xDiscordAlerts891ceea90881bCDeEa901C98B6a1",
    category: "SaaS",
    dateRegistered: "2026-06-08",
  },
];

function useFlashingValue(value: number) {
  const [flash, setFlash] = useState(false);
  const [prev, setPrev] = useState(value);

  useEffect(() => {
    if (value !== prev) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      setPrev(value);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return flash;
}

function ThresholdSlider({
  label,
  tip,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  label: string;
  tip: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit: string;
}) {
  const flash = useFlashingValue(value);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold uppercase font-mono text-fg-muted tracking-wider">
          {label}
        </label>
        <motion.span
          animate={flash ? { scale: [1, 1.2, 1], color: [LIME, "#fff", LIME] } : {}}
          transition={{ duration: 0.4 }}
          className="text-xs font-mono font-bold tabular-nums flex items-center gap-1"
          style={{ color: flash ? undefined : CORAL }}
        >
          <AnimatedNumber value={value} /> {unit}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, rgba(255,255,255,0.08) 0%, ${LIME} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
      <p className="text-[10px] leading-tight text-fg-subtle">{tip}</p>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${LIME};
          cursor: pointer;
          box-shadow: 0 0 10px ${LIME}99, 0 0 20px ${LIME}40;
          border: 2px solid #0D0D0D;
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${LIME};
          cursor: pointer;
          box-shadow: 0 0 10px ${LIME}99, 0 0 20px ${LIME}40;
          border: 2px solid #0D0D0D;
        }
      `}</style>
    </div>
  );
}

export function PolicyModule() {
  const { t, lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

  const {
    budgetRule,
    updateSingleLimit,
    updateMonthlyBudget,
    updateWhitelist,
  } = useConsoleState();

  /* Sync local whitelist display with the global budget rule whitelist. */
  const buildWhitelistFromRule = useCallback(
    (addresses: string[]): WhitelistItem[] =>
      addresses.map((address) => {
        const known = INITIAL_WHITELIST.find(
          (w) => w.address.toLowerCase() === address.toLowerCase()
        );
        return (
          known ?? {
            id: `wl-${address.slice(2, 10)}`,
            name: address.slice(0, 10),
            address,
            category: "Developer" as const,
            dateRegistered: new Date().toISOString().split("T")[0],
          }
        );
      }),
    []
  );

  const [whitelist, setWhitelist] = useState<WhitelistItem[]>(() =>
    buildWhitelistFromRule(budgetRule.whitelist)
  );

  /* Keep local display in sync when the global rule changes elsewhere. */
  useEffect(() => {
    setWhitelist(buildWhitelistFromRule(budgetRule.whitelist));
  }, [budgetRule.whitelist, buildWhitelistFromRule]);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCategory, setNewCategory] = useState<WhitelistItem["category"]>("Developer");

  const [maxSingle, setMaxSingle] = useState(budgetRule.singlePaymentLimit);
  const [dailyCum, setDailyCum] = useState(budgetRule.monthlyBudget);
  const [autoUnder, setAutoUnder] = useState(10);
  const [slackWebhook, setSlackWebhook] = useState("placeholder-slack-webhook-url");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

  /* Keep sliders aligned with externally updated rules. */
  useEffect(() => {
    setMaxSingle(budgetRule.singlePaymentLimit);
  }, [budgetRule.singlePaymentLimit]);

  useEffect(() => {
    setDailyCum(budgetRule.monthlyBudget);
  }, [budgetRule.monthlyBudget]);

  const syncWhitelistToContext = useCallback(
    (next: WhitelistItem[]) => {
      setWhitelist(next);
      updateWhitelist(next.map((w) => w.address));
    },
    [updateWhitelist]
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress) return;
    const item: WhitelistItem = {
      id: `wl-${Date.now()}`,
      name: newName,
      address: newAddress,
      category: newCategory,
      dateRegistered: new Date().toISOString().split("T")[0],
    };
    syncWhitelistToContext([...whitelist, item]);
    setIsAddingItem(false);
    setNewName("");
    setNewAddress("");
  };

  const handleDelete = (id: string) => {
    syncWhitelistToContext(whitelist.filter((w) => w.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateSingleLimit(maxSingle);
    updateMonthlyBudget(dailyCum);
    updateWhitelist(whitelist.map((w) => w.address));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* ─── Neural Guardrails Graph ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FrostedPanel
          glowColor="coral"
          scanline
          sheen
          className="relative p-5"
        >
          <CornerGlow color="coral" className="-top-24 -right-24" intensity={0.2} />

          <div className="relative z-10 flex items-start justify-between mb-4">
            <div>
              <HudLabel prefix="GUARD::" value="NEURAL MESH" color="coral" size="md" />
              <h2 className="mt-1 text-base font-semibold text-fg">
                {_("规则拓扑", "Guardrail Topology")}
              </h2>
            </div>
            <StatusPulse
              color="coral"
              label={lang === "zh" ? "在线防护" : "GUARDING"}
              size="sm"
            />
          </div>

          <Scanline color="coral" className="relative z-10 mb-4" />

          <div className="relative z-10 flex items-center justify-center h-64">
            <NeuralGuardrailsGraph
              activeRuleId={activeRuleId}
              onRuleHover={setActiveRuleId}
              className="w-full h-full"
            />
          </div>
        </FrostedPanel>
      </motion.div>

      {/* ─── Rules list ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <RulesSatellite
          activeRuleId={activeRuleId}
          onHover={setActiveRuleId}
          _={_}
        />
      </motion.div>

      {/* ─── Threshold adjuster ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <ThresholdSatellite
          maxSingle={maxSingle}
          setMaxSingle={setMaxSingle}
          dailyCum={dailyCum}
          setDailyCum={setDailyCum}
          autoUnder={autoUnder}
          setAutoUnder={setAutoUnder}
          slackWebhook={slackWebhook}
          setSlackWebhook={setSlackWebhook}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          onSave={handleSave}
          _={_}
        />
      </motion.div>

      {/* ─── Whitelist strip ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <WhitelistStrip
          whitelist={whitelist}
          onDelete={handleDelete}
          onAdd={() => setIsAddingItem(true)}
        />
      </motion.div>

      {/* ── Add whitelist modal ── */}
      <AnimatePresence>
        {isAddingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-white/[0.08] rounded-xl max-w-sm w-full p-6 shadow-2xl relative bg-surface dark:bg-[#0b1120]"
            >
              <button
                onClick={() => setIsAddingItem(false)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-white/5 text-fg-subtle transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-fg mb-1">
                {lang === "zh" ? "注册白名单地址" : "Register Whitelisted Address"}
              </h3>
              <p className="text-xs text-fg-subtle mb-4">
                {lang === "zh"
                  ? "在 AgentCFO 安全扫描任务之前绑定链上公钥公开地址。"
                  : "Register a cryptographic public address to verify transactions within AgentCFO scan batches."}
              </p>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
                    {lang === "zh" ? "备注标签/姓名" : "Friendly Label"}
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Bob UI Designer"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border border-white/[0.08] rounded-lg px-3 py-2 text-xs bg-white/[0.03] text-fg focus:border-coral-400 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
                    {lang === "zh" ? "身份类别" : "Category Type"}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as WhitelistItem["category"])}
                    className="w-full border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-semibold bg-white/[0.03] text-fg focus:border-coral-400 outline-none transition-colors"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Ad Network">Ad Network</option>
                    <option value="API Provider">API Provider</option>
                    <option value="SaaS">SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
                    {lang === "zh" ? "链上公钥地址 (0x...)" : "On-chain Address"}
                  </label>
                  <input
                    type="text"
                    placeholder="0x90A81D234..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-white/[0.03] text-fg focus:border-coral-400 outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <HolographicButton
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    variant="cyan"
                    size="sm"
                  >
                    {lang === "zh" ? "取消" : "Cancel"}
                  </HolographicButton>
                  <HolographicButton
                    type="submit"
                    variant="coral"
                    size="sm"
                  >
                    {lang === "zh" ? "确立注册" : "Confirm Registry"}
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

function RulesSatellite({
  activeRuleId,
  onHover,
  _,
}: {
  activeRuleId: string | null;
  onHover: (id: string | null) => void;
  _: (zh: string, en: string) => string;
}) {
  const { t } = useApp();

  return (
    <FrostedPanel glowColor="coral" sheen className="flex flex-col">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <Shield className="w-4 h-4 text-hud-coral" />
        <span className="text-sm font-semibold text-fg">
          {_("规则节点", "Rule Nodes")}
        </span>
        <span className="text-[10px] text-fg-subtle font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04]">
          {RULES.length}
        </span>
      </div>

      <div className="p-2 space-y-1">
        {RULES.map((rule, i) => {
          const isActive = activeRuleId === rule.num;
          const Icon = rule.icon;
          return (
            <motion.button
              key={rule.num}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onMouseEnter={() => onHover(rule.num)}
              onMouseLeave={() => onHover(null)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                isActive
                  ? "bg-hud-coral/10 border-hud-coral/30"
                  : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: rule.color, boxShadow: `0 0 8px ${rule.color}` }}
                />
                <span
                  className="text-[11px] font-mono font-bold uppercase tracking-wider"
                  style={{ color: isActive ? rule.color : undefined }}
                >
                  {rule.num}
                </span>
              </div>
              <div className="mt-1.5 text-[13px] font-medium text-fg">
                {t(rule.titleKey as any)}
              </div>
              <div className="mt-0.5 text-[10px] text-fg-subtle leading-tight">
                {t(rule.bodyKey as any)}
              </div>
            </motion.button>
          );
        })}
      </div>
    </FrostedPanel>
  );
}

function ThresholdSatellite({
  maxSingle,
  setMaxSingle,
  dailyCum,
  setDailyCum,
  autoUnder,
  setAutoUnder,
  slackWebhook,
  setSlackWebhook,
  isSaving,
  saveSuccess,
  onSave,
  _,
}: {
  maxSingle: number;
  setMaxSingle: (v: number) => void;
  dailyCum: number;
  setDailyCum: (v: number) => void;
  autoUnder: number;
  setAutoUnder: (v: number) => void;
  slackWebhook: string;
  setSlackWebhook: (v: string) => void;
  isSaving: boolean;
  saveSuccess: boolean;
  onSave: (e: React.FormEvent) => void;
  _: (zh: string, en: string) => string;
}) {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <FrostedPanel
        glowColor="coral"
        sheen
        className={cn(
          "p-5 space-y-5 transition-colors duration-300",
          saveSuccess && "border-lime-400/60 shadow-[0_0_30px_rgba(181,255,77,0.15)]"
        )}
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <Sliders className="w-5 h-5" style={{ color: CORAL }} />
          <div>
            <h4 className="text-sm font-bold text-fg">
              {t("console.policy.adjusterTitle" as any)}
            </h4>
            <p className="text-[11px] text-fg-subtle">
              {t("console.policy.adjusterDesc" as any)}
            </p>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-5">
          <ThresholdSlider
            label={t("console.policy.maxSingle" as any)}
            tip={t("console.policy.maxSingleTip" as any)}
            value={maxSingle}
            onChange={setMaxSingle}
            min={5}
            max={100}
            unit="USDC"
          />

          <ThresholdSlider
            label={t("console.policy.dailyCum" as any)}
            tip={t("console.policy.dailyCumTip" as any)}
            value={dailyCum}
            onChange={setDailyCum}
            min={50}
            max={500}
            unit="USDC"
          />

          <ThresholdSlider
            label={t("console.policy.autoUnder" as any)}
            tip={t("console.policy.autoUnderTip" as any)}
            value={autoUnder}
            onChange={setAutoUnder}
            min={1}
            max={50}
            unit="USDC"
          />

          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold uppercase font-mono text-fg-muted tracking-wider">
              {t("console.policy.slackWebhook" as any)}
            </label>
            <input
              type="text"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              className="w-full border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-white/[0.03] text-fg-subtle focus:text-fg focus:border-coral-400 outline-none transition-colors"
            />
          </div>

          <HolographicButton
            type="submit"
            variant="coral"
            size="sm"
            disabled={isSaving}
            className="w-full"
          >
            {isSaving
              ? t("console.policy.syncing" as any)
              : t("console.policy.confirmPolicyBtn" as any)}
          </HolographicButton>
        </form>

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg text-xs flex items-center gap-1.5 border bg-success/10 border-success/20 text-success"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{t("console.policy.success" as any)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </FrostedPanel>

      <FrostedPanel glowColor="coral" sheen className="p-4 space-y-3">
        <h3 className="text-sm font-bold text-fg flex items-center gap-2">
          <Workflow className="w-4 h-4" style={{ color: CORAL }} />
          {t("console.policy.guardIntegrity" as any)}
        </h3>
        <div className="space-y-2">
          {[
            { label: t("console.policy.guardItem1" as any), sub: t("console.policy.guardItem1Sub" as any) },
            { label: t("console.policy.guardItem2" as any), sub: t("console.policy.guardItem2Sub" as any) },
          ].map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="group relative p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 80% 20%, rgba(251,113,133,0.08), transparent 70%)",
                }}
              />
              <div className="relative z-10 space-y-0.5">
                <span className="text-[10px] uppercase font-mono font-bold text-fg-muted tracking-wider">
                  {g.label}
                </span>
                <p className="text-xs font-bold text-fg">{g.sub}</p>
              </div>
              <div
                className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${CORAL}20`, color: CORAL }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <SparklesFX count={3} color={CORAL} className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </FrostedPanel>
    </div>
  );
}

function WhitelistStrip({
  whitelist,
  onDelete,
  onAdd,
}: {
  whitelist: WhitelistItem[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const { t, lang } = useApp();

  return (
    <FrostedPanel glowColor="coral" sheen className="p-5">
      <div className="flex flex-col gap-4 mb-4">
        <div>
          <HudLabel prefix="WHITELIST::" value={`${whitelist.length} ENTRIES`} color="coral" size="sm" />
          <h3 className="mt-1 text-sm font-bold text-fg">
            {t("console.policy.whitelistTitle" as any)}
          </h3>
          <p className="text-[11px] mt-0.5 text-fg-subtle">
            {t("console.policy.whitelistDesc" as any)}
          </p>
        </div>
        <HolographicButton
          onClick={onAdd}
          variant="cyan"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          {t("console.policy.registerBtn" as any)}
        </HolographicButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06] font-mono uppercase text-fg-muted bg-white/[0.02]">
              <th className="font-semibold py-2.5 px-2">
                {t("console.policy.tblName" as any)}
              </th>
              <th className="font-semibold py-2.5 px-2">
                {t("console.policy.tblType" as any)}
              </th>
              <th className="font-semibold py-2.5 px-2 text-right">
                {t("console.policy.tblDate" as any)}
              </th>
              <th className="font-semibold py-2.5 px-2 text-center">
                {t("console.policy.tblAction" as any)}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {whitelist.map((item, idx) => (
                <motion.tr
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative hover:bg-white/[0.02] transition-colors before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[var(--category-color)]"
                  style={{
                    ["--category-color" as string]:
                      item.category === "Developer"
                        ? "#B5FF4D"
                        : item.category === "API Provider"
                        ? "#60A5FA"
                        : item.category === "Ad Network"
                        ? "#C084FC"
                        : "#FB7185",
                  }}
                >
                  <td className="py-3 px-2 relative z-10">
                    <div className="font-bold text-fg text-xs">{item.name}</div>
                    <div className="font-mono text-[10px] mt-0.5 text-fg-subtle">
                      {item.address.substring(0, 10)}...
                      {item.address.substring(item.address.length - 8)}
                    </div>
                  </td>
                  <td className="py-3 px-2 relative z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono leading-none border border-white/[0.08] bg-white/[0.04] text-fg-muted">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-fg-subtle relative z-10">
                    {item.dateRegistered}
                  </td>
                  <td className="py-3 px-2 text-center relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-full transition-colors hover:bg-red-500/10 text-fg-subtle hover:text-danger cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </FrostedPanel>
  );
}
