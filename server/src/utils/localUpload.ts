import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(__dirname, "../../uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeFolder(folder: string): string {
  const f = folder.replace(/[^a-z0-9_-]/gi, "");
  if (!f) throw new Error("Invalid upload folder");
  return f;
}

export function saveLocalUpload(
  buffer: Buffer,
  folder: string,
  originalName: string,
  mimeType: string,
): { urlPath: string; publicId: string } {
  const dirName = safeFolder(folder);
  const ext = EXT_BY_MIME[mimeType.toLowerCase()] || "";
  const safeBase = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 48);
  const id = `${safeBase || "file"}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const dir = path.join(UPLOAD_ROOT, dirName);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, id), buffer);
  return { urlPath: `/api/uploads/${dirName}/${id}`, publicId: `local/${dirName}/${id}` };
}

/** Delete a file saved by saveLocalUpload. publicId must look like local/<folder>/<file>. */
export function deleteLocalUpload(publicId: string): boolean {
  const m = /^local\/([a-z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/i.exec(publicId);
  if (!m) return false;
  const target = path.join(UPLOAD_ROOT, m[1], m[2]);
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(UPLOAD_ROOT))) return false;
  try {
    fs.unlinkSync(resolved);
    return true;
  } catch {
    return false;
  }
}

export { UPLOAD_ROOT };
