// src/context/authTypes.ts
export type Admin = {
  _id: string;
  fullName: string;
  email: string;
  role: "admin";
};

export type AuthState = {
  token: string | null;
  admin: Admin | null;
};

export type AuthContextValue = {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
