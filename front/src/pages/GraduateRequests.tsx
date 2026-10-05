import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Inbox, Check, X, MessageSquareWarning, Mail, Phone,
  GraduationCap, Github, Linkedin, Globe, Dribbble, FileText, ExternalLink, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { requestsApi } from "@/services/api";
import { requestsQuery } from "@/hooks/usePendingRequestCount";
import { getErrorMessage } from "@/services/apiClient";
import { GraduateRequest, RequestStatus } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Stagger, Item } from "@/components/shared/Motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CoverBanner } from "@/components/shared/CoverBanner";
import { cn } from "@/lib/utils";

const filters: { key: RequestStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "changes_requested", label: "Changes" },
  { key: "rejected", label: "Rejected" },
];

export default function GraduateRequests() {
  const qc = useQueryClient();
  const { data: requests, isLoading } = useQuery(requestsQuery);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [selected, setSelected] = useState<GraduateRequest | null>(null);
  const [changesOpen, setChangesOpen] = useState(false);
  const [changesNote, setChangesNote] = useState("");
  const [confirm, setConfirm] = useState<{ open: boolean; action: RequestStatus | null; id: string | null }>({ open: false, action: null, id: null });

  const mutate = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: RequestStatus; note?: string }) =>
      requestsApi.setStatus(id, status, note),
    onSuccess: (data, v) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      qc.invalidateQueries({ queryKey: ["graduates"] });
      if (v.status === "approved") {
        if (data.email?.sent) toast.success("Approved — welcome email sent to the graduate");
        else if (data.email && data.email.configured === false) {
          toast.success("Approved. Welcome email is not configured yet (add RESEND_API_KEY).");
        } else if (data.email && !data.email.sent) {
          toast.success(`Approved. Email was not sent${data.email.reason ? `: ${data.email.reason}` : ""}`);
        } else toast.success("Request approved — graduate added");
      } else {
        const map: Record<string, string> = {
          rejected: "Request rejected",
          changes_requested: "Changes requested — the graduate will be notified",
        };
        toast.success(map[v.status] || "Request updated");
      }
      setSelected(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const list = useMemo(() => {
    let out = [...(requests || [])];
    if (filter !== "all") out = out.filter((r) => r.status === filter);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((r) => r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.specialization.toLowerCase().includes(q));
    }
    out.sort((a, b) =>
      sort === "name" ? a.fullName.localeCompare(b.fullName)
        : sort === "oldest" ? a.requestDate.localeCompare(b.requestDate)
          : b.requestDate.localeCompare(a.requestDate)
    );
    return out;
  }, [requests, filter, search, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests?.length || 0 };
    (requests || []).forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [requests]);

  const doAction = (id: string, action: RequestStatus) => {
    if (action === "changes_requested") { setChangesOpen(true); return; }
    setConfirm({ open: true, action, id });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Approvals"
        title="Graduate Requests"
        subtitle="Review submissions from the mobile app. Approve to publish a graduate, request changes, or reject."
      />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              data-testid={`filter-${f.key}`}
              className={cn(
                "relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter === f.key && <motion.span layoutId="req-filter" className="absolute inset-0 rounded-lg bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative z-10">{f.label}</span>
              <span className={cn("relative z-10 ml-1.5 text-xs", filter === f.key ? "text-primary-foreground/70" : "text-muted-foreground/60")}>
                {counts[f.key] || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              data-testid="requests-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, field…"
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:outline-none focus:ring-0"
            />
          </div>
          <select
            data-testid="requests-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:outline-none focus:ring-0"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Inbox} title="No requests found" description="No graduate requests match your current filters. Try adjusting your search." />
      ) : (
        <Stagger className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <Item key={r.id} className="h-full">
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setSelected(r)}
                data-testid={`request-card-${r.id}`}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
              >
                <div className="relative h-24 shrink-0">
                  <CoverBanner src={r.cover} />
                  <div className="absolute inset-0 bg-primary/35" />
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={r.status} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5">
                  <UserAvatar
                    src={r.photo}
                    name={r.fullName}
                    className="relative z-10 -mt-8 h-16 w-16 rounded-2xl border-4 border-card bg-card shadow-soft"
                  />
                  <div className="mt-3 min-w-0">
                    <p className="truncate font-heading text-base font-semibold">{r.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">{r.specialization}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.university}</span>
                  </div>
                  <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                    {r.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{s}</span>
                    ))}
                    {r.skills.length > 3 && <span className="text-xs text-muted-foreground">+{r.skills.length - 3}</span>}
                  </div>
                  <div className="mt-4 flex shrink-0 items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">{formatDate(r.requestDate)}</span>
                    {r.status === "pending" ? (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setSelected(r); doAction(r.id, "changes_requested"); }} title="Request changes" data-testid={`quick-changes-${r.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent/20 hover:text-accent-foreground">
                          <MessageSquareWarning className="h-4 w-4" />
                        </button>
                        <button onClick={() => doAction(r.id, "rejected")} title="Reject" data-testid={`quick-reject-${r.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                        <button onClick={() => doAction(r.id, "approved")} title="Approve" data-testid={`quick-approve-${r.id}`}
                          className="flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">View details →</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </Item>
          ))}
        </Stagger>
      )}

      {/* Details drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-lg" data-testid="request-drawer">
          {selected && (
            <div>
              <div className="relative h-36 overflow-hidden">
                <CoverBanner src={selected.cover} />
                <div className="pointer-events-none absolute inset-0 bg-primary/40" />
              </div>
              <div className="relative px-6 pb-6">
                <div className="relative z-10 -mt-14 flex items-end justify-between gap-3">
                  <UserAvatar
                    src={selected.photo}
                    name={selected.fullName}
                    className="h-24 w-24 shrink-0 rounded-2xl border-4 border-card bg-card shadow-lift"
                  />
                  <StatusBadge status={selected.status} />
                </div>
                <h2 className="mt-4 font-heading text-2xl font-bold">{selected.fullName}</h2>
                <p className="text-sm text-muted-foreground">{selected.specialization} · {selected.university}</p>

                <div className="mt-5 grid grid-cols-1 gap-2">
                  <InfoRow icon={Mail} label={selected.email} />
                  <InfoRow icon={Phone} label={selected.phone} />
                </div>

                <Section title="About">
                  <p className="text-sm leading-relaxed text-muted-foreground">{selected.about}</p>
                </Section>

                <Section title="Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map((s) => (
                      <span key={s} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </Section>

                <Section title="Links & documents">
                  <div className="flex flex-wrap gap-2">
                    <LinkChip icon={FileText} label="CV" href={selected.cvUrl} />
                    {selected.social.portfolio && <LinkChip icon={ExternalLink} label="Portfolio" href={selected.social.portfolio} />}
                    {selected.social.github && <LinkChip icon={Github} label="GitHub" href={selected.social.github} />}
                    {selected.social.linkedin && <LinkChip icon={Linkedin} label="LinkedIn" href={selected.social.linkedin} />}
                    {selected.social.behance && <LinkChip icon={ExternalLink} label="Behance" href={selected.social.behance} />}
                    {selected.social.dribbble && <LinkChip icon={Dribbble} label="Dribbble" href={selected.social.dribbble} />}
                    {selected.social.website && <LinkChip icon={Globe} label="Website" href={selected.social.website} />}
                  </div>
                </Section>

                {selected.note && (
                  <div className="mt-5 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
                    <p className="font-semibold text-foreground">Admin note</p>
                    <p className="mt-1 text-muted-foreground">{selected.note}</p>
                  </div>
                )}

                <p className="mt-5 text-xs text-muted-foreground">Submitted {formatDate(selected.requestDate)}</p>

                {selected.status !== "approved" && (
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button className="flex-1" data-testid="drawer-approve" disabled={mutate.isPending}
                      onClick={() => doAction(selected.id, "approved")}>
                      {mutate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve
                    </Button>
                    <Button variant="outline" className="flex-1" data-testid="drawer-changes" disabled={mutate.isPending}
                      onClick={() => doAction(selected.id, "changes_requested")}>
                      <MessageSquareWarning className="h-4 w-4" /> Request Changes
                    </Button>
                    <Button variant="outline" data-testid="drawer-reject" disabled={mutate.isPending}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => doAction(selected.id, "rejected")}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Request changes dialog */}
      <Dialog open={changesOpen} onOpenChange={(open) => { if (!mutate.isPending) setChangesOpen(open); }}>
        <DialogContent data-testid="changes-dialog">
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
            <DialogDescription>Let the graduate know what needs to be updated before approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Note to applicant</Label>
            <Textarea id="note" data-testid="changes-note" rows={4} value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)} placeholder="e.g. Please add at least 2 portfolio case studies…" disabled={mutate.isPending} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangesOpen(false)} disabled={mutate.isPending}>Cancel</Button>
            <Button
              data-testid="changes-submit"
              disabled={!selected || mutate.isPending}
              onClick={async () => {
                if (!selected) return;
                try {
                  await mutate.mutateAsync({ id: selected.id, status: "changes_requested", note: changesNote });
                  setChangesOpen(false);
                  setChangesNote("");
                } catch {
                  /* toast from mutation onError */
                }
              }}
            >
              {mutate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mutate.isPending ? "Sending…" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={confirm.action === "approved" ? "Approve this graduate?" : "Reject this request?"}
        description={confirm.action === "approved"
          ? "The graduate will be published and become visible in the Graduates section."
          : "This request will be marked as rejected. You can still view it later."}
        confirmLabel={confirm.action === "approved" ? "Approve" : "Reject"}
        destructive={confirm.action === "rejected"}
        onConfirm={async () => {
          if (confirm.id && confirm.action) {
            await mutate.mutateAsync({ id: confirm.id, status: confirm.action });
          }
        }}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <Icon className="h-4 w-4 text-muted-foreground" /> {label}
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
function LinkChip({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-ring hover:bg-secondary">
      <Icon className="h-3.5 w-3.5" /> {label}
    </a>
  );
}
