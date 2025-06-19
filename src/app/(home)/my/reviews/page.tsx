"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Edit, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteReview, getUserReviews, updateReview } from "./actions";
import { ReviewListSkeleton } from "./skeleton";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    images: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const result = await deleteReview(reviewId);
      if (result.success) {
        toast.success("评论删除成功");
        // 从本地状态中移除已删除的评论
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      } else {
        toast.error(result.error || "删除评论失败");
      }
    } catch (err) {
      toast.error("删除评论失败");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    setIsUpdating(true);
    try {
      const result = await updateReview(
        editingReview.id,
        editRating,
        editComment
      );
      if (result.success) {
        toast.success("评论更新成功");
        // 更新本地状态中的评论
        setReviews((prev) =>
          prev.map((review) =>
            review.id === editingReview.id
              ? { ...review, rating: editRating, comment: editComment }
              : review
          )
        );
        setIsEditDialogOpen(false);
        setEditingReview(null);
      } else {
        toast.error(result.error || "更新评论失败");
      }
    } catch (err) {
      toast.error("更新评论失败");
    } finally {
      setIsUpdating(false);
    }
  };

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
    <>
      <div className="space-y-4">
        {reviews.map((review) => {
          const images = JSON.parse(review.product.images);
          const firstImage = Array.isArray(images) ? images[0] : images;

          return (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link
                    href={`/products/${review.product.id}`}
                    className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {firstImage && (
                      <img
                        src={firstImage}
                        alt={review.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/products/${review.product.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-medium mb-2">
                          {review.product.name}
                        </h3>
                      </Link>

                      <div className="flex gap-2">
                        {/* 编辑按钮 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditReview(review)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* 删除按钮 */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingId === review.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除评论</AlertDialogTitle>
                              <AlertDialogDescription>
                                您确定要删除这条评论吗？此操作无法撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReview(review.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

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

      {/* 编辑评论对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑评价</DialogTitle>
          </DialogHeader>

          {editingReview && (
            <div className="space-y-4">
              {/* 商品信息 */}
              <div className="flex gap-3 items-center">
                <Link
                  href={`/products/${editingReview.product.id}`}
                  className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {(() => {
                    const images = JSON.parse(editingReview.product.images);
                    const firstImage = Array.isArray(images)
                      ? images[0]
                      : images;
                    return firstImage ? (
                      <img
                        src={firstImage}
                        alt={editingReview.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null;
                  })()}
                </Link>
                <Link
                  href={`/products/${editingReview.product.id}`}
                  className="hover:text-primary transition-colors"
                >
                  <h4 className="font-medium text-sm">
                    {editingReview.product.name}
                  </h4>
                </Link>
              </div>

              {/* 评分选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">评分</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditRating(index + 1)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          index < editRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 评论内容 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">评论内容</label>
                <Textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="分享你的使用体验..."
                  className="min-h-20"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateReview}
              disabled={isUpdating || editRating === 0}
            >
              {isUpdating ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
