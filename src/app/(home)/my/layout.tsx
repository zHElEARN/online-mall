"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Package, Star } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");

  // 根据当前路径设置激活的 tab
  useEffect(() => {
    if (pathname.includes("/my/orders")) {
      setActiveTab("orders");
    } else if (pathname.includes("/my/addresses")) {
      setActiveTab("addresses");
    } else if (pathname.includes("/my/reviews")) {
      setActiveTab("reviews");
    }
  }, [pathname]);

  // 处理 tab 切换
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case "orders":
        router.push("/my/orders");
        break;
      case "addresses":
        router.push("/my/addresses");
        break;
      case "reviews":
        router.push("/my/reviews");
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">我的账户</h1>
        <p className="text-muted-foreground">管理您的订单、地址和评论</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
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

        <TabsContent value={activeTab} className="mt-6">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}
