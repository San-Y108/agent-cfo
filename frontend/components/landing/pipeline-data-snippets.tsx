"use client";

import React from "react";
import { Stage } from "./pipeline-stage-data";

interface DataSnippetProps {
  stage: Stage;
}

export function DataSnippet({ stage }: DataSnippetProps) {
  const lines = stage.dataSnippet.split("\n");

  return (
    <div
      className="relative overflow-hidden rounded-xl border backdrop-blur-sm"
      style={{
        borderColor: stage.accentBorder,
        backgroundColor: "rgba(10, 10, 10, 0.85)",
      }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{
          borderColor: "rgba(255, 255, 255, 0.08)",
          backgroundColor: stage.accentSoft,
        }}
      >
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <span
          className="ml-2 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            color: stage.accent,
          }}
        >
          {stage.key}.log
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-4">
        <pre
          className="overflow-x-auto text-xs leading-relaxed sm:text-sm"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            color: "rgba(255, 255, 255, 0.75)",
          }}
        >
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {highlightLine(line, stage.accent)}
            </div>
          ))}
        </pre>
      </div>

      {/* Bottom accent glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${stage.accent}40, transparent)`,
        }}
      />
    </div>
  );
}

/**
 * Highlight specific patterns in the data snippet:
 * - ✓ / ✗ symbols
 * - ETH addresses (0x...)
 * - Amounts with USDC
 * - Section headers (ALL CAPS lines)
 */
function highlightLine(line: string, accent: string): React.ReactNode {
  // Empty line
  if (!line.trim()) {
    return <span>&nbsp;</span>;
  }

  // Section header: ALL CAPS or starts with [
  if (/^[A-Z][A-Z\s]+/.test(line) || line.startsWith("[")) {
    return (
      <span style={{ color: "rgba(255, 255, 255, 0.95)", fontWeight: 600 }}>
        {line}
      </span>
    );
  }

  // Highlight specific tokens
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Patterns to highlight
  const patterns = [
    { regex: /(0x[\da-fA-F]{4})\.\.\.[\da-fA-F]{4}/g, type: "address" as const },
    { regex: /(\d+\s*USDC)/g, type: "amount" as const },
    { regex: /(✓|✗)/g, type: "status" as const },
  ];

  // Find all matches
  const allMatches: { index: number; text: string; type: string }[] = [];
  for (const { regex, type } of patterns) {
    let match;
    while ((match = regex.exec(line)) !== null) {
      allMatches.push({ index: match.index, text: match[0], type });
    }
  }

  // Sort by index
  allMatches.sort((a, b) => a.index - b.index);

  // Remove overlapping matches
  const uniqueMatches = allMatches.filter((match, i) => {
    if (i === 0) return true;
    const prev = allMatches[i - 1];
    return match.index >= prev.index + prev.text.length;
  });

  // Build parts
  let lastIndex = 0;
  for (const match of uniqueMatches) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} style={{ color: "rgba(255, 255, 255, 0.75)" }}>
          {remaining.slice(lastIndex, match.index)}
        </span>
      );
    }

    let color = accent;
    if (match.type === "status") {
      color = match.text === "✓" ? "#5EEAD4" : "#FB7185";
    }

    parts.push(
      <span key={key++} style={{ color, fontWeight: 500 }}>
        {match.text}
      </span>
    );

    lastIndex = match.index + match.text.length;
  }

  // Remaining text
  if (lastIndex < line.length) {
    parts.push(
      <span key={key++} style={{ color: "rgba(255, 255, 255, 0.75)" }}>
        {remaining.slice(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : line;
}
