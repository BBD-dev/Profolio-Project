import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { User, UserStatus, GraduateStatus } from "../models/User";
import { Project } from "../models/Project";
import { Category } from "../models/Category";
import { Activity } from "../models/Activity";
import { MediaItem } from "../models/MediaItem";
import { SEED_AVATARS, SEED_IMAGES as IMG, avatarFor } from "./seedMedia";

const DEMO_PASSWORD = "Password123!";

interface DemoUserSpec {
  email: string;
  fullName: string;
  phone: string;
  university: string;
  specialization: string;
  skills: string[];
  about: string;
  avatar: string;
  cover: string;
  status: UserStatus;
  graduateStatus?: GraduateStatus;
  availableForWork?: boolean;
  featured?: boolean;
  adminNote?: string;
  links?: Record<string, string>;
  createdAt: Date;
}

const DEMO_USERS: DemoUserSpec[] = [
  {
    email: "layla.haddad@bbd.dev",
    fullName: "Layla Haddad",
    phone: "+962 79 555 1042",
    university: "University of Jordan",
    specialization: "Mobile Developer",
    skills: ["React Native", "Flutter", "TypeScript", "Firebase"],
    about: "Mobile engineer focused on delightful, performant cross-platform experiences.",
    avatar: avatarFor("layla.haddad@bbd.dev"),
    cover: IMG.mobile1,
    status: "approved",
    graduateStatus: "active",
    availableForWork: true,
    featured: true,
    links: { github: "https://github.com/laylah", linkedin: "https://linkedin.com/in/laylah", portfolio: "https://layla.dev" },
    createdAt: new Date("2025-11-02"),
  },
  {
    email: "omar.nassar@bbd.dev",
    fullName: "Omar Nassar",
    phone: "+962 78 221 8890",
    university: "Princess Sumaya University",
    specialization: "Full-Stack Developer",
    skills: ["Node.js", "React", "MongoDB", "AWS"],
    about: "Full-stack developer who loves clean architecture and scalable APIs.",
    avatar: avatarFor("omar.nassar@bbd.dev"),
    cover: IMG.web1,
    status: "approved",
    graduateStatus: "active",
    availableForWork: true,
    featured: true,
    links: { github: "https://github.com/omarn", linkedin: "https://linkedin.com/in/omarn", website: "https://omarn.io" },
    createdAt: new Date("2025-10-18"),
  },
  {
    email: "nour.khalil@bbd.dev",
    fullName: "Nour Khalil",
    phone: "+962 77 908 2231",
    university: "German Jordanian University",
    specialization: "UI/UX Designer",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    about: "Product designer crafting interfaces people love, from research to pixel-perfect delivery.",
    avatar: avatarFor("nour.khalil@bbd.dev"),
    cover: IMG.gd1,
    status: "approved",
    graduateStatus: "active",
    availableForWork: false,
    featured: false,
    links: { behance: "https://behance.net/nourk", dribbble: "https://dribbble.com/nourk", portfolio: "https://nour.design" },
    createdAt: new Date("2025-09-30"),
  },
  {
    email: "yousef.barakat@bbd.dev",
    fullName: "Yousef Barakat",
    phone: "+962 79 118 4420",
    university: "Yarmouk University",
    specialization: "Cybersecurity Analyst",
    skills: ["Penetration Testing", "SIEM", "Python", "Network Security"],
    about: "Security analyst passionate about offensive security and threat detection.",
    avatar: avatarFor("yousef.barakat@bbd.dev"),
    cover: IMG.cyber1,
    status: "approved",
    graduateStatus: "active",
    availableForWork: true,
    featured: true,
    links: { github: "https://github.com/yousefb", linkedin: "https://linkedin.com/in/yousefb" },
    createdAt: new Date("2025-11-20"),
  },
  {
    email: "salma.rashid@bbd.dev",
    fullName: "Salma Rashid",
    phone: "+962 78 664 7712",
    university: "Al-Balqa Applied University",
    specialization: "Motion Designer",
    skills: ["After Effects", "Cinema 4D", "Blender", "Storyboarding"],
    about: "Motion designer turning brands into memorable moving stories.",
    avatar: avatarFor("salma.rashid@bbd.dev"),
    cover: IMG.motion1,
    status: "approved",
    graduateStatus: "inactive",
    availableForWork: true,
    featured: false,
    links: { behance: "https://behance.net/salmar", dribbble: "https://dribbble.com/salmar" },
    createdAt: new Date("2025-08-14"),
  },
  {
    email: "hana.mansour@bbd.dev",
    fullName: "Hana Mansour",
    phone: "+962 77 445 9981",
    university: "Hashemite University",
    specialization: "Digital Marketer",
    skills: ["SEO", "Google Ads", "Content Strategy", "Analytics"],
    about: "Growth-focused marketer blending data and creativity to scale brands.",
    avatar: avatarFor("hana.mansour@bbd.dev"),
    cover: IMG.dash1,
    status: "approved",
    graduateStatus: "hidden",
    availableForWork: false,
    featured: false,
    links: { linkedin: "https://linkedin.com/in/hanam", website: "https://hanam.co" },
    createdAt: new Date("2025-07-22"),
  },
  {
    email: "dana.suleiman@gmail.com",
    fullName: "Dana Suleiman",
    phone: "+962 79 332 1188",
    university: "University of Jordan",
    specialization: "Frontend Developer",
    skills: ["React", "Next.js", "TypeScript", "TailwindCSS"],
    about: "Frontend developer passionate about accessible, high-performance web apps.",
    avatar: avatarFor("dana.suleiman@gmail.com"),
    cover: IMG.web2,
    status: "pending",
    links: { github: "https://github.com/danas", linkedin: "https://linkedin.com/in/danas", portfolio: "https://dana.dev" },
    createdAt: new Date("2026-01-08"),
  },
  {
    email: "karim.fares@gmail.com",
    fullName: "Karim Fares",
    phone: "+962 78 112 3344",
    university: "Princess Sumaya University",
    specialization: "Backend Developer",
    skills: ["Node.js", "Express", "PostgreSQL", "Redis"],
    about: "Backend engineer focused on distributed systems and clean API design.",
    avatar: avatarFor("karim.fares@gmail.com"),
    cover: IMG.code1,
    status: "pending",
    links: { github: "https://github.com/karimf", linkedin: "https://linkedin.com/in/karimf", website: "https://karim.io" },
    createdAt: new Date("2026-01-06"),
  },
  {
    email: "sami.darwish@gmail.com",
    fullName: "Sami Darwish",
    phone: "+962 77 654 8890",
    university: "Al-Balqa Applied University",
    specialization: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform"],
    about: "DevOps engineer automating everything from build to production.",
    avatar: avatarFor("sami.darwish@gmail.com"),
    cover: IMG.dash2,
    status: "pending",
    links: { github: "https://github.com/samid", linkedin: "https://linkedin.com/in/samid" },
    createdAt: new Date("2026-01-09"),
  },
  {
    email: "reem.odeh@gmail.com",
    fullName: "Reem Odeh",
    phone: "+962 77 210 9987",
    university: "German Jordanian University",
    specialization: "Product Designer",
    skills: ["Figma", "UX Research", "Design Systems"],
    about: "Designer bridging research and delivery to ship products that feel effortless.",
    avatar: avatarFor("reem.odeh@gmail.com"),
    cover: IMG.gd2,
    status: "changes_requested",
    adminNote: "Please add at least 2 case studies to your portfolio.",
    links: { behance: "https://behance.net/reemo", dribbble: "https://dribbble.com/reemo", portfolio: "https://reem.design" },
    createdAt: new Date("2026-01-03"),
  },
  {
    email: "tariq.zaid@gmail.com",
    fullName: "Tariq Zaid",
    phone: "+962 79 456 3321",
    university: "Yarmouk University",
    specialization: "Data Analyst",
    skills: ["SQL", "Python", "Power BI", "Statistics"],
    about: "Data analyst turning messy data into decisions leadership can act on.",
    avatar: avatarFor("tariq.zaid@gmail.com"),
    cover: IMG.dash1,
    status: "approved",
    graduateStatus: "active",
    availableForWork: true,
    featured: false,
    links: { linkedin: "https://linkedin.com/in/tariqz", github: "https://github.com/tariqz" },
    createdAt: new Date("2025-12-28"),
  },
  {
    email: "maya.habib@gmail.com",
    fullName: "Maya Habib",
    phone: "+962 78 889 1120",
    university: "Hashemite University",
    specialization: "Motion Designer",
    skills: ["After Effects", "Premiere Pro", "Blender"],
    about: "Motion designer with a love for kinetic type and 3D storytelling.",
    avatar: avatarFor("maya.habib@gmail.com"),
    cover: IMG.motion2,
    status: "rejected",
    adminNote: "Portfolio did not meet minimum project requirement.",
    links: { behance: "https://behance.net/mayah", dribbble: "https://dribbble.com/mayah" },
    createdAt: new Date("2025-12-20"),
  },
];

