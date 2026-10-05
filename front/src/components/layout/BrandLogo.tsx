import fallbackLogo from "@/assets/bbd-logo.jpeg";
import { cn } from "@/lib/utils";

/** Zoom past the dark padding baked into the JPEG asset — same crop as the mobile app. */
const CROP_SCALE = 1.42;

function usesBrandCrop(src?: string): boolean {
  const value = src?.trim().toLowerCase() || "";
  if (!value) return true;
  if (value.includes("bbd-admin")) return true;
  if (value.includes("bbd-logo")) return true;
  if (value.includes("bbd-profolio")) return true;
  return false;
}

type Props = {
  src?: string;
  size?: number;
  radius?: number;
  className?: string;
  alt?: string;
};

export function BrandLogo({ src, size = 40, radius, className, alt = "BBD PROFOLIO" }: Props) {
  const custom = src?.trim();
  const corner = radius ?? Math.round(size * 0.24);
  const crop = usesBrandCrop(custom);
  const scale = crop ? CROP_SCALE : 1;

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden bg-transparent", className)}
      style={{ width: size, height: size, borderRadius: corner }}
      data-testid="brand-logo"
    >
      <img
        src={custom || fallbackLogo}
        alt={alt}
        className="absolute left-1/2 top-1/2 max-w-none bg-transparent"
        style={{
          width: size * scale,
          height: size * scale,
          transform: "translate(-50%, -50%)",
          objectFit: crop ? "cover" : "contain",
        }}
      />
    </div>
  );
}
