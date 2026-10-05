import { cn } from "@/lib/utils";

export function CountBadge({
  count,
  inverted = false,
  className,
}: {
  count: number;
  inverted?: boolean;
  className?: string;
}) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
        inverted ? "bg-accent text-accent-foreground" : "bg-accent text-accent-foreground",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
