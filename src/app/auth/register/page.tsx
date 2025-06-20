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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { register } from "./actions";

export default function RegisterPage() {
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [captcha, setCaptcha] = useState("");
  const [captchaSent, setCaptchaSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    document.title = "注册 | 在线商城";
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendCaptcha = async () => {
    setCaptchaSent(true);
    setCountdown(60);
    // 模拟发送验证码
    toast.success("验证码已发送！");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("role", role);
      formData.set("captcha", captcha);

      const result = await register(formData);

      if (result.success) {
        toast.success("注册成功！正在跳转...");
        router.push("/");
      } else {
        toast.error(result.error || "注册失败");
      }
    } catch {
      toast.error("注册失败，请稍后再试");
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
          <CardTitle>创建新账户</CardTitle>
          <CardDescription>请填写以下信息以创建您的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label>用户类型</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as "BUYER" | "SELLER")
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BUYER" id="buyer" />
                    <Label htmlFor="buyer">买家</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SELLER" id="seller" />
                    <Label htmlFor="seller">卖家</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="请输入用户名"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="请输入密码 (至少6个字符)"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="captcha">验证码</Label>
                <div className="flex gap-2">
                  <Input
                    id="captcha"
                    name="captcha"
                    type="text"
                    placeholder="请输入验证码"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendCaptcha}
                    disabled={countdown > 0}
                    className="whitespace-nowrap"
                  >
                    {countdown > 0
                      ? `${countdown}s`
                      : captchaSent
                      ? "重新发送"
                      : "发送验证码"}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "注册中..." : "注册"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              已有账户？
              <Link href="/auth/login" className="underline underline-offset-4">
                立即登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
