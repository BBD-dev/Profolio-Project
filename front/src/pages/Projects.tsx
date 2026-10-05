import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, FolderKanban, MoreVertical, Pencil, Trash2, Copy, Eye, EyeOff,
  Star, Plus, ExternalLink, Check, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { projectsApi, categoriesApi, graduatesApi } from "@/services/api";
import { getErrorMessage } from "@/services/apiClient";
import { Project } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Stagger, Item } from "@/components/shared/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { projectCoverUrl } from "@/lib/placeholders";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { SingleImageUpload, GalleryUpload } from "@/components/shared/ProjectImageUpload";

export default function Projects() {
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const { data: graduates } = useQuery({ queryKey: ["graduates"], queryFn: graduatesApi.list });
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [del, setDel] = useState<Project | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["graduates"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
  };

  const fail = (err: unknown) => toast.error(getErrorMessage(err));

  const create = useMutation({ mutationFn: (d: Partial<Project>) => projectsApi.create(d), onSuccess: () => { invalidate(); toast.success("Project created"); }, onError: fail });
  const update = useMutation({ mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) => projectsApi.update(id, patch), onSuccess: () => { invalidate(); toast.success("Project updated"); }, onError: fail });
  const duplicate = useMutation({ mutationFn: (id: string) => projectsApi.duplicate(id), onSuccess: () => { invalidate(); toast.success("Project duplicated"); }, onError: fail });
  const remove = useMutation({ mutationFn: (id: string) => projectsApi.remove(id), onSuccess: () => { invalidate(); toast.success("Project deleted"); setDel(null); }, onError: fail });

  const list = useMemo(() => {
    let out = [...(projects || [])];
    if (cat !== "all") {
      const selectedCat = (categories || []).find((c) => c.id === cat || c.name === cat);
      out = out.filter((p) => {
        if (!selectedCat) return p.category === cat;
        return (
          p.category === selectedCat.id ||
          p.category === selectedCat.name ||
          p.type === selectedCat.type ||
          p.type === selectedCat.name
        );
      });
    }
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q) || p.technologies.join(" ").toLowerCase().includes(q));
    }
    return out;
  }, [projects, cat, search]);

  const gradsById = (ids: string[]) => (graduates || []).filter((g) => ids.includes(g.id));

  return (
    <div>
      <PageHeader eyebrow="Portfolio" title="Projects"
        subtitle="Create and curate every project. Assign graduates and they appear automatically on public profiles."
        actions={<Button onClick={() => setCreating(true)} data-testid="new-project-btn"><Plus className="h-4 w-4" /> New Project</Button>} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterPill active={cat === "all"} onClick={() => setCat("all")} label="All" />
          {(categories || []).filter((c) => c.enabled).map((c) => (
            <FilterPill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={c.name} />
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input data-testid="project-search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:outline-none focus:ring-0" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project and assign graduates to showcase their work."
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Project</Button>} />
      ) : (
        <Stagger className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <Item key={p.id} className="h-full">
              <motion.div whileHover={{ y: -4 }} data-testid={`project-card-${p.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
                <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
                  <img src={projectCoverUrl(p.cover)} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                    <div className="flex gap-2">
                      <StatusBadge status={p.status} />
                      {p.featured && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground"><Star className="h-3 w-3 fill-current" /> Featured</span>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button data-testid={`project-menu-${p.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/90 backdrop-blur transition-colors hover:bg-card"><MoreVertical className="h-4 w-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setEditing(p)} data-testid={`project-edit-${p.id}`}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicate.mutate(p.id)} data-testid={`project-duplicate-${p.id}`}><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
                        {p.status === "published"
                          ? <DropdownMenuItem onClick={() => update.mutate({ id: p.id, patch: { status: "hidden" } })}><EyeOff className="h-4 w-4" /> Hide</DropdownMenuItem>
                          : <DropdownMenuItem onClick={() => update.mutate({ id: p.id, patch: { status: "published" } })} data-testid={`project-publish-${p.id}`}><Eye className="h-4 w-4" /> Publish</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => update.mutate({ id: p.id, patch: { featured: !p.featured } })}><Star className="h-4 w-4" /> {p.featured ? "Unfeature" : "Feature"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDel(p)} className="text-destructive focus:text-destructive" data-testid={`project-delete-${p.id}`}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.type}</p>
                  <div className="mt-1 flex min-w-0 items-center gap-2.5">
                    {p.logo?.trim() ? (
                      <img
                        src={p.logo}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-xl object-cover"
                      />
                    ) : null}
                    <h3 className="min-w-0 flex-1 font-heading text-lg font-semibold leading-tight">{p.title}</h3>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.subtitle}</p>
                  <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                    {p.technologies.slice(0, 3).map((t) => <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">{t}</span>)}
                    {p.technologies.length > 3 && <span className="text-xs text-muted-foreground">+{p.technologies.length - 3}</span>}
                  </div>
                  <div className="mt-4 flex shrink-0 items-center justify-between border-t border-border pt-4">
                    <div className="flex -space-x-2">
                      {gradsById(p.graduateIds).slice(0, 3).map((g) => (
                        <UserAvatar key={g.id} src={g.avatar} name={g.name} className="h-7 w-7 border-2 border-card" />
                      ))}
                      {p.graduateIds.length === 0 && <span className="text-xs text-muted-foreground">No graduates</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(p.completionDate)}</span>
                  </div>
                </div>
              </motion.div>
            </Item>
          ))}
        </Stagger>
      )}

      {(creating || editing) && (
        <ProjectDialog
          project={editing}
          categories={categories || []}
          graduates={graduates || []}
          saving={create.isPending || update.isPending}
          onClose={() => {
            if (create.isPending || update.isPending) return;
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (data) => {
            try {
              if (editing) await update.mutateAsync({ id: editing.id, patch: data });
              else await create.mutateAsync(data);
              setCreating(false);
              setEditing(null);
            } catch {
              /* toast from mutation onError */
            }
          }}
        />
      )}

      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}
        title="Delete project?" description={`"${del?.title}" will be permanently removed and unassigned from all graduates.`}
        confirmLabel="Delete" destructive onConfirm={() => del ? remove.mutateAsync(del.id) : undefined} />
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
      {label}
    </button>
  );
}

