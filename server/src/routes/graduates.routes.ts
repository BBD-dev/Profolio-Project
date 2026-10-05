import { Router } from "express";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { serializeGraduateApp, serializeProject, paginated } from "../utils/serialize";
import { asString, parsePage, parsePageSize, requireObjectId, safeRegex } from "../utils/validation";

const router = Router();

const publicGraduateFilter = {
  role: "user" as const,
  status: "approved" as const,
  graduateStatus: "active" as const,
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = asString(req.query.search, 64);
    const filter: Record<string, unknown> = { ...publicGraduateFilter };
    if (req.query.featured === "true") filter.featured = true;
    if (search) {
      const rx = safeRegex(search);
      filter.$or = [{ fullName: rx }, { headline: rx }, { specialization: rx }, { skills: rx }];
    }

    const pageNum = parsePage(req.query.page);
    const size = parsePageSize(req.query.pageSize, 8);

    const [total, items] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * size)
        .limit(size),
    ]);

    res.json(paginated(items.map(serializeGraduateApp), total, pageNum, size));
  }),
);

router.get(
  "/featured",
  asyncHandler(async (_req, res) => {
    const users = await User.find({ ...publicGraduateFilter, featured: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(users.map(serializeGraduateApp));
  }),
);

router.get(
  "/latest",
  asyncHandler(async (req, res) => {
    const limit = parsePageSize(req.query.limit, 6, 20);
    const users = await User.find(publicGraduateFilter).sort({ createdAt: -1 }).limit(limit);
    res.json(users.map(serializeGraduateApp));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const user = await User.findOne({ _id: id, ...publicGraduateFilter });
    if (!user) throw new AppError("Graduate not found", 404);

    const published = await Project.find({
      status: "published",
      $or: [{ ownerId: user._id }, { graduateIds: user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      ...serializeGraduateApp(user),
      projects: published.map(serializeProject),
    });
  }),
);

export default router;
