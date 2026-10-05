import {
  GraduateRequest, Graduate, Project, Category,
  HomepageSection, MediaItem, Settings, Activity,
} from "@/types";
import { SEED_AVATARS as AV, SEED_IMAGES as IMG, avatarFor } from "./seedMedia";

export const seedCategories: Category[] = [
  { id: "cat_mobile", name: "Mobile Apps", slug: "mobile-apps", icon: "smartphone", type: "Mobile App", enabled: true },
  { id: "cat_web", name: "Web Development", slug: "web-development", icon: "globe", type: "Website", enabled: true },
  { id: "cat_uiux", name: "UI/UX", slug: "ui-ux", icon: "layout", type: "UI/UX", enabled: true },
  { id: "cat_graphic", name: "Graphic Design", slug: "graphic-design", icon: "palette", type: "Graphic Design", enabled: true },
  { id: "cat_motion", name: "Motion Graphics", slug: "motion-graphics", icon: "film", type: "Motion Graphics", enabled: true },
  { id: "cat_marketing", name: "Digital Marketing", slug: "digital-marketing", icon: "megaphone", type: "Digital Marketing", enabled: true },
  { id: "cat_cyber", name: "Cybersecurity", slug: "cybersecurity", icon: "shield", type: "Cybersecurity", enabled: true },
];

export const seedGraduates: Graduate[] = [
  {
    id: "grad_1", name: "Layla Haddad", email: "layla.haddad@bbd.dev", phone: "+962 79 555 1042",
    university: "University of Jordan", specialization: "Mobile Developer",
    skills: ["React Native", "Flutter", "TypeScript", "Firebase"],
    bio: "Mobile engineer focused on delightful, performant cross-platform experiences. Built 4 production apps during BBD Select.",
    avatar: AV.a1, cover: IMG.mobile1, cvUrl: "/cv/layla-haddad.pdf",
    social: { github: "github.com/laylah", linkedin: "linkedin.com/in/laylah", portfolio: "layla.dev" },
    availableForWork: true, status: "active", projectIds: ["proj_1", "proj_6"], createdAt: "2025-11-02",
  },
  {
    id: "grad_2", name: "Omar Nassar", email: "omar.nassar@bbd.dev", phone: "+962 78 221 8890",
    university: "Princess Sumaya University", specialization: "Full-Stack Developer",
    skills: ["Node.js", "React", "MongoDB", "AWS"],
    bio: "Full-stack developer who loves clean architecture and scalable APIs.",
    avatar: AV.a3, cover: IMG.web1, cvUrl: "/cv/omar-nassar.pdf",
    social: { github: "github.com/omarn", linkedin: "linkedin.com/in/omarn", website: "omarn.io" },
    availableForWork: true, status: "active", projectIds: ["proj_2"], createdAt: "2025-10-18",
  },
  {
    id: "grad_3", name: "Nour Khalil", email: "nour.khalil@bbd.dev", phone: "+962 77 908 2231",
    university: "German Jordanian University", specialization: "UI/UX Designer",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    bio: "Product designer crafting interfaces people love, from research to pixel-perfect delivery.",
    avatar: AV.a4, cover: IMG.gd1, cvUrl: "/cv/nour-khalil.pdf",
    social: { behance: "behance.net/nourk", dribbble: "dribbble.com/nourk", portfolio: "nour.design" },
    availableForWork: false, status: "active", projectIds: ["proj_3", "proj_7"], createdAt: "2025-09-30",
  },
  {
    id: "grad_4", name: "Yousef Barakat", email: "yousef.barakat@bbd.dev", phone: "+962 79 118 4420",
    university: "Yarmouk University", specialization: "Cybersecurity Analyst",
    skills: ["Penetration Testing", "SIEM", "Python", "Network Security"],
    bio: "Security analyst passionate about offensive security and threat detection.",
    avatar: AV.a7, cover: IMG.cyber1, cvUrl: "/cv/yousef-barakat.pdf",
    social: { github: "github.com/yousefb", linkedin: "linkedin.com/in/yousefb" },
    availableForWork: true, status: "active", projectIds: ["proj_4"], createdAt: "2025-11-20",
  },
  {
    id: "grad_5", name: "Salma Rashid", email: "salma.rashid@bbd.dev", phone: "+962 78 664 7712",
    university: "Al-Balqa Applied University", specialization: "Motion Designer",
    skills: ["After Effects", "Cinema 4D", "Blender", "Storyboarding"],
    bio: "Motion designer turning brands into memorable moving stories.",
    avatar: AV.a5, cover: IMG.motion1, cvUrl: "/cv/salma-rashid.pdf",
    social: { behance: "behance.net/salmar", dribbble: "dribbble.com/salmar" },
    availableForWork: true, status: "inactive", projectIds: ["proj_5"], createdAt: "2025-08-14",
  },
  {
    id: "grad_6", name: "Hana Mansour", email: "hana.mansour@bbd.dev", phone: "+962 77 445 9981",
    university: "Hashemite University", specialization: "Digital Marketer",
    skills: ["SEO", "Google Ads", "Content Strategy", "Analytics"],
    bio: "Growth-focused marketer blending data and creativity to scale brands.",
    avatar: AV.a6, cover: IMG.dash1, cvUrl: "/cv/hana-mansour.pdf",
    social: { linkedin: "linkedin.com/in/hanam", website: "hanam.co" },
    availableForWork: false, status: "hidden", projectIds: [], createdAt: "2025-07-22",
  },
];

