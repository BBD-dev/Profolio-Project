import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { usePlatformBrand } from "@/hooks/usePlatformBrand";

export function BrandMark({
  collapsed = false,
  dark = false,
  subtitle = "Admin Panel",
}: {
  collapsed?: boolean;
  dark?: boolean;
  subtitle?: string;
}) {
  const { name, logo } = usePlatformBrand();

  return (
    <div className="flex items-center gap-3" data-testid="brand-mark">
      <BrandLogo src={logo} size={40} />
      {!collapsed && (
        <div className="leading-tight">
          <p className={cn("font-heading text-sm font-bold tracking-tight", dark ? "text-primary-foreground" : "text-foreground")}>
            {name}
          </p>
          <p className={cn("text-[10px] font-medium uppercase tracking-[0.2em]", dark ? "text-primary-foreground/50" : "text-muted-foreground")}>
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
}
