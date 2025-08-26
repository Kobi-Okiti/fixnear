export type Artisan = {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  role: "artisan";
  tradeType: string;
  profilePhoto?: string;
  documents?: {
    idCardUrl?: string;
    skillPhotoUrl?: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
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
  reviews?: string[]; // Change to Review[] if you fetch populated reviews later
  isSuspended: boolean;
  status: "pending" | "approved" | "suspended";
  distance?: number; // Only from /artisans query
};
