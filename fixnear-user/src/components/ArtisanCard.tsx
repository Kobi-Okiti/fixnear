import { Artisan } from "@/types/artisan";
import React from "react";
import { useNavigate } from "react-router-dom";

interface ArtisanCardProps {
  artisan: Artisan;
}

const ArtisanCard: React.FC<ArtisanCardProps> = ({ artisan }) => {
  const navigate = useNavigate();

  const addressString = artisan.readableAddress
    ? [
        artisan.readableAddress.road,
        artisan.readableAddress.county,
        artisan.readableAddress.state,
        artisan.readableAddress.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "Location not available";

  return (
    <div
      onClick={() => navigate(`/artisan/${artisan._id}`)}
      className="border p-4 rounded my-2 cursor-pointer hover:bg-gray-100 transition"
    >
      <p className="font-bold">{artisan.fullName}</p>
      <p>{artisan.tradeType}</p>
      <p>
        {artisan.rating} ★ ({artisan.reviewCount} reviews)
      </p>
      <p>{addressString}</p>
      {artisan.distance !== undefined && (
        <p>{artisan.distance.toFixed(1)} km away</p>
      )}
    </div>
  );
};

export default ArtisanCard;
