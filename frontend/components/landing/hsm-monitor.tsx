"use client";

import React, { useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { ROUTES } from "@/lib/constants/routes";

const HASH_STREAM =
  "a3f8c2e1 · 9b4d7f0a · e2c8915b · 7f3a0d4e · c8b1e6f2 · 4a9d2c7b · f0e3b8a1 · 6c2f9d4e · ";

const LOAD_BY_PROBE = ["18%", "24%", "31%", "38%"] as const;

const PROBE_LOGS = [
  "> ECDSA_SIGN latency=0.12ms [PASS]",
  "> MULTISIG quorum=2/3 [VALID]",
  "> AES-256-GCM cipher=READY [OK]",
  "> POLICY_ENGINE rules=4 [ACTIVE]",
] as const;

const STAT_REGS = ["0x00", "0x01", "0x02", "0x03"] as const;

function StatTile({
  label,
  value,
  highlight = false,
  reg,
  tileRef,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  reg: string;
  tileRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={tileRef}
      className="relative overflow-hidden rounded-sm p-3 transition-transform duration-200"
      style={{
        background:
          "linear-gradient(145deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%)",
        border: "1px solid rgba(181,255,77,0.12)",
        boxShadow: `
          inset 0 0 0 1px rgba(0,0,0,0.5),
          inset 0 1px 0 rgba(181,255,77,0.06)
        `,
      }}
    >
      <div className="hsm-stat-sweep" aria-hidden />
      <span className="absolute right-2 top-1.5 font-mono text-[7px] tracking-widest text-[#B5FF4D]/35">
        REG[{reg}]
      </span>
      <span className="relative mb-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      <span
        className="hsm-phosphor relative block font-mono text-xs font-bold tracking-tight"
        style={{ color: highlight ? "#B5FF4D" : "#d4ffd0" }}
      >
        {value}
      </span>
    </div>
  );
}

export function HSMMonitor() {
  const t = useT();
  const reduce = useReducedMotion();

  const vaultRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setProbeVars = (
    el: HTMLDivElement,
    px: number,
    py: number,
    box: DOMRect,
    active: boolean
  ) => {
    const mx = (px / box.width) * 100;
    const my = (py / box.height) * 100;
    const cx = px - box.width / 2;
    const cy = py - box.height / 2;
    const angle = Math.atan2(cy, cx) * (180 / Math.PI);

    el.style.setProperty("--mx", `${mx}%`);
    el.style.setProperty("--my", `${my}%`);
    el.style.setProperty("--px", `${px}px`);
    el.style.setProperty("--py", `${py}px`);
    el.style.setProperty("--angle", `${angle}deg`);
    el.style.setProperty("--coord-x", `0x${Math.round(px).toString(16).toUpperCase().padStart(3, "0")}`);
    el.style.setProperty("--coord-y", `0x${Math.round(py).toString(16).toUpperCase().padStart(3, "0")}`);
    const coordX = el.querySelector(".hsm-coord-x");
    const coordY = el.querySelector(".hsm-coord-y");
    if (coordX) coordX.textContent = el.style.getPropertyValue("--coord-x");
    if (coordY) coordY.textContent = el.style.getPropertyValue("--coord-y");
    el.dataset.active = active ? "1" : "0";
  };

  const restartSweep = (tile: HTMLDivElement) => {
    const sweep = tile.querySelector(".hsm-stat-sweep") as HTMLElement | null;
    if (!sweep) return;
    sweep.style.animation = "none";
    void sweep.offsetWidth;
    sweep.style.animation = "";
  };

  const updateProbedStat = (px: number, py: number, box: DOMRect) => {
    let probed = -1;
    statRefs.current.forEach((tile, i) => {
      if (!tile) return;
      const r = tile.getBoundingClientRect();
      const inside =
        px >= r.left - box.left &&
        px <= r.right - box.left &&
        py >= r.top - box.top &&
        py <= r.bottom - box.top;

      const wasProbed = tile.classList.contains("hsm-stat-probed");
      tile.classList.toggle("hsm-stat-probed", inside);
      if (inside) {
        probed = i;
        if (!wasProbed) restartSweep(tile);
      }
    });

    const el = vaultRef.current;
    if (el) {
      el.style.setProperty("--probe", String(Math.max(0, probed)));
      const load = probed >= 0 ? LOAD_BY_PROBE[probed] : "14%";
      el.style.setProperty("--load-pct", load);
      const loadLabel = el.querySelector(".hsm-load-label");
      if (loadLabel) loadLabel.textContent = load;
      const logLine = el.querySelector(".hsm-log-line");
      if (logLine) {
        logLine.textContent =
          probed >= 0 ? PROBE_LOGS[probed] : "> await probe input_";
      }
    }

  };

  useLayoutEffect(() => {
    const el = vaultRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    setProbeVars(el, box.width / 2, box.height / 2, box, false);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = vaultRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    setProbeVars(el, px, py, box, true);
    updateProbedStat(px, py, box);
  };

  const handlePointerLeave = () => {
    const el = vaultRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    setProbeVars(el, box.width / 2, box.height / 2, box, false);
    statRefs.current.forEach((tile) => tile?.classList.remove("hsm-stat-probed"));
    el.style.setProperty("--load-pct", "14%");
    const loadLabel = el.querySelector(".hsm-load-label");
    if (loadLabel) loadLabel.textContent = "14%";
    const logLine = el.querySelector(".hsm-log-line");
    if (logLine) logLine.textContent = "> await probe input_";
  };

  return (
    <div className="md:col-span-2 flex h-full items-center justify-center py-4 md:py-0">
      <div
        ref={vaultRef}
        data-active="0"
        className="hsm-vault relative flex min-h-[440px] w-full cursor-crosshair flex-col justify-between overflow-hidden rounded-sm border border-[#B5FF4D]/20 p-5 font-mono backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:scale-[1.01] hover:border-[#B5FF4D]/35 hover:shadow-[0_0_40px_rgba(181,255,77,0.14)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,8,4,0.98) 0%, rgba(2,4,2,1) 50%, rgba(0,0,0,1) 100%)",
          boxShadow: `
            0 32px 64px -20px rgba(0,0,0,0.85),
            inset 0 0 60px rgba(181,255,77,0.02),
            inset 0 1px 0 rgba(181,255,77,0.08)
          `,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="hsm-bit-grid pointer-events-none absolute inset-0 z-[1] opacity-40" />
        <div className="hsm-crt pointer-events-none absolute inset-0 z-[9] rounded-sm" />

        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[min(340px,90%)] w-[min(340px,90%)] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <g className={reduce ? "" : "animate-hsm-seal-spin"}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="rgba(181,255,77,0.35)"
              strokeWidth="0.6"
              strokeDasharray="3 9"
            />
            <circle
              cx="100"
              cy="100"
              r="58"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.4"
            />
          </g>
          <g className={reduce ? "" : "animate-hsm-seal-spin-rev"}>
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(181,255,77,0.18)"
              strokeWidth="0.5"
              strokeDasharray="1 14"
            />
            <text
              x="100"
              y="104"
              textAnchor="middle"
              fill="rgba(181,255,77,0.25)"
              fontSize="7"
              fontFamily="ui-monospace, monospace"
              letterSpacing="3"
            >
              HSM-CAW
            </text>
          </g>
        </svg>

        <div className="hsm-hex-breach pointer-events-none absolute inset-0 z-[2] rounded-sm opacity-90" />
        <div className="hsm-foil pointer-events-none absolute inset-0 z-[3] rounded-sm opacity-35 transition-opacity duration-200" />
        <div className="hsm-probe-beam pointer-events-none absolute z-[6]" />
        <div className="hsm-probe-band pointer-events-none absolute z-[7]" />

        <div className="hsm-scanner pointer-events-none absolute inset-0 z-[8] overflow-hidden rounded-sm">
          <div className="hsm-crosshair-h" />
          <div className="hsm-crosshair-v" />
          <div className="hsm-reticle-bracket hsm-reticle-bracket-tl" />
          <div className="hsm-reticle-bracket hsm-reticle-bracket-tr" />
          <div className="hsm-reticle-bracket hsm-reticle-bracket-bl" />
          <div className="hsm-reticle-bracket hsm-reticle-bracket-br" />
          {!reduce && (
            <>
              <div className="hsm-ring hsm-ring-1" />
              <div className="hsm-ring hsm-ring-2" />
            </>
          )}
          <div className="hsm-reticle">
            <div className="hsm-reticle-core" />
            {!reduce && <div className="hsm-reticle-ring" />}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[4] rounded-2xl opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <div
            key={pos}
            className="pointer-events-none absolute z-20 h-4 w-4 transition-colors duration-200"
            style={{
              top: pos.startsWith("t") ? 10 : undefined,
              bottom: pos.startsWith("b") ? 10 : undefined,
              left: pos.endsWith("l") ? 10 : undefined,
              right: pos.endsWith("r") ? 10 : undefined,
              borderTop: pos.startsWith("t")
                ? "1.5px solid rgba(181,255,77,0.35)"
                : undefined,
              borderBottom: pos.startsWith("b")
                ? "1.5px solid rgba(255,255,255,0.12)"
                : undefined,
              borderLeft: pos.endsWith("l")
                ? "1.5px solid rgba(181,255,77,0.35)"
                : undefined,
              borderRight: pos.endsWith("r")
                ? "1.5px solid rgba(255,255,255,0.12)"
                : undefined,
            }}
          />
        ))}

        <div
          className="animate-hsm-scan pointer-events-none absolute left-0 right-0 z-[5] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(181,255,77,0.55), transparent)",
          }}
        />

        <div className="pointer-events-none absolute bottom-14 left-4 z-[11] font-mono text-[8px] tracking-wider text-[#B5FF4D]/50">
          <span className="hsm-coords transition-opacity duration-200">
            ADDR:<span className="hsm-coord-x text-[#B5FF4D]/80">0x000</span>
            {" · "}OFF:<span className="hsm-coord-y text-[#B5FF4D]/80">0x000</span>
          </span>
        </div>

        <div className="relative z-10 space-y-3">
          <div className="border border-[#B5FF4D]/15 bg-black/40 px-3 py-2 text-[8px] tracking-wide text-[#B5FF4D]/45">
            ┌─ PKCS#11 · FIPS 140-2 L3 · SECP256k1 · CAW-BUS v2.1 ─┐
          </div>

          <div className="flex items-center justify-between border-b border-[#B5FF4D]/15 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#B5FF4D]">#</span>
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#B5FF4D] opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-[#B5FF4D]" />
              </span>
              <span className="hsm-phosphor text-[10px] font-bold uppercase tracking-[0.22em] text-[#B5FF4D]">
                {t("hsm.header")}
              </span>
              <span className="hsm-cursor-blink text-[#B5FF4D]">█</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hsm-probe-badge hsm-glitch-badge border border-[#B5FF4D]/50 bg-[#B5FF4D]/10 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.2em] text-[#B5FF4D]">
                [PROBE::ON]
              </span>
              <span className="border border-white/15 bg-black/50 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/70">
                TLS1.3
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-[#B5FF4D]/10 bg-black/50 px-2 py-1.5 text-[8px] text-[#B5FF4D]/70">
            <span className="text-[#B5FF4D]/40">shell@hsm-caw:~$ </span>
            <span className="hsm-log-line hsm-phosphor">{"> await probe input_"}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <StatTile
              tileRef={(el) => {
                statRefs.current[0] = el;
              }}
              reg={STAT_REGS[0]}
              label={t("hsm.latency")}
              value="0.12ms :: FAST"
              highlight
            />
            <StatTile
              tileRef={(el) => {
                statRefs.current[1] = el;
              }}
              reg={STAT_REGS[1]}
              label={t("hsm.quorum")}
              value="2/3 :: REGISTERED"
            />
            <StatTile
              tileRef={(el) => {
                statRefs.current[2] = el;
              }}
              reg={STAT_REGS[2]}
              label={t("hsm.encryption")}
              value="AES-256-GCM"
            />
            <StatTile
              tileRef={(el) => {
                statRefs.current[3] = el;
              }}
              reg={STAT_REGS[3]}
              label={t("hsm.policies")}
              value="4 :: ACTIVE"
              highlight
            />
          </div>

          <div
            className="relative mt-1 space-y-2 overflow-hidden rounded-sm border border-[#B5FF4D]/12 bg-black/55 p-3"
          >
            <div className="flex justify-between text-[8px] uppercase tracking-wider text-[#B5FF4D]/45">
              <span>{t("hsm.load")}</span>
              <span className="font-bold text-[#B5FF4D]/90">
                <span className="hsm-load-label">14%</span>
                <span className="ml-1 text-[#B5FF4D]/40">CPU</span>
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-sm bg-black/80 ring-1 ring-[#B5FF4D]/15">
              <div
                className="hsm-load-fill relative h-full transition-[width] duration-300"
                style={{
                  width: "14%",
                  background: "repeating-linear-gradient(90deg, #6fd628 0px, #6fd628 4px, #B5FF4D 4px, #B5FF4D 8px)",
                  boxShadow: "0 0 12px rgba(181,255,77,0.6)",
                }}
              />
            </div>
            <div className="flex justify-between text-[7px] text-white/25">
              <span>0x00</span>
              <span>0xFF</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 space-y-2 border-t border-[#B5FF4D]/12 pt-3">
          <div className="overflow-hidden rounded-sm border border-[#B5FF4D]/10 bg-black/60 py-1">
            <div
              className={`flex whitespace-nowrap text-[7px] tracking-[0.2em] text-[#B5FF4D]/30 ${reduce ? "" : "animate-hsm-hash-scroll"}`}
            >
              <span className="px-2">SHA256::{HASH_STREAM}</span>
              <span className="px-2" aria-hidden>
                SHA256::{HASH_STREAM}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="tracking-wide text-[#B5FF4D]/45">
              [OK] COBO_CLIENT::INTG
            </span>
            <a
              href={ROUTES.console}
              className="group/cta flex items-center gap-1 border border-[#B5FF4D]/30 bg-[#B5FF4D]/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B5FF4D] transition-all hover:border-[#B5FF4D]/60 hover:bg-[#B5FF4D]/10"
            >
              {t("hsm.enter")}
              <ArrowRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
            </a>
          </div>
          <div className="text-right text-[7px] tracking-[0.25em] text-[#B5FF4D]/25">
            └─ NODE_ID: CAW-90A81D-CFO · UPTIME: 99.97% ─┘
          </div>
        </div>
      </div>
    </div>
  );
}
