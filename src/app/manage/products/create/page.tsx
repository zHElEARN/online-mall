"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createProduct } from "./actions";

interface FormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  images: string[];
}

interface FormErrors {
  [key: string]: string[];
}

const PRODUCT_CATEGORIES = [
  "电子产品",
  "服装配饰",
  "家居用品",
  "美妆护肤",
  "运动户外",
  "图书文娱",
  "食品饮料",
  "母婴用品",
  "汽车用品",
  "其他",
];

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const handleImageAdd = () => {
    if (imagePreview.trim()) {
      if (formData.images.includes(imagePreview.trim())) {
        toast.error("图片已存在");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imagePreview.trim()],
      }));
      setImagePreview("");

      if (errors.images) {
        setErrors((prev) => ({
          ...prev,
          images: [],
        }));
      }
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = ["商品名称不能为空"];
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = ["请输入有效的价格"];
    }

    const stock = parseInt(formData.stock);
    if (!formData.stock || isNaN(stock) || stock < 0) {
      newErrors.stock = ["请输入有效的库存数量"];
    }

    if (formData.images.length === 0) {
      newErrors.images = ["至少需要添加一张商品图片"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("请检查表单数据");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category || undefined,
        images: formData.images,
      });

      if (result.success) {
        toast.success("商品创建成功");
        router.push("/manage/products");
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        toast.error(result.error || "创建失败");
      }
    } catch (error) {
      console.error("创建商品失败:", error);
      toast.error("创建失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/manage/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            返回商品列表
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">创建商品</h1>
          <p className="text-muted-foreground">填写商品信息并发布到商城</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    商品名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="请输入商品名称"
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">商品描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="请输入商品描述"
                    className="min-h-[120px]"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description[0]}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      价格 (¥) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      aria-invalid={errors.price ? "true" : "false"}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">
                        {errors.price[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">
                      库存 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      aria-invalid={errors.stock ? "true" : "false"}
                    />
                    {errors.stock && (
                      <p className="text-sm text-destructive">
                        {errors.stock[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">商品分类</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>商品图片</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    添加图片 <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={imagePreview}
                      onChange={(e) => setImagePreview(e.target.value)}
                      placeholder="请输入图片 URL"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleImageAdd();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleImageAdd}
                      disabled={!imagePreview.trim()}
                    >
                      <ImagePlus className="h-4 w-4" />
                      添加
                    </Button>
                  </div>
                  {errors.images && (
                    <p className="text-sm text-destructive">
                      {errors.images[0]}
                    </p>
                  )}
                </div>

                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    <Label>已添加的图片</Label>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {formData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg border overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`商品图片 ${index + 1}`}
                            className="aspect-square w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%236b7280' font-size='14'%3E图片加载失败%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageRemove(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    商品创建后将自动上架，您可以随时在商品列表中修改商品状态。
                  </p>
                </div>

                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "创建中..." : "创建商品"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/manage/products">取消</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>创建提示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• 商品名称应该简洁明了，方便买家搜索</p>
                <p>• 详细的商品描述有助于提高转化率</p>
                <p>• 请确保图片清晰，展示商品的真实外观</p>
                <p>• 合理的价格定位有助于商品销售</p>
                <p>• 及时更新库存信息，避免超卖</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
