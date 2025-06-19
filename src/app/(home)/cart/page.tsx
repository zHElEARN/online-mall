"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  clearCart,
  createPendingOrdersFromCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "./actions";
import CartSkeleton from "./skeleton";

type CartItem = {
  id: string;
  quantity: number;
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
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      const items = await getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error("加载购物车失败:", error);
      toast.error("加载购物车失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      setUpdatingItems((prev) => new Set(prev).add(cartId));
      await updateCartItemQuantity(cartId, newQuantity);

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item
        )
      );

      toast.success("更新数量成功");
    } catch (error) {
      console.error("更新数量失败:", error);
      toast.error("更新数量失败");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartId: string) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(cartId));
      await removeCartItem(cartId);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartId)
      );

      toast.success("删除商品成功");
    } catch (error) {
      console.error("删除商品失败:", error);
      toast.error("删除商品失败");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;

    try {
      await clearCart();
      setCartItems([]);
      toast.success("清空购物车成功");
    } catch (error) {
      console.error("清空购物车失败:", error);
      toast.error("清空购物车失败");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("购物车为空");
      return;
    }

    try {
      setIsCheckingOut(true);
      await createPendingOrdersFromCart();
      toast.success("订单创建成功，请选择支付方式");
      router.push("/confirm");
    } catch (error: any) {
      console.error("创建订单失败:", error);
      toast.error(error.message || "创建订单失败");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const parseImages = (images: string) => {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [images];
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const calculateItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">购物车</h1>
        <p className="text-muted-foreground">
          {cartItems.length === 0
            ? "购物车为空"
            : `共 ${calculateItemsCount()} 件商品`}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">购物车为空</h3>
          <p className="text-muted-foreground mb-6">快去选购您喜欢的商品吧！</p>
          <Button asChild>
            <Link href="/">去购物</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">商品列表</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
              >
                清空购物车
              </Button>
            </div>

            {cartItems.map((item) => {
              const images = parseImages(item.product.images);
              const isUpdating = updatingItems.has(item.id);

              return (
                <Card key={item.id} className={isUpdating ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex gap-6">
                      <div className="flex-1 flex gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium mb-1 line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            卖家: {item.product.seller.username}
                          </p>
                          <div className="text-lg font-medium text-primary">
                            ¥{item.product.price.toFixed(2)}
                          </div>
                          {item.quantity >= item.product.stock && (
                            <p className="text-sm text-destructive mt-2">
                              库存不足，仅剩 {item.product.stock} 件
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between h-20 min-w-[120px]">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.product.stock || isUpdating
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>订单摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>商品件数</span>
                  <span>{calculateItemsCount()} 件</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>商品总价</span>
                  <span>¥{calculateTotal().toFixed(2)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-medium mb-4">
                    <span>总计</span>
                    <span className="text-primary">
                      ¥{calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={cartItems.length === 0 || isCheckingOut}
                    onClick={handleCheckout}
                  >
                    {isCheckingOut ? "创建订单中..." : "去结算"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
