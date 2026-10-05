import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "../config/db";
import { env } from "../config/env";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { HomepageSection } from "../models/HomepageSection";
import { Settings } from "../models/Settings";
import { DEFAULT_SETTINGS, ensureSettingsDefaults } from "../utils/settingsDefaults";
import { cloudinaryEnabled, uploadBuffer } from "../config/cloudinary";
import { readBrandLogo } from "../brand/logo";

const DEFAULT_CATEGORIES = [
  { name: "Apps", slug: "apps", icon: "smartphone", type: "Mobile App" },
  { name: "Websites", slug: "websites", icon: "globe", type: "Website" },
  { name: "Graphic Design", slug: "graphic-design", icon: "palette", type: "Graphic Design" },
  { name: "Motion Graphics", slug: "motion-graphics", icon: "film", type: "Motion Graphics" },
  { name: "Digital Marketing", slug: "digital-marketing", icon: "megaphone", type: "Digital Marketing" },
  { name: "Cybersecurity", slug: "cybersecurity", icon: "shield", type: "Cybersecurity" },
];

const DEFAULT_HOMEPAGE = [
  { key: "featured_projects", title: "Featured Projects", description: "Highlighted student work", order: 0 },
  { key: "latest_projects", title: "Latest Projects", description: "Recently added projects", order: 1 },
  { key: "featured_graduates", title: "Featured Graduates", description: "Spotlight graduates", order: 2 },
  { key: "latest_graduates", title: "Latest Graduates", description: "Newly approved graduates", order: 3 },
];

const STOCK_ADMIN_AVATAR = "images.unsplash.com/photo-1507003211169";

async function adminAvatarUrl(): Promise<string | undefined> {
  const logo = readBrandLogo();
  if (logo && cloudinaryEnabled) {
    const uploaded = await uploadBuffer(logo.buffer, "avatars", { filename: "bbd-admin" });
    return uploaded.url;
  }
  try {
    const host = env.publicApiUrl ? new URL(env.publicApiUrl).hostname : "";
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `${env.publicApiUrl}/api/brand/logo.jpeg`;
    }
  } catch {
    /* fall through */
  }
  return undefined;
}

function shouldReplaceAdminAvatar(avatar?: string | null): boolean {
  const value = avatar?.trim() || "";
  if (!value || value.includes(STOCK_ADMIN_AVATAR)) return true;
  try {
    const host = new URL(value).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

/** Empty-database setup only: defaults + admin from env. No demo users or sample content. */
export async function bootstrapDatabase(): Promise<void> {
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    console.log("Bootstrap: default categories");
  }

  if ((await HomepageSection.countDocuments()) === 0) {
    await HomepageSection.insertMany(DEFAULT_HOMEPAGE);
    console.log("Bootstrap: homepage sections");
  }

  if ((await Settings.countDocuments()) === 0) {
    await Settings.create(DEFAULT_SETTINGS);
    console.log("Bootstrap: platform settings");
  } else {
    await ensureSettingsDefaults();
  }

  if (env.adminEmail && env.adminPassword) {
    const email = env.adminEmail.toLowerCase();
    const existing = await User.findOne({ email });
    const avatar = await adminAvatarUrl();
    if (!existing) {
      await User.create({
        email,
        passwordHash: await bcrypt.hash(env.adminPassword, 12),
        fullName: "BBD Select Admin",
        avatar,
        status: "approved",
        role: "admin",
        graduateStatus: "active",
      });
      console.log("Bootstrap: admin account");
    } else if (avatar && shouldReplaceAdminAvatar(existing.avatar)) {
      await User.updateOne({ _id: existing._id }, { $set: { avatar } });
      console.log("Bootstrap: admin avatar");
    }
  } else if (env.isProduction) {
    console.warn("[bootstrap] Set ADMIN_EMAIL and ADMIN_PASSWORD in production");
  }
}

if (require.main === module) {
  connectDb()
    .then(() => bootstrapDatabase())
    .then(() => disconnectDb())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
