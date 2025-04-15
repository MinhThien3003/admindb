"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Admin {
  _id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  avatar?: string;
}

// Mở rộng kiểu User trong useAuth để bao gồm cả _id và id
declare module '@/hooks/use-auth' {
  interface User {
    _id?: string;
    id?: string;
  }
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    console.log("User từ useAuth:", user);
    
    if (user) {
      // Lấy ID từ user object (được lưu từ response đăng nhập)
      const adminId = user._id || user.id;
      console.log("Admin ID từ user:", adminId);
      
      if (adminId) {
        fetchAdminData(adminId);
      } else {
        toast.error('Không tìm thấy ID admin');
        setIsLoading(false);
      }
    }
  }, [user]);

  const fetchAdminData = async (adminId: string) => {
    try {
      console.log("Đang tải thông tin admin với ID:", adminId);
      
      const response = await fetch(`/api/admins/${adminId}`);
      console.log("API Response status:", response.status);
      const data = await response.json();
      console.log("API Response data:", data);
      
      if (data.success) {
        setAdmin(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          username: data.data.username || '',
          password: '',
        });
      } else {
        toast.error('Không thể lấy thông tin admin: ' + (data.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Có lỗi xảy ra khi lấy thông tin admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const adminId = user?._id || user?.id;
      if (!adminId) {
        toast.error('Không tìm thấy ID admin');
        return;
      }

      console.log("Đang cập nhật thông tin admin với ID:", adminId);
      console.log("Form data:", formData);

      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log("API Response status:", response.status);
      const data = await response.json();
      console.log("API Response data:", data);

      if (data.success) {
        toast.success('Cập nhật thông tin thành công');
        fetchAdminData(adminId); // Lấy lại dữ liệu mới
      } else {
        toast.error(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!admin) {
    return <div>Không tìm thấy thông tin admin</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="name">Họ tên</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu mới</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Để trống nếu không muốn thay đổi"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Cập nhật</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </form>
    </div>
  );
} 