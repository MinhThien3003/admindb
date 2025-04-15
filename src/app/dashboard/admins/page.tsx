"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Trash2, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import config from "@/lib/config";

interface Admin {
  id: string;
  username: string;
  email: string;
  gender: "Male" | "Female";
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminsPage() {
  const { token, user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State cho form thêm/sửa admin
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
    role: "Admin",
  });

  // Fetch danh sách admin
  const fetchAdmins = async () => {
    if (!token) {
      toast.error("Bạn cần đăng nhập để xem danh sách này");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${config.api.baseUrl}${config.api.endpoints.admins}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAdmins(response.data.data || []);
      } else {
        toast.error(response.data.message || "Không thể tải danh sách admin");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách admin:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách admin");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm admin mới
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${config.api.baseUrl}${config.api.endpoints.admins}`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          role: formData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Thêm admin thành công");
        fetchAdmins();
        setShowAddDialog(false);
        resetForm();
      } else {
        toast.error(response.data.message || "Thêm admin thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm admin:", error);
      toast.error("Có lỗi xảy ra khi thêm admin");
    } finally {
      setIsLoading(false);
    }
  };

  // Cập nhật admin
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedAdmin) return;

    // Kiểm tra nếu có đặt mật khẩu mới
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsLoading(true);
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        gender: formData.gender,
        role: formData.role,
      };

      // Chỉ gửi mật khẩu nếu có nhập
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put(
        `${config.api.baseUrl}${config.api.endpoints.admins}/${selectedAdmin.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật admin thành công");
        fetchAdmins();
        setShowEditDialog(false);
      } else {
        toast.error(response.data.message || "Cập nhật admin thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật admin:", error);
      toast.error("Có lỗi xảy ra khi cập nhật admin");
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa admin
  const handleDeleteAdmin = async (adminId: string) => {
    if (!token) return;
    
    if (adminId === user?.id) {
      toast.error("Bạn không thể xóa tài khoản của chính mình");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa admin này?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${config.api.baseUrl}${config.api.endpoints.admins}/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Xóa admin thành công");
        fetchAdmins();
      } else {
        toast.error(response.data.message || "Xóa admin thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi xóa admin:", error);
      toast.error("Có lỗi xảy ra khi xóa admin");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username || "",
      email: admin.email || "",
      password: "",
      confirmPassword: "",
      gender: admin.gender || "Male",
      role: admin.role || "Admin",
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "Male",
      role: "Admin",
    });
    setSelectedAdmin(null);
  };

  // Lọc admin theo tìm kiếm
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Admin</h2>
          <p className="text-muted-foreground">
            Quản lý tài khoản admin của hệ thống
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm admin..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm Admin mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin để tạo tài khoản admin mới
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddAdmin}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-username">Tên đăng nhập</Label>
                    <Input
                      id="add-username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-email">Email</Label>
                    <Input
                      id="add-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-password">Mật khẩu</Label>
                    <Input
                      id="add-password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-confirm-password">Xác nhận mật khẩu</Label>
                    <Input
                      id="add-confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-gender">Giới tính</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger id="add-gender">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Nam</SelectItem>
                        <SelectItem value="Female">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-role">Vai trò</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleSelectChange("role", value)}
                    >
                      <SelectTrigger id="add-role">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang thêm..." : "Thêm Admin"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Không có admin nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {admin.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {admin.username}
                      </div>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.gender === "Male" ? "Nam" : "Nữ"}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>{formatDate(admin.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(admin)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={admin.id === user?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog sửa admin */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Admin</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin admin
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateAdmin}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Tên đăng nhập</Label>
                <Input
                  id="edit-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không đổi)</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="edit-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Giới tính</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger id="edit-gender">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Nam</SelectItem>
                    <SelectItem value="Female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 