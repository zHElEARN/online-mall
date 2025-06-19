"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfo } from "@/types/user";
import { Camera } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { changePassword, getCurrentUser, updateUserProfile } from "./actions";
import { ProfilePageSkeleton } from "./skeleton";

function ProfileForm({ user }: { user: UserInfo }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 创建表单数据
      const formData = new FormData();
      formData.append("file", file);

      // 调用上传API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "头像上传失败");
        return;
      }

      if (result.success && result.data.url) {
        setAvatarUrl(result.data.url);
        toast.success("头像上传成功");
      } else {
        toast.error("头像上传失败");
      }
    } catch (error) {
      console.error("头像上传失败:", error);
      toast.error("头像上传失败，请稍后重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        realName: formData.get("realName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        avatar: avatarUrl, // 使用上传后的头像URL
      };

      const result = await updateUserProfile(data);
      if (result.success) {
        toast.success(result.message || "个人信息更新成功");
        // 刷新页面以获取最新数据
        window.location.reload();
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
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt="头像" />
                <AvatarFallback className="text-lg font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin">⌛</div>
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-muted-foreground">
                {user.role === "SELLER" ? "商家" : "买家"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                点击相机图标上传新头像
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
          </div>

          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full"
          >
            {isLoading ? "保存中..." : isUploading ? "上传中..." : "保存更改"}
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

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "个人资料 | 在线商城";

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
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">获取用户信息失败</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">个人设置</h1>
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
    </main>
  );
}
