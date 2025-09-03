import { useEffect, useState } from "react";
import api from "@/service/api";
import { useAuth } from "@/context/useAuth";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { fullName: string };
}

export default function ArtisanReviewsPage() {
  const authCtx = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authCtx.artisan?._id) return;
    setLoading(true);

    api.get<Review[]>(`/review/artisan/${authCtx.artisan._id}`)
      .then((res) => setReviews(res.data))
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [authCtx.artisan?._id]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Reviews</h1>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border p-4 rounded shadow-sm">
              <p className="font-semibold">{review.user.fullName}</p>
              <p>Rating: {review.rating} ★</p>
              {review.comment && <p>{review.comment}</p>}
              <p className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
