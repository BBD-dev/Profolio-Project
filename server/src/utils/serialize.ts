import { IUser } from "../models/User";
import { IProject } from "../models/Project";
import { ICategory } from "../models/Category";
import { DEFAULT_COVER } from "../constants/placeholders";
import { normalizeGallery } from "./gallery";

const PROJECT_TYPE_TO_CATEGORY: Record<string, string> = {
  "Mobile App": "Apps",
  Apps: "Apps",
  Website: "Websites",
  Websites: "Websites",
  "UI/UX": "Websites",
  "Graphic Design": "Graphic Design",
  "Motion Graphics": "Motion Graphics",
  "Digital Marketing": "Digital Marketing",
  Cybersecurity: "Cybersecurity",
};

export const CATEGORY_TO_PROJECT_TYPES: Record<string, string[]> = {
  Apps: ["Mobile App", "Apps"],
  Websites: ["Website", "Websites", "UI/UX"],
  "Graphic Design": ["Graphic Design"],
  "Motion Graphics": ["Motion Graphics"],
  "Digital Marketing": ["Digital Marketing"],
  Cybersecurity: ["Cybersecurity"],
};

function projectCategoryLabel(project: IProject): string {
  const raw = String(project.category ?? "");
  if (PROJECT_TYPE_TO_CATEGORY[raw]) return PROJECT_TYPE_TO_CATEGORY[raw];
  return PROJECT_TYPE_TO_CATEGORY[project.type] || project.type || "Apps";
}

const ids = (list?: { toString(): string }[]) => (list ?? []).map((id) => id.toString());
const iso = (d?: Date) => (d ? new Date(d).toISOString() : new Date(0).toISOString());
const day = (d?: Date) => iso(d).slice(0, 10);

export function serializeUser(user: IUser) {
  return {
    id: user._id.toString(),
    email: user.email,
    full_name: user.fullName,
    status: user.status,
    role: user.role,
    headline: user.headline,
    about: user.about,
    specialization: user.specialization,
    university: user.university,
    phone: user.phone,
    skills: user.skills,
    avatar: user.avatar,
    cover: user.cover,
    cv_url: user.cvUrl,
    resume_name: user.resumeName,
    available_for_work: user.availableForWork,
    featured: user.featured,
    experience: user.experience ?? [],
    links: user.links ?? {},
    project_ids: ids(user.projectIds),
    created_at: iso(user.createdAt),
  };
}

/** Dashboard: registration request shape */
export function serializeRequest(user: IUser) {
  return {
    id: user._id.toString(),
    photo: user.avatar || "",
    cover: user.cover || "",
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    university: user.university || "",
    specialization: user.specialization || "",
    skills: user.skills,
    about: user.about || "",
    cvUrl: user.cvUrl || "",
    social: user.links || {},
    requestDate: day(user.createdAt),
    status: user.status === "approved" ? "approved" : user.status,
    note: user.adminNote,
  };
}

/** Dashboard: graduate directory shape */
export function serializeGraduate(user: IUser) {
  const status =
    user.status === "approved"
      ? user.graduateStatus
      : user.status === "pending" || user.status === "changes_requested"
        ? "inactive"
        : "hidden";

  return {
    id: user._id.toString(),
    name: user.fullName,
    email: user.email,
    phone: user.phone || "",
    university: user.university || "",
    specialization: user.specialization || "",
    headline: user.headline,
    bio: user.about || "",
    skills: user.skills,
    avatar: user.avatar || "",
    cover: user.cover || "",
    cvUrl: user.cvUrl || "",
    social: user.links || {},
    availableForWork: user.availableForWork,
    featured: user.featured,
    experience: user.experience ?? [],
    projectIds: ids(user.projectIds),
    createdAt: day(user.createdAt),
    status,
  };
}

/** Mobile app: public graduate profile shape */
export function serializeGraduateApp(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.fullName,
    headline: user.headline || "",
    specialization: user.specialization || "",
    about: user.about || "",
    skills: user.skills,
    avatar: user.avatar || "",
    cover: user.cover || "",
    availableForWork: user.availableForWork,
    links: { ...(user.links || {}), email: user.links?.email || user.email },
    experience: user.experience ?? [],
    resumeName: user.resumeName,
    cvUrl: user.cvUrl || "",
    projectIds: ids(user.projectIds),
    featured: user.featured,
    createdAt: iso(user.createdAt),
  };
}

export function serializeProject(project: IProject) {
  return {
    id: project._id.toString(),
    name: project.name,
    title: project.title,
    subtitle: project.subtitle || "",
    category: projectCategoryLabel(project),
    type: project.type,
    shortDescription: project.shortDescription || project.subtitle || "",
    description: project.description || "",
    cover: project.cover || DEFAULT_COVER,
    logo: project.logo || project.cover || DEFAULT_COVER,
    gallery: normalizeGallery(project.gallery, [project.cover, project.logo]),
    video: project.video,
    technologies: project.technologies,
    demoUrl: project.demoUrl,
    websiteUrl: project.websiteUrl,
    downloadUrl: project.downloadUrl,
    githubUrl: project.githubUrl,
    team: project.team ?? [],
    ownerId: project.ownerId?.toString() ?? "",
    ownerName: project.ownerName,
    graduateIds: ids(project.graduateIds),
    completionDate: project.completionDate || day(project.createdAt),
    status: project.status,
    featured: project.featured,
    createdAt: day(project.createdAt),
  };
}

export function serializeCategory(cat: ICategory) {
  return {
    id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    type: cat.type,
    enabled: cat.enabled,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function paginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}
