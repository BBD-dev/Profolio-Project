import {
  GraduateRequest, Graduate, Project, Category,
  HomepageSection, MediaItem, Settings, Activity,
  RequestStatus, GraduateStatus, MediaType,
} from "@/types";
import { apiRequest, uploadFile } from "@/services/apiClient";

/* ------------------------------- Requests ------------------------------- */
export const requestsApi = {
  list: () => apiRequest<GraduateRequest[]>("get", "/admin/requests"),
  get: (id: string) => apiRequest<GraduateRequest | null>("get", `/admin/requests/${id}`),
  setStatus: (id: string, status: RequestStatus, note?: string) =>
    apiRequest<GraduateRequest & { email?: { sent?: boolean; configured?: boolean; reason?: string } }>(
      "patch",
      `/admin/requests/${id}/status`,
      { status, note },
    ),
};

/* ------------------------------ Graduates ------------------------------- */
export const graduatesApi = {
  list: () => apiRequest<Graduate[]>("get", "/admin/users"),
  get: (id: string) => apiRequest<Graduate | null>("get", `/admin/users/${id}`),
  update: (id: string, patch: Partial<Graduate>) =>
    apiRequest<Graduate>("patch", `/admin/users/${id}`, patch),
  setStatus: (id: string, status: GraduateStatus) =>
    apiRequest<Graduate>("patch", `/admin/users/${id}`, { status }),
  toggleAvailable: (id: string) =>
    apiRequest<Graduate>("post", `/admin/users/${id}/toggle-available`),
  remove: (id: string) => apiRequest<{ ok: boolean }>("delete", `/admin/users/${id}`),
};

/* ------------------------------- Projects ------------------------------- */
export const projectsApi = {
  list: () => apiRequest<Project[]>("get", "/admin/projects"),
  get: (id: string) => apiRequest<Project | null>("get", `/admin/projects/${id}`),
  create: (data: Partial<Project>) => apiRequest<Project>("post", "/admin/projects", data),
  update: (id: string, patch: Partial<Project>) =>
    apiRequest<Project>("patch", `/admin/projects/${id}`, patch),
  duplicate: (id: string) => apiRequest<Project>("post", `/admin/projects/${id}/duplicate`),
  remove: (id: string) => apiRequest<{ ok: boolean }>("delete", `/admin/projects/${id}`),
};

/* ------------------------------ Categories ------------------------------ */
export const categoriesApi = {
  list: () => apiRequest<Category[]>("get", "/admin/categories"),
  create: (data: Partial<Category>) => apiRequest<Category>("post", "/admin/categories", data),
  update: (id: string, patch: Partial<Category>) =>
    apiRequest<Category>("patch", `/admin/categories/${id}`, patch),
  remove: (id: string) => apiRequest<{ ok: boolean }>("delete", `/admin/categories/${id}`),
};

/* ------------------------------- Homepage ------------------------------- */
export const homepageApi = {
  list: () => apiRequest<HomepageSection[]>("get", "/homepage"),
  update: (id: string, patch: Partial<HomepageSection>) =>
    apiRequest<HomepageSection>("patch", `/admin/homepage/${id}`, patch),
  reorder: (ordered: HomepageSection[]) =>
    apiRequest<HomepageSection[]>(
      "post",
      "/admin/homepage/reorder",
      ordered.map((s, i) => ({ id: s.id, order: i })),
    ),
};

/* -------------------------------- Media --------------------------------- */
export const mediaApi = {
  list: () => apiRequest<MediaItem[]>("get", "/admin/media"),
  create: (data: Partial<MediaItem>) => apiRequest<MediaItem>("post", "/admin/media", data),
  upload: (file: File, field = "media") => uploadFile(file, field),
  remove: (id: string) => apiRequest<{ ok: boolean }>("delete", `/admin/media/${id}`),
};

export function mediaUploadField(type: MediaType): string {
  if (type === "cv") return "cv";
  if (type === "document") return "document";
  if (type === "logo") return "logo";
  return "media";
}

/* ------------------------------- Settings ------------------------------- */
export const settingsApi = {
  get: () => apiRequest<Settings>("get", "/settings"),
  update: (patch: Partial<Settings>) => apiRequest<Settings>("patch", "/admin/settings", patch),
};

/* ------------------------------ Dashboard ------------------------------- */
export const dashboardApi = {
  activity: () => apiRequest<Activity[]>("get", "/admin/dashboard/activity"),
  stats: () => apiRequest<{
    totalGraduates: number;
    pendingRequests: number;
    totalProjects: number;
    applications: number;
    websites: number;
    graphic: number;
    motion: number;
    marketing: number;
    cyber: number;
    categories: number;
    recentRequests: GraduateRequest[];
    recentProjects: Project[];
  }>("get", "/admin/dashboard/stats"),
};

/* -------------------------------- Auth ---------------------------------- */
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access_token: string; user: { id: string; email: string; full_name?: string; role: string; avatar?: string } }>(
      "post",
      "/auth/login",
      { email, password },
    ),
  me: () =>
    apiRequest<{ id: string; email: string; full_name?: string; role: string; avatar?: string }>(
      "get",
      "/auth/me",
    ),
};
