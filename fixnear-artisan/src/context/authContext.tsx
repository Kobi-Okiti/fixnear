import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { ARTISAN_TOKEN_KEY, ARTISAN_KEY } from "./authKeys";
import { Artisan, AuthState, AuthContextValue } from "./authTypes";
import api, { setAuthHeader } from "@/service/api";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem(ARTISAN_TOKEN_KEY);
    const savedUser = localStorage.getItem(ARTISAN_KEY);
    return {
      token: savedToken,
      artisan: savedUser ? JSON.parse(savedUser) : null,
    };
  });

  useEffect(() => {
    setAuthHeader(auth.token);
  }, [auth.token]);

  const logout = useCallback(() => {
    localStorage.removeItem(ARTISAN_TOKEN_KEY);
    localStorage.removeItem(ARTISAN_KEY);
    setAuth({ token: null, artisan: null });
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!auth.token) return;

    try {
      const res = await api.get<Artisan>("/artisan/profile");
      const freshArtisan = res.data;

      setAuth((prev) => {
        const newState = { token: prev.token, artisan: freshArtisan };
        localStorage.setItem(ARTISAN_KEY, JSON.stringify(freshArtisan));
        return newState;
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      logout();
    }
  }, [auth.token, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/auth/login", {
      email,
      password,
      role: "artisan",
    });
    const { token, artisan } = res.data as { token: string; artisan: Artisan };

    localStorage.setItem(ARTISAN_TOKEN_KEY, token);
    localStorage.setItem(ARTISAN_KEY, JSON.stringify(artisan));
    setAuth({ token, artisan });
  }, []);

  // Fetch profile on first load if token exists but user might be stale
  useEffect(() => {
    if (auth.token) {
      fetchProfile();
    }
  }, [auth.token, fetchProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth.token,
      artisan: auth.artisan,
      isAuthenticated: Boolean(auth.token && auth.artisan?.role === "artisan"),
      login,
      logout,
    }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
