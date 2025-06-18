import { Mail, MapPin, Package, Phone, User } from "lucide-react";

import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/manage/orders">返回订单列表</BackButton>
          <div>
            <h1 className="text-2xl font-bold">订单详情</h1>
            <div className="text-muted-foreground flex items-center gap-1">
              <span>订单号:</span>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              订单状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <span>创建时间:</span>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>更新时间:</span>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>快递单号:</span>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-8 w-20 mb-1" />
                <p className="text-sm text-muted-foreground">总金额</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              商品信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Skeleton className="w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-16" />
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span>单价:</span>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>数量:</span>
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <span>小计:</span>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </div>
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
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Skeleton className="h-4 w-24" />
                </div>
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
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
