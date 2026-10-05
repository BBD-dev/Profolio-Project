import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Tags, Plus, Pencil, Trash2, Smartphone, Globe, Layout, Palette,
  Film, Megaphone, Shield, Tag as TagIcon, FolderKanban, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { categoriesApi, projectsApi } from "@/services/api";
import { getErrorMessage } from "@/services/apiClient";
import { Category } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Stagger, Item } from "@/components/shared/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const iconMap: Record<string, any> = {
  smartphone: Smartphone, globe: Globe, layout: Layout, palette: Palette,
  film: Film, megaphone: Megaphone, shield: Shield, tag: TagIcon,
};

export default function Categories() {
  const qc = useQueryClient();
  const { data: categories, isLoading } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [del, setDel] = useState<Category | null>(null);

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["categories"] }); qc.invalidateQueries({ queryKey: ["stats"] }); };
  const fail = (err: unknown) => toast.error(getErrorMessage(err));
  const create = useMutation({ mutationFn: (d: Partial<Category>) => categoriesApi.create(d), onSuccess: () => { invalidate(); toast.success("Category created"); }, onError: fail });
  const update = useMutation({ mutationFn: ({ id, patch }: { id: string; patch: Partial<Category> }) => categoriesApi.update(id, patch), onSuccess: () => { invalidate(); toast.success("Category updated"); }, onError: fail });
  const remove = useMutation({ mutationFn: (id: string) => categoriesApi.remove(id), onSuccess: () => { invalidate(); toast.success("Category deleted"); setDel(null); }, onError: fail });

  const count = (c: Category) => (projects || []).filter((p) => p.category === c.id).length;

  return (
    <div>
      <PageHeader eyebrow="Taxonomy" title="Categories"
        subtitle="Manage the project categories shown across the platform. Enable, disable or add new ones anytime."
        actions={<Button onClick={() => setCreating(true)} data-testid="new-category-btn"><Plus className="h-4 w-4" /> New Category</Button>} />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : (categories || []).length === 0 ? (
        <EmptyState icon={Tags} title="No categories" description="Create your first project category." />
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories || []).map((c) => {
            const Icon = iconMap[c.icon] || TagIcon;
            return (
              <Item key={c.id}>
                <motion.div whileHover={{ y: -3 }} data-testid={`category-card-${c.id}`}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-heading text-base font-semibold">{c.name}</h3>
                      <Switch checked={c.enabled} data-testid={`category-toggle-${c.id}`}
                        onCheckedChange={(v) => update.mutate({ id: c.id, patch: { enabled: v } })} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">/{c.slug}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <FolderKanban className="h-3.5 w-3.5" /> {count(c)} projects
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(c)} data-testid={`category-edit-${c.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDel(c)} data-testid={`category-delete-${c.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Item>
            );
          })}
        </Stagger>
      )}

      {(creating || editing) && (
        <CategoryDialog
          category={editing}
          saving={create.isPending || update.isPending}
          onClose={() => {
            if (create.isPending || update.isPending) return;
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (d) => {
            try {
              if (editing) await update.mutateAsync({ id: editing.id, patch: d });
              else await create.mutateAsync(d);
              setCreating(false);
              setEditing(null);
            } catch {
              /* toast from mutation onError */
            }
          }}
        />
      )}

      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}
        title="Delete category?" description={`"${del?.name}" will be removed. Existing projects keep their type label.`}
        confirmLabel="Delete" destructive onConfirm={() => del ? remove.mutateAsync(del.id) : undefined} />
    </div>
  );
}

function CategoryDialog({ category, saving, onClose, onSubmit }: {
  category: Category | null; saving?: boolean; onClose: () => void; onSubmit: (d: Partial<Category>) => void | Promise<void>;
}) {
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "tag");
  const [type, setType] = useState(category?.type || "");
  const icons = Object.keys(iconMap);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="category-dialog">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>Categories can be added anytime without code changes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} data-testid="category-name" placeholder="e.g. AR / VR" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Project type label</Label><Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. AR/VR" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map((k) => {
                const Ic = iconMap[k];
                return (
                  <button key={k} type="button" onClick={() => setIcon(k)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${icon === k ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}>
                    <Ic className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" data-testid="category-save" disabled={!name.trim() || saving} onClick={() => onSubmit({ name, icon, type: type || name })}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : category ? "Save" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