export const seedProjects: Project[] = [
  {
    id: "proj_1", title: "Tabaq", subtitle: "Food delivery, reimagined",
    description: "A cross-platform food ordering app with live tracking, smart recommendations and a frictionless checkout built for the MENA market.",
    category: "cat_mobile", type: "Mobile App", cover: IMG.mobile1, logo: IMG.mobile2,
    gallery: [IMG.mobile1, IMG.mobile2], video: "", technologies: ["React Native", "TypeScript", "Firebase", "Stripe"],
    demoUrl: "https://tabaq.app", websiteUrl: "https://tabaq.app", downloadUrl: "https://apps.apple.com", githubUrl: "https://github.com/laylah/tabaq",
    completionDate: "2025-12-01", status: "published", featured: true, graduateIds: ["grad_1"], createdAt: "2025-12-02",
  },
  {
    id: "proj_2", title: "Ledgerly", subtitle: "SaaS invoicing platform",
    description: "A full-stack invoicing and accounting dashboard for freelancers with automated reminders and multi-currency support.",
    category: "cat_web", type: "Website", cover: IMG.web1, logo: IMG.dash2,
    gallery: [IMG.web1, IMG.dash2, IMG.code1], technologies: ["React", "Node.js", "MongoDB", "TailwindCSS"],
    demoUrl: "https://ledgerly.io", websiteUrl: "https://ledgerly.io", githubUrl: "https://github.com/omarn/ledgerly",
    completionDate: "2025-11-15", status: "published", featured: true, graduateIds: ["grad_2"], createdAt: "2025-11-16",
  },
  {
    id: "proj_3", title: "Aura Banking", subtitle: "Neobank design system",
    description: "An end-to-end product design and design system for a modern neobank, covering onboarding to investments.",
    category: "cat_uiux", type: "UI/UX", cover: IMG.gd1, logo: IMG.gd2,
    gallery: [IMG.gd1, IMG.gd2], technologies: ["Figma", "Design Tokens", "Prototyping"],
    demoUrl: "https://figma.com", websiteUrl: "", completionDate: "2025-10-20", status: "published",
    featured: false, graduateIds: ["grad_3"], createdAt: "2025-10-21",
  },
  {
    id: "proj_4", title: "SentinelOps", subtitle: "Threat detection dashboard",
    description: "A SIEM analytics console visualizing real-time threats, anomaly detection and automated incident response playbooks.",
    category: "cat_cyber", type: "Cybersecurity", cover: IMG.cyber1, logo: IMG.dash1,
    gallery: [IMG.cyber1, IMG.dash1], technologies: ["Python", "Elastic", "Kibana", "Docker"],
    demoUrl: "", githubUrl: "https://github.com/yousefb/sentinelops", completionDate: "2025-12-05", status: "published",
    featured: true, graduateIds: ["grad_4"], createdAt: "2025-12-06",
  },
  {
    id: "proj_5", title: "Momentum", subtitle: "Brand launch film",
    description: "A 60-second animated brand film combining 3D motion and typography to launch a fintech startup.",
    category: "cat_motion", type: "Motion Graphics", cover: IMG.motion1, logo: IMG.motion2,
    gallery: [IMG.motion1, IMG.motion2], video: "https://youtube.com", technologies: ["After Effects", "Cinema 4D", "Octane"],
    demoUrl: "https://vimeo.com", completionDate: "2025-09-12", status: "draft", featured: false,
    graduateIds: ["grad_5"], createdAt: "2025-09-13",
  },
  {
    id: "proj_6", title: "FitPulse", subtitle: "AI fitness companion",
    description: "A mobile fitness app with AI-generated workout plans, habit tracking and social challenges.",
    category: "cat_mobile", type: "Mobile App", cover: IMG.mobile2, logo: IMG.mobile1,
    gallery: [IMG.mobile2], technologies: ["Flutter", "Dart", "TensorFlow Lite"],
    demoUrl: "https://fitpulse.app", downloadUrl: "https://play.google.com", completionDate: "2025-11-28", status: "published",
    featured: false, graduateIds: ["grad_1"], createdAt: "2025-11-29",
  },
  {
    id: "proj_7", title: "Bloom Studio", subtitle: "Creative agency identity",
    description: "Full visual identity and marketing collateral for a boutique creative studio, from logo to social kit.",
    category: "cat_graphic", type: "Graphic Design", cover: IMG.gd2, logo: IMG.gd1,
    gallery: [IMG.gd2, IMG.gd1], technologies: ["Illustrator", "Photoshop", "InDesign"],
    demoUrl: "https://behance.net", completionDate: "2025-08-30", status: "hidden", featured: false,
    graduateIds: ["grad_3"], createdAt: "2025-08-31",
  },
];

