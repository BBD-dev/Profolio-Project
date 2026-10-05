import { Router } from "express";
import { Category } from "../models/Category";
import { Project } from "../models/Project";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { serializeCategory } from "../utils/serialize";
import { bool, pickFields, requireObjectId, str } from "../utils/validation";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const cats = await Category.find({ enabled: true }).sort({ name: 1 });
    res.json(cats.map(serializeCategory));
  }),
);

const admin = Router();
admin.use(requireAdmin);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

const categorySpec = {
  name: str(60),
  slug: (v: unknown) => (typeof v === "string" ? slugify(v) : undefined),
  icon: str(40),
  type: str(60),
  enabled: bool,
};

admin.get(
  "/",
  asyncHandler(async (_req, res) => {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats.map(serializeCategory));
  }),
);

admin.post(
  "/",
  asyncHandler(async (req, res) => {
    const fields = pickFields(req.body, categorySpec) as Record<string, unknown>;
    const name = (fields.name as string | undefined)?.trim();
    if (!name) throw new AppError("Name is required", 400);

    const slug = (fields.slug as string | undefined) || slugify(name);
    if (!slug) throw new AppError("Slug is required", 400);

    const cat = await Category.create({
      name,
      slug,
      icon: (fields.icon as string | undefined) || "tag",
      type: (fields.type as string | undefined) || name,
      enabled: (fields.enabled as boolean | undefined) ?? true,
    });
    res.status(201).json(serializeCategory(cat));
  }),
);

admin.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const updates = pickFields(req.body, categorySpec) as Record<string, unknown>;
    if (updates.name === "") throw new AppError("Name cannot be empty", 400);
    if (updates.slug === "") delete updates.slug;
    if (Object.keys(updates).length === 0) throw new AppError("No valid fields to update", 400);

    const cat = await Category.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!cat) throw new AppError("Category not found", 404);
    res.json(serializeCategory(cat));
  }),
);

admin.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const cat = await Category.findById(id);
    if (!cat) throw new AppError("Category not found", 404);

    const inUse = await Project.countDocuments({
      $or: [{ category: cat.name }, { category: cat._id }, { type: cat.type }],
    });
    if (inUse > 0 && req.query.force !== "true") {
      throw new AppError(`This category is used by ${inUse} project(s). Reassign them first.`, 409);
    }

    await Category.deleteOne({ _id: cat._id });
    res.json({ ok: true });
  }),
);

export { admin as categoriesAdminRoutes };
export default router;