function ProjectDialog({ project, categories, graduates, saving, onClose, onSubmit }: {
  project: Project | null; categories: any[]; graduates: any[]; saving?: boolean; onClose: () => void; onSubmit: (d: Partial<Project>) => void | Promise<void>;
}) {
  const cat0 = project?.category || categories[0]?.id || "";
  const [form, setForm] = useState({
    title: project?.title || "", subtitle: project?.subtitle || "", description: project?.description || "",
    category: cat0, cover: project?.cover || "", logo: project?.logo || "",
    gallery: project?.gallery || [],
    technologies: (project?.technologies || []).join(", "),
    demoUrl: project?.demoUrl || "", websiteUrl: project?.websiteUrl || "", downloadUrl: project?.downloadUrl || "", githubUrl: project?.githubUrl || "",
    completionDate: project?.completionDate || new Date().toISOString().slice(0, 10),
    status: project?.status || "draft", featured: project?.featured || false,
    graduateIds: project?.graduateIds || [] as string[],
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleGrad = (id: string) => set("graduateIds", form.graduateIds.includes(id) ? form.graduateIds.filter((g) => g !== id) : [...form.graduateIds, id]);
  const catType = categories.find((c) => c.id === form.category)?.type || "Other";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" data-testid="project-dialog">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Create project"}</DialogTitle>
          <DialogDescription>Assign graduates to automatically publish this project on their profiles.</DialogDescription>
        </DialogHeader>

        <div className={cn("space-y-4", saving && "pointer-events-none opacity-70")}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="proj-title" placeholder="Project name" /></Field>
            <Field label="Subtitle"><Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Short tagline" /></Field>
          </div>
          <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the project…" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger data-testid="proj-category"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Completion date"><Input type="date" value={form.completionDate} onChange={(e) => set("completionDate", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SingleImageUpload
              label="Cover image"
              hint="Hero image on project cards and the app detail header."
              value={form.cover}
              onChange={(v) => set("cover", v)}
              uploadField="project"
              previewClassName="h-36"
              testId="proj-cover-upload"
            />
            <SingleImageUpload
              label="Logo / icon"
              hint="Small thumbnail shown beside the project title."
              value={form.logo}
              onChange={(v) => set("logo", v)}
              uploadField="logo"
              previewClassName="h-36"
              testId="proj-logo-upload"
            />
          </div>
          <GalleryUpload
            label="Website mockups & screenshots"
            hint="Upload full-page website screenshots or mockups. These appear in the app project gallery."
            images={form.gallery}
            onChange={(urls) => set("gallery", urls)}
            testId="proj-gallery-upload"
          />
          <Field label="Technologies (comma separated)"><Input value={form.technologies} onChange={(e) => set("technologies", e.target.value)} placeholder="React, Node.js" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Demo URL"><Input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} /></Field>
            <Field label="Website URL"><Input value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} /></Field>
            <Field label="Download URL"><Input value={form.downloadUrl} onChange={(e) => set("downloadUrl", e.target.value)} /></Field>
            <Field label="GitHub URL"><Input value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} /></Field>
          </div>

          <div>
            <Label className="text-xs">Assign graduates</Label>
            <div className="mt-2 grid max-h-40 grid-cols-1 gap-1.5 overflow-y-auto rounded-xl border border-border p-2 sm:grid-cols-2">
              {graduates.length === 0 && <p className="p-2 text-sm text-muted-foreground">No graduates available.</p>}
              {graduates.map((g) => {
                const on = form.graduateIds.includes(g.id);
                return (
                  <button key={g.id} type="button" onClick={() => toggleGrad(g.id)} data-testid={`assign-${g.id}`}
                    className={cn("flex items-center gap-2 rounded-lg border p-2 text-left transition-colors",
                      on ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50")}>
                    <img src={g.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{g.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{g.specialization}</p>
                    </div>
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-md border", on ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                      {on && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger data-testid="proj-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border px-4">
              <div><p className="text-sm font-semibold">Featured</p><p className="text-xs text-muted-foreground">Highlight on homepage</p></div>
              <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} data-testid="proj-featured" />
            </div>
          </div>
        </div>

        <div className="mt-2 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" data-testid="proj-save" disabled={!form.title.trim() || saving} onClick={() => onSubmit({
            title: form.title, subtitle: form.subtitle, description: form.description, category: form.category, type: catType,
            cover: form.cover, logo: form.logo,
            gallery: form.gallery,
            technologies: form.technologies.split(",").map((s) => s.trim()).filter(Boolean),
            demoUrl: form.demoUrl, websiteUrl: form.websiteUrl, downloadUrl: form.downloadUrl, githubUrl: form.githubUrl,
            completionDate: form.completionDate, status: form.status as any, featured: form.featured, graduateIds: form.graduateIds,
          })}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
