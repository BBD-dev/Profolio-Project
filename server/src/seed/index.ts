import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "../config/db";
import { env } from "../config/env";
import { syncAllGraduateProjectIds } from "../utils/syncProjects";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { HomepageSection } from "../models/HomepageSection";
import { Project } from "../models/Project";
import { Settings } from "../models/Settings";
import { seedDemoData } from "./demoData";
import { avatarFor, SEED_IMAGES } from "./seedMedia";
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

async function adminAvatarUrl(email: string): Promise<string> {
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
  return avatarFor(email);
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

export async function seedDatabase(options?: { demo?: boolean; force?: boolean }): Promise<void> {
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    console.log("Seeded categories");
  }

  if ((await HomepageSection.countDocuments()) === 0) {
    await HomepageSection.insertMany(DEFAULT_HOMEPAGE);
    console.log("Seeded homepage sections");
  }

  if ((await Settings.countDocuments()) === 0) {
    await Settings.create(DEFAULT_SETTINGS);
    console.log("Seeded settings");
  } else {
    await ensureSettingsDefaults();
  }

  if (env.adminEmail && env.adminPassword) {
    const email = env.adminEmail.toLowerCase();
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({
        email,
        passwordHash: await bcrypt.hash(env.adminPassword, 12),
        fullName: "BBD Select Admin",
        avatar: await adminAvatarUrl(email),
        status: "approved",
        role: "admin",
        graduateStatus: "active",
      });
      console.log("Seeded admin account");
    } else if (shouldReplaceAdminAvatar(existing.avatar)) {
      await User.updateOne({ _id: existing._id }, { $set: { avatar: await adminAvatarUrl(email) } });
      console.log("Set admin profile avatar");
    }
  }

  if (env.demoEmail && env.demoPassword) {
    const email = env.demoEmail.toLowerCase();
    if (!(await User.findOne({ email }))) {
      const demo = await User.create({
        email,
        passwordHash: await bcrypt.hash(env.demoPassword, 12),
        fullName: "Naledi Khumalo",
        headline: "Full-Stack Developer & UI Engineer",
        specialization: "Apps",
        about: "BBD Select graduate specialising in production React Native apps.",
        skills: ["React Native", "TypeScript", "Node.js", "Figma"],
        avatar: avatarFor(email),
        cover: SEED_IMAGES.mobile1,
        availableForWork: true,
        featured: true,
        status: "approved",
        role: "user",
        graduateStatus: "active",
        links: {
          linkedin: "https://linkedin.com/in/naledi",
          github: "https://github.com/naledi",
          website: "https://naledi.dev",
        },
        approvedAt: new Date(),
      });

      if ((await Project.countDocuments()) === 0) {
        await Project.create({
          title: "Pulse Health",
          name: "Pulse Health",
          shortDescription: "Telehealth companion for African clinics",
          description: "A production-ready telehealth platform built with React Native.",
          category: "Apps",
          type: "Mobile App",
          cover: SEED_IMAGES.mobile2,
          logo: SEED_IMAGES.mobile1,
          gallery: [SEED_IMAGES.mobile2, SEED_IMAGES.mobile1],
          technologies: ["React Native", "TypeScript", "Node.js"],
          ownerId: demo._id,
          ownerName: demo.fullName,
          graduateIds: [demo._id],
          status: "published",
          featured: true,
        });
        console.log("Seeded demo project");
      }

      console.log("Seeded demo graduate");
    }
  }

  const runDemo = options?.demo || env.seedDemo;
  if (runDemo) {
    await seedDemoData(options?.force || process.argv.includes("--force"));
    await syncAllGraduateProjectIds();
  }
}

if (require.main === module) {
  const demo = process.argv.includes("--demo");
  const force = process.argv.includes("--force");
  connectDb()
    .then(() => seedDatabase({ demo: demo || process.env.SEED_DEMO === "true", force }))
    .then(() => disconnectDb())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
