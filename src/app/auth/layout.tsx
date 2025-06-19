import { ModeToggle } from "@/components/theme-toggle";
import { CreditCard, ShoppingBag, Star, Truck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "用户认证",
    template: "%s | 在线商城",
  },
  description: "登录或注册账户，开始您的购物之旅",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <ShoppingBag className="absolute top-1/4 left-1/4 w-16 h-16 text-blue-500" />
          <CreditCard className="absolute top-3/4 right-1/4 w-12 h-12 text-purple-500" />
          <Star className="absolute top-1/3 right-1/3 w-10 h-10 text-yellow-500" />
          <Truck className="absolute bottom-1/3 left-1/3 w-14 h-14 text-green-500" />
        </div>
      </div>

      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
