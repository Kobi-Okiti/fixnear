// src/context/authTypes.ts
export type User = {
  _id: string;
  fullName: string;
  email: string;
  role: "user";
  phone: string
};

export type AuthState = {
  token: string | null;
  user: User | null;
};

export type AuthContextValue = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
