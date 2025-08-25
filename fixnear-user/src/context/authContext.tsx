import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import api, { setAuthHeader } from "../services/api";
import { USER_TOKEN_KEY, USER_KEY } from "./authKeys";
import { User, AuthState, AuthContextValue } from "./authTypes";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem(USER_TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    return {
      token: savedToken,
      user: savedUser ? JSON.parse(savedUser) : null,
    };
  });

  useEffect(() => {
    setAuthHeader(auth.token);
  }, [auth.token]);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuth({ token: null, user: null });
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!auth.token) return;

    try {
      const res = await api.get<User>("/user/profile");
      const freshUser = res.data;

      setAuth((prev) => {
        const newState = { token: prev.token, user: freshUser };
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
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
      role: "user",
    });
    const { token, user } = res.data as { token: string; user: User };

    localStorage.setItem(USER_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuth({ token, user });
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
      user: auth.user,
      isAuthenticated: Boolean(auth.token && auth.user?.role === "user"),
      login,
      logout,
    }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
