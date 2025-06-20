"use client";

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { OrderStatus } from "@prisma/client";
import { Eye, MoreHorizontal, Package, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cancelOrder, getSellerOrders, updateOrderStatus } from "./actions";
import { OrdersPageSkeleton } from "./skeleton";

interface OrderWithDetails {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    realName: string | null;
  };
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
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
    color: "text-white dark:text-red-100",
  },
};

const statusActions = {
  PENDING: [
    {
      type: "cancel",
      status: "CANCELED" as OrderStatus,
      label: "取消订单",
      icon: X,
      variant: "destructive" as const,
    },
  ],
  PAID: [
    {
      type: "update",
      status: "SHIPPED" as OrderStatus,
      label: "发货",
      icon: Truck,
      variant: "default" as const,
    },
  ],
  SHIPPED: [],
  COMPLETED: [],
  CANCELED: [],
};

function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipDialog, setShipDialog] = useState<{
    open: boolean;
    orderId: string;
    trackingNumber: string;
  }>({
    open: false,
    orderId: "",
    trackingNumber: "",
  });

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
    } catch {
      setError("获取订单失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ) => {
    try {
      const result = await updateOrderStatus(orderId, status, trackingNumber);
      if (result.success) {
        toast.success("订单状态更新成功");
        await loadOrders();
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
      "SHIPPED" as OrderStatus,
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
        await loadOrders();
      } else {
        toast.error(result.error || "取消订单失败");
      }
    } catch (err) {
      console.error("取消订单失败:", err);
      toast.error("取消订单失败");
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/manage/orders/${orderId}`);
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
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewOrder(order.id)}
                  >
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
                          {order.address.province} {order.address.city}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">打开菜单</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order.id);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            查看订单
                          </DropdownMenuItem>

                          {actions.map((action) => (
                            <DropdownMenuItem
                              key={action.status}
                              className={
                                action.variant === "destructive"
                                  ? "text-destructive"
                                  : ""
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                if (action.type === "cancel") {
                                  handleCancelOrder(order.id);
                                } else if (action.status === "SHIPPED") {
                                  handleShipOrder(order.id);
                                } else {
                                  handleUpdateStatus(order.id, action.status);
                                }
                              }}
                            >
                              <action.icon className="mr-2 h-4 w-4" />
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

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
    </Card>
  );
}

export default function OrdersPage() {
  useEffect(() => {
    document.title = "订单管理 | 管理后台";
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">我的订单</h1>
      </div>

      <OrdersList />
    </div>
  );
}
