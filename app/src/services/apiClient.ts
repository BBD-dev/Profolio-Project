// Thin fetch wrapper. Single place that knows the base URL and attaches the
// auth token — so switching mock services to real endpoints is trivial.

import { Platform } from "react-native";

import { storage } from "@/src/utils/storage";

export const TOKEN_KEY = "bbd.auth.token";

const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
// Empty string = same-origin /api (web deploy behind nginx proxy)
const BASE_URL =
  envUrl === ""
    ? ""
    : (envUrl ?? "http://localhost:5000").replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 20_000;
const UPLOAD_TIMEOUT_MS = 90_000;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
  get isNetwork() {
    return this.status === 0;
  }
  get isTimeout() {
    return this.status === 408;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// ---- Session expiry broadcast -------------------------------------------------
type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/** AuthContext subscribes so an expired/invalid token logs the user out everywhere. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

async function handleUnauthorized() {
  await storage.secureRemove(TOKEN_KEY);
  unauthorizedListeners.forEach((l) => {
    try {
      l();
    } catch {
      /* ignore */
    }
  });
}

// ---- Helpers -----------------------------------------------------------------
async function authHeader(): Promise<Record<string, string>> {
  const token = await storage.secureGet<string>(TOKEN_KEY, "");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractDetail(data: unknown, status: number, fallback: string): string {
  if (data && typeof data === "object") {
    const d = data as { detail?: unknown; message?: unknown };
    if (typeof d.detail === "string" && d.detail) return d.detail;
    if (Array.isArray(d.detail) && d.detail.length) {
      const first = d.detail[0] as { msg?: string } | string;
      if (typeof first === "string") return first;
      if (first && typeof first.msg === "string") return first.msg;
    }
    if (typeof d.message === "string" && d.message) return d.message;
  }
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status === 413) return "The file is too large.";
  if (status >= 500) return "The server had a problem. Please try again shortly.";
  return `${fallback} (${status})`;
}

function networkError(err: unknown, label: string): ApiError {
  if (err instanceof Error && err.name === "AbortError") {
    return new ApiError(`${label} timed out. Check your connection and try again.`, 408);
  }
  return new ApiError(
    BASE_URL
      ? `Cannot reach the server. Check your internet connection.`
      : `Cannot reach the server at this address.`,
    0,
  );
}

async function fail(res: Response, fallback: string): Promise<never> {
  const data = await parseBody(res);
  if (res.status === 401) await handleUnauthorized();
  throw new ApiError(extractDetail(data, res.status, fallback), res.status);
}

// ---- Core request ------------------------------------------------------------
async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = false } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) Object.assign(headers, await authHeader());

  const t = withTimeout(REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: t.signal,
    });
  } catch (err) {
    throw networkError(err, "Request");
  } finally {
    t.clear();
  }

  if (!res.ok) await fail(res, "Request failed");
  return (await parseBody(res)) as T;
}

// ---- Uploads -----------------------------------------------------------------
export type UploadFileInput = {
  uri: string;
  name: string;
  type: string;
};

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(EXT_BY_MIME).map(([mime, ext]) => [ext, mime]),
);
MIME_BY_EXT.jpeg = "image/jpeg";

/** Make sure name + type agree; derive whichever is missing from the other / the uri. */
export function normalizeFileMeta(file: Partial<UploadFileInput> & { uri: string }, fallbackBase: string): UploadFileInput {
  const uriExt = file.uri.split(/[?#]/)[0].split(".").pop()?.toLowerCase() || "";
  let type = (file.type || "").toLowerCase();
  if (!type || type === "application/octet-stream") type = MIME_BY_EXT[uriExt] || "";
  let name = (file.name || "").trim();
  const nameExt = name.split(".").pop()?.toLowerCase() || "";
  if (!type && nameExt) type = MIME_BY_EXT[nameExt] || "";
  if (!type) type = "image/jpeg";
  const ext = EXT_BY_MIME[type] || uriExt || "bin";
  if (!name) name = `${fallbackBase}.${ext}`;
  else if (!nameExt || MIME_BY_EXT[nameExt] !== type) name = `${name.replace(/\.[^.]+$/, "")}.${ext}`;
  return { uri: file.uri, name, type };
}

async function uploadFormFile(file: UploadFileInput): Promise<Blob | { uri: string; name: string; type: string }> {
  if (Platform.OS === "web") {
    const res = await fetch(file.uri);
    if (!res.ok) throw new ApiError("Could not read the selected file", 0);
    const blob = await res.blob();
    // Preserve the declared type if the blob came back untyped.
    return blob.type ? blob : new Blob([blob], { type: file.type });
  }
  return { uri: file.uri, name: file.name, type: file.type };
}

export const apiClient = {
  get: <T>(path: string, auth = false) => request<T>(path, { auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "POST", body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "PATCH", body, auth }),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: "DELETE", auth }),

  upload: async <T = { url: string; publicId?: string }>(
    path: string,
    file: UploadFileInput,
    field: string,
  ): Promise<T> => {
    const form = new FormData();
    // Field must come before file — multer reads fields in order and we validate on it.
    form.append("field", field);

    const payload = await uploadFormFile(file);
    if (payload instanceof Blob) {
      form.append("file", payload, file.name);
    } else {
      form.append("file", payload as unknown as Blob);
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    Object.assign(headers, await authHeader());

    const t = withTimeout(UPLOAD_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/api${path}?field=${encodeURIComponent(field)}`, {
        method: "POST",
        headers,
        body: form,
        signal: t.signal,
      });
    } catch (err) {
      throw networkError(err, "Upload");
    } finally {
      t.clear();
    }

    if (!res.ok) await fail(res, "Upload failed");
    return (await parseBody(res)) as T;
  },
};

/** Turn a stored media reference into something <Image> can load on every platform. */
export function resolveMediaUrl(uri?: string | null): string | undefined {
  const v = uri?.trim();
  if (!v) return undefined;
  if (/^(https?:|data:|blob:|file:|content:|ph:|assets-library:)/i.test(v)) return v;
  if (v.startsWith("/")) return `${BASE_URL}${v}`;
  return v;
}

export { BASE_URL };
