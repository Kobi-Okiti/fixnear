import { useEffect, useState } from "react";
import { fetchAllArtisans } from "../services/api/artisans";
import { Artisan } from "../types/artisan";
import ArtisanCard from "@/components/ArtisanCard";
import ArtisanMap from "@/components/ArtisanMap";
import { useGeolocation } from "@/hooks/useGeolocation";


export default function Home() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { coords: userCoords } = useGeolocation();


  useEffect(() => {
    fetchAllArtisans()
      .then((data) => setArtisans(data))
      .catch(() => setError("Failed to fetch artisans"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading artisans...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full flex flex-row gap-4">
      <div className="space-y-4">
        {artisans.map((artisan) => (
          <ArtisanCard key={artisan._id} artisan={artisan} />
        ))}
      </div>
      <div className="space-y-4">
    <h2 className="text-lg font-bold mb-2">View on Map</h2>
    <ArtisanMap artisans={artisans} userCoords={userCoords || undefined}  />
  </div>
    </div>
  );
}
