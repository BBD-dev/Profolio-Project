import { apiClient, normalizeFileMeta } from "./apiClient";

export type UploadField = "avatar" | "cover" | "cv" | "document";

export const uploadService = {
  uploadFile(uri: string, name: string, mimeType: string, field: UploadField) {
    const file = normalizeFileMeta({ uri, name, type: mimeType }, field);
    return apiClient.upload<{ url: string; publicId?: string }>("/upload", file, field);
  },
};
