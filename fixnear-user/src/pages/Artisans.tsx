import { useEffect, useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import api from "../services/api";
import { TRADES } from "../constants/trades";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import DisplayLocation from "@/components/displayLocationUser";
import { useNavigate } from "react-router-dom";

type Artisan = {
  _id: string;
  fullName: string;
  tradeType: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  readableAddress?: {
    amenity?: string;
    road?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
};

export default function Artisans() {
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [trade, setTrade] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!coords || !trade) return;

    setLoading(true);
    api
      .get<Artisan[]>("/artisan", {
        params: {
          trade,
          lat: coords.lat,
          lng: coords.lng,
        },
      })
      .then((res) => setArtisans(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch nearby artisans.");
      })
      .finally(() => setLoading(false));
  }, [coords, trade]);

  if (geoLoading) return <p>Getting your location...</p>;
  if (geoError) return <p>Error: {geoError}</p>;
  if (!coords) return <p>No location available</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Nearby Artisans</h1>
      <p className="mb-4">
        Your location:{" "}
        <DisplayLocation
          coordinates={{
            lat: coords.lat,
            lng: coords.lng,
          }}
        />{" "}
        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
      </p>

      <div className="mb-6 w-[250px]">
        <Select onValueChange={setTrade} value={trade}>
          <SelectTrigger className="!bg-white !text-black !border-black">
            <SelectValue placeholder="Select trade" />
          </SelectTrigger>
          <SelectContent>
            {TRADES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p>Loading nearby artisans...</p>
      ) : error ? (
        <p>{error}</p>
      ) : artisans.length === 0 ? (
        <p>No artisans found.</p>
      ) : (
        artisans.map((artisan) => {
          const addr = artisan.readableAddress;
          const addressString = addr
            ? [addr.road, addr.county, addr.state, addr.country]
                .filter(Boolean)
                .join(", ")
            : "Location not available";
          return (
            <div
              key={artisan._id}
              onClick={() => navigate(`/artisan/${artisan._id}`)}
              className="border p-4 rounded my-2 cursor-pointer hover:bg-gray-100 transition"
            >
              <p className="font-bold">{artisan.fullName}</p>
              <p>{artisan.tradeType}</p>
              <p>
                {artisan.rating} ★ ({artisan.reviewCount} reviews)
              </p>
              <p>{addressString}</p>
              {artisan.distance && <p>{artisan.distance.toFixed(1)} km away</p>}
            </div>
          );
        })
      )}
    </div>
  );
}
