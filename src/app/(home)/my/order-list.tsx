"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Eye, Package, Star, Store, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getBuyerOrders } from "./actions";
import { OrderListSkeleton } from "./skeleton";

interface Order {
  id: string;
  status: string;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
  product: {
    name: string;
    images: string;
    seller: {
      realName: string | null;
      username: string;
    };
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

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await getBuyerOrders();
        if (result.success) {
          setOrders(result.orders || []);
        } else {
          toast.error(result.error || "获取订单失败");
        }
      } catch (err) {
        toast.error("获取订单列表失败");
      } finally {
        setLoading(false);
      }
    }

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
                <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                  {firstImage && (
                    <img
                      src={firstImage}
                      alt={order.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate mb-1">
                    {order.product.name}
                  </h3>
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
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    详情
                  </Button>
                  {order.status === "COMPLETED" && (
                    <Button variant="outline" size="sm">
                      <Star className="h-3 w-3 mr-1" />
                      评价
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
