"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { getSellerOrders, updateOrderStatus } from "./actions";
import { OrdersPageSkeleton } from "./skeleton";

// 订单状态映射
const orderStatusMap = {
  PENDING: {
    label: "待支付",
    variant: "secondary" as const,
    color: "text-orange-600",
  },
  PAID: {
    label: "已支付",
    variant: "default" as const,
    color: "text-blue-600",
  },
  SHIPPED: {
    label: "已发货",
    variant: "default" as const,
    color: "text-purple-600",
  },
  COMPLETED: {
    label: "已完成",
    variant: "default" as const,
    color: "text-green-600",
  },
  CANCELED: {
    label: "已取消",
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

// 状态更新操作
const statusActions = {
  PAID: [{ status: "SHIPPED", label: "发货", icon: Truck }],
  SHIPPED: [{ status: "COMPLETED", label: "完成订单", icon: Package }],
};

function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await getSellerOrders();

      if (!result.success) {
        setError(result.error || "获取订单失败");
        return;
      }

      setOrders(result.orders || []);
      setError(null);
    } catch (err) {
      setError("获取订单失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err) {
      console.error("更新订单状态失败:", err);
    }
  };

  if (loading) {
    return <OrdersPageSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-destructive">错误: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground mb-2">暂无订单</div>
            <div className="text-sm text-muted-foreground">
              当有买家下单时，订单将在这里显示
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>订单列表 ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>买家信息</TableHead>
                <TableHead>商品信息</TableHead>
                <TableHead>收货地址</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>总价</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>下单时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusInfo =
                  orderStatusMap[order.status as keyof typeof orderStatusMap];
                const actions =
                  statusActions[order.status as keyof typeof statusActions] ||
                  [];

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {order.buyer.realName || order.buyer.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.buyer.phone || order.buyer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-1">
                          {order.product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ¥{order.product.price.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        <div className="font-medium">
                          {order.address.receiverName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.address.phone}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {order.address.province} {order.address.city}{" "}
                          {order.address.district} {order.address.detail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.quantity}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ¥{order.totalPrice.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusInfo.variant}
                        className={statusInfo.color}
                      >
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                      </div>
                      <div className="text-xs">
                        {new Date(order.createdAt).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {actions.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">打开菜单</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action) => (
                              <DropdownMenuItem
                                key={action.status}
                                onClick={() => {
                                  handleUpdateStatus(order.id, action.status);
                                }}
                              >
                                <action.icon className="mr-2 h-4 w-4" />
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="text-muted-foreground text-sm">-</div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">我的订单</h1>
      </div>

      <OrdersList />
    </div>
  );
}
