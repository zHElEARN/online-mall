import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">购物车</h1>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">商品列表</h2>
            <Skeleton className="h-8 w-20" />
          </div>

          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex gap-6">
                  <div className="flex-1 flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-32 mb-3" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between h-20 min-w-[120px]">
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>订单摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>商品件数</span>
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between text-sm">
                <span>商品总价</span>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-medium mb-4">
                  <span>总计</span>
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