interface DemoProjectSpec {
  slug: string;
  ownerEmail: string;
  title: string;
  subtitle: string;
  description: string;
  categorySlug: string;
  type: string;
  cover: string;
  logo: string;
  gallery: string[];
  technologies: string[];
  demoUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  downloadUrl?: string;
  completionDate: string;
  status: "published" | "hidden" | "draft";
  featured: boolean;
  createdAt: Date;
}

const DEMO_PROJECTS: DemoProjectSpec[] = [
  {
    slug: "tabaq",
    ownerEmail: "layla.haddad@bbd.dev",
    title: "Tabaq",
    subtitle: "Food delivery, reimagined",
    description: "A cross-platform food ordering app with live tracking and smart recommendations.",
    categorySlug: "apps",
    type: "Mobile App",
    cover: IMG.mobile1,
    logo: IMG.mobile2,
    gallery: [IMG.mobile1, IMG.mobile2],
    technologies: ["React Native", "TypeScript", "Firebase", "Stripe"],
    demoUrl: "https://tabaq.app",
    websiteUrl: "https://tabaq.app",
    downloadUrl: "https://apps.apple.com",
    githubUrl: "https://github.com/laylah/tabaq",
    completionDate: "2025-12-01",
    status: "published",
    featured: true,
    createdAt: new Date("2025-12-02"),
  },
  {
    slug: "ledgerly",
    ownerEmail: "omar.nassar@bbd.dev",
    title: "Ledgerly",
    subtitle: "SaaS invoicing platform",
    description: "A full-stack invoicing and accounting dashboard for freelancers.",
    categorySlug: "websites",
    type: "Website",
    cover: IMG.web1,
    logo: IMG.dash2,
    gallery: [IMG.web1, IMG.dash2, IMG.code1],
    technologies: ["React", "Node.js", "MongoDB", "TailwindCSS"],
    demoUrl: "https://ledgerly.io",
    websiteUrl: "https://ledgerly.io",
    githubUrl: "https://github.com/omarn/ledgerly",
    completionDate: "2025-11-15",
    status: "published",
    featured: true,
    createdAt: new Date("2025-11-16"),
  },
  {
    slug: "aura-banking",
    ownerEmail: "nour.khalil@bbd.dev",
    title: "Aura Banking",
    subtitle: "Neobank design system",
    description: "An end-to-end product design and design system for a modern neobank.",
    categorySlug: "websites",
    type: "UI/UX",
    cover: IMG.gd1,
    logo: IMG.gd2,
    gallery: [IMG.gd1, IMG.gd2],
    technologies: ["Figma", "Design Tokens", "Prototyping"],
    demoUrl: "https://figma.com",
    completionDate: "2025-10-20",
    status: "published",
    featured: false,
    createdAt: new Date("2025-10-21"),
  },
  {
    slug: "sentinel-ops",
    ownerEmail: "yousef.barakat@bbd.dev",
    title: "SentinelOps",
    subtitle: "Threat detection dashboard",
    description: "A SIEM analytics console visualizing real-time threats and incident response.",
    categorySlug: "cybersecurity",
    type: "Cybersecurity",
    cover: IMG.cyber1,
    logo: IMG.dash1,
    gallery: [IMG.cyber1, IMG.dash1],
    technologies: ["Python", "Elastic", "Kibana", "Docker"],
    githubUrl: "https://github.com/yousefb/sentinelops",
    completionDate: "2025-12-05",
    status: "published",
    featured: true,
    createdAt: new Date("2025-12-06"),
  },
  {
    slug: "momentum",
    ownerEmail: "salma.rashid@bbd.dev",
    title: "Momentum",
    subtitle: "Brand launch film",
    description: "A 60-second animated brand film combining 3D motion and typography.",
    categorySlug: "motion-graphics",
    type: "Motion Graphics",
    cover: IMG.motion1,
    logo: IMG.motion2,
    gallery: [IMG.motion1, IMG.motion2],
    technologies: ["After Effects", "Cinema 4D", "Octane"],
    demoUrl: "https://vimeo.com",
    completionDate: "2025-09-12",
    status: "draft",
    featured: false,
    createdAt: new Date("2025-09-13"),
  },
  {
    slug: "fitpulse",
    ownerEmail: "layla.haddad@bbd.dev",
    title: "FitPulse",
    subtitle: "AI fitness companion",
    description: "A mobile fitness app with AI-generated workout plans and habit tracking.",
    categorySlug: "apps",
    type: "Mobile App",
    cover: IMG.mobile2,
    logo: IMG.mobile1,
    gallery: [IMG.mobile2],
    technologies: ["Flutter", "Dart", "TensorFlow Lite"],
    demoUrl: "https://fitpulse.app",
    downloadUrl: "https://play.google.com",
    completionDate: "2025-11-28",
    status: "published",
    featured: false,
    createdAt: new Date("2025-11-29"),
  },
  {
    slug: "bloom-studio",
    ownerEmail: "nour.khalil@bbd.dev",
    title: "Bloom Studio",
    subtitle: "Creative agency identity",
    description: "Full visual identity and marketing collateral for a boutique creative studio.",
    categorySlug: "graphic-design",
    type: "Graphic Design",
    cover: IMG.gd2,
    logo: IMG.gd1,
    gallery: [IMG.gd2, IMG.gd1],
    technologies: ["Illustrator", "Photoshop", "InDesign"],
    demoUrl: "https://behance.net",
    completionDate: "2025-08-30",
    status: "hidden",
    featured: false,
    createdAt: new Date("2025-08-31"),
  },
];

