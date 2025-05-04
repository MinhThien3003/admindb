"use client"

import React from "react"
import { useState, useEffect } from "react"
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
import { Search, Pencil, DollarSign, Eye, Download, Bell, Upload, EyeOff, Trash2 } from "lucide-react"
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
import { Author } from "@/types/author"
import Link from "next/link"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Interface cho ví tác giả
interface AuthorWallet {
  _id: string
  userId: {
    _id: string
    fullname: string
    username: string
    avatar: string
  }
  totalRevenue: number
  monthlyRevenue: Record<string, number>
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

// Interface cho form data
interface AuthorFormData {
  fullname: string
  email: string
  username: string
  password: string
  gender: 'Male' | 'Female'
  status: 'active' | 'inactive' | 'banned'
  bio?: string
  avatar?: string
  role: 'author'
  level: string
  experiencePoints: number
}

// Interface cho dữ liệu gửi đi API
interface AuthorApiData {
  fullname: string
  email: string
  username: string
  password?: string
  gender: 'Male' | 'Female'
  status: 'active' | 'inactive' | 'banned'
  bio?: string
  avatar?: string
  role: 'author'
  level: string
  experiencePoints: number
}

// Type cho dữ liệu cập nhật
type AuthorUpdateData = Partial<Omit<AuthorApiData, 'role'>> & { role: 'author' }

interface UploadResponse {
  url: string;
}

export default function AuthorsPage() {
  const [users, setUsers] = useState<Author[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Author[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [wallets, setWallets] = useState<Record<string, AuthorWallet>>({})
  const [isLoadingWallets, setIsLoadingWallets] = useState(false)
  const ITEMS_PER_PAGE = 10
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<Author | null>(null)
  const [editFormData, setEditFormData] = useState<AuthorFormData>({
    fullname: '',
    email: '',
    username: '',
    password: '',
    gender: 'Male',
    status: 'active',
    bio: '',
    avatar: '',
    role: 'author',
    level: 'Junior',
    experiencePoints: 0
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
      const validUsers = response.data.filter((user: Author) => {
        if (!user._id || !user.username) {
          console.warn('User thiếu thông tin cần thiết:', user)
          return false
        }
        return true
      })

      console.log('Valid users:', validUsers)
      setUsers(validUsers)
      
      // Lấy thông tin ví của tất cả tác giả
      await fetchAuthorsWallets(validUsers)
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng:', error)
      toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu người dùng")
    } finally {
      setIsLoading(false)
    }
  }

  // Thêm hàm lấy thông tin ví của tất cả tác giả
  const fetchAuthorsWallets = async (authors: Author[]) => {
    try {
      setIsLoadingWallets(true)
      const token = sessionStorage.getItem('admin_token')
      if (!token) {
        console.error('Không tìm thấy token xác thực')
        return
      }

      const walletsData: Record<string, AuthorWallet> = {}
      
      // Lấy ví cho từng tác giả (thực hiện song song các request)
      const requests = authors.map(author => 
        axios.get<AuthorWallet>(`/api/wallets/${author._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (response.data) {
            walletsData[author._id] = response.data
          }
          return response
        })
        .catch(error => {
          // Lỗi khi lấy ví của một tác giả cụ thể, nhưng không dừng hàm
          console.log(`Không thể lấy ví của tác giả ${author._id}:`, error)
          return null
        })
      )
      
      // Chờ tất cả request hoàn thành
      await Promise.allSettled(requests)
      
      // Cập nhật state với dữ liệu ví đã lấy được
      console.log('Dữ liệu ví tác giả:', walletsData)
      setWallets(walletsData)
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu ví tác giả:', error)
    } finally {
      setIsLoadingWallets(false)
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
        
        const matchesGender = genderFilter === "all" || user.gender === genderFilter
        
        const userCreatedAt = user.createdAt ? new Date(user.createdAt) : null
        const matchesDateRange = !dateRange || !dateRange.from || !dateRange.to || 
          (userCreatedAt && userCreatedAt >= dateRange.from && 
           userCreatedAt <= new Date(dateRange.to.getTime() + 86400000))
        
        return matchesSearch && matchesGender && matchesDateRange
      } catch (error) {
        console.error('Lỗi khi lọc user:', error, user)
        return false
      }
    })
    
    console.log('Filtered users:', filtered)
    setFilteredUsers(filtered)
  }, [users, searchQuery, genderFilter, dateRange])

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

  // Tính tổng doanh thu từ cả dữ liệu tác giả và ví
  const totalEarnings = Array.isArray(filteredUsers)
    ? filteredUsers.reduce((sum, user) => {
        // Ưu tiên lấy doanh thu từ ví (nếu có)
        const walletRevenue = wallets[user._id]?.totalRevenue || 0
        const userEarnings = user?.totalEarnings || 0
        // Sử dụng giá trị lớn hơn giữa hai nguồn
        return sum + Math.max(walletRevenue, userEarnings)
      }, 0)
    : 0

  const totalViews = Array.isArray(filteredUsers)
    ? filteredUsers.reduce((sum, user) => sum + (user?.totalViews || 0), 0)
    : 0

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusMap: Record<string, { color: string, label: string }> = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Hoạt động' },
      'inactive': { color: 'bg-gray-100 text-gray-800', label: 'Không hoạt động' },
      'banned': { color: 'bg-red-100 text-red-800', label: 'Bị cấm' }
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

  const handleEditUser = (user: Author) => {
    setEditingUser(user)
    setEditFormData({
      fullname: user.fullname || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      gender: user.gender || 'Male',
      status: user.status || 'active',
      bio: user.bio || '',
      avatar: user.avatar || '',
      role: 'author',
      level: user.level || 'Junior',
      experiencePoints: user.experiencePoints || 0
    })
    setAvatarPreview(user.avatar || '')
    setShowPassword(false)
    setShowEditDialog(true)
  }

  // Thêm hàm nén ảnh
  const compressImage = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Tính toán kích thước mới
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Không thể tạo canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Chuyển đổi sang base64 với chất lượng đã chỉ định
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Hàm xử lý khi thay đổi avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Kiểm tra loại file và kích thước
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng tải lên file hình ảnh');
      return;
    }
    
    // Kiểm tra các loại hình ảnh được chấp nhận
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận các định dạng: JPG, PNG, GIF, WEBP');
      return;
    }
    
    // Kích thước tối đa (2MB)
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error('Kích thước hình ảnh không được vượt quá 2MB, hệ thống sẽ tự động nén ảnh');
      compressImage(file)
        .then(compressedBase64 => {
          setAvatarPreview(compressedBase64);
          console.log('Avatar đã được nén và mã hóa thành base64');
        })
        .catch(error => {
          console.error('Lỗi khi nén ảnh:', error);
          toast.error('Không thể nén ảnh, vui lòng chọn ảnh nhỏ hơn');
        });
      return;
    }
    
    // Nén ảnh để đảm bảo kích thước nhỏ
    compressImage(file)
      .then(compressedBase64 => {
        setAvatarPreview(compressedBase64);
        console.log('Avatar đã được nén và mã hóa thành base64');
      })
      .catch(error => {
        console.error('Lỗi khi nén ảnh:', error);
        // Fallback to traditional method if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAvatarPreview(base64Data);
          console.log('Avatar đã được mã hóa thành base64 (không nén)');
        };
        reader.readAsDataURL(file);
      });
  }

  const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsLoading(true);
      toast.loading("Đang cập nhật thông tin tác giả...");

      // Chuẩn bị dữ liệu cập nhật
      const updateData: AuthorUpdateData = {
        fullname: editFormData.fullname,
        email: editFormData.email,
        username: editFormData.username,
        gender: editFormData.gender,
        status: editFormData.status,
        bio: editFormData.bio,
        role: 'author',
        level: editFormData.level,
        experiencePoints: editFormData.experiencePoints
      };

      // Chỉ thêm password nếu có thay đổi
      if (editFormData.password && editFormData.password.trim() !== '') {
        updateData.password = editFormData.password;
      }

      // Xử lý avatar nếu có thay đổi
      if (avatarPreview && avatarPreview !== editingUser.avatar) {
        try {
          // Kiểm tra kích thước base64 trước khi upload
          const base64Size = Math.round((avatarPreview.length * 0.75) / 1024); // KB
          console.log('Kích thước avatar base64 khi edit:', base64Size, 'KB');
          
          if (base64Size > 800) {
            toast.dismiss();
            toast.error(`Ảnh quá lớn (${base64Size} KB). Vui lòng sử dụng ảnh nhỏ hơn.`);
            setIsLoading(false);
            return;
          }

          // Tạo FormData và thêm file
          console.log('Bắt đầu upload avatar cho edit...');
          const formData = new FormData();
          const blob = await fetch(avatarPreview).then(r => r.blob());
          console.log('Đã tạo blob từ base64 (edit), kích thước:', blob.size, 'bytes, type:', blob.type);
          
          // Quan trọng: API yêu cầu field name phải là 'image' chứ không phải 'avatar'
          formData.append('image', blob, 'avatar.jpg');
          
          // Log ra tất cả các entries trong FormData
          console.log('FormData entries cho edit:');
          for (const pair of formData.entries()) {
            console.log(pair[0], pair[1]);
          }

          // Upload ảnh
          console.log('Gọi API upload với endpoint: /api/upload (edit)');
          const uploadResponse = await axios.post<UploadResponse>('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // 30 giây
          });

          console.log('Response từ API upload (edit):', uploadResponse.status, uploadResponse.data);
          updateData.avatar = uploadResponse.data.url;
          console.log('Avatar đã được upload thành công (edit), URL:', updateData.avatar);
        } catch (error) {
          console.error('Lỗi chi tiết khi upload avatar (edit):', error);
          if (axios.isAxiosError(error)) {
            console.error('Axios error status (edit):', error.response?.status);
            console.error('Axios error data (edit):', error.response?.data);
          }
          toast.dismiss();
          toast.error('Không thể upload avatar. Vui lòng thử lại.');
          setIsLoading(false);
          return;
        }
      }

      // Lấy token từ sessionStorage
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        toast.dismiss();
        toast.error('Không tìm thấy token xác thực, vui lòng đăng nhập lại');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      // Gọi API cập nhật
      const response = await axios.put(`/api/users/${editingUser._id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        toast.dismiss();
        toast.success('Cập nhật thông tin tác giả thành công');
        
        // Cập nhật state
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === editingUser._id ? { ...user, ...response.data } : user
        ));
        setFilteredUsers(prevUsers => prevUsers.map(user => 
          user._id === editingUser._id ? { ...user, ...response.data } : user
          ));
        
          setShowEditDialog(false);
        }
    } catch (error) {
      toast.dismiss();
        console.error('Lỗi khi cập nhật tác giả:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin tác giả');
    } finally {
      setIsLoading(false);
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

      // Kiểm tra status code trước
        if (response.status === 401) {
        toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        return;
      }

      // Nếu status code là 200 hoặc 204, xem như thành công
      if (response.ok) {
        toast.success('Xóa tác giả thành công');
        // Cập nhật lại danh sách ngay lập tức
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        return;
      }

      // Nếu có response body, thử parse và hiển thị thông báo lỗi
      const responseText = await response.text();
      if (responseText) {
        try {
          const responseData = JSON.parse(responseText);
          toast.error(responseData.message || 'Không thể xóa tác giả');
        } catch {
          toast.error('Không thể xóa tác giả');
        }
      } else {
        toast.error('Không thể xóa tác giả');
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
            <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Từ {filteredUsers.length} tác giả
            </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng tác giả hiện tại
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Trong hệ thống
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
                          <DollarSign className="h-4 w-4 text-green-500" />
                          {isLoadingWallets ? (
                            <div className="w-24 h-5 bg-gray-200 animate-pulse rounded"></div>
                          ) : wallets[user._id] ? (
                            <span className="text-green-600 font-medium">{formatCurrency(wallets[user._id].totalRevenue || 0)}</span>
                          ) : (
                          <span>{formatCurrency(user.totalEarnings || 0)}</span>
                          )}
                        </div>
                        {wallets[user._id] && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">
                              Cập nhật: {new Date(wallets[user._id].lastUpdated).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Chỉnh sửa tác giả</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xóa tác giả</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                    status: value as "active" | "inactive"
                  }))}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
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

      {/* Dialog hiển thị thông tin ví tác giả */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Thông tin ví tác giả</DialogTitle>
            <DialogDescription>
              Danh sách ví của tất cả tác giả theo thứ tự doanh thu giảm dần.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 h-[500px] overflow-y-auto">
            {isLoadingWallets ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                <p className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu ví...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(wallets).map(([userId, wallet]) => (
                  <Card key={userId} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center space-y-0 gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={wallet.userId.avatar} alt={wallet.userId.username} />
                        <AvatarFallback>{wallet.userId.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{wallet.userId.fullname}</CardTitle>
                        <div className="text-sm text-muted-foreground">@{wallet.userId.username}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-amber-600">Tổng doanh thu</p>
                          <p className="text-xl font-bold">{formatCurrency(wallet.totalRevenue)}</p>
                          <p className="text-xs text-muted-foreground">
                            Cập nhật: {format(new Date(wallet.lastUpdated), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      
                      {Object.keys(wallet.monthlyRevenue).length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Doanh thu theo tháng</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(wallet.monthlyRevenue)
                              .sort((a, b) => b[0].localeCompare(a[0]))
                              .slice(0, 6)
                              .map(([month, revenue]) => (
                                <div key={month} className="flex justify-between items-center p-2 bg-amber-50 rounded-md">
                                  <span className="text-xs">{month}</span>
                                  <span className="text-xs font-medium">{formatCurrency(revenue)}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 