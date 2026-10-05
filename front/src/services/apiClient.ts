import axios, { AxiosError } from "axios";

export const TOKEN_KEY = "bbd.auth.token";

function resolveApiBaseUrl(): string {
  const configured = process.env.REACT_APP_API_URL;
  // Empty string = same-origin /api (Docker nginx proxy on VPS).
  if (configured === "") return "/api";
  const base = (configured || "http://localhost:5000").replace(/\/$/, "");
  return `${base}/api`;
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("bbd_auth");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    return err.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Request failed";
}

export async function apiRequest<T>(
  method: "get" | "post" | "patch" | "delete",
  path: string,
  body?: unknown,
): Promise<T> {
  try {
    const res = await api.request<T>({ method, url: path, data: body });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new ApiError(getErrorMessage(err), err.response?.status || 500);
    }
    throw err;
  }
}

export async function uploadFile(
  file: File,
  field = "media",
): Promise<{ url: string; publicId: string; media: { id: string; name: string; type: string; url: string; size: string } }> {
  const form = new FormData();
  form.append("file", file);
  form.append("field", field);

  try {
    const res = await api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new ApiError(getErrorMessage(err), err.response?.status || 500);
    }
    throw err;
  }
}