const DEMO_ACTIVITY = [
  { kind: "request" as const, message: "Dana Suleiman submitted a graduate registration request", createdAt: new Date("2026-01-08") },
  { kind: "request" as const, message: "Sami Darwish submitted a graduate registration request", createdAt: new Date("2026-01-09") },
  { kind: "graduate" as const, message: "Layla Haddad profile was approved and published", createdAt: new Date("2025-11-02") },
  { kind: "project" as const, message: "Tabaq was published as a featured project", createdAt: new Date("2025-12-02") },
  { kind: "project" as const, message: "Ledgerly was published as a featured project", createdAt: new Date("2025-11-16") },
  { kind: "request" as const, message: "Changes requested on Reem Odeh's application", createdAt: new Date("2026-01-04") },
  { kind: "request" as const, message: "Maya Habib's request was rejected", createdAt: new Date("2025-12-21") },
  { kind: "system" as const, message: "Homepage sections were reordered", createdAt: new Date("2026-01-10") },
];

const DEMO_MEDIA = [
  { name: "tabaq-cover.jpg", type: "image" as const, url: IMG.mobile1, size: "1.2 MB" },
  { name: "ledgerly-dashboard.jpg", type: "image" as const, url: IMG.web1, size: "0.9 MB" },
  { name: "aura-logo.png", type: "logo" as const, url: IMG.gd2, size: "220 KB" },
  { name: "sentinel-ops.jpg", type: "image" as const, url: IMG.cyber1, size: "1.6 MB" },
  { name: "bloom-identity.jpg", type: "image" as const, url: IMG.gd1, size: "1.1 MB" },
  { name: "fitpulse-preview.jpg", type: "image" as const, url: IMG.mobile2, size: "0.8 MB" },
  { name: "motion-reel-thumb.jpg", type: "image" as const, url: IMG.motion1, size: "1.0 MB" },
  { name: "sample-cv.pdf", type: "cv" as const, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "13 KB" },
];

