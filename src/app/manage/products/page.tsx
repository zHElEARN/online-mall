import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { getUserProducts } from "./actions";
import { ProductsPageSkeleton } from "./skeleton";

async function ProductsList() {
  const result = await getUserProducts();

  if (!result.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-destructive">错误: {result.error}</div>
        </CardContent>
      </Card>
    );
  }

  const products = result.products || [];

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">暂无商品</div>
            <Button asChild>
              <Link href="/manage/products/create">
                <Plus className="mr-2 h-4 w-4" />
                创建第一个商品
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品列表 ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品名称</TableHead>
              <TableHead>价格</TableHead>
              <TableHead>库存</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>销量</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  {product.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {product.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">¥{product.price.toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <div className={product.stock <= 10 ? "text-orange-600" : ""}>
                    {product.stock}
                    {product.stock <= 10 && (
                      <span className="text-xs ml-1">(库存低)</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {product.category || "未分类"}
                  </Badge>
                </TableCell>
                <TableCell>{product.salesCount}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "上架" : "下架"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(product.createdAt).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">我的商品</h1>
        <Button asChild>
          <Link href="/manage/products/create">
            <Plus className="mr-2 h-4 w-4" />
            添加商品
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
