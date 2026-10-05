import { Router } from "express";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { Category } from "../models/Category";
import { Activity } from "../models/Activity";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { parsePageSize } from "../utils/validation";

const router = Router();
router.use(requireAdmin);

const TYPE_KEYS: Record<string, string> = {
  "Mobile App": "applications",
  Website: "websites",
  "Graphic Design": "graphic",
  "Motion Graphics": "motion",
  "Digital Marketing": "marketing",
  Cybersecurity: "cyber",
};

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [graduates, pendingRequests, totalProjects, categories, byType, recentRequests, recentProjects] =
      await Promise.all([
        User.countDocuments({ role: "user", status: "approved" }),
        User.countDocuments({ role: "user", status: "pending" }),
        Project.countDocuments(),
        Category.countDocuments({ enabled: true }),
        Project.aggregate<{ _id: string; count: number }>([
          { $match: { status: "published" } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
        User.find({ role: "user" })
          .sort({ createdAt: -1 })
          .limit(4)
          .select("fullName email specialization createdAt status")
          .lean(),
        Project.find().sort({ createdAt: -1 }).limit(4).select("title type status createdAt featured").lean(),
      ]);

    const counts: Record<string, number> = {
      applications: 0,
      websites: 0,
      graphic: 0,
      motion: 0,
      marketing: 0,
      cyber: 0,
    };
    for (const row of byType) {
      const key = TYPE_KEYS[row._id];
      if (key) counts[key] += row.count;
    }

    res.json({
      totalGraduates: graduates,
      pendingRequests,
      totalProjects,
      ...counts,
      categories,
      recentRequests: recentRequests.map((u) => ({
        id: String(u._id),
        fullName: u.fullName,
        email: u.email,
        specialization: u.specialization,
        requestDate: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "",
        status: u.status,
      })),
      recentProjects: recentProjects.map((p) => ({
        id: String(p._id),
        title: p.title,
        type: p.type,
        status: p.status,
        featured: p.featured,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "",
      })),
    });
  }),
);

router.get(
  "/activity",
  asyncHandler(async (req, res) => {
    const limit = parsePageSize(req.query.limit, 40, 100);
    const items = await Activity.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(
      items.map((a) => ({
        id: String(a._id),
        kind: a.kind,
        message: a.message,
        timestamp: new Date(a.createdAt).toISOString(),
      })),
    );
  }),
);

export default router;
