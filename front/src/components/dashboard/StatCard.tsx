import { motion } from "framer-motion";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { itemVariants } from "@/components/shared/Motion";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  accent?: boolean;
  onClick?: () => void;
}

export function StatCard({ label, value, icon: Icon, hint, accent, onClick }: StatCardProps) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-6 text-left shadow-soft transition-shadow hover:shadow-lift",
        accent ? "border-primary/10 bg-primary text-primary-foreground" : "border-border bg-card"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl",
          accent ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground")}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <ArrowUpRight className={cn("h-4 w-4 opacity-0 transition-all group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
          accent ? "text-primary-foreground" : "text-muted-foreground")} />
      </div>
      <p className={cn("mt-5 font-heading text-4xl font-bold tracking-tight", accent ? "text-primary-foreground" : "text-foreground")}>
        {value}
      </p>
      <p className={cn("mt-1 text-sm font-medium", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>{label}</p>
      {hint && <p className={cn("mt-3 text-xs", accent ? "text-primary-foreground/50" : "text-muted-foreground/70")}>{hint}</p>}
    </motion.button>
  );
}

export function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-card"
      data-testid={`ministat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-[18px] w-[18px] text-foreground" strokeWidth={2} />
      </div>
      <div>
        <p className="font-heading text-xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
