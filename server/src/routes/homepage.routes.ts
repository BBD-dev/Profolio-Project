import { Router } from "express";
import { HomepageSection, IHomepageSection } from "../models/HomepageSection";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { logActivity } from "../models/Activity";
import { bool, isObjectId, pickFields, requireObjectId, str } from "../utils/validation";

const router = Router();

function serializeSection(s: IHomepageSection) {
  return {
    id: s._id.toString(),
    key: s.key,
    title: s.title,
    description: s.description,
    visible: s.visible,
    order: s.order,
  };
}

/** Public: only visible sections, in order. */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const sections = await HomepageSection.find({ visible: true }).sort({ order: 1 });
    res.json(sections.map(serializeSection));
  }),
);

const admin = Router();
admin.use(requireAdmin);

admin.get(
  "/",
  asyncHandler(async (_req, res) => {
    const sections = await HomepageSection.find().sort({ order: 1 });
    res.json(sections.map(serializeSection));
  }),
);

admin.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const updates = pickFields(req.body, {
      title: str(80),
      description: str(240),
      visible: bool,
    }) as Record<string, unknown>;
    if (updates.title === "") throw new AppError("Title cannot be empty", 400);
    if (Object.keys(updates).length === 0) throw new AppError("No valid fields to update", 400);

    const section = await HomepageSection.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!section) throw new AppError("Section not found", 404);
    res.json(serializeSection(section));
  }),
);

admin.post(
  "/reorder",
  asyncHandler(async (req, res) => {
    const raw = req.body?.sections ?? req.body;
    if (!Array.isArray(raw)) throw new AppError("sections must be an array", 400);

    const ids = raw
      .map((item: unknown) => (typeof item === "string" ? item : (item as { id?: string })?.id))
      .filter((id): id is string => isObjectId(id));

    if (ids.length === 0) throw new AppError("No valid section ids", 400);
    if (new Set(ids).size !== ids.length) throw new AppError("Duplicate section ids", 400);

    await HomepageSection.bulkWrite(
      ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i } } } })),
    );

    await logActivity("system", "Homepage sections were reordered");
    const sections = await HomepageSection.find().sort({ order: 1 });
    res.json(sections.map(serializeSection));
  }),
);

export { admin as homepageAdminRoutes };
export default router;
