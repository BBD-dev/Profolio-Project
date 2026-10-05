import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, GraduationCap, MoreVertical, Pencil, Trash2, Eye, EyeOff,
  Power, Briefcase, Mail, Phone, FolderKanban, Plus, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { graduatesApi, projectsApi } from "@/services/api";
import { getErrorMessage } from "@/services/apiClient";
import { Graduate, GraduateStatus } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QueryError } from "@/components/shared/QueryError";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Stagger, Item } from "@/components/shared/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CoverBanner } from "@/components/shared/CoverBanner";

export default function Graduates() {
  const qc = useQueryClient();
  const { data: grads, isLoading, isError, refetch } = useQuery({ queryKey: ["graduates"], queryFn: graduatesApi.list });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | GraduateStatus | "available">("all");
  const [editing, setEditing] = useState<Graduate | null>(null);
  const [del, setDel] = useState<Graduate | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["graduates"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
  };

  const fail = (err: unknown) => toast.error(getErrorMessage(err));

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Graduate> }) => graduatesApi.update(id, patch),
    onSuccess: () => { invalidate(); toast.success("Profile updated"); },
    onError: fail,
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GraduateStatus }) => graduatesApi.setStatus(id, status),
    onSuccess: (_d, v) => { invalidate(); toast.success(`Graduate ${v.status === "active" ? "activated" : v.status}`); },
    onError: fail,
  });
  const toggleAvail = useMutation({
    mutationFn: (id: string) => graduatesApi.toggleAvailable(id),
    onSuccess: () => { invalidate(); toast.success("Availability updated"); },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: (id: string) => graduatesApi.remove(id),
    onSuccess: () => { invalidate(); toast.success("Graduate deleted"); setDel(null); },
    onError: fail,
  });

  const list = useMemo(() => {
    let out = [...(grads || [])];
    if (filter === "available") out = out.filter((g) => g.availableForWork);
    else if (filter !== "all") out = out.filter((g) => g.status === filter);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((g) => g.name.toLowerCase().includes(q) || g.specialization.toLowerCase().includes(q) || g.skills.join(" ").toLowerCase().includes(q));
    }
    return out;
  }, [grads, filter, search]);

  const gradProjects = (g: Graduate) => (projects || []).filter((p) => g.projectIds.includes(p.id));

  return (
    <div>
      <PageHeader eyebrow="Directory" title="Graduates"
        subtitle="Manage every published graduate — edit profiles, control visibility and assign projects." />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1">
          {(["all", "active", "inactive", "hidden", "available"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`grad-filter-${f}`}
              className={cn("relative rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                filter === f ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {filter === f && <motion.span layoutId="grad-filter" className="absolute inset-0 rounded-lg bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative z-10">{f === "available" ? "Available" : f}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input data-testid="grad-search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search graduates…" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:outline-none focus:ring-0" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : isError ? (
        <QueryError message="Could not load graduates." onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No graduates found" description="No graduates match your filters. Approve requests to add graduates here." />
      ) : (
        <Stagger className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((g) => (
            <Item key={g.id} className="h-full">
              <motion.div whileHover={{ y: -4 }} data-testid={`grad-card-${g.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
                <div className="relative h-24 shrink-0">
                  <CoverBanner src={g.cover} />
                  <div className="absolute inset-0 bg-primary/35" />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    {g.availableForWork && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">Open to work</span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button data-testid={`grad-menu-${g.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/90 text-foreground backdrop-blur transition-colors hover:bg-card">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setEditing(g)} data-testid={`grad-edit-${g.id}`}><Pencil className="h-4 w-4" /> Edit profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleAvail.mutate(g.id)}><Briefcase className="h-4 w-4" /> {g.availableForWork ? "Unmark" : "Mark"} available</DropdownMenuItem>
                        {g.status === "hidden"
                          ? <DropdownMenuItem onClick={() => setStatus.mutate({ id: g.id, status: "active" })}><Eye className="h-4 w-4" /> Unhide</DropdownMenuItem>
                          : <DropdownMenuItem onClick={() => setStatus.mutate({ id: g.id, status: "hidden" })}><EyeOff className="h-4 w-4" /> Hide profile</DropdownMenuItem>}
                        {g.status === "active"
                          ? <DropdownMenuItem onClick={() => setStatus.mutate({ id: g.id, status: "inactive" })}><Power className="h-4 w-4" /> Deactivate</DropdownMenuItem>
                          : <DropdownMenuItem onClick={() => setStatus.mutate({ id: g.id, status: "active" })}><Power className="h-4 w-4" /> Activate</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDel(g)} className="text-destructive focus:text-destructive" data-testid={`grad-delete-${g.id}`}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5">
                  <UserAvatar
                    src={g.avatar}
                    name={g.name}
                    className="relative z-10 -mt-8 h-16 w-16 shrink-0 rounded-2xl border-4 border-card bg-card shadow-soft"
                  />
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-heading text-base font-semibold">{g.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{g.specialization}</p>
                    </div>
                    <StatusBadge status={g.status} />
                  </div>
                  <p className="mt-3 flex-1 line-clamp-3 text-sm text-muted-foreground">{g.bio}</p>
                  <div className="mt-4 flex shrink-0 items-center justify-between border-t border-border pt-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <FolderKanban className="h-3.5 w-3.5" /> {gradProjects(g).length} projects
                    </span>
                    <button onClick={() => setEditing(g)} className="text-xs font-semibold text-foreground hover:text-accent-foreground">Manage →</button>
                  </div>
                </div>
              </motion.div>
            </Item>
          ))}
        </Stagger>
      )}

      {editing && (
        <EditGraduateSheet
          graduate={editing}
          projects={gradProjects(editing)}
          saving={update.isPending}
          onClose={() => { if (!update.isPending) setEditing(null); }}
          onSave={async (patch) => {
            try {
              await update.mutateAsync({ id: editing.id, patch });
              setEditing(null);
            } catch {
              /* toast from mutation onError */
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="Delete graduate?"
        description={`This will permanently remove ${del?.name}'s profile. This action cannot be undone.`}
        confirmLabel="Delete" destructive
        onConfirm={() => del ? remove.mutateAsync(del.id) : undefined}
      />
    </div>
  );
}

function EditGraduateSheet({ graduate, projects, saving, onClose, onSave }: {
  graduate: Graduate; projects: any[]; saving?: boolean; onClose: () => void; onSave: (p: Partial<Graduate>) => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    name: graduate.name, specialization: graduate.specialization, university: graduate.university,
    email: graduate.email, phone: graduate.phone, bio: graduate.bio,
    skills: graduate.skills.join(", "),
    status: graduate.status, availableForWork: graduate.availableForWork,
    github: graduate.social.github || "", linkedin: graduate.social.linkedin || "",
    behance: graduate.social.behance || "", dribbble: graduate.social.dribbble || "",
    website: graduate.social.website || "", portfolio: graduate.social.portfolio || "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg" data-testid="grad-edit-sheet">
        <div className="mb-6 flex items-center gap-3">
          <UserAvatar src={graduate.avatar} name={graduate.name} className="h-12 w-12 rounded-xl" />
          <div>
            <h2 className="font-heading text-lg font-semibold">Edit graduate</h2>
            <p className="text-sm text-muted-foreground">Update profile, links and visibility</p>
          </div>
        </div>

        <div className="space-y-5">
          <Field label="Full name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="edit-name" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Specialization"><Input value={form.specialization} onChange={(e) => set("specialization", e.target.value)} /></Field>
            <Field label="University"><Input value={form.university} onChange={(e) => set("university", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          </div>
          <Field label="Biography"><Textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} data-testid="edit-bio" /></Field>
          <Field label="Skills (comma separated)"><Input value={form.skills} onChange={(e) => set("skills", e.target.value)} data-testid="edit-skills" /></Field>

          <div className="rounded-xl border border-border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Social links</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="GitHub"><Input value={form.github} onChange={(e) => set("github", e.target.value)} /></Field>
              <Field label="LinkedIn"><Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></Field>
              <Field label="Behance"><Input value={form.behance} onChange={(e) => set("behance", e.target.value)} /></Field>
              <Field label="Dribbble"><Input value={form.dribbble} onChange={(e) => set("dribbble", e.target.value)} /></Field>
              <Field label="Website"><Input value={form.website} onChange={(e) => set("website", e.target.value)} /></Field>
              <Field label="Portfolio"><Input value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} /></Field>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-semibold">Available for work</p>
              <p className="text-xs text-muted-foreground">Shows an "Open to work" badge</p>
            </div>
            <Switch checked={form.availableForWork} onCheckedChange={(v) => set("availableForWork", v)} data-testid="edit-available" />
          </div>

          <Field label="Profile status">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger data-testid="edit-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned projects ({projects.length})</p>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects assigned yet. Assign from the Projects page.</p>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
                    <img src={p.cover} alt="" className="h-9 w-12 rounded object-cover" />
                    <span className="text-sm font-medium">{p.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-border bg-card py-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" data-testid="edit-save" disabled={saving} onClick={() => onSave({
            name: form.name, specialization: form.specialization, university: form.university,
            email: form.email, phone: form.phone, bio: form.bio,
            skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
            status: form.status as GraduateStatus, availableForWork: form.availableForWork,
            social: { github: form.github, linkedin: form.linkedin, behance: form.behance, dribbble: form.dribbble, website: form.website, portfolio: form.portfolio },
          })}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
