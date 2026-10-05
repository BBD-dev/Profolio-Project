import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadOverlay({
  label = "Uploading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-[3px]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="px-3 text-center text-xs font-medium text-foreground">{label}</span>
    </div>
  );
}
