import { Router } from "express";
import { Types } from "mongoose";
import { User, GraduateStatus } from "../models/User";
import { Project, ProjectStatus } from "../models/Project";
import { requireAdmin, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { serializeGraduate, serializeProject } from "../utils/serialize";
import { logActivity } from "../models/Activity";
import { syncGraduateProjectIds } from "../utils/syncProjects";
import { normalizeGallery } from "../utils/gallery";
import {
  asEnum,
  asLinks,
  asOptionalUrl,
  bool,
  isObjectId,
  objectIdArray,
  pickFields,
  requireObjectId,
  str,
  strArr,
} from "../utils/validation";

const router = Router();
router.use(requireAdmin);

const GRADUATE_STATUSES = ["active", "inactive", "hidden"] as const;
const PROJECT_STATUSES = ["published", "hidden", "draft"] as const;

// --- Graduates (approved users only) ---
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { role: "user", status: "approved" };
    const gs = asEnum(req.query.graduateStatus, GRADUATE_STATUSES);
    if (gs) filter.graduateStatus = gs;

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(users.map(serializeGraduate));
  }),
);

router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const user = await User.findOne({ _id: id, role: "user", status: "approved" });
    if (!user) throw new AppError("Graduate not found", 404);
    res.json(serializeGraduate(user));
  }),
);

const graduateStatusCoerce = (v: unknown) => asEnum<GraduateStatus>(v, GRADUATE_STATUSES);
const urlOrEmpty = (label: string) => (v: unknown) => {
  const r = asOptionalUrl(v, label);
  return r === null ? "" : r;
};

router.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;

    // Dashboard uses a slightly different vocabulary; map it first.
    const normalized: Record<string, unknown> = {
      ...body,
      fullName: body.fullName ?? body.name,
      about: body.about ?? body.bio,
      links: body.links ?? body.social,
      graduateStatus: body.graduateStatus ?? body.status,
    };

    const updates = pickFields(normalized, {
      fullName: str(120),
      headline: str(160),
      about: str(3000),
      specialization: str(80),
      skills: strArr(40, 50),
      avatar: urlOrEmpty("avatar"),
      cover: urlOrEmpty("cover"),
      cvUrl: urlOrEmpty("cvUrl"),
      availableForWork: bool,
      featured: bool,
      links: asLinks,
      graduateStatus: graduateStatusCoerce,
      phone: str(40),
      university: str(160),
    });

    if (updates.fullName === "") throw new AppError("Name cannot be empty", 400);
    if (Object.keys(updates).length === 0) throw new AppError("No valid fields to update", 400);

    const user = await User.findOneAndUpdate(
      { _id: id, role: "user", status: "approved" },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!user) throw new AppError("Graduate not found", 404);

    if (updates.fullName) {
      await Project.updateMany({ ownerId: user._id }, { $set: { ownerName: user.fullName } });
    }

    await logActivity("graduate", `${user.fullName}'s profile was updated`);
    res.json(serializeGraduate(user));
  }),
);

router.post(
  "/users/:id/toggle-available",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const user = await User.findOne({ _id: id, role: "user", status: "approved" });
    if (!user) throw new AppError("Graduate not found", 404);

    user.availableForWork = !user.availableForWork;
    await user.save();
    await logActivity("graduate", `${user.fullName}'s availability was updated`);
    res.json(serializeGraduate(user));
  }),
);

