"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-col space-y-1 p-4">
          <h1 className="text-lg font-semibold text-foreground">
            网上商城平台
          </h1>
          <p className="text-sm text-muted-foreground">商家管理</p>
        </div>
      </SidebarHeader>
      <SidebarContent>SidebarContent</SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
