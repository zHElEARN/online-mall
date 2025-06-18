"use client";

import { ArrowLeft, Package, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getProduct, getProductOrders, getProductStats } from "./actions";
import { ProductDetailSkeleton } from "./skeleton";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  salesCount: number;
  isActive: boolean;
  category: string | null;
  images: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: {
      username: string;
      avatar: string | null;
    };
  }>;
}

interface Order {
  id: string;
  quantity: number;
  totalPrice: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELED";
  createdAt: Date;
  buyer: {
    username: string;
    email: string | null;
    avatar: string | null;
  };
  address: {
    receiverName: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  };
}

interface ProductStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(price);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const orderStatusMap = {
  PENDING: { label: "待支付", variant: "secondary" as const },
  PAID: { label: "已支付", variant: "default" as const },
  SHIPPED: { label: "已发货", variant: "default" as const },
  COMPLETED: { label: "已完成", variant: "default" as const },
  CANCELED: { label: "已取消", variant: "destructive" as const },
};

function ImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={images[selectedImage]}
          alt={productName}
          fill
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 ${
                selectedImage === index
                  ? "border-primary"
                  : "border-muted hover:border-muted-foreground"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductDetailContent({
  product,
  orders,
  stats,
  productId,
}: {
  product: Product;
  orders: Order[];
  stats: ProductStats;
  productId: string;
}) {
  const images = JSON.parse(product.images || "[]") as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/manage/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回商品列表
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">商品详情</h1>
        </div>
        <Button asChild>
          <Link href={`/manage/products/${productId}/edit`}>编辑商品</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImageGallery images={images} productName={product.name} />

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "已上架" : "已下架"}
                  </Badge>
                  {product.category && (
                    <Badge variant="outline">{product.category}</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatPrice(product.price)}
                </p>
              </div>

              {product.description && (
                <div>
                  <h3 className="font-medium mb-2">商品描述</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    库存
                  </h3>
                  <p className="text-lg font-semibold">{product.stock} 件</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    销量
                  </h3>
                  <p className="text-lg font-semibold">
                    {product.salesCount} 件
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span>创建时间：</span>
                  <span>{formatDate(product.createdAt)}</span>
                </div>
                <div>
                  <span>更新时间：</span>
                  <span>{formatDate(product.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">总订单数</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">总收入</p>
                <p className="text-2xl font-bold">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">平均评分</p>
                <p className="text-2xl font-bold">
                  {stats.averageRating > 0
                    ? stats.averageRating.toFixed(1)
                    : "暂无"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            相关订单 ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无相关订单
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>买家信息</TableHead>
                    <TableHead>收货地址</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>总价</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>下单时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={order.buyer.avatar || ""} />
                              <AvatarFallback className="text-xs">
                                {order.buyer.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {order.buyer.username}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.buyer.email}
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
                      <TableCell className="font-semibold">
                        {formatPrice(order.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={orderStatusMap[order.status].variant}>
                          {orderStatusMap[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString(
                            "zh-CN"
                          )}
                        </div>
                        <div className="text-xs">
                          {new Date(order.createdAt).toLocaleTimeString(
                            "zh-CN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {product.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              用户评价 ({product.reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.user.avatar || ""} />
                      <AvatarFallback>
                        {review.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {review.user.username}
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productData, ordersData, statsData] = await Promise.all([
          getProduct(resolvedParams.id),
          getProductOrders(resolvedParams.id),
          getProductStats(resolvedParams.id),
        ]);

        if (!productData) {
          setError("商品不存在");
          return;
        }

        setProduct(productData);
        setOrders(ordersData);
        setStats(statsData);
      } catch (err) {
        setError("加载数据失败");
        console.error("Error fetching product data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product || !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            {error || "加载失败"}
          </h1>
          <Button onClick={() => router.back()}>返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ProductDetailContent
        product={product}
        orders={orders}
        stats={stats}
        productId={resolvedParams.id}
      />
    </div>
  );
}
