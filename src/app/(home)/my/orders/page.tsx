"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Package,
  Star,
  Store,
  Truck,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  cancelOrder,
  confirmOrder,
  createReview,
  getBuyerOrders,
} from "./actions";
import { OrderListSkeleton } from "./skeleton";

interface Order {
  id: string;
  status: string;
  quantity: number;
  totalPrice: number;
  trackingNumber: string | null;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    images: string;
    seller: {
      realName: string | null;
      username: string;
    };
    reviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
    }>;
  };
  address: {
    receiverName: string;
  };
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: "待支付", variant: "destructive" as const },
    PAID: { label: "已支付", variant: "default" as const },
    SHIPPED: { label: "已发货", variant: "secondary" as const },
    COMPLETED: { label: "已完成", variant: "default" as const },
    CANCELED: { label: "已取消", variant: "outline" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(
    null
  );
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  // 评价相关状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    document.title = "我的订单 | 在线商城";
  }, []);

  const fetchOrders = async () => {
    try {
      const result = await getBuyerOrders();
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        toast.error(result.error || "获取订单失败");
      }
    } catch {
      toast.error("获取订单列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    try {
      const result = await confirmOrder(orderId);
      if (result.success) {
        toast.success("确认收货成功");
        await fetchOrders(); // 重新获取订单列表
      } else {
        toast.error(result.error || "确认收货失败");
      }
    } catch {
      toast.error("确认收货失败");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handlePayOrder = () => {
    router.push("/confirm");
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancelingOrderId(orderId);
    try {
      const result = await cancelOrder(orderId);
      if (result.success) {
        toast.success("订单已取消");
        await fetchOrders(); // 重新获取订单列表
      } else {
        toast.error(result.error || "取消订单失败");
      }
    } catch {
      toast.error("取消订单失败");
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handleOpenReviewDialog = (order: Order) => {
    setReviewingOrder(order);
    setReviewRating(5);
    setReviewComment("");
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setReviewingOrder(null);
    setReviewRating(5);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewingOrder) return;

    setSubmittingReview(true);
    try {
      const result = await createReview(
        reviewingOrder.product.id,
        reviewRating,
        reviewComment.trim() || undefined
      );

      if (result.success) {
        toast.success("评价提交成功");
        handleCloseReviewDialog();
        await fetchOrders(); // 重新获取订单列表
      } else {
        toast.error(result.error || "评价提交失败");
      }
    } catch {
      toast.error("评价提交失败");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <OrderListSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">暂无订单记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const images = JSON.parse(order.product.images);
        const firstImage = Array.isArray(images) ? images[0] : images;
        const hasReview = order.product.reviews.length > 0;

        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Link
                  href={`/products/${order.product.id}`}
                  className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {firstImage && (
                    <Image
                      src={firstImage}
                      alt={order.product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${order.product.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    <h3 className="font-medium truncate mb-1">
                      {order.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {order.product.seller.realName ||
                        order.product.seller.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        数量: {order.quantity}
                      </span>
                      <span className="font-medium text-orange-600">
                        ¥{order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{order.address.receiverName}</span>
                    </div>

                    {/* 快递单号 */}
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="h-3 w-3" />
                        <span className="text-xs">
                          快递单号: {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {order.status === "PENDING" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handlePayOrder}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        立即支付
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelingOrderId === order.id}
                      >
                        <X className="h-3 w-3 mr-1" />
                        {cancelingOrderId === order.id
                          ? "取消中..."
                          : "取消订单"}
                      </Button>
                    </>
                  )}

                  {order.status === "PAID" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelingOrderId === order.id}
                    >
                      <X className="h-3 w-3 mr-1" />
                      {cancelingOrderId === order.id ? "取消中..." : "取消订单"}
                    </Button>
                  )}

                  {order.status === "SHIPPED" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleConfirmOrder(order.id)}
                      disabled={confirmingOrderId === order.id}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {confirmingOrderId === order.id
                        ? "确认中..."
                        : "确认收货"}
                    </Button>
                  )}

                  {order.status === "COMPLETED" && (
                    <>
                      {hasReview ? (
                        <Button variant="outline" size="sm" disabled>
                          <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                          已评价
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReviewDialog(order)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          评价
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* 评价对话框 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>评价商品</DialogTitle>
            <DialogDescription>
              请对您购买的商品进行评价，您的意见对其他买家很重要。
            </DialogDescription>
          </DialogHeader>

          {reviewingOrder && (
            <div className="space-y-4">
              {/* 商品信息 */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Link
                  href={`/products/${reviewingOrder.product.id}`}
                  className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {(() => {
                    const images = JSON.parse(reviewingOrder.product.images);
                    const firstImage = Array.isArray(images)
                      ? images[0]
                      : images;
                    return firstImage ? (
                      <Image
                        src={firstImage}
                        alt={reviewingOrder.product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : null;
                  })()}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${reviewingOrder.product.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    <h4 className="text-sm font-medium truncate">
                      {reviewingOrder.product.name}
                    </h4>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    ¥{reviewingOrder.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* 评分 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">评分</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setReviewRating(index + 1)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          index < reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 评价内容 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">评价内容 (可选)</label>
                <Textarea
                  rows={3}
                  placeholder="分享您对商品的看法..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="min-h-20"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseReviewDialog}
              disabled={submittingReview}
            >
              取消
            </Button>
            <Button
              variant="default"
              onClick={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? "提交中..." : "提交评价"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
