import { cn } from "@/lib/utils";

interface StatusPillProps {
  children: React.ReactNode;
  status: "success" | "warning" | "danger" | "info" | "neutral";
  pulse?: boolean;
  className?: string;
}

export function StatusPill({ children, status, pulse = false, className }: StatusPillProps) {
  const statusClasses = {
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-400",
    danger: "border-red-500/25 bg-red-500/10 text-red-400",
    info: "border-blue-500/25 bg-blue-500/10 text-blue-400",
    neutral: "border-white/10 bg-white/5 text-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        statusClasses[status],
        className
      )}
    >
      {pulse && <span className={cn("h-1.5 w-1.5 rounded-full", status === "danger" ? "bg-red-400" : status === "warning" ? "bg-amber-400" : "bg-emerald-400", "animate-pulse")} />}
      {children}
    </span>
  );
}
