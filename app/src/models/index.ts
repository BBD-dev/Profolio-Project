// Domain models. Mirror the backend/API contract so the mock services can be
// swapped for real endpoints without touching the UI.

export type Category =
  | "Apps"
  | "Websites"
  | "Graphic Design"
  | "Motion Graphics"
  | "Digital Marketing"
  | "Cybersecurity";

export const CATEGORIES: Category[] = [
  "Apps",
  "Websites",
  "Graphic Design",
  "Motion Graphics",
  "Digital Marketing",
  "Cybersecurity",
];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
};

export type Project = {
  id: string;
  name: string;
  category: Category;
  shortDescription: string;
  description: string;
  cover: string;
  logo: string;
  technologies: string[];
  gallery: string[];
  demoUrl?: string;
  downloadUrl?: string;
  websiteUrl?: string;
  team: TeamMember[];
  ownerId: string;
  ownerName: string;
  featured: boolean;
  createdAt: string;
};

export type SocialLinks = {
  email?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
};

export type Graduate = {
  id: string;
  name: string;
  headline: string;
  specialization: string;
  about: string;
  skills: string[];
  avatar: string;
  cover: string;
  availableForWork: boolean;
  links: SocialLinks;
  experience: Experience[];
  resumeName?: string;
  cvUrl?: string;
  projectIds: string[];
  featured: boolean;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  role: "user" | "admin";
  headline?: string;
  about?: string;
  specialization?: string;
  skills?: string[];
  avatar?: string;
  cover?: string;
  available_for_work?: boolean;
  links?: SocialLinks;
  resume_name?: string;
  cv_url?: string;
  cv_public_id?: string;
  project_ids?: string[];
};

export type PlatformSettings = {
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
};
