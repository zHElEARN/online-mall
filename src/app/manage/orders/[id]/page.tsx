"use client";

import {
  CheckCircle,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { OrderStatus } from "@prisma/client";
import { cancelOrder, updateOrderStatus } from "../actions";
import { getOrder } from "./actions";
import { OrderDetailSkeleton } from "./skeleton";

interface OrderWithDetails {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  note: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    realName: string | null;
    avatar: string | null;
  };
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string;
    category: string | null;
  };
  address: {
    id: string;
    receiverName: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  };
}

const orderStatusMap = {
  PENDING: {
    label: "待支付",
    variant: "secondary" as const,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
  PAID: {
    label: "已支付",
    variant: "default" as const,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    icon: CreditCard,
  },
  SHIPPED: {
    label: "已发货",
    variant: "default" as const,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: Truck,
  },
  COMPLETED: {
    label: "已完成",
    variant: "default" as const,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
  CANCELED: {
    label: "已取消",
    variant: "destructive" as const,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    borderColor: "border-gray-200 dark:border-gray-800",
    icon: XCircle,
  },
};

const statusActions = {
  PENDING: [
    {
      type: "cancel",
      status: "CANCELED",
      label: "取消订单",
      icon: X,
      variant: "destructive" as const,
    },
  ],
  PAID: [
    {
      type: "update",
      status: "SHIPPED",
      label: "发货",
      icon: Truck,
      variant: "default" as const,
    },
  ],
  SHIPPED: [],
  COMPLETED: [],
  CANCELED: [],
};

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [shipDialog, setShipDialog] = useState<{
    open: boolean;
    orderId: string;
    trackingNumber: string;
  }>({
    open: false,
    orderId: "",
    trackingNumber: "",
  });

  const loadOrder = useCallback(async () => {
    try {
      const result = await getOrder(id);
      if (result.success && result.order) {
        setOrder(result.order);
      } else {
        toast.error(result.error || "获取订单详情失败");
        router.push("/manage/orders");
      }
    } catch (error) {
      console.error("获取订单详情失败:", error);
      toast.error("获取订单详情失败");
      router.push("/manage/orders");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleUpdateStatus = async (
    orderId: string,
    status: string,
    trackingNumber?: string
  ) => {
    try {
      const result = await updateOrderStatus(
        orderId,
        status as OrderStatus,
        trackingNumber
      );
      if (result.success) {
        toast.success("订单状态更新成功");
        await loadOrder();
      } else {
        toast.error(result.error || "更新订单状态失败");
      }
    } catch (err) {
      console.error("更新订单状态失败:", err);
      toast.error("更新订单状态失败");
    }
  };

  const handleShipOrder = (orderId: string) => {
    setShipDialog({
      open: true,
      orderId,
      trackingNumber: "",
    });
  };

  const handleConfirmShip = async () => {
    if (!shipDialog.trackingNumber.trim()) {
      toast.error("请输入快递单号");
      return;
    }

    await handleUpdateStatus(
      shipDialog.orderId,
      "SHIPPED",
      shipDialog.trackingNumber
    );
    setShipDialog({
      open: false,
      orderId: "",
      trackingNumber: "",
    });
  };

  const handleCancelShip = () => {
    setShipDialog({
      open: false,
      orderId: "",
      trackingNumber: "",
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const result = await cancelOrder(orderId);
      if (result.success) {
        toast.success("订单取消成功");
        await loadOrder();
      } else {
        toast.error(result.error || "取消订单失败");
      }
    } catch (err) {
      console.error("取消订单失败:", err);
      toast.error("取消订单失败");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const getProductImages = (imagesString: string) => {
    try {
      return JSON.parse(imagesString) as string[];
    } catch {
      return [];
    }
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return null;
  }

  const statusInfo =
    orderStatusMap[order.status as keyof typeof orderStatusMap];
  const StatusIcon = statusInfo?.icon || Package;
  const productImages = getProductImages(order.product.images);
  const actions =
    statusActions[order.status as keyof typeof statusActions] || [];

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/manage/orders">返回订单列表</BackButton>
          <div>
            <h1 className="text-2xl font-bold">订单详情</h1>
            <p className="text-muted-foreground">订单号: {order.id}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              订单状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo?.bgColor} ${statusInfo?.borderColor}`}
                >
                  <StatusIcon className={`h-4 w-4 ${statusInfo?.color}`} />
                  <span className={`font-medium ${statusInfo?.color}`}>
                    {statusInfo?.label}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>创建时间: {formatDate(order.createdAt)}</p>
                  <p>更新时间: {formatDate(order.updatedAt)}</p>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 mt-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">快递单号:</span>
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {order.trackingNumber}
                      </code>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(order.totalPrice)}
                </p>
                <p className="text-sm text-muted-foreground">总金额</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {actions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>订单操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {actions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      onClick={() => {
                        if (action.type === "cancel") {
                          handleCancelOrder(order.id);
                        } else if (action.status === "SHIPPED") {
                          handleShipOrder(order.id);
                        } else {
                          handleUpdateStatus(order.id, action.status);
                        }
                      }}
                      className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                    >
                      <ActionIcon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              商品信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {productImages.length > 0 && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={productImages[0]}
                    alt={order.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">{order.product.name}</h3>
                {order.product.description && (
                  <p className="text-sm text-muted-foreground">
                    {order.product.description}
                  </p>
                )}
                {order.product.category && (
                  <Badge variant="outline">{order.product.category}</Badge>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span>单价: {formatPrice(order.product.price)}</span>
                  <span>数量: {order.quantity}</span>
                  <span className="font-semibold">
                    小计: {formatPrice(order.product.price * order.quantity)}
                  </span>
                </div>
              </div>
            </div>
            {order.note && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">买家备注:</span> {order.note}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              买家信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {order.buyer.avatar ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={order.buyer.avatar}
                      alt={order.buyer.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{order.buyer.username}</p>
                  {order.buyer.realName && (
                    <p className="text-sm text-muted-foreground">
                      {order.buyer.realName}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {order.buyer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.buyer.email}</span>
                  </div>
                )}
                {order.buyer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.buyer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              收货地址
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {order.address.receiverName}
                </span>
                <span className="text-muted-foreground">
                  {order.address.phone}
                </span>
              </div>
              <p className="text-sm">
                {order.address.province} {order.address.city}{" "}
                {order.address.district} {order.address.detail}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={shipDialog.open}
        onOpenChange={(open) => !open && handleCancelShip()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认发货</DialogTitle>
            <DialogDescription>
              请输入快递单号以确认发货，发货后买家将能够追踪包裹物流信息。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-number">快递单号</Label>
              <Input
                id="tracking-number"
                placeholder="请输入快递单号"
                value={shipDialog.trackingNumber}
                onChange={(e) =>
                  setShipDialog((prev) => ({
                    ...prev,
                    trackingNumber: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmShip();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelShip}>
              取消
            </Button>
            <Button
              onClick={handleConfirmShip}
              disabled={!shipDialog.trackingNumber.trim()}
            >
              确认发货
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
