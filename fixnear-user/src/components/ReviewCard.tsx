import { Review } from "@/types/artisan";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b pb-3 mb-3">
      <div className="flex justify-between">
        <p className="font-bold">{review.user.fullName}</p>
        <p>{review.rating} ★</p>
      </div>
      {review.comment && (
        <p className="mt-1 text-gray-700">{review.comment}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
