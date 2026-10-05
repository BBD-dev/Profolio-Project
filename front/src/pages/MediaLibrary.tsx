import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Images, Upload, Trash2, FileText, Video, Image as ImageIcon,
  FileBadge, Download, Plus, Copy, ExternalLink, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { mediaApi, mediaUploadField } from "@/services/api";
import { getErrorMessage } from "@/services/apiClient";
import { MediaItem, MediaType } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { QueryError } from "@/components/shared/QueryError";
import { UploadOverlay } from "@/components/shared/UploadOverlay";
import { Stagger, Item } from "@/components/shared/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

const typeIcon: Record<MediaType, any> = { image: ImageIcon, logo: FileBadge, video: Video, document: FileText, cv: FileText };
const filters: { key: MediaType | "all"; label: string }[] = [
  { key: "all", label: "All" }, { key: "image", label: "Images" }, { key: "logo", label: "Logos" },
  { key: "video", label: "Videos" }, { key: "document", label: "Documents" }, { key: "cv", label: "CV Files" },
];

function inferTypeFromFile(file: File): MediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "document";
  if (file.type.startsWith("image/")) return "image";
  return "document";
}

export default function MediaLibrary() {
  const qc = useQueryClient();
  const { data: media, isLoading, isError, error, refetch } = useQuery({ queryKey: ["media"], queryFn: mediaApi.list });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MediaType | "all">("all");
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [del, setDel] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const create = useMutation({
    mutationFn: async (payload: { file?: File; type: MediaType; name?: string; url?: string }) => {
      if (payload.file) {
        const result = await mediaApi.upload(payload.file, mediaUploadField(payload.type));
        return {
          id: result.media.id,
          name: result.media.name,
          type: result.media.type as MediaType,
          url: result.media.url,
          size: result.media.size,
          uploadedAt: new Date().toISOString().slice(0, 10),
        } satisfies MediaItem;
      }
      return mediaApi.create({
        name: payload.name,
        url: payload.url,
        type: payload.type,
        size: "—",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media added");
      setUploadOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media deleted");
      setDel(null);
      setPreview(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const list = useMemo(() => {
    let out = [...(media || [])];
    if (filter !== "all") out = out.filter((m) => m.type === filter);
    if (search) out = out.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
    return out;
  }, [media, filter, search]);

  const isVisual = (m: MediaItem) => m.type === "image" || m.type === "logo";
  const isVideo = (m: MediaItem) => m.type === "video";

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const downloadFile = (item: MediaItem) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader eyebrow="Assets" title="Media Library"
        subtitle="Upload and manage images, logos, videos, documents and CV files for the platform."
        actions={<Button onClick={() => setUploadOpen(true)} data-testid="upload-media-btn"><Upload className="h-4 w-4" /> Upload</Button>} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} data-testid={`media-filter-${f.key}`}
              className={cn("relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors", filter === f.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {filter === f.key && <motion.span layoutId="media-filter" className="absolute inset-0 rounded-lg bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input data-testid="media-search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:outline-none focus:ring-0" />
        </div>
      </div>

      {isError ? (
        <QueryError message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={Images} title="No media found" description="Upload files or add by URL to build your media library." action={<Button onClick={() => setUploadOpen(true)}><Plus className="h-4 w-4" /> Upload</Button>} />
      ) : (
        <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((m) => {
            const Icon = typeIcon[m.type];
            return (
              <Item key={m.id}>
                <motion.div whileHover={{ y: -4 }} data-testid={`media-item-${m.id}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
                  <button type="button" onClick={() => setPreview(m)} className="relative block aspect-square w-full overflow-hidden bg-secondary">
                    {isVisual(m) ? (
                      <img src={m.url} alt={m.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : isVideo(m) ? (
                      <>
                        <video src={m.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/30"><Video className="h-8 w-8 text-primary-foreground" /></div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center"><Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} /></div>
                    )}
                    <span className="absolute left-2 top-2 rounded-md bg-card/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-foreground backdrop-blur">{m.type}</span>
                  </button>
                  <div className="flex items-center gap-2 p-3">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">{m.size} · {formatDate(m.uploadedAt)}</p>
                    </div>
                    <button type="button" onClick={() => setDel(m)} data-testid={`media-delete-${m.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </motion.div>
              </Item>
            );
          })}
        </Stagger>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => { if (!open) setPreview(null); }}>
        <DialogContent className="max-w-2xl" data-testid="media-preview">
          {preview && (
            <div>
              <DialogHeader>
                <DialogTitle className="truncate">{preview.name}</DialogTitle>
                <DialogDescription>{preview.type} · {preview.size} · uploaded {formatDate(preview.uploadedAt)}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 overflow-hidden rounded-xl border border-border bg-secondary">
                {preview.type === "image" || preview.type === "logo" ? (
                  <img src={preview.url} alt={preview.name} className="max-h-[50vh] w-full object-contain" />
                ) : preview.type === "video" ? (
                  <video src={preview.url} controls className="max-h-[50vh] w-full bg-black" />
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center gap-3">
                    <FileText className="h-14 w-14 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground">{preview.name}</p>
                    <a href={preview.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" /> Open file
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" className="flex-1" onClick={() => downloadFile(preview)}><Download className="h-4 w-4" /> Download</Button>
                <Button variant="outline" className="flex-1" onClick={() => copyUrl(preview.url)}><Copy className="h-4 w-4" /> Copy URL</Button>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => { setDel(preview); setPreview(null); }}><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UploadDialog
        open={uploadOpen}
        uploading={create.isPending}
        onClose={() => setUploadOpen(false)}
        onSubmit={async (payload) => { await create.mutateAsync(payload); }}
      />

      <ConfirmDialog open={!!del} onOpenChange={(open) => { if (!open) setDel(null); }}
        title="Delete file?" description={`"${del?.name}" will be permanently removed from the media library.`}
        confirmLabel="Delete" destructive onConfirm={() => del ? remove.mutateAsync(del.id) : undefined} />
    </div>
  );
}

function UploadDialog({
  open,
  uploading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  uploading: boolean;
  onClose: () => void;
  onSubmit: (payload: { file?: File; type: MediaType; name?: string; url?: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<MediaType>("image");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"file" | "url">("file");

  const reset = () => {
    setName("");
    setUrl("");
    setType("image");
    setFile(null);
    setMode("file");
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) {
      setName(f.name);
      setType(inferTypeFromFile(f));
      setMode("file");
    }
  };

  const submit = async () => {
    if (mode === "file" && file) {
      await onSubmit({ file, type, name: file.name });
      reset();
      return;
    }
    if (mode === "url" && name.trim() && url.trim()) {
      await onSubmit({ type, name: name.trim(), url: url.trim() });
      reset();
    }
  };

  const canSubmit = mode === "file" ? !!file : !!(name.trim() && url.trim());

  return (
    <Dialog open={open} onOpenChange={(openState) => { if (!openState) handleClose(); }}>
      <DialogContent data-testid="upload-dialog" className="relative">
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
          <DialogDescription>Upload a file to Cloudinary or add an external URL.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          <button type="button" onClick={() => setMode("file")}
            className={cn("flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", mode === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            Upload file
          </button>
          <button type="button" onClick={() => setMode("url")}
            className={cn("flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", mode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            Add by URL
          </button>
        </div>

        <div className="space-y-4">
          {mode === "file" ? (
            <label className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/40 py-8 text-center transition-colors hover:bg-secondary/60">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm font-medium">{file ? file.name : "Choose a file"}</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, MP4, PDF up to 10MB</p>
              <input type="file" className="hidden" accept="image/*,video/*,.pdf" disabled={uploading} onChange={(e) => handleFile(e.target.files?.[0] || null)} data-testid="upload-file-input" />
              {uploading ? <UploadOverlay label="Uploading file…" /> : null}
            </label>
          ) : (
            <>
              <div className="space-y-1.5"><Label className="text-xs">File name</Label><Input value={name} onChange={(e) => setName(e.target.value)} data-testid="upload-name" placeholder="asset.jpg" /></div>
              <div className="space-y-1.5"><Label className="text-xs">File URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} data-testid="upload-url" placeholder="https://…" /></div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as MediaType)}>
              <SelectTrigger data-testid="upload-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="logo">Logo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="cv">CV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-2 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button className="flex-1" data-testid="upload-submit" disabled={uploading || !canSubmit} onClick={submit}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {uploading ? "Uploading…" : "Add media"}
          </Button>
        </div>
        {uploading ? <UploadOverlay label="Uploading media…" className="rounded-lg" /> : null}
      </DialogContent>
    </Dialog>
  );
}
