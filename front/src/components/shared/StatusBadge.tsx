import { cn } from "@/lib/utils";
import { statusStyles, statusLabel } from "@/lib/format";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status] || "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status)}
    </span>
  );
}
