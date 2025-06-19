"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { login } from "./actions";

export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = "登录 | 在线商城";
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await login(formData);

      if (result.success) {
        toast.success("登录成功！");
        router.push("/");
      } else {
        toast.error(result.error || "登录失败");
      }
    } catch {
      toast.error("登录失败，请稍后再试");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">网上商城平台</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>登录您的账户</CardTitle>
          <CardDescription>
            请输入您的用户名和密码以登录您的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="请输入您的用户名"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">密码</Label>
                  <button
                    type="button"
                    onClick={() => toast.info("请联系管理员重置密码")}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline cursor-pointer bg-transparent border-none p-0 text-inherit"
                  >
                    忘记密码
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="请输入您的密码"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "登录中..." : "登录"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              还没有账户？
              <Link
                href="/auth/register"
                className="underline underline-offset-4"
              >
                立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
