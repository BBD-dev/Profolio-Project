import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  className?: string;
};

export function CoverBanner({ src, className }: Props) {
  const url = src?.trim();
  if (url) {
    return <img src={url} alt="" className={cn("h-full w-full object-cover", className)} />;
  }
  return <div className={cn("h-full w-full bg-muted", className)} aria-hidden />;
}
