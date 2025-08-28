import { useEffect, useState } from "react";
import { Artisan } from "@/types/artisan";
import ArtisanCard from "@/components/ArtisanCard";
import ArtisanMap from "@/components/ArtisanMap";
import api from "@/services/api";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function Emergency() {
  const { coords, loading: geoLoading, error: geoError } = useGeolocation();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) {
      if (!geoLoading && geoError) {
        setError("Could not get your location");
        setLoading(false);
      }
      return;
    }

    api.get<Artisan[]>(`/artisan/emergency?lat=${coords.lat}&lng=${coords.lng}`)
      .then(res => setArtisans(res.data))
      .catch(() => setError("Failed to fetch nearby artisans"))
      .finally(() => setLoading(false));
  }, [coords, geoLoading, geoError]);

  if (loading || geoLoading) return <p>Loading nearby artisans...</p>;

  return (
    <div className="w-full flex flex-row gap-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold mb-2">Top 3 Nearby Artisans</h2>
        {error && <p className="text-red-600">{error}</p>}
        {artisans.length === 0 && !error ? (
          <p>No nearby artisan available.</p>
        ) : (
          artisans.map((artisan) => (
            <ArtisanCard key={artisan._id} artisan={artisan} />
          ))
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-2">View on Map</h2>
        <ArtisanMap artisans={artisans} userCoords={coords ?? undefined} />
      </div>
    </div>
  );
}
