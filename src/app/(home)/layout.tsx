"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  LogOut,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthStatus, logout } from "./actions";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await getAuthStatus();
        setIsAuthenticated(authStatus.isAuthenticated);
      } catch (error) {
        console.error("检查认证状态失败:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const isActiveRoute = (route: string) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("退出登录失败:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ShoppingBag className="size-4" />
              </div>
              <span className="text-lg font-bold text-foreground">
                网上商城平台
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className={`font-medium transition-colors border-b-2 py-1 flex items-center gap-1 ${
                  isActiveRoute("/") && pathname === "/"
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <Home className="size-4" />
                首页
              </Link>
              <Link
                href="/search"
                className={`font-medium transition-colors border-b-2 py-1 flex items-center gap-1 ${
                  isActiveRoute("/search")
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <Search className="size-4" />
                搜索
              </Link>
              <Link
                href="/products"
                className={`font-medium transition-colors border-b-2 py-1 flex items-center gap-1 ${
                  isActiveRoute("/products")
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <ShoppingBag className="size-4" />
                商品
              </Link>

              {!isLoading && isAuthenticated && (
                <>
                  <Link
                    href="/cart"
                    className={`font-medium transition-colors border-b-2 py-1 flex items-center gap-1 ${
                      isActiveRoute("/cart")
                        ? "text-primary border-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    <ShoppingCart className="size-4" />
                    购物车
                  </Link>
                  <Link
                    href="/my"
                    className={`font-medium transition-colors border-b-2 py-1 flex items-center gap-1 ${
                      isActiveRoute("/my")
                        ? "text-primary border-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    <User className="size-4" />
                    我的
                  </Link>
                  <Link
                    href="/profile"
                    className={`font-medium transition-colors border-b-2 py-1 flex items-center gap-1 ${
                      isActiveRoute("/profile")
                        ? "text-primary border-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    <Settings className="size-4" />
                    个人设置
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-b-2 border-transparent"
                  >
                    <LogOut className="size-4 mr-1" />
                    退出登录
                  </Button>
                </>
              )}

              <div className="flex items-center gap-2">
                {isLoading && (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-16 rounded-md" />
                  </div>
                )}

                {!isLoading && !isAuthenticated && (
                  <Button asChild>
                    <Link href="/auth/login">登录</Link>
                  </Button>
                )}

                <ModeToggle />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
