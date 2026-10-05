import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { uploadBuffer, deleteByPublicId, cloudinaryEnabled, UploadFolder } from "../config/cloudinary";
import { MediaItem, MediaType } from "../models/MediaItem";
import { formatBytes } from "../utils/serialize";
import { saveLocalUpload, deleteLocalUpload } from "../utils/localUpload";
import { env } from "../config/env";
import { cloudinaryResourceType } from "../utils/media";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
const DOC_TYPES = new Set(["application/pdf"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

const USER_UPLOAD_FIELDS = new Set(["avatar", "cover", "cv", "document"]);
const ADMIN_ONLY_FIELDS = new Set(["media", "logo", "gallery", "project"]);

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_DOC = 10 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO, files: 1 },
  fileFilter(req, file, cb) {
    const field = resolveUploadField(req as AuthRequest);
    const mt = file.mimetype.toLowerCase();
    const okImage = IMAGE_TYPES.has(mt);
    const okDoc = DOC_TYPES.has(mt);
    const okVideo = VIDEO_TYPES.has(mt);

    if (field === "cv" || field === "document") {
      if (!okDoc) return cb(new AppError("Only PDF files are allowed for this upload", 400));
      return cb(null, true);
    }
    if (field === "media") {
      if (!okImage && !okDoc && !okVideo) return cb(new AppError("Unsupported file type", 400));
      return cb(null, true);
    }
    if (!okImage) return cb(new AppError("Only JPG, PNG, WebP, GIF or HEIC images are allowed", 400));
    cb(null, true);
  },
});

const router = Router();

function folderFromField(field: string): UploadFolder {
  const map: Record<string, UploadFolder> = {
    avatar: "avatars",
    cover: "covers",
    logo: "logos",
    gallery: "gallery",
    project: "projects",
    cv: "documents",
    document: "documents",
    media: "media",
  };
  return map[field] || "media";
}

function detectMediaType(field: string, mimetype: string): MediaType {
  if (field === "cv") return "cv";
  if (field === "document" || mimetype === "application/pdf") return "document";
  if (field === "logo") return "logo";
  if (mimetype.startsWith("video/")) return "video";
  return "image";
}

function resourceTypeForUpload(field: string, mimetype: string): "image" | "raw" | "video" {
  if (field === "cv" || field === "document" || mimetype === "application/pdf") return "raw";
  if (mimetype.startsWith("video/")) return "video";
  return "image";
}

function resolveUploadField(req: AuthRequest): string {
  const raw = req.body?.field ?? req.query?.field;
  return typeof raw === "string" ? raw.trim() : "";
}

function multerSingle(req: AuthRequest, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("File is too large.", 413));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);
    next();
  });
}

function absoluteUploadUrl(req: AuthRequest, urlPath: string): string {
  if (env.publicApiUrl) return `${env.publicApiUrl}${urlPath}`;
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost";
  const proto = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${proto}://${host}${urlPath}`;
}

router.post(
  "/",
  requireAuth,
  multerSingle,
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) throw new AppError("No file uploaded", 400);

    const field = resolveUploadField(req);
    if (!field) throw new AppError("Upload field is required", 400);
    const isAdmin = req.user?.role === "admin";

    if (ADMIN_ONLY_FIELDS.has(field) && !isAdmin) {
      throw new AppError("This upload type requires admin access", 403);
    }
    if (!USER_UPLOAD_FIELDS.has(field) && !ADMIN_ONLY_FIELDS.has(field)) {
      throw new AppError("Invalid upload field", 400);
    }

    const mt = req.file.mimetype.toLowerCase();
    const sizeLimit = VIDEO_TYPES.has(mt) ? MAX_VIDEO : DOC_TYPES.has(mt) ? MAX_DOC : MAX_IMAGE;
    if (req.file.size > sizeLimit) {
      throw new AppError(`File is too large. Maximum size is ${formatBytes(sizeLimit)}.`, 413);
    }

    const folder = folderFromField(field);
    const mediaType = detectMediaType(field, mt);
    const resourceType = resourceTypeForUpload(field, mt);

    let url: string;
    let publicId: string;
    let bytes = req.file.size;

    if (cloudinaryEnabled) {
      const result = await uploadBuffer(req.file.buffer, folder, { resourceType });
      url = result.url;
      publicId = result.publicId;
      bytes = result.bytes;
    } else {
      const local = saveLocalUpload(req.file.buffer, folder, req.file.originalname, mt);
      url = absoluteUploadUrl(req, local.urlPath);
      publicId = local.publicId;
    }

    let mediaRecord: { id: string; name: string; type: string; url: string; size: string } | undefined;
    if (field === "media" || field === "logo") {
      const item = await MediaItem.create({
        name: req.file.originalname.slice(0, 160),
        type: mediaType,
        url,
        publicId,
        size: formatBytes(bytes),
        uploadedBy: req.user!._id.toString(),
      });
      mediaRecord = {
        id: item._id.toString(),
        name: item.name,
        type: item.type,
        url: item.url,
        size: item.size,
      };
    }

    res.status(201).json({
      url,
      publicId,
      size: bytes,
      mimeType: mt,
      ...(mediaRecord ? { media: mediaRecord } : {}),
    });
  }),
);

router.delete(
  "/:publicId(*)",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const publicId = decodeURIComponent(String(req.params.publicId || "")).trim();
    if (!publicId) throw new AppError("publicId is required", 400);

    if (publicId.startsWith("local/")) {
      deleteLocalUpload(publicId);
      await MediaItem.deleteOne({ publicId });
      return res.json({ ok: true });
    }

    if (!publicId.startsWith("bbd-profolio/")) {
      throw new AppError("Only assets owned by this platform can be deleted", 403);
    }

    const item = await MediaItem.findOne({ publicId });
    await deleteByPublicId(publicId, item ? cloudinaryResourceType(item.type) : "image");
    if (item) await MediaItem.deleteOne({ _id: item._id });
    res.json({ ok: true });
  }),
);

export default router;
