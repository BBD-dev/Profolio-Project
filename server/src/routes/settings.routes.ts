import { Router } from "express";
import { Settings } from "../models/Settings";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { logActivity } from "../models/Activity";
import {
  DEFAULT_SETTINGS,
  serializeSettings,
  applySettingsPatch,
} from "../utils/settingsDefaults";

async function getOrCreateSettings() {
  let doc = await Settings.findOne();
  if (!doc) {
    doc = await Settings.create(DEFAULT_SETTINGS);
  }
  return doc;
}

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const s = await getOrCreateSettings();
    res.json(serializeSettings(s));
  }),
);

const admin = Router();
admin.use(requireAdmin);

admin.get(
  "/",
  asyncHandler(async (_req, res) => {
    const s = await getOrCreateSettings();
    res.json(serializeSettings(s));
  }),
);

admin.patch(
  "/",
  asyncHandler(async (req, res) => {
    const s = await getOrCreateSettings();
    applySettingsPatch(s, req.body);
    await s.save();
    await logActivity("system", "Platform settings were updated");
    res.json(serializeSettings(s));
  }),
);

export { admin as settingsAdminRoutes };
export default router;
