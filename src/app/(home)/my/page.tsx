"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Package,
  Star,
} from "lucide-react";
import { Suspense } from "react";
import AddressList from "./address-list";
import OrderList from "./order-list";
import ReviewList from "./review-list";
import {
  AddressListSkeleton,
  OrderListSkeleton,
  ReviewListSkeleton,
} from "./skeleton";

export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">我的账户</h1>
        <p className="text-muted-foreground">管理您的订单、地址和评论</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            订单列表
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            地址列表
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            评论列表
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <Suspense fallback={<OrderListSkeleton />}>
            <OrderList />
          </Suspense>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Suspense fallback={<AddressListSkeleton />}>
            <AddressList />
          </Suspense>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Suspense fallback={<ReviewListSkeleton />}>
            <ReviewList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