router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const user = await User.findOneAndDelete({ _id: id, role: "user" });
    if (!user) throw new AppError("Graduate not found", 404);

    // Projects owned solely by this graduate are removed; shared projects keep the others.
    const owned = await Project.find({ ownerId: user._id }, "_id graduateIds");
    const toDelete: Types.ObjectId[] = [];
    const toReassign: { _id: Types.ObjectId; next: Types.ObjectId }[] = [];
    for (const p of owned) {
      const others = p.graduateIds.filter((g) => !g.equals(user._id));
      if (others.length === 0) toDelete.push(p._id as Types.ObjectId);
      else toReassign.push({ _id: p._id as Types.ObjectId, next: others[0] });
    }

    if (toDelete.length) await Project.deleteMany({ _id: { $in: toDelete } });
    for (const r of toReassign) {
      const next = await User.findById(r.next, "fullName");
      await Project.updateOne(
        { _id: r._id },
        { $set: { ownerId: r.next, ownerName: next?.fullName }, $pull: { graduateIds: user._id } },
      );
    }
    const affected = await Project.find({ graduateIds: user._id }, "graduateIds");
    await Project.updateMany({ graduateIds: user._id }, { $pull: { graduateIds: user._id } });
    await syncGraduateProjectIds(affected.flatMap((p) => p.graduateIds));

    await logActivity("graduate", `${user.fullName} was deleted`);
    res.json({ ok: true, deletedProjects: toDelete.length });
  }),
);

// --- Projects CRUD ---
router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    const status = asEnum(req.query.status, PROJECT_STATUSES);
    if (status) filter.status = status;
    const projects = await Project.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(projects.map(serializeProject));
  }),
);

router.get(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const project = await Project.findById(id);
    if (!project) throw new AppError("Project not found", 404);
    res.json(serializeProject(project));
  }),
);

type TeamMemberInput = { id?: string; name?: string; role?: string; avatar?: string };
function asTeam(v: unknown) {
  if (!Array.isArray(v)) return undefined;
  return v
    .filter((m): m is TeamMemberInput => !!m && typeof m === "object")
    .slice(0, 30)
    .map((m, i) => ({
      id: typeof m.id === "string" && m.id ? m.id.slice(0, 64) : `tm_${i}_${Date.now()}`,
      name: typeof m.name === "string" ? m.name.trim().slice(0, 120) : "",
      role: typeof m.role === "string" ? m.role.trim().slice(0, 120) : "",
      avatar: typeof m.avatar === "string" ? m.avatar.trim().slice(0, 2048) : "",
    }))
    .filter((m) => m.name);
}

const projectFieldSpec = {
  title: str(160),
  name: str(160),
  subtitle: str(240),
  shortDescription: str(400),
  description: str(8000),
  category: str(80),
  type: str(80),
  cover: urlOrEmpty("cover"),
  logo: urlOrEmpty("logo"),
  gallery: strArr(30, 2048),
  video: urlOrEmpty("video"),
  technologies: strArr(40, 50),
  demoUrl: urlOrEmpty("demoUrl"),
  websiteUrl: urlOrEmpty("websiteUrl"),
  downloadUrl: urlOrEmpty("downloadUrl"),
  githubUrl: urlOrEmpty("githubUrl"),
  team: asTeam,
  completionDate: str(40),
  status: (v: unknown) => asEnum<ProjectStatus>(v, PROJECT_STATUSES),
  featured: bool,
};

router.post(
  "/projects",
  asyncHandler(async (req: AuthRequest, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const fields = pickFields(body, projectFieldSpec) as Record<string, unknown>;

    const title = (fields.title as string | undefined)?.trim();
    if (!title) throw new AppError("Title is required", 400);

    const graduateIds = objectIdArray(body.graduateIds, "graduateIds");
    const ownerId = body.ownerId
      ? requireObjectId(body.ownerId, "ownerId")
      : graduateIds[0] || (req.user!._id as Types.ObjectId);
    const owner = await User.findById(ownerId, "fullName");
    if (!owner) throw new AppError("Owner not found", 404);

    const cover = (fields.cover as string | undefined) || "";
    const logo = (fields.logo as string | undefined) || "";

    const project = await Project.create({
      title,
      name: (fields.name as string | undefined) || title,
      subtitle: (fields.subtitle as string | undefined) || "",
      shortDescription: (fields.shortDescription as string | undefined) || (fields.subtitle as string | undefined) || "",
      description: (fields.description as string | undefined) || "",
      category: (fields.category as string | undefined) || (fields.type as string | undefined) || "Website",
      type: (fields.type as string | undefined) || "Website",
      cover,
      logo,
      gallery: normalizeGallery((fields.gallery as string[] | undefined) ?? [], [cover, logo]),
      video: (fields.video as string | undefined) || "",
      technologies: (fields.technologies as string[] | undefined) ?? [],
      demoUrl: fields.demoUrl,
      websiteUrl: fields.websiteUrl,
      downloadUrl: fields.downloadUrl,
      githubUrl: fields.githubUrl,
      team: (fields.team as unknown[] | undefined) ?? [],
      ownerId,
      ownerName: owner.fullName,
      graduateIds: graduateIds.length ? graduateIds : [ownerId],
      completionDate: fields.completionDate,
      status: (fields.status as ProjectStatus | undefined) || "draft",
      featured: (fields.featured as boolean | undefined) ?? false,
    });

    await syncGraduateProjectIds(project.graduateIds);
    await logActivity("project", `Project '${project.title}' was created`);
    res.status(201).json(serializeProject(project));
  }),
);

