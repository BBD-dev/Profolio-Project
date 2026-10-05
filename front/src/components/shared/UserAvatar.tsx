import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Props = {
  src?: string | null;
  name: string;
  className?: string;
};

export function UserAvatar({ src, name, className }: Props) {
  const url = src?.trim();

  return (
    <Avatar className={cn("rounded-[inherit]", className)}>
      {url ? <AvatarImage src={url} alt={name} className="object-cover" /> : null}
      <AvatarFallback className="rounded-[inherit] bg-muted text-sm font-semibold text-muted-foreground">
        {initials(name || "?")}
      </AvatarFallback>
    </Avatar>
  );
}
