import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { Artisan, Review } from "../types/artisan";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";

export default function ArtisanProfile() {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const refreshArtisan = useCallback(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Artisan>(`/artisan/${id}`)
      .then((res) => setArtisan(res.data))
      .catch(() => setError("Failed to fetch artisan profile."))
      .finally(() => setLoading(false));
  }, [id]);

  const refreshReviews = useCallback(() => {
    if (!id) return;
    setReviewsLoading(true);
    api
      .get<Review[]>(`/review/artisan/${id}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviewsError("Failed to fetch reviews."))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    refreshArtisan();
    refreshReviews();
  }, [refreshArtisan, refreshReviews]);


  if (loading) return <p>Loading artisan profile...</p>;
  if (error) return <p>{error}</p>;
  if (!artisan) return <p>No artisan found.</p>;

  const addr = artisan.readableAddress;
  const addressString = addr
    ? [addr.road, addr.county, addr.state, addr.country]
        .filter(Boolean)
        .join(", ")
    : "Location not available";

  return (
    <div className="max-w-xl mx-auto p-4">
      {artisan.profilePhoto && (
        <img
          src={artisan.profilePhoto}
          alt={artisan.fullName}
          className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
        />
      )}
      <h1 className="text-2xl font-bold text-center">{artisan.fullName}</h1>
      <p className="text-center text-gray-600">{artisan.tradeType}</p>
      <p className="text-center mt-2">
        {artisan.rating} ★ ({artisan.reviewCount} reviews)
      </p>
      <p className="text-center text-sm text-gray-500">
        Joined{" "}
        {artisan.createdAt
          ? new Date(artisan.createdAt).toLocaleDateString()
          : "N/A"}
      </p>
      <p className="text-center text-sm text-gray-500">{addressString}</p>
      <div className="mt-6 text-center">
        <a
          href={`tel:${artisan.phone}`}
          className="inline-block bg-blue-600 !text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Call Artisan
        </a>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        {reviewsLoading && <p>Loading reviews...</p>}
        {reviewsError && <p className="text-red-500">{reviewsError}</p>}
        {reviews.length === 0 && !reviewsLoading ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))
        )}
      </div>
      <ReviewForm artisanId={artisan._id} onReviewAdded={() => {
        refreshReviews();
        refreshArtisan();
      }} />
    </div>
  );
}