router.patch(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const updates = pickFields(body, projectFieldSpec) as Record<string, unknown>;

    if (updates.title === "") throw new AppError("Title cannot be empty", 400);
    if (updates.title && !body.name) updates.name = updates.title;

    if (body.graduateIds !== undefined) updates.graduateIds = objectIdArray(body.graduateIds, "graduateIds");
    if (body.ownerId !== undefined) {
      const ownerId = requireObjectId(body.ownerId, "ownerId");
      const owner = await User.findById(ownerId, "fullName");
      if (!owner) throw new AppError("Owner not found", 404);
      updates.ownerId = ownerId;
      updates.ownerName = owner.fullName;
    }

    const existing = await Project.findById(id, "cover logo graduateIds");
    if (!existing) throw new AppError("Project not found", 404);

    if (updates.gallery !== undefined || updates.cover !== undefined || updates.logo !== undefined) {
      const cover = (updates.cover as string | undefined) ?? existing.cover;
      const logo = (updates.logo as string | undefined) ?? existing.logo;
      if (updates.gallery !== undefined) {
        updates.gallery = normalizeGallery(updates.gallery as string[], [cover, logo]);
      }
    }

    if (Object.keys(updates).length === 0) throw new AppError("No valid fields to update", 400);

    const project = await Project.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!project) throw new AppError("Project not found", 404);

    const touched = [...existing.graduateIds, ...project.graduateIds];
    await syncGraduateProjectIds(touched);
    await logActivity("project", `Project '${project.title}' was updated`);
    res.json(serializeProject(project));
  }),
);

router.post(
  "/projects/:id/duplicate",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const src = await Project.findById(id);
    if (!src) throw new AppError("Project not found", 404);

    const copy = await Project.create({
      title: `${src.title} (Copy)`,
      name: `${src.name} (Copy)`,
      subtitle: src.subtitle,
      shortDescription: src.shortDescription,
      description: src.description,
      category: src.category,
      type: src.type,
      cover: src.cover,
      logo: src.logo,
      gallery: [...src.gallery],
      video: src.video,
      technologies: [...src.technologies],
      demoUrl: src.demoUrl,
      websiteUrl: src.websiteUrl,
      downloadUrl: src.downloadUrl,
      githubUrl: src.githubUrl,
      team: src.team.map((t) => ({ ...t })),
      ownerId: src.ownerId,
      ownerName: src.ownerName,
      graduateIds: [...src.graduateIds],
      completionDate: src.completionDate,
      status: "draft",
      featured: false,
    });

    await syncGraduateProjectIds(copy.graduateIds);
    await logActivity("project", `Project '${src.title}' was duplicated`);
    res.status(201).json(serializeProject(copy));
  }),
);

router.delete(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const project = await Project.findByIdAndDelete(id);
    if (!project) throw new AppError("Project not found", 404);

    await syncGraduateProjectIds(project.graduateIds);
    await logActivity("project", `Project '${project.title}' was deleted`);
    res.json({ ok: true });
  }),
);

export { isObjectId };
export default router;
