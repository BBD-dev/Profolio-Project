import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import brandLogo from "@/assets/bbd-logo.jpeg";
import { authApi } from "@/services/api";
import { ApiError, getErrorMessage, TOKEN_KEY } from "@/services/apiClient";

const AUTH_USER_KEY = "bbd_auth";

interface AuthUser {
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function toAuthUser(data: { email: string; full_name?: string; avatar?: string }): AuthUser {
  return {
    name: data.full_name || data.email.split("@")[0],
    email: data.email,
    avatar: data.avatar || brandLogo,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then((data) => {
        if (data.role !== "admin") {
          throw new ApiError("Admin access only", 403);
        }
        const u = toAuthUser(data);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email.trim().toLowerCase(), password);
    if (res.user.role !== "admin") {
      throw new ApiError("This account does not have admin access", 403);
    }
    localStorage.setItem(TOKEN_KEY, res.access_token);
    const u = toAuthUser(res.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getErrorMessage };
