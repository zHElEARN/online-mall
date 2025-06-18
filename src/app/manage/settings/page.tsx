"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfo } from "@/types/user";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { getCurrentUser } from "../actions";
import { changePassword, updateUserProfile } from "./actions";

function ProfileForm({ user }: { user: UserInfo }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        realName: formData.get("realName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        avatar: formData.get("avatar") as string,
      };

      const result = await updateUserProfile(data);
      if (result.success) {
        toast.success(result.message || "个人信息更新成功");
      } else {
        toast.error(result.error || "更新失败");
      }
    } catch {
      toast.error("更新失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人信息</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || ""} alt="头像" />
              <AvatarFallback className="text-lg font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-muted-foreground">
                {user.role === "SELLER" ? "商家" : "买家"}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={user.username}
                disabled
                className="bg-muted"
              />
              <div className="text-xs text-muted-foreground">
                用户名无法修改
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="realName">真实姓名</Label>
              <Input
                id="realName"
                name="realName"
                defaultValue={user.realName || ""}
                placeholder="请输入真实姓名"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email || ""}
                placeholder="请输入邮箱地址"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={user.phone || ""}
                placeholder="请输入手机号"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar">头像URL</Label>
              <Input
                id="avatar"
                name="avatar"
                defaultValue={user.avatar || ""}
                placeholder="请输入头像图片URL"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "保存中..." : "保存更改"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        currentPassword: formData.get("currentPassword") as string,
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
      };

      const result = await changePassword(data);
      if (result.success) {
        toast.success(result.message || "密码修改成功");
        // 重置表单
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.error || "修改失败");
      }
    } catch {
      toast.error("修改失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">当前密码</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="请输入当前密码"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="请输入新密码（至少6位）"
              required
              minLength={6}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "修改中..." : "修改密码"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          toast.error(result.error || "获取用户信息失败");
        }
      } catch {
        toast.error("获取用户信息失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">获取用户信息失败</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">商家设置</h1>
        <p className="text-muted-foreground mt-2">
          管理您的个人信息和账户安全设置
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">个人信息</TabsTrigger>
          <TabsTrigger value="password">修改密码</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