export const seedRequests: GraduateRequest[] = [
  {
    id: "req_1", photo: AV.a2, fullName: "Dana Suleiman", email: "dana.suleiman@gmail.com", phone: "+962 79 332 1188",
    university: "University of Jordan", specialization: "Frontend Developer",
    skills: ["React", "Next.js", "TypeScript", "TailwindCSS"],
    about: "Frontend developer passionate about accessible, high-performance web apps. Completed 3 real client projects at BBD Select.",
    cvUrl: "/cv/dana-suleiman.pdf",
    social: { github: "github.com/danas", linkedin: "linkedin.com/in/danas", portfolio: "dana.dev", dribbble: "dribbble.com/danas" },
    requestDate: "2026-01-08", status: "pending",
  },
  {
    id: "req_2", photo: avatarFor("karim.fares@gmail.com"), fullName: "Karim Fares", email: "karim.fares@gmail.com", phone: "+962 78 771 2044",
    university: "Princess Sumaya University", specialization: "Backend Developer",
    skills: ["Node.js", "Express", "PostgreSQL", "Redis"],
    about: "Backend engineer focused on distributed systems and clean API design.",
    cvUrl: "/cv/karim-fares.pdf",
    social: { github: "github.com/karimf", linkedin: "linkedin.com/in/karimf", website: "karim.io" },
    requestDate: "2026-01-06", status: "pending",
  },
  {
    id: "req_3", photo: avatarFor("reem.odeh@gmail.com"), fullName: "Reem Odeh", email: "reem.odeh@gmail.com", phone: "+962 77 210 9987",
    university: "German Jordanian University", specialization: "Product Designer",
    skills: ["Figma", "UX Research", "Design Systems"],
    about: "Designer bridging research and delivery to ship products that feel effortless.",
    cvUrl: "/cv/reem-odeh.pdf",
    social: { behance: "behance.net/reemo", dribbble: "dribbble.com/reemo", portfolio: "reem.design" },
    requestDate: "2026-01-03", status: "changes_requested", note: "Please add at least 2 case studies to your portfolio.",
  },
  {
    id: "req_4", photo: avatarFor("tariq.zaid@gmail.com"), fullName: "Tariq Zaid", email: "tariq.zaid@gmail.com", phone: "+962 79 456 3321",
    university: "Yarmouk University", specialization: "Data Analyst",
    skills: ["SQL", "Python", "Power BI", "Statistics"],
    about: "Data analyst turning messy data into decisions leadership can act on.",
    cvUrl: "/cv/tariq-zaid.pdf",
    social: { linkedin: "linkedin.com/in/tariqz", github: "github.com/tariqz" },
    requestDate: "2025-12-28", status: "approved",
  },
  {
    id: "req_5", photo: avatarFor("maya.habib@gmail.com"), fullName: "Maya Habib", email: "maya.habib@gmail.com", phone: "+962 78 889 1120",
    university: "Hashemite University", specialization: "Motion Designer",
    skills: ["After Effects", "Premiere Pro", "Blender"],
    about: "Motion designer with a love for kinetic type and 3D storytelling.",
    cvUrl: "/cv/maya-habib.pdf",
    social: { behance: "behance.net/mayah", dribbble: "dribbble.com/mayah" },
    requestDate: "2025-12-20", status: "rejected", note: "Portfolio did not meet minimum project requirement.",
  },
  {
    id: "req_6", photo: avatarFor("sami.darwish@gmail.com"), fullName: "Sami Darwish", email: "sami.darwish@gmail.com", phone: "+962 77 654 8890",
    university: "Al-Balqa Applied University", specialization: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform"],
    about: "DevOps engineer automating everything from build to production.",
    cvUrl: "/cv/sami-darwish.pdf",
    social: { github: "github.com/samid", linkedin: "linkedin.com/in/samid" },
    requestDate: "2026-01-09", status: "pending",
  },
];

