import { useRef, useState } from "react";
import { ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadFile, getErrorMessage } from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadOverlay } from "@/components/shared/UploadOverlay";
import { cn } from "@/lib/utils";

type UploadField = "project" | "logo" | "gallery";

async function uploadImage(file: File, field: UploadField): Promise<string> {
  const result = await uploadFile(file, field);
  return result.url;
}

type SingleProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  uploadField: UploadField;
  previewClassName?: string;
  testId?: string;
};

export function SingleImageUpload({
  label,
  hint,
  value,
  onChange,
  uploadField,
  previewClassName,
  testId,
}: SingleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploading(true);
    try {
      onChange(await uploadImage(file, uploadField));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <div className={cn("relative overflow-hidden rounded-xl border border-border bg-muted", previewClassName || "h-32")}>
        {value ? (
          <img src={value} alt="" className={cn("h-full w-full object-cover", uploading && "opacity-60")} />
        ) : (
          <button
            type="button"
            data-testid={testId}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/50 disabled:pointer-events-none"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs font-medium">Upload image</span>
          </button>
        )}

        {uploading ? <UploadOverlay label="Uploading image…" /> : null}

        {value && !uploading ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-card/90 text-destructive shadow-sm backdrop-blur transition-colors hover:bg-card"
            aria-label="Remove image"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : value ? "Replace" : "Choose file"}
        </Button>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL"
          className="h-9 text-xs"
          disabled={uploading}
        />
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

type GalleryProps = {
  label: string;
  hint?: string;
  images: string[];
  onChange: (urls: string[]) => void;
  testId?: string;
};

export function GalleryUpload({ label, hint, images, onChange, testId }: GalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) {
      toast.error("Please choose image files");
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: imageFiles.length });
    try {
      const urls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setProgress({ current: i + 1, total: imageFiles.length });
        urls.push(await uploadImage(imageFiles[i], "gallery"));
      }
      onChange([...images, ...urls]);
      toast.success(urls.length === 1 ? "Image added to gallery" : `${urls.length} images added to gallery`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (index: number) => {
    if (uploading) return;
    onChange(images.filter((_, i) => i !== index));
  };

  const progressLabel =
    progress && progress.total > 1
      ? `Uploading ${progress.current} of ${progress.total}…`
      : "Uploading image…";

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Label className="text-xs">{label}</Label>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {uploading ? (
          <p className="text-xs font-medium text-primary">{progressLabel}</p>
        ) : null}
      </div>

      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={uploading}
              onClick={() => remove(index)}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-card/90 text-destructive opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 disabled:opacity-0"
              aria-label="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          data-testid={testId}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="relative flex aspect-[4/3] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50 disabled:pointer-events-none"
        >
          <Plus className="h-5 w-5" />
          <span className="px-2 text-center text-xs font-medium">Add mockups</span>
          {uploading ? <UploadOverlay label={progressLabel} /> : null}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => pick(e.target.files)} />
    </div>
  );
}
