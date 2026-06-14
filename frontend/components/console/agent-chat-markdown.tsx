"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 [&:only-child]:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-fg">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-fg-muted">{children}</em>,
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code
          className={cn(
            "block overflow-x-auto rounded-lg border border-border-token bg-surface-2/80 px-3 py-2 font-mono text-[12px] leading-relaxed text-fg",
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-hud-cyan"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border-token bg-surface-2/80 p-3 font-mono text-[12px] leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-border-token">
      <table className="w-full min-w-[220px] border-collapse text-left text-[13px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border-token bg-surface-2/80">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border-token/60 last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold text-fg-muted">{children}</th>
  ),
  td: ({ children }) => <td className="px-3 py-2 align-top text-fg">{children}</td>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 marker:text-hud-lime">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-hud-lime">{children}</ol>
  ),
  li: ({ children }) => <li className="text-fg">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-2 text-[16px] font-semibold text-fg">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 text-[15px] font-semibold text-fg">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 text-[14px] font-semibold text-fg">{children}</h3>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-hud-cyan underline underline-offset-2 transition-colors hover:text-hud-lime"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-hud-lime/40 pl-3 text-fg-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border-token" />,
};

export function hasAgentMarkdown(text: string): boolean {
  return /(\*\*|__|`|^\s*[-*+]\s|^\s*\d+\.\s|^\s*\|.+\|)/m.test(text);
}

export function AgentChatMarkdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("agent-chat-markdown break-words", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
