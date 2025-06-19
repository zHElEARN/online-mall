"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getUserReviews } from "./actions";
import { ReviewListSkeleton } from "./skeleton";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  product: {
    name: string;
    images: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const result = await getUserReviews();
        if (result.success) {
          setReviews(result.reviews || []);
        } else {
          toast.error(result.error || "获取评论失败");
        }
      } catch (err) {
        toast.error("获取评论列表失败");
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return <ReviewListSkeleton />;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">暂无评论记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const images = JSON.parse(review.product.images);
        const firstImage = Array.isArray(images) ? images[0] : images;

        return (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                  {firstImage && (
                    <img
                      src={firstImage}
                      alt={review.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium mb-2">{review.product.name}</h3>

                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {review.rating}/5
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
