import { Category, Project } from "@/src/models";
import { normalizeGalleryImages } from "@/src/utils/gallery";
import { apiClient } from "./apiClient";

export type ProjectQuery = {
  search?: string;
  categories?: Category[];
  page?: number;
  pageSize?: number;
};

type PaginatedProjects = { items: Project[]; hasMore: boolean; total?: number };

export function normalizeProject(raw: Project): Project {
  return {
    ...raw,
    name: raw.name || (raw as any).title || "Untitled",
    shortDescription: raw.shortDescription || (raw as any).subtitle || "",
    cover: raw.cover || "",
    logo: raw.logo || raw.cover || "",
    gallery: normalizeGalleryImages(raw.gallery || [], [raw.cover, raw.logo]),
    technologies: raw.technologies || [],
    team: raw.team || [],
    ownerId: raw.ownerId || "",
    ownerName: raw.ownerName || "Unknown",
    featured: Boolean(raw.featured),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const projectService = {
  async list(query: ProjectQuery = {}): Promise<{ items: Project[]; hasMore: boolean }> {
    const { search = "", categories = [], page = 1, pageSize = 6 } = query;
    const data = await apiClient.get<PaginatedProjects>(
      `/projects${buildQuery({
        search,
        categories: categories.join(","),
        page,
        pageSize,
      })}`,
    );
    return {
      items: data.items.map(normalizeProject),
      hasMore: data.hasMore,
    };
  },

  async featured(): Promise<Project[]> {
    const items = await apiClient.get<Project[]>("/projects/featured");
    return items.map(normalizeProject);
  },

  async latest(limit = 6): Promise<Project[]> {
    const items = await apiClient.get<Project[]>(`/projects/latest${buildQuery({ limit })}`);
    return items.map(normalizeProject);
  },

  async getById(id: string): Promise<Project | null> {
    try {
      const item = await apiClient.get<Project>(`/projects/${id}`);
      return normalizeProject(item);
    } catch {
      return null;
    }
  },

  async related(project: Project, limit = 4): Promise<Project[]> {
    const items = await apiClient.get<Project[]>(`/projects/${project.id}/related${buildQuery({ limit })}`);
    return items.map(normalizeProject);
  },

  async byOwner(ownerId: string): Promise<Project[]> {
    const items = await apiClient.get<Project[]>(`/projects/owner/${ownerId}`);
    return items.map(normalizeProject);
  },
};
