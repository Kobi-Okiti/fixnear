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
import ArtisanCard from "@/components/ArtisanCard";
import { Artisan } from "@/types/artisan";
import ArtisanMap from "@/components/ArtisanMap";

export default function Artisans() {
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [trade, setTrade] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="w-full flex flex-row gap-3.5">
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
          artisans.map((artisan) => (
            <ArtisanCard key={artisan._id} artisan={artisan} />
          ))
        )}
      </div>
      <ArtisanMap artisans={artisans} userCoords={coords || undefined}  />
    </div>
  );
}
