"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { HolographicButton } from "@/components/ui/holographic-button";
import { GradientOrb } from "@/components/ui/aceternity/background";
import { BentoCard } from "@/components/ui/aceternity/bento-grid";
import { AnimatedNumber } from "@/components/ui/aceternity/animated-number";
import { Sparkles as SparklesFX } from "@/components/ui/aceternity/sparkles";
import { GradientText } from "@/components/ui/aceternity/colourful-text";

const CORAL = "#FB7185";
const CORAL_LIGHT = "#F43F5E";
const LIME = "#B5FF4D";

/* ─── 5 rule categories (PipelineShowcase big-number style) ─── */
const RULES = [
  { num: "0x1A", titleKey: "risk.1.title", bodyKey: "risk.1.body", color: "#5EEAD4" },
  { num: "0x2B", titleKey: "risk.2.title", bodyKey: "risk.2.body", color: "#FB7185" },
  { num: "0x3C", titleKey: "risk.3.title", bodyKey: "risk.3.body", color: "#B5FF4D" },
  { num: "0x4D", titleKey: "risk.4.title", bodyKey: "risk.4.body", color: "#60A5FA" },
  { num: "0x5E", titleKey: "risk.5.title", bodyKey: "risk.5.body", color: "#C084FC" },
];

function RuleIcon({ color }: { color: string }) {
  return (
    <div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

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

/* ─── Flashing value hook ─── */
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

/* ─── Slider with lime thumb + flashing value + gradient track ─── */
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

/* ─── Page ─── */
export default function PolicyPage() {
  const { t, lang } = useApp();

  const [whitelist, setWhitelist] = useState<WhitelistItem[]>(INITIAL_WHITELIST);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCategory, setNewCategory] = useState<WhitelistItem["category"]>("Developer");

  const [maxSingle, setMaxSingle] = useState(25);
  const [dailyCum, setDailyCum] = useState(100);
  const [autoUnder, setAutoUnder] = useState(10);
  const [slackWebhook, setSlackWebhook] = useState("placeholder-slack-webhook-url");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    setWhitelist([...whitelist, item]);
    setIsAddingItem(false);
    setNewName("");
    setNewAddress("");
  };

  const handleDelete = (id: string) => {
    setWhitelist(whitelist.filter((w) => w.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* ─── Ambient orb: Policy = coral ─── */}
      <GradientOrb color="coral" className="-top-32 -right-32" />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.03]"
      >
        <div>
          <h2
            className="text-xl font-bold tracking-tight text-fg"
          >
            {t("console.policy.title" as any)}
          </h2>
          <p className="text-xs mt-1 text-fg-subtle">{t("console.policy.desc" as any)}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[11px] font-bold bg-surface dark:bg-white/[0.05] border border-border-token dark:border-white/[0.08] text-fg">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: CORAL }} />
          {lang === "zh" ? "实时规则防护活跃中" : "ACTIVE SECURITY RULES"}
        </div>
      </motion.div>

      {/* ── 5 Rules big-number showcase ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {RULES.map((rule, i) => (
          <BentoCard
            key={rule.num}
            index={i}
            glowColor={rule.color}
            title={t(rule.titleKey as any)}
            description={t(rule.bodyKey as any)}
            icon={<RuleIcon color={rule.color} />}
            className="relative overflow-hidden"
          >
            <div className="flex items-end justify-between mt-2">
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[34px] font-bold leading-none tracking-tighter font-mono"
                style={{ color: rule.color }}
              >
                {rule.num}
              </motion.span>
              <SparklesFX count={4} color={rule.color} className="w-12 h-8" />
            </div>
          </BentoCard>
        ))}
      </div>

      {/* ── Main grid: whitelist + adjuster ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Whitelist */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.03] p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-border-token dark:border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-fg">
                  {t("console.policy.whitelistTitle" as any)}
                </h3>
                <p className="text-[11px] mt-0.5 text-fg-subtle">
                  {t("console.policy.whitelistDesc" as any)}
                </p>
              </div>
              <HolographicButton
                onClick={() => setIsAddingItem(true)}
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
                  <tr className="border-b border-border-token dark:border-white/[0.06] font-mono uppercase text-fg-muted bg-surface-2/50 dark:bg-white/[0.02]">
                    <th className="font-semibold py-2.5 px-3">
                      {t("console.policy.tblName" as any)}
                    </th>
                    <th className="font-semibold py-2.5 px-3">
                      {t("console.policy.tblType" as any)}
                    </th>
                    <th className="font-semibold py-2.5 px-3 text-right">
                      {t("console.policy.tblDate" as any)}
                    </th>
                    <th className="font-semibold py-2.5 px-3 text-center">
                      {t("console.policy.tblAction" as any)}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-token dark:divide-white/[0.04]">
                  <AnimatePresence>
                    {whitelist.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="group relative hover:bg-surface-2/50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Hover left color bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            backgroundColor:
                              item.category === "Developer"
                                ? "#B5FF4D"
                                : item.category === "API Provider"
                                ? "#60A5FA"
                                : item.category === "Ad Network"
                                ? "#C084FC"
                                : "#FB7185",
                          }}
                        />
                        <td className="py-3 px-3 relative z-10">
                          <div className="font-bold text-fg text-xs">{item.name}</div>
                          <div className="font-mono text-[10px] mt-0.5 text-fg-subtle">
                            {item.address.substring(0, 10)}...
                            {item.address.substring(item.address.length - 8)}
                          </div>
                        </td>
                        <td className="py-3 px-3 relative z-10">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono leading-none border border-border-token dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.04] text-fg-muted">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-fg-subtle relative z-10">
                          {item.dateRegistered}
                        </td>
                        <td className="py-3 px-3 text-center relative z-10">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(item.id)}
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
          </motion.div>

          {/* Security gateway cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border-token dark:border-white/[0.06] bg-surface dark:bg-white/[0.03] p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              <Workflow className="w-4 h-4" style={{ color: CORAL }} />
              {t("console.policy.guardIntegrity" as any)}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ perspective: "1000px" }}>
              {[
                { label: t("console.policy.guardItem1" as any), sub: t("console.policy.guardItem1Sub" as any) },
                { label: t("console.policy.guardItem2" as any), sub: t("console.policy.guardItem2Sub" as any) },
              ].map((g, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, rotateX: -25, y: 20 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ rotateX: -8, scale: 1.02, z: 20 }}
                  className="group relative p-4 rounded-xl border border-border-token dark:border-white/[0.06] bg-surface-2 dark:bg-white/[0.02] flex items-center justify-between overflow-hidden"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Hover glow */}
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
          </motion.div>
        </div>

        {/* Adjuster panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={cn(
            "rounded-xl border p-6 space-y-5 transition-colors duration-300",
            "bg-surface dark:bg-white/[0.03]",
            saveSuccess
              ? "border-lime-400/60 shadow-[0_0_30px_rgba(181,255,77,0.15)]"
              : "border-border-token dark:border-white/[0.06]"
          )}
        >
          <div className="flex items-center gap-2 border-b border-border-token dark:border-white/[0.06] pb-4 mb-2">
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

          <form onSubmit={handleSave} className="space-y-5">
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
                className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-surface-2 dark:bg-white/[0.03] text-fg-subtle focus:text-fg focus:border-coral-400 outline-none transition-colors"
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
        </motion.div>
      </div>

      {/* ── Add whitelist modal ── */}
      <AnimatePresence>
        {isAddingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-border-token dark:border-white/[0.08] rounded-xl max-w-sm w-full p-6 shadow-2xl relative bg-surface dark:bg-[#0b1120]"
            >
              <button
                onClick={() => setIsAddingItem(false)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-surface-hover dark:hover:bg-white/5 text-fg-subtle transition-colors cursor-pointer"
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
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs bg-surface-2 dark:bg-white/[0.03] text-fg focus:border-coral-400 outline-none transition-colors"
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
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-semibold bg-surface-2 dark:bg-white/[0.03] text-fg focus:border-coral-400 outline-none transition-colors"
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
                    className="w-full border border-border-token dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono bg-surface-2 dark:bg-white/[0.03] text-fg focus:border-coral-400 outline-none transition-colors"
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
