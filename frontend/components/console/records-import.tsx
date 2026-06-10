"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ClipboardPaste,
} from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { ContributorRecord } from "@/lib/types/console";

/* =============================================================================
 * RECORDS IMPORT — batch contribution records input (CSV upload / JSON paste)
 *
 * Planning doc requires a "contribution records input" beyond the inline
 * single-row form. This modal accepts:
 *   - CSV upload / paste: header row `name,wallet,amount[,role,task,token]`
 *   - JSON paste: array of objects with at least { name, wallet, amount }
 * Rows are validated and previewed before import; only valid rows import.
 * ===========================================================================*/

type Mode = "csv" | "json";

interface ParsedRow {
  raw: Partial<ContributorRecord>;
  errors: string[];
}

const WALLET_RE = /^0x[a-zA-Z0-9]{8,}$/;

function validateRow(raw: Partial<ContributorRecord>): ParsedRow {
  const errors: string[] = [];
  if (!raw.name || !String(raw.name).trim()) errors.push("name");
  if (!raw.wallet || !WALLET_RE.test(String(raw.wallet).trim())) errors.push("wallet");
  const amount = Number(raw.amount);
  if (!Number.isFinite(amount) || amount <= 0) errors.push("amount");
  return { raw, errors };
}

/** Minimal quote-aware CSV line splitter (handles `"a,b",c`). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const header = splitCsvLine(lines[0].toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  // Header row is required; bail out (all-invalid row) if mandatory columns missing
  if (idx("name") < 0 || idx("wallet") < 0 || idx("amount") < 0) {
    return [{ raw: {}, errors: ["header"] }];
  }

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const pick = (k: string) => (idx(k) >= 0 ? cells[idx(k)] : undefined);
    return validateRow({
      name: pick("name"),
      wallet: pick("wallet"),
      amount: pick("amount") as unknown as number,
      role: pick("role") || "Contributor",
      task: pick("task") || "Imported record",
      token: pick("token") || "USDC",
    });
  });
}

function parseJson(text: string): ParsedRow[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return [{ raw: {}, errors: ["json"] }];
  }
  const arr = Array.isArray(data) ? data : [data];
  return arr.map((item) => {
    const o = (item ?? {}) as Record<string, unknown>;
    return validateRow({
      name: o.name as string,
      wallet: o.wallet as string,
      amount: o.amount as number,
      role: (o.role as string) || "Contributor",
      task: (o.task as string) || "Imported record",
      token: (o.token as string) || "USDC",
    });
  });
}

const CSV_EXAMPLE = `name,wallet,amount,task
Dana,0xDana567890abcdef1234567890abcdef123456,8,Community moderation
Evan,0xEvan567890abcdef1234567890abcdef123456,12,Smart contract review`;

const JSON_EXAMPLE = `[
  { "name": "Dana", "wallet": "0xDana567890abcdef1234567890abcdef123456", "amount": 8, "task": "Community moderation" },
  { "name": "Evan", "wallet": "0xEvan567890abcdef1234567890abcdef123456", "amount": 12, "task": "Smart contract review" }
]`;

export function RecordsImport({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (records: ContributorRecord[]) => void;
}) {
  const { lang } = useApp();
  const _ = (zh: string, en: string) => (lang === "zh" ? zh : en);

  const [mode, setMode] = useState<Mode>("csv");
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo<ParsedRow[]>(() => {
    if (!text.trim()) return [];
    return mode === "csv" ? parseCsv(text) : parseJson(text);
  }, [text, mode]);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const headerError = rows.length === 1 && (rows[0].errors.includes("header") || rows[0].errors.includes("json"));

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  }, []);

  const handleImport = () => {
    const records: ContributorRecord[] = validRows.map((r, i) => ({
      id: `rec_import_${Date.now()}_${i}`,
      name: String(r.raw.name).trim(),
      role: String(r.raw.role || "Contributor"),
      task: String(r.raw.task || "Imported record"),
      wallet: String(r.raw.wallet).trim(),
      amount: Number(r.raw.amount),
      token: String(r.raw.token || "USDC"),
    }));
    onImport(records);
    setText("");
    onClose();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setText("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-border-token dark:border-white/[0.08] bg-surface dark:bg-[#121212] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border-token dark:border-white/[0.06] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#B5FF4D]" />
                <span className="text-sm font-semibold text-fg">
                  {_("批量导入贡献记录", "Import Contribution Records")}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-fg-subtle hover:text-fg hover:bg-surface-2 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Mode tabs */}
              <div className="flex items-center gap-1 rounded-lg p-1 bg-surface-2 dark:bg-white/[0.04] w-fit">
                {(
                  [
                    { key: "csv", icon: <FileSpreadsheet className="w-3.5 h-3.5" />, label: "CSV" },
                    { key: "json", icon: <FileJson className="w-3.5 h-3.5" />, label: "JSON" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => switchMode(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      mode === tab.key
                        ? "bg-[#B5FF4D] text-[#0D0D0D]"
                        : "text-fg-subtle hover:text-fg"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Input area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-fg-subtle font-mono uppercase">
                    {mode === "csv"
                      ? _("粘贴 CSV（首行表头 name,wallet,amount）或上传文件", "Paste CSV (header: name,wallet,amount) or upload file")
                      : _("粘贴 JSON 数组（含 name / wallet / amount）", "Paste a JSON array with name / wallet / amount")}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setText(mode === "csv" ? CSV_EXAMPLE : JSON_EXAMPLE)}
                      className="text-[11px] text-fg-subtle hover:text-fg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3 h-3" />
                      {_("填入示例", "Fill example")}
                    </button>
                    {mode === "csv" && (
                      <>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".csv,text/csv"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(f);
                            e.target.value = "";
                          }}
                        />
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="text-[11px] text-fg-subtle hover:text-fg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          {_("上传 .csv", "Upload .csv")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={mode === "csv" ? CSV_EXAMPLE : JSON_EXAMPLE}
                  spellCheck={false}
                  rows={6}
                  className="w-full px-3 py-2.5 text-[12px] font-mono rounded-lg border border-border-token dark:border-white/[0.08] bg-surface dark:bg-white/[0.03] text-fg outline-none focus:border-[#B5FF4D] transition-colors resize-y placeholder:text-fg-subtle/50"
                />
              </div>

              {/* Parse feedback */}
              {headerError && (
                <div className="p-3 rounded-lg border border-[#FB7185]/20 bg-[#FB7185]/5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
                  <span className="text-[11px]" style={{ color: "#FB7185" }}>
                    {mode === "csv"
                      ? _("CSV 解析失败：首行必须包含 name / wallet / amount 表头。", "CSV parse failed: header row must include name / wallet / amount.")
                      : _("JSON 解析失败：请检查是否为合法 JSON 数组。", "JSON parse failed: make sure it is a valid JSON array.")}
                  </span>
                </div>
              )}

              {/* Preview table */}
              {rows.length > 0 && !headerError && (
                <div className="rounded-lg border border-border-token dark:border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface-2 dark:bg-white/[0.03] border-b border-border-token dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-fg-muted">
                      {_("预览", "Preview")}
                    </span>
                    <span className="text-[11px] text-fg-subtle">
                      <span className="text-success font-semibold">{validRows.length}</span>
                      {" "}{_("有效", "valid")} ·{" "}
                      <span className={rows.length - validRows.length > 0 ? "text-[#FB7185] font-semibold" : ""}>
                        {rows.length - validRows.length}
                      </span>
                      {" "}{_("无效", "invalid")}
                    </span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-left text-[12px]">
                      <tbody className="divide-y divide-border-token dark:divide-white/[0.04]">
                        {rows.map((row, i) => (
                          <tr key={i} className={row.errors.length > 0 ? "bg-[#FB7185]/5" : ""}>
                            <td className="py-2 px-4 w-8">
                              {row.errors.length === 0 ? (
                                <CheckCircle className="w-3.5 h-3.5 text-success" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-[#FB7185]" />
                              )}
                            </td>
                            <td className="py-2 px-2 font-medium text-fg">
                              {String(row.raw.name || "—")}
                            </td>
                            <td className="py-2 px-2 font-mono text-[10px] text-fg-subtle">
                              {row.raw.wallet
                                ? `${String(row.raw.wallet).substring(0, 10)}...`
                                : "—"}
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-fg">
                              {row.raw.amount != null && row.raw.amount !== ("" as unknown as number)
                                ? `${row.raw.amount} ${row.raw.token || "USDC"}`
                                : "—"}
                            </td>
                            <td className="py-2 px-4 text-[10px] text-[#FB7185] font-mono">
                              {row.errors.length > 0
                                ? `${_("缺失/非法", "bad")}: ${row.errors.join(", ")}`
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border-token dark:border-white/[0.06] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-fg-subtle">
                {_("仅导入有效行；无效行会被跳过。", "Only valid rows import; invalid rows are skipped.")}
              </span>
              <button
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="px-4 py-2 rounded-lg text-[12px] font-bold bg-[#B5FF4D] hover:brightness-95 text-[#0D0D0D] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {_("导入", "Import")} {validRows.length > 0 ? `(${validRows.length})` : ""}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
