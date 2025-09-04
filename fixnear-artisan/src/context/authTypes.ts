// src/context/authTypes.ts
export type Artisan = {
  _id: string;
  fullName: string;
  email: string;
  role: "artisan";
  phone: string;
  tradeType: string;
  bio: string;
  createdAt: string;
  readableAddress?: {
    amenity?: string;
    road?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  rating: number;
  reviewCount: number;
  isSuspended: boolean;
  status: "pending" | "approved" | "suspended";
  isAvailable: boolean;
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
