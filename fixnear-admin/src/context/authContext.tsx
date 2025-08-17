import React, { createContext, useEffect, useMemo, useState, useCallback } from "react";
import api, { setAuthHeader } from "../services/api";
import { TOKEN_KEY, ADMIN_KEY } from "./authKeys";
import { Admin, AuthState, AuthContextValue } from "./authTypes";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedAdmin = localStorage.getItem(ADMIN_KEY);
    return {
      token: savedToken,
      admin: savedAdmin ? JSON.parse(savedAdmin) : null,
    };
  });

  // Keep axios Authorization header in sync
  useEffect(() => {
    setAuthHeader(auth.token);
  }, [auth.token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/admin/login", { email, password });
    const { token, admin } = res.data as { token: string; admin: Admin };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    setAuth({ token, admin });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setAuth({ token: null, admin: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth.token,
      admin: auth.admin,
      isAuthenticated: Boolean(auth.token && auth.admin?.role === "admin"),
      login,
      logout,
    }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
