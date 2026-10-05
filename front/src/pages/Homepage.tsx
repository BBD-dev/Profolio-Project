import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LayoutTemplate, ArrowUp, ArrowDown, Eye, EyeOff, GripVertical, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { homepageApi } from "@/services/api";
import { HomepageSection } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Stagger, Item } from "@/components/shared/Motion";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Homepage() {
  const qc = useQueryClient();
  const { data: sections, isLoading } = useQuery({ queryKey: ["homepage"], queryFn: homepageApi.list });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["homepage"] }); qc.invalidateQueries({ queryKey: ["activity"] }); };

  const update = useMutation({ mutationFn: ({ id, patch }: { id: string; patch: Partial<HomepageSection> }) => homepageApi.update(id, patch), onSuccess: () => { invalidate(); toast.success("Section updated"); } });
  const reorder = useMutation({
    mutationFn: (list: HomepageSection[]) => homepageApi.reorder(list),
    onSuccess: (data) => {
      qc.setQueryData(["homepage"], data);
      qc.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Section order updated");
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ["homepage"] });
      toast.error("Failed to reorder sections");
    },
  });

  const move = (index: number, dir: -1 | 1) => {
    if (!sections) return;
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const withOrder = next.map((s, i) => ({ ...s, order: i }));
    qc.setQueryData(["homepage"], withOrder);
    reorder.mutate(withOrder);
  };

  return (
    <div>
      <PageHeader eyebrow="Mobile App" title="Homepage Management"
        subtitle="Control what appears in the BBD PROFOLIO mobile app home screen — toggle visibility and reorder sections." />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : (
            <Stagger className="space-y-3">
              {(sections || []).map((s, i) => (
                <Item key={s.id}>
                  <div data-testid={`homepage-section-${s.key}`}
                    className={cn("flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-soft transition-all",
                      s.visible ? "border-border" : "border-dashed border-border opacity-70")}>
                    <div className="flex flex-col">
                      <button onClick={() => move(i, -1)} disabled={i === 0} data-testid={`move-up-${s.key}`}
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === (sections?.length || 0) - 1} data-testid={`move-down-${s.key}`}
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-muted-foreground">{i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-base font-semibold">{s.title}</h3>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", s.visible ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                          {s.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />} {s.visible ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{s.description}</p>
                    </div>
                    <Switch checked={s.visible} data-testid={`homepage-toggle-${s.key}`}
                      onCheckedChange={(v) => update.mutate({ id: s.id, patch: { visible: v } })} />
                  </div>
                </Item>
              ))}
            </Stagger>
          )}
        </div>

        {/* Phone preview */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="mx-auto w-full max-w-[280px] rounded-[2.5rem] border-8 border-primary bg-primary p-2 shadow-lift">
              <div className="overflow-hidden rounded-[2rem] bg-background">
                <div className="flex items-center justify-between bg-primary px-4 py-2">
                  <span className="text-[10px] font-semibold text-primary-foreground">BBD</span>
                  <Smartphone className="h-3 w-3 text-primary-foreground/60" />
                </div>
                <div className="space-y-2 p-3">
                  {(sections || []).filter((s) => s.visible).map((s) => (
                    <motion.div key={s.id} layout className="rounded-xl bg-secondary/70 p-3">
                      <div className="h-1.5 w-16 rounded bg-primary/30" />
                      <div className="mt-2 h-1 w-24 rounded bg-muted-foreground/20" />
                      {s.key.includes("project") || s.key.includes("graduate") ? (
                        <div className="mt-2 flex gap-1.5">{[0, 1, 2].map((n) => <div key={n} className="h-10 flex-1 rounded-lg bg-primary/10" />)}</div>
                      ) : <div className="mt-2 h-12 rounded-lg bg-primary/10" />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">Live preview · mobile home screen</p>
          </div>
        </div>
      </div>
    </div>
  );
}
