import { User } from "@/src/models";
import { apiClient } from "./apiClient";

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  specialization?: string;
  headline?: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export const authService = {
  register: (payload: RegisterPayload) =>
    apiClient.post<{ status: string; message: string }>("/auth/register", payload),

  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }),

  me: () => apiClient.get<User>("/auth/me", true),

  updateProfile: (payload: Partial<User>) =>
    apiClient.patch<User>("/auth/me", payload),

  changePassword: (current_password: string, new_password: string) =>
    apiClient.post<{ ok: boolean }>("/auth/change-password", { current_password, new_password }, true),
};
