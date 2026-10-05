import { Graduate, Project } from "@/src/models";
import { apiClient } from "./apiClient";
import { normalizeProject } from "./projectService";

export type GraduateQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
};

type PaginatedGraduates = { items: Graduate[]; hasMore: boolean; total?: number };
type GraduateDetail = Graduate & { projects?: Project[] };

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function normalizeGraduate(raw: Graduate): Graduate {
  return {
    ...raw,
    headline: raw.headline || "",
    about: raw.about || "",
    skills: raw.skills || [],
    avatar: raw.avatar || "",
    cover: raw.cover || "",
    links: raw.links || {},
    experience: raw.experience || [],
    resumeName: raw.resumeName,
    cvUrl: raw.cvUrl || "",
    projectIds: raw.projectIds || [],
    featured: Boolean(raw.featured),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const graduateService = {
  async list(query: GraduateQuery = {}): Promise<{ items: Graduate[]; hasMore: boolean }> {
    const { search = "", page = 1, pageSize = 8 } = query;
    const data = await apiClient.get<PaginatedGraduates>(
      `/graduates${buildQuery({ search, page, pageSize })}`,
    );
    return {
      items: data.items.map(normalizeGraduate),
      hasMore: data.hasMore,
    };
  },

  async featured(): Promise<Graduate[]> {
    const items = await apiClient.get<Graduate[]>("/graduates/featured");
    return items.map(normalizeGraduate);
  },

  async latest(limit = 6): Promise<Graduate[]> {
    const items = await apiClient.get<Graduate[]>(`/graduates/latest${buildQuery({ limit })}`);
    return items.map(normalizeGraduate);
  },

  async getById(id: string): Promise<Graduate | null> {
    try {
      const item = await apiClient.get<GraduateDetail>(`/graduates/${id}`);
      return normalizeGraduate(item);
    } catch {
      return null;
    }
  },

  async getByIdWithProjects(id: string): Promise<{ graduate: Graduate; projects: Project[] } | null> {
    try {
      const item = await apiClient.get<GraduateDetail>(`/graduates/${id}`);
      const { projects = [], ...rest } = item;
      return {
        graduate: normalizeGraduate(rest as Graduate),
        projects: projects.map(normalizeProject),
      };
    } catch {
      return null;
    }
  },
};
