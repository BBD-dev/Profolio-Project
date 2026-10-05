import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { signToken, requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { serializeUser } from "../utils/serialize";
import { logActivity } from "../models/Activity";
import {
  asLinks,
  asOptionalUrl,
  bool,
  pickFields,
  requireEmail,
  requirePassword,
  str,
  strArr,
} from "../utils/validation";

const DUMMY_HASH = bcrypt.hashSync("dummy-password-to-mitigate-timing", 10);

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    `${ipKeyGenerator(req.ip ?? "")}|${String(req.body?.email || "").toLowerCase().trim()}`,
  message: { detail: "Too many login attempts. Please try again in 15 minutes." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { detail: "Too many registration attempts. Please try again later." },
});

router.get("/", (_req, res) => {
  res.json({ message: "BBD PROFOLIO API", status: "ok" });
});

router.post(
  "/auth/register",
  registerLimiter,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;

    const email = requireEmail(body.email);
    const password = requirePassword(body.password);
    const fullName = str(120)(body.full_name)?.trim();
    if (!fullName || fullName.length < 2) throw new AppError("Full name is required", 400);

    const fields = pickFields(body, {
      specialization: str(80),
      headline: str(160),
      phone: str(40),
      university: str(160),
      about: str(3000),
      skills: strArr(40, 50),
      avatar: (v) => asOptionalUrl(v, "avatar") ?? undefined,
    }) as Record<string, unknown>;
    const links = asLinks(body.links ?? body.social) ?? {};

    const existing = await User.findOne({ email }).select("_id");
    if (existing) throw new AppError("This email already has a request or account", 409);

    await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      fullName,
      ...fields,
      skills: fields.skills ?? [],
      links,
      status: "pending",
      role: "user",
    });

    await logActivity("request", `New registration request from ${fullName}`);

    res.status(201).json({
      status: "pending",
      message: "Request submitted. Your account is pending BBD Select Admin approval.",
    });
  }),
);

router.post(
  "/auth/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const emailRaw = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!emailRaw || !password) throw new AppError("Email and password are required", 400);

    const user = await User.findOne({ email: emailRaw }).select("+passwordHash");

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      throw new AppError("Incorrect email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError("Incorrect email or password", 401);

    if (user.status !== "approved") {
      const msg =
        user.status === "changes_requested"
          ? "Changes were requested on your application. Please check your email or contact BBD Select."
          : user.status === "rejected"
            ? "Your application was not approved. Please contact BBD Select."
            : "Your account is pending admin approval";
      throw new AppError(msg, 403);
    }

    const token = signToken(user);
    res.json({ access_token: token, token_type: "bearer", user: serializeUser(user) });
  }),
);

router.get(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(serializeUser(req.user!));
  }),
);

const urlOrEmpty = (label: string) => (v: unknown) => {
  const r = asOptionalUrl(v, label);
  return r === null ? "" : r;
};

router.patch(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;

    const picked = pickFields(body, {
      full_name: str(120),
      headline: str(160),
      about: str(3000),
      specialization: str(80),
      skills: strArr(40, 50),
      avatar: urlOrEmpty("avatar"),
      cover: urlOrEmpty("cover"),
      available_for_work: bool,
      links: asLinks,
      resume_name: str(160),
      cv_url: urlOrEmpty("cv_url"),
      cv_public_id: str(256),
      phone: str(40),
      university: str(160),
    }) as Record<string, unknown>;

    if (picked.full_name === "") throw new AppError("Full name cannot be empty", 400);

    const map: Record<string, string> = {
      full_name: "fullName",
      available_for_work: "availableForWork",
      resume_name: "resumeName",
      cv_url: "cvUrl",
      cv_public_id: "cvPublicId",
    };
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(picked)) updates[map[key] || key] = value;

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: req.user!._id }, { $set: updates }, { runValidators: true });
      if (updates.fullName) {
        await Project.updateMany({ ownerId: req.user!._id }, { $set: { ownerName: updates.fullName } });
      }
    }

    const fresh = await User.findById(req.user!._id);
    if (!fresh) throw new AppError("User not found", 404);
    res.json(serializeUser(fresh));
  }),
);

router.post(
  "/auth/change-password",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const current = typeof body.current_password === "string" ? body.current_password : "";
    const next = requirePassword(body.new_password);
    if (!current) throw new AppError("Current password is required", 400);

    const user = await User.findById(req.user!._id).select("+passwordHash");
    if (!user) throw new AppError("User not found", 404);
    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) throw new AppError("Current password is incorrect", 400);

    user.passwordHash = await bcrypt.hash(next, 12);
    await user.save();
    res.json({ ok: true });
  }),
);

export default router;
