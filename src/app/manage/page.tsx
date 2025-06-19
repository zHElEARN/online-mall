import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertTriangle,
    DollarSign,
    Package,
    Plus,
    ShoppingCart,
    TrendingUp,
    Users,
    Warehouse,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats, getRecentOrders } from "./actions";

export const metadata: Metadata = {
  title: "仪表板",
  description: "查看商店概况和重要数据",
};

export const dynamic = "force-dynamic";

type OrderWithRelations = {
  id: string;
  quantity: number;
  totalPrice: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELED";
  createdAt: Date;
  product: {
    name: string;
  };
  buyer: {
    username: string;
  };
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const orderStatusMap = {
  PENDING: {
    label: "待支付",
    variant: "secondary" as const,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  PAID: {
    label: "已支付",
    variant: "default" as const,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  SHIPPED: {
    label: "已发货",
    variant: "default" as const,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  COMPLETED: {
    label: "已完成",
    variant: "default" as const,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  CANCELED: {
    label: "已取消",
    variant: "destructive" as const,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
};

export default async function ManagePage() {
  const [statsResult, ordersResult] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
  ]);

  if (!statsResult.success) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">{statsResult.error}</p>
      </div>
    );
  }

  const stats = statsResult.stats!;
  const recentOrders = ordersResult.success ? ordersResult.orders : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">商家管理首页</h1>
        <p className="text-muted-foreground">
          欢迎回来！这里是您的商店管理控制台
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/manage/products/create" className="block">
            <CardContent className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">添加商品</h3>
              <p className="text-sm text-muted-foreground">
                快速上架新商品，开始销售
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/manage/products" className="block">
            <CardContent className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">商品管理</h3>
              <p className="text-sm text-muted-foreground">
                管理所有商品，编辑信息和库存
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/manage/orders" className="block">
            <CardContent className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">订单管理</h3>
              <p className="text-sm text-muted-foreground">
                处理订单，跟踪发货状态
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/manage/settings" className="block">
            <CardContent className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">账户设置</h3>
              <p className="text-sm text-muted-foreground">
                管理个人信息和店铺设置
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总商品数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              其中 {stats.activeProducts} 件在售
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总订单数</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              待处理 {stats.pendingOrders} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              今日订单 {stats.todayOrders} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">库存情况</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts > 0 && (
                <span className="flex items-center text-orange-600">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {stats.lowStockProducts} 件低库存
                </span>
              )}
              {stats.lowStockProducts === 0 && (
                <span className="text-green-600">库存充足</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>最近订单</CardTitle>
            <p className="text-sm text-muted-foreground">最新的 5 个订单信息</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/manage/orders">
              查看全部
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名称</TableHead>
                  <TableHead>买家</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order: OrderWithRelations) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.product.name}
                    </TableCell>
                    <TableCell>{order.buyer.username}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          orderStatusMap[
                            order.status as keyof typeof orderStatusMap
                          ].bgColor
                        } ${
                          orderStatusMap[
                            order.status as keyof typeof orderStatusMap
                          ].borderColor
                        } ${
                          orderStatusMap[
                            order.status as keyof typeof orderStatusMap
                          ].color
                        } border`}
                      >
                        {
                          orderStatusMap[
                            order.status as keyof typeof orderStatusMap
                          ].label
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              暂无订单数据
            </div>
          )}
        </CardContent>
      </Card>

      {stats.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              库存预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              您有 {stats.lowStockProducts}{" "}
              件商品库存不足（少于10件），建议及时补货。
            </p>
            <Button className="mt-4" variant="outline" size="sm" asChild>
              <Link href="/manage/products?filter=low-stock">
                查看低库存商品
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
