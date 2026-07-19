"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Shield,
  Sliders,
  CheckCircle,
  Workflow,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { useConsoleState } from "@/lib/console/console-state";
import { HolographicButton } from "@/components/ui/holographic-button";
import { ScrambleValue } from "@/components/ui/gsap-text-effects";
import { NeuralGuardrailsGraph } from "@/components/console/neural-guardrails-graph";
import {
  HudLabel,
  StatusPulse,
  Scanline,
  CornerGlow,
  FrostedPanel,
  ConsolePanelHeader,
  ConsoleModal,
  StageCornerAccent,
  DetailDeckShell,
  PreflightRow,
} from "@/components/console/command-deck";
import { ModuleStageLayout } from "@/components/console/module-stage-layout";
import { useConsoleFlowHighlight } from "@/lib/console/use-console-flow-highlight";

const CORAL = "#FB7185";
const LIME = "#B5FF4D";
// Use the clean isolated guardian robot (shield + check) instead of the busy
// multi-element "audit scene" asset, which read as a broken/detached image at
// this small size.
const POLICY_AUDIT_SCENE_SRC = "/console/mascots/treasury-audit-robot.png";

/** Compact audit scene — right column beside integrity status rows. */
function PolicyAuditSceneAccent() {
  const reduce = useReducedMotion();

  return (
    <div className="relative hidden min-h-[148px] w-[144px] shrink-0 overflow-hidden rounded-xl border border-coral-400/30 bg-gradient-to-br from-coral-400/14 via-violet-500/10 to-surface-2/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(251,113,133,0.1)] sm:block">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 95% 88% at 50% 82%, rgba(251,113,133,0.42) 0%, rgba(192,132,252,0.18) 38%, transparent 72%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-coral-400/40 to-transparent" />

      <motion.div
        className="absolute inset-0 flex items-center justify-center p-1.5"
        animate={reduce ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={POLICY_AUDIT_SCENE_SRC}
          alt="Policy audit guardian"
          className="h-full w-full select-none object-contain object-center"
          draggable={false}
          style={{
            filter:
              "brightness(1.06) contrast(1.12) saturate(1.1) drop-shadow(0 10px 20px rgba(0,0,0,0.38)) drop-shadow(0 0 14px rgba(251,113,133,0.32))",
          }}
        />
      </motion.div>
    </div>
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

/* ─── Slider with lime thumb + Scramble on release ─── */
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
  const [releaseTick, setReleaseTick] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  const finishDrag = () => {
    setDragging(false);
    setReleaseTick((t) => t + 1);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold uppercase font-mono text-fg-muted tracking-wider">
          {label}
        </label>
        <motion.span
          initial={{ scale: 1 }}
          animate={dragging ? { scale: 1 } : { scale: [1, 1.08, 1] }}
          transition={{ duration: 0.35 }}
          className="text-xs font-mono font-bold tabular-nums flex items-center gap-1"
          style={{ color: CORAL }}
        >
          {dragging ? (
            <>
              {value}
              {unit}
            </>
          ) : (
            <ScrambleValue key={releaseTick} value={`${value}${unit}`} duration={0.55} />
          )}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={() => setDragging(true)}
        onPointerUp={finishDrag}
        onTouchStart={() => setDragging(true)}
        onTouchEnd={finishDrag}
        className="hud-range w-full"
        style={
          {
            "--range-fill": LIME,
            "--range-pct": `${pct}%`,
          } as React.CSSProperties
        }
      />
      <p className="text-[10px] leading-tight text-fg-muted">{tip}</p>
    </div>
  );
}

/* ─── Page ─── */
export function PolicyStage() {
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
  const { hasBlockedWhitelist, whitelistBlockedNames } = useConsoleFlowHighlight();

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
    <>
      <ModuleStageLayout
        moduleColor="coral"
        moduleLabel={lang === "zh" ? "策略中心" : "Policy"}
        title={t("console.policy.title" as any) as string}
        subtitle={t("console.policy.desc" as any) as string}
        statusPulse={{
          color: "coral",
          label: hasBlockedWhitelist
            ? lang === "zh"
              ? "白名单告警"
              : "WL ALERT"
            : lang === "zh"
            ? "防护中"
            : "GUARDING",
        }}
        leftRailLabel={_("白名单", "Whitelist")}
        leftRail={
          <WhitelistLeftRail
            whitelist={whitelist}
            onDelete={handleDelete}
            onAdd={() => setIsAddingItem(true)}
            hasBlocked={hasBlockedWhitelist}
            blockedNames={whitelistBlockedNames}
          />
        }
        rightRailLabel={_("阈值调节", "Thresholds")}
        rightRail={
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
        }
        stage={
          <FrostedPanel
            glowColor="coral"
            scanline={hasBlockedWhitelist}
            sheen
            className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-card"
          >
            <CornerGlow color="coral" className="-top-24 -right-24" intensity={0.2} />
            <StageCornerAccent color="coral" />

            <ConsolePanelHeader
              title={_("规则拓扑", "Guardrail Topology")}
              subtitle={
                hasBlockedWhitelist
                  ? _(
                      `Treasury 拦截：${whitelistBlockedNames.join("、")} 不在白名单`,
                      `Treasury blocked: ${whitelistBlockedNames.join(", ")} not whitelisted`
                    )
                  : _("悬停节点查看规则详情", "Hover nodes to inspect rule details")
              }
              hudPrefix="GUARD::"
              hudValue={lang === "zh" ? "三线防护" : "TRI-LINE GUARD"}
              hudColor="coral"
              compact
              trailing={
                <StatusPulse
                  color="coral"
                  label={lang === "zh" ? "在线防护" : "GUARDING"}
                  size="sm"
                />
              }
            />

            {hasBlockedWhitelist && (
              <Scanline color="coral" className="relative z-10 shrink-0" />
            )}

            <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 md:p-5">
              <div className="mx-auto flex min-h-0 w-full flex-1 overflow-hidden">
                <NeuralGuardrailsGraph
                  activeRuleId={activeRuleId}
                  onRuleHover={setActiveRuleId}
                  className="h-full w-full min-h-0"
                />
              </div>
              <div className="mt-2.5 grid shrink-0 grid-cols-2 gap-2 border-t border-border-token/50 pt-2.5 md:grid-cols-4">
                {[
                  { id: "max-single", label: _("单笔上限", "Single limit"), value: `${maxSingle} USDC` },
                  { id: "daily-cum", label: _("日累计", "Daily cap"), value: `${dailyCum} USDC` },
                  { id: "auto-under", label: _("微付阈值", "Micro-pay"), value: `${autoUnder} USDC` },
                  { id: "wl-count", label: _("白名单", "Whitelist"), value: `${whitelist.length} addr` },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onMouseEnter={() => setActiveRuleId(chip.id)}
                    onMouseLeave={() => setActiveRuleId(null)}
                    className={cn(
                      "flex items-center justify-between gap-1 rounded-lg border border-border-token bg-surface-2/40 px-2.5 py-1.5 text-left transition-colors hover:border-coral-400/40",
                      activeRuleId === chip.id && "border-coral-400/50 bg-coral-400/10"
                    )}
                  >
                    <span className="truncate font-mono text-[9px] uppercase text-fg-subtle">{chip.label}</span>
                    <span className="shrink-0 text-[11px] font-bold text-fg">{chip.value}</span>
                  </button>
                ))}
              </div>
            </div>

          </FrostedPanel>
        }
        detailLabel={_("完整性校验", "Integrity & Audit")}
        detailDefaultOpen={true}
        detail={
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <GuardIntegrityPanel />
            <DetailDeckShell glowColor="coral">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                {_("策略预检", "Policy preflight")}
              </p>
              <PreflightRow
                label={_("单笔限额", "Single limit")}
                value={`${maxSingle} USDC`}
                status="ok"
              />
              <PreflightRow
                label={_("月预算", "Monthly budget")}
                value={`${dailyCum} USDC`}
                status="ok"
              />
              <PreflightRow
                label={_("白名单条目", "Whitelist entries")}
                value={String(whitelist.length)}
                status={hasBlockedWhitelist ? "warn" : "ok"}
              />
              {hasBlockedWhitelist && (
                <p className="mt-2 text-[10px] text-coral-300">
                  {_("Treasury 拦截：", "Treasury blocked: ")}
                  {whitelistBlockedNames.join(", ")}
                </p>
              )}
              <p className="mt-2 text-[10px] text-fg-muted">
                {_("提交阈值修改后，CAW 安全层会同步策略版本。", "After commit, CAW secure layer syncs policy revision.")}
              </p>
            </DetailDeckShell>
          </div>
        }
      />

      {/* ── Add whitelist modal ── */}
      <ConsoleModal
        open={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        title={lang === "zh" ? "注册白名单地址" : "Register Whitelisted Address"}
        description={
          lang === "zh"
            ? "在 AgentCFO 安全扫描任务之前绑定链上公钥公开地址。"
            : "Register a cryptographic public address to verify transactions within AgentCFO scan batches."
        }
        maxWidth="sm"
        footer={
          <>
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
              form="add-whitelist-form"
              variant="coral"
              size="sm"
            >
              {lang === "zh" ? "确立注册" : "Confirm Registry"}
            </HolographicButton>
          </>
        }
      >
        <form id="add-whitelist-form" onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold mb-1 text-fg-muted">
              {lang === "zh" ? "备注标签/姓名" : "Friendly Label"}
            </label>
            <input
              type="text"
              placeholder="E.g. Bob UI Designer"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="console-field w-full focus:border-hud-coral"
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
              className="console-field w-full font-semibold focus:border-hud-coral"
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
              className="console-field w-full font-mono focus:border-hud-coral"
              required
            />
          </div>
        </form>
      </ConsoleModal>
    </>
  );
}

/* =============================================================================
 * GUARD INTEGRITY — Moved to DetailDeck
 * ===========================================================================*/

function GuardIntegrityPanel() {
  const { t } = useApp();

  return (
    <FrostedPanel glowColor="coral" sheen className="p-4">
      <div className="flex items-stretch gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-fg">
            <Workflow className="h-4 w-4" style={{ color: CORAL }} />
            {t("console.policy.guardIntegrity" as any)}
          </h3>
          <div className="space-y-2">
            {[
              { label: t("console.policy.guardItem1" as any), sub: t("console.policy.guardItem1Sub" as any) },
              { label: t("console.policy.guardItem2" as any), sub: t("console.policy.guardItem2Sub" as any) },
            ].map((g, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border-token bg-surface-2/40 p-3"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted">
                    {g.label}
                  </span>
                  <p className="text-xs font-bold text-fg">{g.sub}</p>
                </div>
                <CheckCircle className="h-4 w-4 shrink-0" style={{ color: CORAL }} />
              </div>
            ))}
          </div>
        </div>
        <PolicyAuditSceneAccent />
      </div>
    </FrostedPanel>
  );
}

/* =============================================================================
 * THRESHOLD SATELLITE — Right-side limit adjuster (compact)
 * ===========================================================================*/

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <FrostedPanel
        glowColor="coral"
        sheen
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden rounded-card p-3.5 transition-colors duration-300",
          saveSuccess && "border-lime-400/60 shadow-[0_0_30px_rgba(181,255,77,0.15)]"
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border-token pb-3">
          <Sliders className="h-4 w-4 shrink-0" style={{ color: CORAL }} />
          <div className="min-w-0">
            <h4 className="text-[13px] font-bold leading-tight text-fg">
              {t("console.policy.adjusterTitle" as any)}
            </h4>
            <p className="mt-0.5 text-[10px] leading-snug text-fg-muted">
              {t("console.policy.adjusterDesc" as any)}
            </p>
          </div>
        </div>

        <form
          onSubmit={onSave}
          className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
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

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold uppercase font-mono text-fg-muted tracking-wider">
                {t("console.policy.slackWebhook" as any)}
              </label>
              <input
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="console-field w-full font-mono focus:border-hud-coral"
              />
            </div>
          </div>

          <div className="shrink-0 space-y-2 border-t border-border-token pt-3">
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

            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 rounded-lg border border-success/20 bg-success/10 p-3 text-xs text-success"
                >
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{t("console.policy.success" as any)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </FrostedPanel>
    </div>
  );
}

