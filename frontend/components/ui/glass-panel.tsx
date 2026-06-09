import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  accent?: "gold" | "blue" | "emerald" | "red" | "none";
  hover?: boolean;
}

export function GlassPanel({ children, className, accent = "none", hover = false }: GlassPanelProps) {
  const accentClasses = {
    gold: "before:bg-gradient-to-r before:from-amber-500/30 before:via-amber-500/10 before:to-transparent",
    blue: "before:bg-gradient-to-r before:from-blue-500/30 before:via-blue-500/10 before:to-transparent",
    emerald: "before:bg-gradient-to-r before:from-emerald-500/30 before:via-emerald-500/10 before:to-transparent",
    red: "before:bg-gradient-to-r before:from-red-500/30 before:via-red-500/10 before:to-transparent",
    none: "before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-transparent",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0B1120]/60 backdrop-blur-xl",
        "before:absolute before:inset-x-0 before:top-0 before:h-px",
        accentClasses[accent],
        hover && "transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0B1120]/80",
        className
      )}
    >
      {children}
    </div>
  );
}
