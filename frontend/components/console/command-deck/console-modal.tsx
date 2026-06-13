"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConsoleModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
  className?: string;
}

const maxWidthClasses: Record<NonNullable<ConsoleModalProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function ConsoleModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  showCloseButton = true,
  className,
}: ConsoleModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-fg/25 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full rounded-card border border-border-token bg-surface p-6 shadow-2xl",
              maxWidthClasses[maxWidth],
              className
            )}
          >
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <h3 className="pr-6 text-base font-bold text-fg">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-fg-muted">{description}</p>
            )}

            {children && <div className="mt-4">{children}</div>}

            {footer && <div className="mt-5 flex items-center justify-end gap-2.5">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
