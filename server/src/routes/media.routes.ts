import { Router } from "express";
import { MediaItem } from "../models/MediaItem";
import { requireAdmin, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { deleteByPublicId, cloudinaryEnabled } from "../config/cloudinary";
import { cloudinaryResourceType } from "../utils/media";
import { deleteLocalUpload } from "../utils/localUpload";
import { asUrl, requireEnum, requireObjectId, str } from "../utils/validation";

const router = Router();
router.use(requireAdmin);

const MEDIA_TYPES = ["image", "logo", "video", "document", "cv"] as const;

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await MediaItem.find().sort({ createdAt: -1 }).limit(500);
    res.json(
      items.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        type: m.type,
        url: m.url,
        size: m.size,
        uploadedAt: m.createdAt.toISOString().slice(0, 10),
      })),
    );
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const url = asUrl(req.body?.url, "url");
    if (!url) throw new AppError("URL is required", 400);

    const name = str(160)(req.body?.name) || "upload";
    const type = requireEnum(req.body?.type ?? "image", MEDIA_TYPES, "media type");

    const item = await MediaItem.create({
      name,
      type,
      url,
      publicId: str(256)(req.body?.publicId),
      size: str(32)(req.body?.size) || "—",
      uploadedBy: (req as AuthRequest).user?._id.toString(),
    });

    res.status(201).json({
      id: item._id.toString(),
      name: item.name,
      type: item.type,
      url: item.url,
      size: item.size,
      uploadedAt: item.createdAt.toISOString().slice(0, 10),
    });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await MediaItem.findById(requireObjectId(req.params.id));
    if (!item) throw new AppError("Media not found", 404);

    if (item.publicId?.startsWith("local/")) {
      deleteLocalUpload(item.publicId);
    } else if (item.publicId && cloudinaryEnabled) {
      await deleteByPublicId(item.publicId, cloudinaryResourceType(item.type));
    }

    await MediaItem.deleteOne({ _id: item._id });
    res.json({ ok: true });
  }),
);

export default router;
