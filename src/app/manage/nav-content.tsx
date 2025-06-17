"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Package, Settings, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavContent() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/manage") {
      return pathname === "/manage";
    }
    return pathname.startsWith(path);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="首页"
              isActive={isActive("/manage")}
            >
              <Link href="/manage">
                <Home />
                <span>首页</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="商品管理"
              isActive={isActive("/manage/products")}
            >
              <Link href="/manage/products">
                <Package />
                <span>商品管理</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="订单管理"
              isActive={isActive("/manage/orders")}
            >
              <Link href="/manage/orders">
                <ShoppingCart />
                <span>订单管理</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="商家设置"
              isActive={isActive("/manage/settings")}
            >
              <Link href="/manage/settings">
                <Settings />
                <span>商家设置</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
