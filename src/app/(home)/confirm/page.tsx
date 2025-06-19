"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Check,
  CreditCard,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  calculateTotalPrice,
  getPendingOrders,
  getUserAddresses,
  payPendingOrders,
} from "./actions";
import ConfirmSkeleton from "./skeleton";

type PendingOrder = {
  id: string;
  quantity: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
    stock: number;
    seller: {
      username: string;
    };
  };
  address: {
    id: string;
    receiverName: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    isDefault: boolean;
  };
};

type Address = {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
};

export default function ConfirmPage() {
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"wechat" | "alipay">(
    "wechat"
  );
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "确认订单 | 在线商城";
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [orders, userAddresses, total] = await Promise.all([
        getPendingOrders(),
        getUserAddresses(),
        calculateTotalPrice(),
      ]);

      setPendingOrders(orders);
      setAddresses(userAddresses);
      setTotalPrice(total);

      // 如果没有待支付订单，重定向到购物车页面
      if (orders.length === 0) {
        toast.error("没有待支付订单");
        router.push("/cart");
        return;
      }

      // 默认选择订单中的地址，或用户的默认地址
      const orderAddress = orders[0]?.address;
      if (orderAddress) {
        setSelectedAddressId(orderAddress.id);
      } else {
        const defaultAddress =
          userAddresses.find((addr: Address) => addr.isDefault) ||
          userAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error("加载数据失败:", error);
      toast.error("加载数据失败");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      toast.error("请选择收货地址");
      return;
    }

    try {
      setIsSubmitting(true);
      await payPendingOrders(selectedAddressId, paymentMethod);
      toast.success("支付成功！");
      router.push("/my/orders");
    } catch (error) {
      console.error("支付失败:", error);
      toast.error("支付失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFirstImage = (images: string) => {
    const imageArray = JSON.parse(images);
    return imageArray[0];
  };

  if (isLoading) {
    return <ConfirmSkeleton />;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 头部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cart">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回购物车
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">确认订单</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* 收货地址 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                收货地址
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">您还没有收货地址</p>
                  <Link href="/my/addresses">
                    <Button>添加收货地址</Button>
                  </Link>
                </div>
              ) : (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                  className="space-y-4"
                >
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <RadioGroupItem
                        value={address.id}
                        id={address.id}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={address.id}
                            className="font-medium cursor-pointer"
                          >
                            {address.receiverName}
                          </Label>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {address.phone}
                          </div>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              默认
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.province} {address.city} {address.district}{" "}
                          {address.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* 商品列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                待支付订单 ({pendingOrders.length}件)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex gap-4 p-4 border rounded-lg"
                >
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={getFirstImage(order.product.images)}
                      alt={order.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium line-clamp-1">
                      {order.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      卖家: {order.product.seller.username}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        ¥{order.product.price.toFixed(2)} × {order.quantity}
                      </span>
                      <span className="font-medium text-lg">
                        ¥{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 支付方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                支付方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "wechat" | "alipay")
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="wechat" id="wechat" />
                  <Label
                    htmlFor="wechat"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-sm font-bold">
                      微
                    </div>
                    <span>微信支付</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="alipay" id="alipay" />
                  <Label
                    htmlFor="alipay"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold">
                      支
                    </div>
                    <span>支付宝</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* 订单摘要 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>订单摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>商品总价</span>
                  <span>¥{totalPrice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>应付总额</span>
                  <span className="text-primary">¥{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={
                  isSubmitting ||
                  !selectedAddressId ||
                  pendingOrders.length === 0
                }
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    支付中...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    确认支付
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                点击&ldquo;提交订单&rdquo;表示您同意相关服务条款
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
