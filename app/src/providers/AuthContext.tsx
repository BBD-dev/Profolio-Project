import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { User } from "@/src/models";
import { authService, RegisterPayload } from "@/src/services/authService";
import { onUnauthorized, TOKEN_KEY } from "@/src/services/apiClient";
import { storage } from "@/src/utils/storage";

type AuthValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await storage.secureGet<string>(TOKEN_KEY, "");
      if (token) {
        try {
          const me = await authService.me();
          setUserState(me);
        } catch {
          await storage.secureRemove(TOKEN_KEY);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    return onUnauthorized(() => setUserState(null));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    await storage.secureSet(TOKEN_KEY, res.access_token);
    setUserState(res.user);
  };

  const register = async (payload: RegisterPayload) => {
    return authService.register(payload);
  };

  const logout = async () => {
    await storage.secureRemove(TOKEN_KEY);
    setUserState(null);
  };

  const refresh = async () => {
    try {
      const me = await authService.me();
      setUserState(me);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refresh,
      setUser: setUserState,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
