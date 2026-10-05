import { Router } from "express";
import { Project } from "../models/Project";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { serializeProject, paginated, CATEGORY_TO_PROJECT_TYPES } from "../utils/serialize";
import { asString, parsePage, parsePageSize, requireObjectId, safeRegex } from "../utils/validation";

const router = Router();

const PUBLISHED = { status: "published" } as const;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = asString(req.query.search, 64);
    const categories = asString(req.query.categories, 500);
    const ownerId = asString(req.query.ownerId, 24);

    const filter: Record<string, unknown> = { ...PUBLISHED };
    if (req.query.featured === "true") filter.featured = true;
    if (ownerId) filter.ownerId = requireObjectId(ownerId, "ownerId");
    if (categories) {
      const names = categories.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
      const types = names.flatMap((name) => CATEGORY_TO_PROJECT_TYPES[name] || [name]);
      filter.type = { $in: types };
    }
    if (search) {
      const rx = safeRegex(search);
      filter.$or = [
        { title: rx },
        { name: rx },
        { description: rx },
        { technologies: rx },
        { ownerName: rx },
      ];
    }

    const pageNum = parsePage(req.query.page);
    const size = parsePageSize(req.query.pageSize, 6);

    const [total, items] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * size)
        .limit(size),
    ]);

    res.json(paginated(items.map(serializeProject), total, pageNum, size));
  }),
);

router.get(
  "/featured",
  asyncHandler(async (_req, res) => {
    const projects = await Project.find({ ...PUBLISHED, featured: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(projects.map(serializeProject));
  }),
);

router.get(
  "/latest",
  asyncHandler(async (req, res) => {
    const limit = parsePageSize(req.query.limit, 6, 20);
    const projects = await Project.find(PUBLISHED).sort({ createdAt: -1 }).limit(limit);
    res.json(projects.map(serializeProject));
  }),
);

router.get(
  "/owner/:ownerId",
  asyncHandler(async (req, res) => {
    const ownerId = requireObjectId(req.params.ownerId, "ownerId");
    const projects = await Project.find({
      ...PUBLISHED,
      $or: [{ ownerId }, { graduateIds: ownerId }],
    })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(projects.map(serializeProject));
  }),
);

router.get(
  "/:id/related",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const project = await Project.findOne({ _id: id, ...PUBLISHED });
    if (!project) throw new AppError("Project not found", 404);

    const limit = parsePageSize(req.query.limit, 4, 10);
    const related = await Project.find({
      _id: { $ne: project._id },
      ...PUBLISHED,
      category: project.category,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(related.map(serializeProject));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const project = await Project.findOne({ _id: id, ...PUBLISHED });
    if (!project) throw new AppError("Project not found", 404);
    res.json(serializeProject(project));
  }),
);

export default router;