/* =============================================================================
 * WHITELIST LEFT RAIL — compact scrollable list in left column
 * ===========================================================================*/

function WhitelistLeftRail({
  whitelist,
  onDelete,
  onAdd,
  hasBlocked,
  blockedNames,
}: {
  whitelist: WhitelistItem[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  hasBlocked: boolean;
  blockedNames: string[];
}) {
  const { t, lang } = useApp();

  return (
    <FrostedPanel glowColor="coral" sheen className="flex h-full min-h-0 flex-col rounded-card p-3">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
        <div>
          <HudLabel prefix="WL::" value={`${whitelist.length}`} color="coral" size="sm" />
          <h3 className="mt-1 text-[12px] font-bold text-fg">
            {t("console.policy.whitelistTitle" as any)}
          </h3>
        </div>
        <HolographicButton
          onClick={onAdd}
          variant="cyan"
          size="sm"
          icon={<Plus className="w-3 h-3" />}
        >
          +
        </HolographicButton>
      </div>

      {hasBlocked && (
        <div className="mb-2 shrink-0 rounded-lg border border-coral-400/30 bg-coral-400/10 px-2 py-1.5 text-[10px] text-coral-200">
          {lang === "zh" ? "拦截：" : "Blocked: "}
          {blockedNames.join(", ")}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        <AnimatePresence>
          {whitelist.map((item) => {
            const categoryColor =
              item.category === "Developer"
                ? "var(--hud-lime)"
                : item.category === "API Provider"
                ? "var(--hud-blue)"
                : item.category === "Ad Network"
                ? "var(--hud-violet)"
                : "var(--hud-coral)";
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="group relative rounded-lg border border-border-token bg-surface-2/40 p-2.5 transition-colors hover:border-hud-coral/25"
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-lg"
                  style={{ backgroundColor: categoryColor }}
                />
                <div className="flex items-start justify-between gap-1 pl-1">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-fg">{item.name}</p>
                    <p className="mt-0.5 font-mono text-[9px] text-fg-muted">
                      {item.address.slice(0, 8)}…{item.address.slice(-6)}
                    </p>
                    <span className="mt-1 inline-block rounded border border-border-token px-1.5 py-0.5 text-[9px] text-fg-muted">
                      {item.category}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(item.id)}
                    className="shrink-0 rounded p-1 text-fg-muted hover:bg-red-500/10 hover:text-danger"
                  >
                    <Trash2 className="h-3 w-3" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </FrostedPanel>
  );
}

/* =============================================================================
 * WHITELIST STRIP — legacy horizontal table (kept for reference / mobile fallback)
 * ===========================================================================*/

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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

      {/* Mobile: card list */}
      <div className="space-y-2 md:hidden">
        <AnimatePresence>
          {whitelist.map((item) => {
            const categoryColor =
              item.category === "Developer"
                ? "var(--hud-lime)"
                : item.category === "API Provider"
                ? "var(--hud-blue)"
                : item.category === "Ad Network"
                ? "var(--hud-violet)"
                : "var(--hud-coral)";
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative overflow-hidden rounded-xl border border-border-token bg-surface-2/40 p-3"
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ backgroundColor: categoryColor }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-fg">{item.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-fg-subtle">
                      {item.address.substring(0, 10)}...
                      {item.address.substring(item.address.length - 8)}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(item.id)}
                    className="shrink-0 rounded-full p-1.5 text-fg-subtle transition-colors hover:bg-red-500/10 hover:text-danger"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded border border-border-token bg-surface-hover px-2 py-0.5 font-mono text-[10px] leading-none text-fg-muted">
                    {item.category}
                  </span>
                  <span className="font-mono text-[10px] text-fg-subtle">
                    {item.dateRegistered}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-border-token font-mono uppercase text-fg-muted bg-surface-2/40">
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
          <tbody className="divide-y divide-border-token">
            <AnimatePresence>
              {whitelist.map((item, idx) => (
                <motion.tr
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative hover:bg-surface-2/40 transition-colors before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[var(--category-color)]"
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
                  <td className="py-3 px-3 relative z-10">
                    <div className="font-bold text-fg text-xs">{item.name}</div>
                    <div className="font-mono text-[10px] mt-0.5 text-fg-subtle">
                      {item.address.substring(0, 10)}...
                      {item.address.substring(item.address.length - 8)}
                    </div>
                  </td>
                  <td className="py-3 px-3 relative z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono leading-none border border-border-token bg-surface-hover text-fg-muted">
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
