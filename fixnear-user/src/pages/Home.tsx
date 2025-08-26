import { useEffect, useState } from "react";
import { fetchAllArtisans } from "../services/api/artisans";
import { Artisan } from "../types/artisan";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllArtisans()
      .then((data) => setArtisans(data))
      .catch(() => setError("Failed to fetch artisans"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading artisans...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-4">
      {artisans.map((artisan) => {
        const addr = artisan.readableAddress;
          const addressString = addr
            ? [addr.road, addr.county, addr.state, addr.country]
                .filter(Boolean)
                .join(", ")
            : "Location not available";
        return(
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
        </div>
      )})}
    </div>
  );
}
