"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Bot, Wallet, FileCheck, AlertTriangle } from "lucide-react";

const RULES = [
  { id: "0x1A", name: "Whitelist", color: "#5EEAD4", icon: Shield },
  { id: "0x2B", name: "Single Limit", color: "#FB7185", icon: Wallet },
  { id: "0x3C", name: "Budget Cap", color: "#B5FF4D", icon: FileCheck },
  { id: "0x4D", name: "Duplicate Guard", color: "#60A5FA", icon: Bot },
  { id: "0x5E", name: "Token Verify", color: "#C084FC", icon: AlertTriangle },
];

interface NeuralGuardrailsGraphProps {
  activeRuleId?: string | null;
  onRuleHover?: (id: string | null) => void;
  className?: string;
}

/**
 * Neural Guardrails Graph — SVG-based force-free visualization.
 * 5 rule nodes orbit a central CAW Core with animated pulse connections.
 */
export function NeuralGuardrailsGraph({
  activeRuleId,
  onRuleHover,
  className,
}: NeuralGuardrailsGraphProps) {
  const reduce = useReducedMotion();
  const center = { x: 200, y: 200 };
  const radius = 130;

  const nodes = RULES.map((rule, i) => {
    const angle = (i * 360) / RULES.length - 90;
    const rad = (angle * Math.PI) / 180;
    return {
      ...rule,
      x: center.x + Math.cos(rad) * radius,
      y: center.y + Math.sin(rad) * radius,
    };
  });

  return (
    <div className={className}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <linearGradient id="guardLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251,113,133,0.2)" />
            <stop offset="100%" stopColor="rgba(251,113,133,0)" />
          </radialGradient>
        </defs>

        {/* Subtle background glow */}
        <circle cx={center.x} cy={center.y} r={radius + 40} fill="url(#coreGrad)" />

        {/* Orbital rings */}
        {[80, 130, 180].map((r, i) => (
          <circle
            key={r}
            cx={center.x}
            cy={center.y}
            r={r}
            fill="none"
            stroke="rgba(251,113,133,0.08)"
            strokeWidth={1}
            strokeDasharray={i === 1 ? "4 4" : undefined}
          />
        ))}

        {/* Connection lines */}
        {nodes.map((node) => (
          <g key={`line-${node.id}`}>
            <line
              x1={center.x}
              y1={center.y}
              x2={node.x}
              y2={node.y}
              stroke="url(#guardLineGrad)"
              strokeWidth={activeRuleId === node.id ? 2 : 1}
              opacity={activeRuleId ? (activeRuleId === node.id ? 1 : 0.3) : 0.6}
            />
            {!reduce && (
              <motion.circle
                r={2.5}
                fill={node.color}
                initial={{ cx: center.x, cy: center.y, opacity: 0 }}
                animate={{
                  cx: [center.x, node.x],
                  cy: [center.y, node.y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: RULES.findIndex((r) => r.id === node.id) * 0.3,
                }}
              />
            )}
          </g>
        ))}

        {/* CAW Core */}
        <motion.g
          animate={reduce ? {} : { scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle
            cx={center.x}
            cy={center.y}
            r={32}
            fill="rgba(11,17,32,0.8)"
            stroke="rgba(251,113,133,0.4)"
            strokeWidth={1.5}
          />
          <text
            x={center.x}
            y={center.y - 4}
            textAnchor="middle"
            className="fill-fg text-[8px] font-mono font-bold uppercase tracking-wider"
          >
            CAW
          </text>
          <text
            x={center.x}
            y={center.y + 8}
            textAnchor="middle"
            className="fill-fg-subtle text-[6px] font-mono uppercase"
          >
            CORE
          </text>
        </motion.g>

        {/* Rule nodes */}
        {nodes.map((node) => {
          const isActive = activeRuleId === node.id;
          const Icon = node.icon;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => onRuleHover?.(node.id)}
              onMouseLeave={() => onRuleHover?.(null)}
              className="cursor-pointer"
            >
              <motion.circle
                r={26}
                fill={isActive ? `${node.color}20` : "rgba(11,17,32,0.8)"}
                stroke={node.color}
                strokeWidth={isActive ? 2 : 1}
                animate={reduce ? {} : { scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  filter: isActive ? `drop-shadow(0 0 12px ${node.color})` : undefined,
                }}
              />
              <g transform="translate(-8, -8)">
                <Icon className="w-4 h-4" style={{ color: node.color }} />
              </g>
              <text
                y={38}
                textAnchor="middle"
                className="fill-fg text-[8px] font-mono font-bold uppercase tracking-wider"
              >
                {node.id}
              </text>
              <text
                y={48}
                textAnchor="middle"
                className="fill-fg-subtle text-[7px] font-mono uppercase"
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
