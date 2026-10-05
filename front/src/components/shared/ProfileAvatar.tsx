import { BrandLogo } from "@/components/layout/BrandLogo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

function isBrandAvatar(url?: string | null): boolean {
  const value = url?.trim().toLowerCase() || "";
  if (!value) return true;
  if (value.includes("bbd-admin")) return true;
  if (value.includes("bbd-logo")) return true;
  if (value.includes("bbd-profolio/avatars")) return true;
  return false;
}

type Props = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  testID?: string;
};

export function ProfileAvatar({ src, name, size = 36, className, testID }: Props) {
  if (isBrandAvatar(src)) {
    const corner = Math.max(8, Math.round(size * 0.28));
    return (
      <div data-testid={testID} className={cn("shrink-0 bg-transparent", className)}>
        <BrandLogo src={src || undefined} size={size} radius={corner} alt={name} />
      </div>
    );
  }

  return (
    <div data-testid={testID} className={cn("shrink-0", className)} style={{ width: size, height: size }}>
      <UserAvatar src={src} name={name} className="h-full w-full rounded-full" />
    </div>
  );
}
