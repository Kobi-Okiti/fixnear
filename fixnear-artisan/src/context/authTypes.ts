// src/context/authTypes.ts
export type Artisan = {
  _id: string;
  fullName: string;
  email: string;
  role: "artisan";
  phone: string
};

export type AuthState = {
  token: string | null;
  artisan: Artisan | null;
};

export type AuthContextValue = {
  token: string | null;
  artisan: Artisan | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
