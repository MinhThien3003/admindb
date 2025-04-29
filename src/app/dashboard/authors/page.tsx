"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Pencil, DollarSign, Eye, Download, Plus, Bell, Upload, EyeOff, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { User } from "@/types/user"
import Link from "next/link"
import { toast } from "sonner"
import { updateUser } from '@/lib/api/users'

interface User {
  _id: string;
  fullname?: string;
  email: string;
  username: string;
  password?: string;
  gender: 'Male' | 'Female';
  status: 'active' | 'inactive' | 'banned';
  role: 'reader' | 'author';
  avatar?: string;
  bio?: string;
  totalViews?: number;
  totalEarnings?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AuthorsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const ITEMS_PER_PAGE = 10
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
    gender: 'Male' as 'Male' | 'Female',
    status: 'active' as 'active' | 'inactive' | 'banned',
    bio: '',
    avatar: '' as string
  })
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)

  // Tải danh sách người dùng từ API
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/authors')
      console.log('API Response:', response.data)
      
      // Kiểm tra dữ liệu trả về
      if (!Array.isArray(response.data)) {
        console.error('Dữ liệu không đúng định dạng mảng:', response.data)
        toast.error("Dữ liệu trả về không đúng định dạng")
        return
      }

      // Kiểm tra từng item trong mảng
      const validUsers = response.data.filter(user => {
        if (!user._id || !user.username) {
          console.warn('User thiếu thông tin cần thiết:', user)
          return false
        }
        return true
      })

      console.log('Valid users:', validUsers)
      setUsers(validUsers)
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng:', error)
      toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu người dùng")
    } finally {
      setIsLoading(false)
    }
  }

  // Tải số lượng yêu cầu đang chờ
  const fetchPendingCount = async () => {
    try {
      console.log('Đang tải số lượng yêu cầu...')
      const response = await axios.get('/api/authorRegisters/admin/count')
      console.log('Số lượng yêu cầu:', response.data)
      setPendingCount(response.data.count)
    } catch (error) {
      // Chỉ log lỗi nếu không phải lỗi 404
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        console.error('Lỗi khi tải số lượng yêu cầu:', error)
      }
      // Đặt số lượng yêu cầu về 0 nếu có lỗi
      setPendingCount(0)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchPendingCount()
  }, [])

  // Áp dụng các bộ lọc cho danh sách người dùng
  useEffect(() => {
    console.log('Users before filtering:', users)
    if (!Array.isArray(users)) {
      console.error('users không phải là mảng:', users)
      return
    }

    const filtered = users.filter(user => {
      if (!user || typeof user !== 'object') {
        console.warn('User không hợp lệ:', user)
        return false
      }

      try {
        const matchesSearch = 
          (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
        
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        const matchesGender = genderFilter === "all" || user.gender === genderFilter
        
        const userCreatedAt = user.createdAt ? new Date(user.createdAt) : null
        const matchesDateRange = !dateRange || !dateRange.from || !dateRange.to || 
          (userCreatedAt && userCreatedAt >= dateRange.from && 
           userCreatedAt <= new Date(dateRange.to.getTime() + 86400000))
        
        return matchesSearch && matchesStatus && matchesGender && matchesDateRange
      } catch (error) {
        console.error('Lỗi khi lọc user:', error, user)
        return false
      }
    })
    
    console.log('Filtered users:', filtered)
    setFilteredUsers(filtered)
  }, [users, searchQuery, statusFilter, genderFilter, dateRange])

  // Tính toán số trang
  const totalPages = Math.max(1, Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE))
  
  // Lấy người dùng cho trang hiện tại
  const paginatedUsers = Array.isArray(filteredUsers) 
    ? filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      )
    : []
  console.log('Paginated users:', paginatedUsers)

  // Tính tổng doanh thu và lượt xem
  const totalEarnings = Array.isArray(filteredUsers)
    ? filteredUsers.reduce((sum, user) => sum + (user?.totalEarnings || 0), 0)
    : 0

  const totalViews = Array.isArray(filteredUsers)
    ? filteredUsers.reduce((sum, user) => sum + (user?.totalViews || 0), 0)
    : 0

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusMap: Record<string, { color: string, label: string }> = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Hoạt động' },
      'inactive': { color: 'bg-gray-100 text-gray-800', label: 'Không hoạt động' },
      'banned': { color: 'bg-red-100 text-red-800', label: 'Đã khóa' }
    }
    
    const { color, label } = statusMap[status] || statusMap.inactive
    
    return (
      <Badge className={`${color}`}>
        {label}
      </Badge>
    )
  }

  const getGenderBadge = (gender: string) => {
    const genderMap: Record<string, { color: string, label: string }> = {
      'Male': { color: 'bg-blue-100 text-blue-800', label: 'Nam' },
      'Female': { color: 'bg-pink-100 text-pink-800', label: 'Nữ' }
    }
    
    const { color, label } = genderMap[gender] || { color: 'bg-gray-100 text-gray-800', label: 'Khác' }
    
    return (
      <Badge className={`${color}`}>
        {label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatViews = (views: number) => {
    return new Intl.NumberFormat('vi-VN').format(views)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      fullname: user.fullname || '',
      email: user.email || '',
      username: user.username || '',
      password: user.password || '',
      gender: user.gender || 'Male',
      status: user.status || 'active',
      bio: user.bio || '',
      avatar: user.avatar || ''
    })
    setAvatarPreview(user.avatar || '')
    setShowPassword(false)
    setShowEditDialog(true)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Kiểm tra loại file và kích thước
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng tải lên file hình ảnh")
      return
    }
    
    // Kiểm tra các loại hình ảnh được chấp nhận
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận các định dạng: JPG, PNG, GIF, WEBP")
      return
    }
    
    // Kích thước tối đa (5MB)
    const maxSizeInBytes = 5 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      toast.error("Kích thước hình ảnh không được vượt quá 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarPreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Chuẩn bị dữ liệu cập nhật
      const updateData: Partial<User> = {
        fullname: editFormData.fullname,
        email: editFormData.email,
        username: editFormData.username,
        gender: editFormData.gender,
        status: editFormData.status,
        role: 'author' // Giữ nguyên role là author
      };

      // Chỉ thêm password nếu có thay đổi
      if (editFormData.password && editFormData.password.trim() !== '') {
        updateData.password = editFormData.password;
      }

      // Chỉ thêm avatar nếu có thay đổi
      if (avatarPreview && avatarPreview !== editingUser.avatar) {
        updateData.avatar = avatarPreview;
      }

      try {
        const response = await updateUser(editingUser._id, updateData);
        if (response) {
          toast.success('Cập nhật thông tin tác giả thành công');
          setUsers(users.map(user => 
            user._id === editingUser._id ? { ...user, ...response } : user
          ));
          setShowEditDialog(false);
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật tác giả:', error);
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin tác giả');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý form:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin tác giả');
    }
  };

  // Thêm hàm xóa người dùng
  const handleDeleteUser = async (userId: string) => {
    try {
      // Hiển thị confirm dialog
      if (!confirm('Bạn có chắc chắn muốn xóa tác giả này?')) {
        return;
      }

      // Lấy token từ sessionStorage
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        toast.error('Không tìm thấy token xác thực, vui lòng đăng nhập lại');
        return;
      }

      // Gọi API xóa với token
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Đọc response dưới dạng text trước
      const responseText = await response.text();
      console.log(`Phản hồi từ API (status: ${response.status}):`, responseText);

      // Parse JSON nếu có thể
      let responseData = null;
      try {
        if (responseText && responseText.trim() !== '') {
          responseData = JSON.parse(responseText);
          console.log('Dữ liệu đã parse:', responseData);
        }
      } catch (e) {
        console.error('Không thể parse JSON từ response:', e);
      }

      if (response.ok) {
        toast.success('Xóa tác giả thành công');
        // Cập nhật lại danh sách
        setUsers(users.filter(user => user._id !== userId));
      } else {
        // Xử lý các loại lỗi
        if (response.status === 401) {
          toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          const errorMessage = responseData?.message || 'Không thể xóa tác giả';
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Lỗi khi xóa tác giả:', error);
      toast.error('Đã xảy ra lỗi khi xóa tác giả');
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý tác giả</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/author-requests">
            <Button variant="outline" className="h-9 relative">
              <Bell className="w-4 h-4 mr-2" />
              Yêu cầu trở thành tác giả
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
          </Link>
          <Button variant="outline" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
          <Button className="h-9">
            <Plus className="w-4 h-4 mr-2" />
            Thêm tác giả
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Từ {filteredUsers.length} tác giả
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng lượt xem
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatViews(totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Trên tất cả truyện của tác giả
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="banned">Đã khóa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giới tính</SelectItem>
                <SelectItem value="Male">Nam</SelectItem>
                <SelectItem value="Female">Nữ</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange 
              date={dateRange} 
              onDateChange={setDateRange} 
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tác giả</TableHead>
                <TableHead>Thông tin</TableHead>
                <TableHead>Lượt xem</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(paginatedUsers) ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <p className="text-gray-500">Lỗi: Dữ liệu không đúng định dạng</p>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <p className="text-gray-500">Không có tác giả nào phù hợp với tìm kiếm</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map(user => {
                  if (!user || typeof user !== 'object') {
                    console.warn('User không hợp lệ:', user)
                    return null
                  }

                  return (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar || "https://via.placeholder.com/40"} 
                            alt={user.username || 'Unknown'}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                          />
                          <div>
                            <p className="font-medium">{user.fullname || user.username || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            {getStatusBadge(user.status)}
                            {getGenderBadge(user.gender)}
                          </div>
                          <p className="text-sm text-gray-500 truncate max-w-[200px] mt-1">
                            {user.bio || "Chưa cập nhật tiểu sử"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>{formatViews(user.totalViews || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span>{formatCurrency(user.totalEarnings || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin tác giả</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết của tác giả. Nhấn Lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center mb-4">
              <div className="h-32 w-32 rounded-full overflow-hidden mb-2 bg-gray-100">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar xem trước" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-3xl font-medium">
                    {editFormData.fullname.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Label 
                  htmlFor="edit-avatar" 
                  className="cursor-pointer px-4 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Tải lên avatar</span>
                </Label>
                <Input 
                  id="edit-avatar" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-id">ID</Label>
                <Input id="edit-id" value={editingUser?._id} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fullname">Họ tên</Label>
                <Input 
                  id="edit-fullname" 
                  name="fullname" 
                  value={editFormData.fullname} 
                  onChange={(e) => setEditFormData({ ...editFormData, fullname: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                name="email" 
                type="email" 
                value={editFormData.email} 
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Tài khoản</Label>
                <Input 
                  id="edit-username" 
                  name="username" 
                  value={editFormData.username} 
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Mật khẩu</Label>
                <div className="relative">
                  <Input 
                    id="edit-password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    value={editFormData.password} 
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} 
                    required 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Giới tính</Label>
                <Select 
                  name="gender" 
                  value={editFormData.gender} 
                  onValueChange={(value) => setEditFormData(prev => ({
                    ...prev, 
                    gender: value as "Male" | "Female"
                  }))}
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
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select 
                  name="status" 
                  value={editFormData.status} 
                  onValueChange={(value) => setEditFormData(prev => ({
                    ...prev, 
                    status: value as "active" | "inactive" | "banned"
                  }))}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="banned">Đã khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Tiểu sử</Label>
              <Textarea
                id="edit-bio"
                name="bio"
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <form onSubmit={handleEditFormSubmit}>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 