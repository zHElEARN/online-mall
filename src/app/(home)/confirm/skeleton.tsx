import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function ConfirmSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 头部导航 - 静态部分 */}
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
          {/* 收货地址 - 只对内容部分做骨架 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                收货地址
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-4 border rounded-lg"
                  >
                    <Skeleton className="h-4 w-4 rounded-full mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 商品列表 - 只对内容部分做骨架 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <Skeleton className="h-5 w-32 inline-block" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 支付方式 - 静态部分，无需骨架 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                支付方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="wechat" id="wechat" disabled />
                  <Label
                    htmlFor="wechat"
                    className="flex items-center gap-3 cursor-pointer opacity-50"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-sm font-bold">
                      微
                    </div>
                    <span>微信支付</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="alipay" id="alipay" disabled />
                  <Label
                    htmlFor="alipay"
                    className="flex items-center gap-3 cursor-pointer opacity-50"
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

        {/* 订单摘要 - 只对价格信息做骨架 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>订单摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>商品总价</span>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>应付总额</span>
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              <Button disabled className="w-full" size="lg">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                加载中...
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                点击"提交订单"表示您同意相关服务条款
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
