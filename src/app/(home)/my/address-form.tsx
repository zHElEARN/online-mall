"use client";

import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createAddress, updateAddress } from "./actions";

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

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
  onSuccess: () => void;
}

export default function AddressForm({
  open,
  onOpenChange,
  address,
  onSuccess,
}: AddressFormProps) {
  const [formData, setFormData] = useState({
    receiverName: address?.receiverName || "",
    phone: address?.phone || "",
    province: address?.province || "",
    city: address?.city || "",
    district: address?.district || "",
    detail: address?.detail || "",
    isDefault: address?.isDefault || false,
  });
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!address;

  const handleSubmit = async (e: React.FormEvent) => {
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
      let result;
      if (isEditing) {
        result = await updateAddress(address.id, formData);
      } else {
        result = await createAddress(formData);
      }
      
      if (result.success) {
        toast.success(isEditing ? "地址更新成功" : "地址创建成功");
        onSuccess();
        onOpenChange(false);
        // 重置表单
        if (!isEditing) {
          setFormData({
            receiverName: "",
            phone: "",
            province: "",
            city: "",
            district: "",
            detail: "",
            isDefault: false,
          });
        }
      } else {
        toast.error(result.error || (isEditing ? "更新失败" : "创建失败"));
      }
    } catch (error) {
      toast.error(isEditing ? "更新地址失败" : "创建地址失败");
    } finally {
      setSubmitting(false);
    }
  };

  // 当对话框关闭时重置表单
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen && !isEditing) {
      setFormData({
        receiverName: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail: "",
        isDefault: false,
      });
    }
  };

  // 当编辑的地址改变时更新表单数据
  useEffect(() => {
    if (address) {
      setFormData({
        receiverName: address.receiverName,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑地址" : "新建地址"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiverName">收货人姓名 *</Label>
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
              <Label htmlFor="phone">手机号 *</Label>
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
              <Label htmlFor="province">省份 *</Label>
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
              <Label htmlFor="city">城市 *</Label>
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
              <Label htmlFor="district">区县 *</Label>
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
            <Label htmlFor="detail">详细地址 *</Label>
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
              onClick={() => handleOpenChange(false)}
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
  );
}
