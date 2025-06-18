"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, EyeOff, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteProduct, getUserProducts, toggleProductStatus } from "./actions";
import { ProductsPageSkeleton } from "./skeleton";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string;
  stock: number;
  isActive: boolean;
  category: string | null;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

function ProductsList({
  products,
  onDelete,
  onToggleStatus,
}: {
  products: Product[];
  onDelete: (productId: string, productName: string) => void;
  onToggleStatus: (productId: string, currentStatus: boolean) => void;
}) {
  const router = useRouter();

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

  const handleEdit = (productId: string) => {
    router.push(`/manage/products/${productId}/edit`);
  };

  const handleView = (productId: string) => {
    router.push(`/manage/products/${productId}`);
  };

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
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleView(product.id)}
              >
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
                  {new Date(product.updatedAt).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(product.id);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product.id);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(product.id, product.isActive);
                        }}
                      >
                        {product.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            下架
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            上架
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(product.id, product.name);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({
    open: false,
    productId: "",
    productName: "",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await getUserProducts();
      if (result.success) {
        setProducts(result.products || []);
        setError(null);
      } else {
        setError(result.error || "获取商品列表失败");
      }
    } catch {
      setError("获取商品列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      const result = await toggleProductStatus(productId);

      if (result.success && result.product) {
        toast.success(`商品已${!currentStatus ? "上架" : "下架"}`);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  isActive: result.product!.isActive,
                  updatedAt: result.product!.updatedAt,
                }
              : p
          )
        );
      } else {
        toast.error(result.error || "操作失败");
      }
    } catch {
      toast.error("操作失败，请重试");
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    setDeleteDialog({
      open: true,
      productId,
      productName,
    });
  };

  const confirmDelete = async () => {
    const { productId } = deleteDialog;
    setDeleteDialog({ open: false, productId: "", productName: "" });

    try {
      const result = await deleteProduct(productId);

      if (result.success) {
        toast.success("商品删除成功");
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        toast.error(result.error || "删除失败");
      }
    } catch {
      toast.error("删除失败，请重试");
    }
  };

  if (loading) {
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
        <ProductsPageSkeleton />
      </div>
    );
  }

  if (error) {
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive">错误: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <ProductsList
        products={products}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, productId: "", productName: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除商品 &ldquo;{deleteDialog.productName}&rdquo;
              吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
