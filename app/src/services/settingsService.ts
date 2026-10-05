import { PlatformSettings } from "@/src/models";
import { apiClient } from "./apiClient";

export const settingsService = {
  get: () => apiClient.get<PlatformSettings>("/settings"),
};