export const seedHomepage: HomepageSection[] = [
  { id: "hp_hero", key: "hero", title: "Hero Section", description: "Main banner shown at the top of the mobile app.", visible: true, order: 0 },
  { id: "hp_feat_grad", key: "featured_graduates", title: "Featured Graduates", description: "Highlighted graduate profiles.", visible: true, order: 1 },
  { id: "hp_feat_proj", key: "featured_projects", title: "Featured Projects", description: "Curated standout projects.", visible: true, order: 2 },
  { id: "hp_latest_proj", key: "latest_projects", title: "Latest Projects", description: "Most recently published projects.", visible: true, order: 3 },
  { id: "hp_latest_grad", key: "latest_graduates", title: "Latest Graduates", description: "Newest approved graduates.", visible: false, order: 4 },
];

export const seedMedia: MediaItem[] = [
  { id: "m1", name: "tabaq-cover.jpg", type: "image", url: IMG.mobile1, size: "1.2 MB", uploadedAt: "2025-12-02" },
  { id: "m2", name: "ledgerly-dashboard.jpg", type: "image", url: IMG.web1, size: "0.9 MB", uploadedAt: "2025-11-16" },
  { id: "m3", name: "aura-logo.png", type: "logo", url: IMG.gd2, size: "220 KB", uploadedAt: "2025-10-21" },
  { id: "m4", name: "sentinel-ops.jpg", type: "image", url: IMG.cyber1, size: "1.6 MB", uploadedAt: "2025-12-06" },
  { id: "m5", name: "momentum-film.mp4", type: "video", url: IMG.motion1, size: "24.8 MB", uploadedAt: "2025-09-13" },
  { id: "m6", name: "bloom-identity.jpg", type: "image", url: IMG.gd1, size: "1.1 MB", uploadedAt: "2025-08-31" },
  { id: "m7", name: "layla-haddad-cv.pdf", type: "cv", url: "/cv/layla-haddad.pdf", size: "180 KB", uploadedAt: "2025-11-02" },
  { id: "m8", name: "fitpulse-preview.jpg", type: "image", url: IMG.mobile2, size: "0.8 MB", uploadedAt: "2025-11-29" },
  { id: "m9", name: "omar-nassar-cv.pdf", type: "document", url: "/cv/omar-nassar.pdf", size: "165 KB", uploadedAt: "2025-10-18" },
  { id: "m10", name: "motion-reel.mp4", type: "video", url: IMG.motion2, size: "18.2 MB", uploadedAt: "2025-09-12" },
];

export const seedSettings: Settings = {
  platformName: "BBD PROFOLIO",
  logo: "",
  primaryColor: "#0A1330",
  accentColor: "#C8D62B",
  social: { instagram: "instagram.com/bbdselect", twitter: "x.com/bbdselect", linkedin: "linkedin.com/company/bbdselect", youtube: "youtube.com/@bbdselect" },
  contactEmail: "hello@bbdselect.com",
  contactPhone: "+962 6 500 1200",
  address: "King Hussein Business Park, Amman, Jordan",
  privacyPolicy: "BBD PROFOLIO respects your privacy. We only collect data required to showcase verified graduate profiles and projects.",
  terms: "By using BBD PROFOLIO you agree to display accurate professional information. Profiles are verified by BBD Select administrators.",
};

export const seedActivity: Activity[] = [
  { id: "act_1", kind: "request", message: "Dana Suleiman submitted a new graduate request", timestamp: "2026-01-08T09:24:00Z" },
  { id: "act_2", kind: "project", message: "Project 'SentinelOps' was published", timestamp: "2026-01-07T14:10:00Z" },
  { id: "act_3", kind: "graduate", message: "Layla Haddad marked as Available for Work", timestamp: "2026-01-06T11:02:00Z" },
  { id: "act_4", kind: "request", message: "Sami Darwish submitted a new graduate request", timestamp: "2026-01-09T08:15:00Z" },
  { id: "act_5", kind: "system", message: "Homepage 'Latest Graduates' section hidden", timestamp: "2026-01-05T16:40:00Z" },
];
