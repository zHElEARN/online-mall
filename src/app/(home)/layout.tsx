"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  LogOut,
  Menu,
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
  const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
      setIsSheetOpen(false); // 关闭移动端菜单
    } catch (error) {
      console.error("退出登录失败:", error);
    }
  };

  const handleLinkClick = () => {
    setIsSheetOpen(false); // 点击链接时关闭移动端菜单
  };

  // 导航链接组件
  const NavLink = ({
    href,
    icon: Icon,
    children,
    onClick,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`font-medium transition-colors border-b-2 py-1 flex items-center gap-1 ${
        isActiveRoute(href) && (href === "/" ? pathname === "/" : true)
          ? "text-primary border-primary"
          : "text-muted-foreground hover:text-foreground border-transparent"
      }`}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* 移动端菜单按钮 */}
              {isMobile && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="size-5" />
                      <span className="sr-only">打开菜单</span>
                    </Button>
                  </SheetTrigger>{" "}
                  <SheetContent side="left" className="w-72">
                    <SheetHeader className="px-6">
                      <SheetTitle className="text-left">菜单</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4 mt-6 px-6">
                      <NavLink href="/" icon={Home} onClick={handleLinkClick}>
                        首页
                      </NavLink>
                      <NavLink
                        href="/search"
                        icon={Search}
                        onClick={handleLinkClick}
                      >
                        搜索
                      </NavLink>
                      <NavLink
                        href="/products"
                        icon={ShoppingBag}
                        onClick={handleLinkClick}
                      >
                        商品
                      </NavLink>

                      {!isLoading && isAuthenticated && (
                        <>
                          <NavLink
                            href="/cart"
                            icon={ShoppingCart}
                            onClick={handleLinkClick}
                          >
                            购物车
                          </NavLink>
                          <NavLink
                            href="/my"
                            icon={User}
                            onClick={handleLinkClick}
                          >
                            我的
                          </NavLink>
                          <NavLink
                            href="/profile"
                            icon={Settings}
                            onClick={handleLinkClick}
                          >
                            个人设置
                          </NavLink>
                          <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-b-2 border-transparent justify-start p-0 h-auto py-1"
                          >
                            <LogOut className="size-4 mr-1" />
                            退出登录
                          </Button>
                        </>
                      )}

                      {!isLoading && !isAuthenticated && (
                        <Button asChild onClick={handleLinkClick}>
                          <Link href="/auth/login">登录</Link>
                        </Button>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              )}

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ShoppingBag className="size-4" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  网上商城平台
                </span>
              </Link>
            </div>

            {/* 桌面端导航 */}
            {!isMobile && (
              <nav className="flex items-center gap-6">
                <NavLink href="/" icon={Home}>
                  首页
                </NavLink>
                <NavLink href="/search" icon={Search}>
                  搜索
                </NavLink>
                <NavLink href="/products" icon={ShoppingBag}>
                  商品
                </NavLink>

                {!isLoading && isAuthenticated && (
                  <>
                    <NavLink href="/cart" icon={ShoppingCart}>
                      购物车
                    </NavLink>
                    <NavLink href="/my" icon={User}>
                      我的
                    </NavLink>
                    <NavLink href="/profile" icon={Settings}>
                      个人设置
                    </NavLink>
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
            )}

            {/* 移动端右侧按钮 */}
            {isMobile && (
              <div className="flex items-center gap-2">
                {isLoading && (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-16 rounded-md" />
                  </div>
                )}

                {!isLoading && !isAuthenticated && (
                  <Button asChild size="sm">
                    <Link href="/auth/login">登录</Link>
                  </Button>
                )}

                <ModeToggle />
              </div>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