async function upsertDemoUser(spec: DemoUserSpec, passwordHash: string): Promise<Types.ObjectId> {
  const email = spec.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { $set: { avatar: spec.avatar, cover: spec.cover } },
    );
    return existing._id;
  }

  const user = await User.create({
    email,
    passwordHash,
    fullName: spec.fullName,
    phone: spec.phone,
    university: spec.university,
    specialization: spec.specialization,
    skills: spec.skills,
    about: spec.about,
    avatar: spec.avatar,
    cover: spec.cover,
    status: spec.status,
    role: "user",
    graduateStatus: spec.graduateStatus || "inactive",
    availableForWork: spec.availableForWork ?? true,
    featured: spec.featured ?? false,
    adminNote: spec.adminNote,
    links: spec.links || {},
    approvedAt: spec.status === "approved" ? spec.createdAt : undefined,
    createdAt: spec.createdAt,
    updatedAt: spec.createdAt,
  });
  return user._id;
}

export async function seedDemoData(force = false): Promise<void> {
  if (force) {
    const demoEmails = DEMO_USERS.map((u) => u.email.toLowerCase());
    const demoUsers = await User.find({ email: { $in: demoEmails } }).select("_id");
    const demoUserIds = demoUsers.map((u) => u._id);
    if (demoUserIds.length) {
      await Project.deleteMany({ ownerId: { $in: demoUserIds } });
      await User.deleteMany({ _id: { $in: demoUserIds } });
    }
    console.log("Cleared existing demo users and their projects");
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const userIds = new Map<string, Types.ObjectId>();

  for (const spec of DEMO_USERS) {
    const id = await upsertDemoUser(spec, passwordHash);
    userIds.set(spec.email.toLowerCase(), id);
  }
  console.log(`Seeded ${DEMO_USERS.length} demo users`);

  const categories = await Category.find();
  const catBySlug = new Map(categories.map((c) => [c.slug, c._id]));

  const projectIdsByOwner = new Map<string, Types.ObjectId[]>();

  for (const spec of DEMO_PROJECTS) {
    const ownerId = userIds.get(spec.ownerEmail.toLowerCase());
    if (!ownerId) continue;

    const existing = await Project.findOne({ title: spec.title, ownerId });
    if (existing) {
      await Project.updateOne(
        { _id: existing._id },
        {
          $set: {
            cover: spec.cover,
            logo: spec.logo,
            gallery: spec.gallery,
          },
        },
      );
      const list = projectIdsByOwner.get(spec.ownerEmail.toLowerCase()) || [];
      list.push(existing._id);
      projectIdsByOwner.set(spec.ownerEmail.toLowerCase(), list);
      continue;
    }

    const categoryId = catBySlug.get(spec.categorySlug);
    const project = await Project.create({
      title: spec.title,
      name: spec.title,
      subtitle: spec.subtitle,
      shortDescription: spec.subtitle,
      description: spec.description,
      category: categoryId || spec.categorySlug,
      type: spec.type,
      cover: spec.cover,
      logo: spec.logo,
      gallery: spec.gallery,
      technologies: spec.technologies,
      demoUrl: spec.demoUrl,
      websiteUrl: spec.websiteUrl,
      downloadUrl: spec.downloadUrl,
      githubUrl: spec.githubUrl,
      ownerId,
      ownerName: DEMO_USERS.find((u) => u.email.toLowerCase() === spec.ownerEmail.toLowerCase())?.fullName,
      graduateIds: [ownerId],
      completionDate: spec.completionDate,
      status: spec.status,
      featured: spec.featured,
      createdAt: spec.createdAt,
      updatedAt: spec.createdAt,
    });

    const list = projectIdsByOwner.get(spec.ownerEmail.toLowerCase()) || [];
    list.push(project._id);
    projectIdsByOwner.set(spec.ownerEmail.toLowerCase(), list);
  }
  console.log(`Seeded ${DEMO_PROJECTS.length} demo projects`);

  for (const [email, ids] of projectIdsByOwner) {
    const userId = userIds.get(email);
    if (userId && ids.length) {
      await User.updateOne({ _id: userId }, { $addToSet: { projectIds: { $each: ids } } });
    }
  }

  if ((await Activity.countDocuments()) < 5) {
    await Activity.insertMany(DEMO_ACTIVITY);
    console.log("Seeded demo activity feed");
  }

  let mediaUpserted = 0;
  for (const item of DEMO_MEDIA) {
    await MediaItem.updateOne(
      { name: item.name },
      { $set: { type: item.type, url: item.url, size: item.size } },
      { upsert: true },
    );
    mediaUpserted++;
  }
  console.log(`Synced ${mediaUpserted} demo media library items`);
}

export { avatarFor, IMG, SEED_AVATARS };
