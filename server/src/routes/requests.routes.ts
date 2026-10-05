import { Router } from "express";
import { User, UserStatus } from "../models/User";
import { requireAdmin, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { serializeRequest } from "../utils/serialize";
import { logActivity } from "../models/Activity";
import { asEnum, asString, requireEnum, requireObjectId } from "../utils/validation";
import { sendApprovalEmail, sendChangesRequestedEmail, sendRejectedEmail } from "../services/email";
import { emailEnabled } from "../config/env";

const router = Router();
router.use(requireAdmin);

const STATUSES = ["pending", "approved", "rejected", "changes_requested"] as const;

/** List all registration requests (every non-admin user account). */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { role: "user" };
    const status = asEnum(req.query.status, STATUSES);
    if (status) filter.status = status;

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(users.map(serializeRequest));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = requireObjectId(req.params.id);
    const user = await User.findOne({ _id: id, role: "user" });
    if (!user) throw new AppError("Request not found", 404);
    res.json(serializeRequest(user));
  }),
);

/** Unified status update — matches dashboard requestsApi.setStatus */
router.patch(
  "/:id/status",
  asyncHandler(async (req: AuthRequest, res) => {
    const id = requireObjectId(req.params.id);
    const status = requireEnum<UserStatus>(req.body?.status, STATUSES, "status");
    const note = asString(req.body?.note, 2000);

    if (status === "changes_requested" && !note) {
      throw new AppError("A note is required when requesting changes", 400);
    }

    const user = await User.findOne({ _id: id, role: "user" });
    if (!user) throw new AppError("Request not found", 404);

    const updates: Record<string, unknown> = {
      status,
      adminNote: note ?? (status === "approved" ? "" : user.adminNote),
    };

    const becameApproved = status === "approved" && user.status !== "approved";
    if (status === "approved") {
      updates.approvedAt = user.approvedAt ?? new Date();
      updates.approvedBy = req.user!._id;
      updates.graduateStatus = "active";
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
    if (!updated) throw new AppError("Request not found", 404);

    const label = status.replace("_", " ");
    await logActivity(
      status === "approved" ? "graduate" : "request",
      status === "approved"
        ? `${user.fullName} was approved and added to Graduates`
        : `Request from ${user.fullName} marked as ${label}`,
    );

    // Notify the applicant. Email failures never fail the admin action.
    let email: { sent: boolean; reason?: string } = { sent: false, reason: "not_applicable" };
    if (becameApproved) {
      email = await sendApprovalEmail(updated);
    } else if (status === "changes_requested" && user.status !== "changes_requested") {
      email = await sendChangesRequestedEmail({ ...updated.toObject(), adminNote: note });
    } else if (status === "rejected" && user.status !== "rejected") {
      email = await sendRejectedEmail({ ...updated.toObject(), adminNote: note });
    }

    if (email.sent) {
      await logActivity("system", `Notification email sent to ${updated.email}`);
    }

    res.json({
      ...serializeRequest(updated),
      email: { sent: email.sent, configured: emailEnabled, reason: email.sent ? undefined : email.reason },
    });
  }),
);

export default router;
