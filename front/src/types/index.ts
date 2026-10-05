export type RequestStatus = "pending" | "approved" | "rejected" | "changes_requested";
export type GraduateStatus = "active" | "inactive" | "hidden";
export type ProjectStatus = "published" | "hidden" | "draft";
export type MediaType = "image" | "logo" | "video" | "document" | "cv";

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  behance?: string;
  dribbble?: string;
  website?: string;
  portfolio?: string;
}

export interface GraduateRequest {
  id: string;
  photo: string;
  cover?: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  specialization: string;
  skills: string[];
  about: string;
  cvUrl: string;
  social: SocialLinks;
  requestDate: string;
  status: RequestStatus;
  note?: string;
}

export interface Graduate {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  specialization: string;
  skills: string[];
  bio: string;
  avatar: string;
  cover: string;
  cvUrl: string;
  social: SocialLinks;
  availableForWork: boolean;
  status: GraduateStatus;
  projectIds: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string; // category id
  type: string;
  cover: string;
  logo: string;
  gallery: string[];
  video?: string;
  technologies: string[];
  demoUrl?: string;
  websiteUrl?: string;
  downloadUrl?: string;
  githubUrl?: string;
  completionDate: string;
  status: ProjectStatus;
  featured: boolean;
  graduateIds: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  type: string;
  enabled: boolean;
}

export interface HomepageSection {
  id: string;
  key: string;
  title: string;
  description: string;
  visible: boolean;
  order: number;
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface Settings {
  platformName: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  social: SocialLinks & { instagram?: string; twitter?: string; youtube?: string };
  contactEmail: string;
  contactPhone: string;
  address: string;
  privacyPolicy: string;
  terms: string;
}

export interface Activity {
  id: string;
  kind: "request" | "project" | "graduate" | "system";
  message: string;
  timestamp: string;
}
