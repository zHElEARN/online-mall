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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, MapPin, Phone, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createAddress,
  deleteAddress,
  getUserAddresses,
  setDefaultAddress,
  updateAddress,
} from "./actions";
import { AddressListSkeleton } from "./skeleton";

interface Address {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    receiverName: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail: "",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "收货地址 | 在线商城";
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      setLoading(true);
      const result = await getUserAddresses();
      if (result.success) {
        setAddresses(result.addresses || []);
      } else {
        toast.error(result.error || "获取地址失败");
      }
    } catch {
      toast.error("获取地址列表失败");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      receiverName: address.receiverName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormData({
      receiverName: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      detail: "",
      isDefault: false,
    });
    setShowAddressForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.receiverName.trim()) {
      toast.error("请输入收货人姓名");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("请输入手机号");
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast.error("请输入正确的手机号");
      return;
    }

    if (!formData.province.trim()) {
      toast.error("请输入省份");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("请输入城市");
      return;
    }

    if (!formData.district.trim()) {
      toast.error("请输入区县");
      return;
    }

    if (!formData.detail.trim()) {
      toast.error("请输入详细地址");
      return;
    }

    setSubmitting(true);

    try {
      if (editingAddress) {
        const result = await updateAddress(editingAddress.id, formData);
        if (result.success) {
          // 更新本地状态中的地址
          setAddresses((prev) =>
            prev.map((addr) =>
              addr.id === editingAddress.id
                ? { ...addr, ...formData }
                : formData.isDefault
                ? { ...addr, isDefault: false }
                : addr
            )
          );
          toast.success("地址更新成功");
          setShowAddressForm(false);
          setEditingAddress(null);
        } else {
          toast.error(result.error || "更新失败");
        }
      } else {
        const result = await createAddress(formData);
        if (result.success && result.address) {
          // 添加新地址到本地状态
          if (formData.isDefault) {
            // 如果新地址是默认地址，将其他地址设为非默认
            setAddresses((prev) => [
              result.address!,
              ...prev.map((addr) => ({ ...addr, isDefault: false })),
            ]);
          } else {
            setAddresses((prev) => [result.address!, ...prev]);
          }
          toast.success("地址创建成功");
          setShowAddressForm(false);
          setEditingAddress(null);
        } else {
          toast.error(result.error || "创建失败");
        }
      }
    } catch {
      toast.error(editingAddress ? "更新地址失败" : "创建地址失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    setDeletingAddress(addressToDelete);
    try {
      const result = await deleteAddress(addressToDelete);
      if (result.success) {
        // 从本地状态中移除地址
        setAddresses((prev) =>
          prev.filter((addr) => addr.id !== addressToDelete)
        );
        toast.success("地址删除成功");
      } else {
        toast.error(result.error || "删除失败");
      }
    } catch {
      toast.error("删除地址失败");
    } finally {
      setDeletingAddress(null);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        // 更新本地状态，设置新的默认地址并取消其他地址的默认状态
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId,
          }))
        );
        toast.success("已设为默认地址");
      } else {
        toast.error(result.error || "设置默认地址失败");
      }
    } catch {
      toast.error("设置默认地址失败");
    }
  };

  if (loading) {
    return <AddressListSkeleton />;
  }

  if (addresses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">收货地址</h2>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            添加地址
          </Button>
        </div>
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">暂无收货地址</p>
          <Button className="mt-4" onClick={handleAddNew}>
            添加地址
          </Button>
        </div>
        <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "编辑地址" : "添加地址"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiverName">收货人姓名</Label>
                  <Input
                    id="receiverName"
                    value={formData.receiverName}
                    onChange={(e) =>
                      setFormData({ ...formData, receiverName: e.target.value })
                    }
                    placeholder="请输入收货人姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="请输入手机号"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">省份</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    placeholder="省份"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">城市</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="城市"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">区县</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    placeholder="区县"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail">详细地址</Label>
                <Textarea
                  id="detail"
                  value={formData.detail}
                  onChange={(e) =>
                    setFormData({ ...formData, detail: e.target.value })
                  }
                  placeholder="请输入详细地址"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: !!checked })
                  }
                />
                <Label htmlFor="isDefault">设为默认地址</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">收货地址</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          添加地址
        </Button>
      </div>

      {addresses.map((address) => (
        <Card key={address.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{address.receiverName}</span>
                  <Phone className="h-4 w-4 text-muted-foreground ml-4" />
                  <span className="text-muted-foreground">{address.phone}</span>
                  {address.isDefault && (
                    <Badge variant="default" className="ml-2">
                      默认
                    </Badge>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {address.province} {address.city} {address.district}
                    {address.detail}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    设为默认
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingAddress === address.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "编辑地址" : "添加地址"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">收货人姓名</Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) =>
                    setFormData({ ...formData, receiverName: e.target.value })
                  }
                  placeholder="请输入收货人姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="请输入手机号"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">省份</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                  placeholder="省份"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="城市"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">区县</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  placeholder="区县"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">详细地址</Label>
              <Textarea
                id="detail"
                value={formData.detail}
                onChange={(e) =>
                  setFormData({ ...formData, detail: e.target.value })
                }
                placeholder="请输入详细地址"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: !!checked })
                }
              />
              <Label htmlFor="isDefault">设为默认地址</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                }}
                disabled={submitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个收货地址吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
