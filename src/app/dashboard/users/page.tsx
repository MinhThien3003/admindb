"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  User, 
  BookOpen, 
  Bookmark, 
  Award, 
  Star, 
  Crown, 
  Search, 
  UserPlus,
  Download,
  Coins,
  Pencil,
  Upload,
  Eye,
  EyeOff
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import axios from "axios"

// Định nghĩa interface cho cấp độ người dùng
interface UserLevel {
  id: number
  name: string
  level: number
  requiredExp: number
  benefits: string[]
  color: string
  icon: string
}

// Định nghĩa interface cho người dùng, phù hợp với mô hình đã cung cấp
interface User {
  _id: string
  fullname: string
  username: string
  password: string
  email: string
  gender: "Male" | "Female"
  role: "reader" | "author"
  avatar: string
  createdAt: Date
  updatedAt: Date
  idReaderExp?: string | null
  
  // Các trường bổ sung cho UI
  level?: UserLevel
  exp?: number
  totalDeposit?: number
  totalCoins?: number
  status?: "active" | "inactive" | "banned"
}

// Dữ liệu mẫu cho cấp độ người dùng
const userLevels: UserLevel[] = [
  {
    id: 1,
    name: "Độc giả mới",
    level: 1,
    requiredExp: 0,
    benefits: ["Đọc truyện miễn phí", "Bình luận"],
    color: "gray",
    icon: "user"
  },
  {
    id: 2,
    name: "Độc giả thường xuyên",
    level: 2,
    requiredExp: 100,
    benefits: ["Đọc truyện miễn phí", "Bình luận", "Đánh giá truyện"],
    color: "green",
    icon: "book-open"
  },
  {
    id: 3,
    name: "Độc giả nhiệt tình",
    level: 3,
    requiredExp: 300,
    benefits: ["Đọc truyện miễn phí", "Bình luận", "Đánh giá truyện", "Giảm 5% phí đọc truyện premium"],
    color: "blue",
    icon: "bookmark"
  },
  {
    id: 4,
    name: "Độc giả chuyên nghiệp",
    level: 4,
    requiredExp: 700,
    benefits: ["Đọc truyện miễn phí", "Bình luận", "Đánh giá truyện", "Giảm 10% phí đọc truyện premium", "Huy hiệu đặc biệt"],
    color: "purple",
    icon: "award"
  },
  {
    id: 5,
    name: "Độc giả kỳ cựu",
    level: 5,
    requiredExp: 1500,
    benefits: ["Đọc truyện miễn phí", "Bình luận", "Đánh giá truyện", "Giảm 15% phí đọc truyện premium", "Huy hiệu đặc biệt", "Truy cập sớm nội dung mới"],
    color: "orange",
    icon: "star"
  },
  {
    id: 6,
    name: "Độc giả huyền thoại",
    level: 6,
    requiredExp: 3000,
    benefits: ["Đọc truyện miễn phí", "Bình luận", "Đánh giá truyện", "Giảm 20% phí đọc truyện premium", "Huy hiệu đặc biệt", "Truy cập sớm nội dung mới", "Quà tặng hàng tháng"],
    color: "red",
    icon: "crown"
  }
]

// Hàm lấy cấp độ dựa trên kinh nghiệm
const getUserLevel = (exp: number): UserLevel => {
  // Sắp xếp cấp độ theo thứ tự giảm dần của requiredExp
  const sortedLevels = [...userLevels].sort((a, b) => b.requiredExp - a.requiredExp);
  
  // Tìm cấp độ phù hợp nhất
  for (const level of sortedLevels) {
    if (exp >= level.requiredExp) {
      return level;
    }
  }
  
  // Mặc định trả về cấp độ thấp nhất
  return userLevels[0];
};

// Hàm lấy biểu tượng dựa trên tên
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'user':
      return <User className="h-4 w-4" />;
    case 'book-open':
      return <BookOpen className="h-4 w-4" />;
    case 'bookmark':
      return <Bookmark className="h-4 w-4" />;
    case 'award':
      return <Award className="h-4 w-4" />;
    case 'star':
      return <Star className="h-4 w-4" />;
    case 'crown':
      return <Crown className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

// Hàm hiển thị màu cho cấp độ
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getLevelBadge = (level: UserLevel) => {
  const colorClasses: Record<string, string> = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    red: "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <Badge variant="outline" className={`${colorClasses[level.color]} flex items-center gap-1`}>
      {getIconComponent(level.icon)}
      <span>{level.name}</span>
    </Badge>
  )
}

// Hàm hiển thị màu cho trạng thái
const getStatusBadge = (status: string) => {
  const statusClasses: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    banned: "bg-red-100 text-red-800 border-red-200"
  }

  const statusLabels: Record<string, string> = {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    banned: "Bị cấm"
  }

  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {statusLabels[status]}
    </Badge>
  )
}

// Hàm hiển thị giới tính
const getGenderBadge = (gender: string) => {
  const genderClasses: Record<string, string> = {
    Male: "bg-blue-100 text-blue-800 border-blue-200",
    Female: "bg-pink-100 text-pink-800 border-pink-200"
  }

  const genderLabels: Record<string, string> = {
    Male: "Nam",
    Female: "Nữ"
  }

  return (
    <Badge variant="outline" className={genderClasses[gender]}>
      {genderLabels[gender]}
    </Badge>
  )
}

// Hàm định dạng số tiền
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  
  // State cho form popup
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    gender: "Male" as "Male" | "Female",
    status: "active" as "active" | "inactive" | "banned"
  })
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [showAddPassword, setShowAddPassword] = useState(false)

  // Fetch users từ API khi component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Đang tải dữ liệu người dùng từ API...');
        
        const response = await fetch('/api/users');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error:', errorData);
          throw new Error(`Không thể tải danh sách người dùng: ${response.status} - ${errorData}`);
        }
        
        const data = await response.json();
        console.log('Nhận được dữ liệu:', data.length, 'người dùng');
        
        if (!Array.isArray(data)) {
          console.error('Dữ liệu không phải là mảng:', data);
          throw new Error('Dữ liệu không đúng định dạng');
        }
        
        // Mặc định status là active và cấp độ là 1
        const usersWithDefaults = data.map((user: User) => ({
          ...user,
          status: user.status || "active",
          level: getUserLevel(user.exp || 0),
          exp: user.exp || 0,
          totalDeposit: user.totalDeposit || 0,
          totalCoins: user.totalCoins || 0,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }));
        
        setUsers(usersWithDefaults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Hàm xử lý khi click vào nút chỉnh sửa thông tin
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      fullname: user.fullname,
      email: user.email,
      username: user.username,
      password: user.password,
      gender: user.gender,
      status: user.status || "active"
    })
    setAvatarPreview(user.avatar)
    setShowPassword(false)
    setShowEditForm(true)
  }

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

  // Hàm nén/resize ảnh
  const compressImage = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Tính toán kích thước mới giữ nguyên tỷ lệ
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
          
          // Tạo canvas để vẽ ảnh đã resize
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Chuyển đổi sang base64 với chất lượng nén
          const base64 = canvas.toDataURL(file.type, quality);
          
          // Kiểm tra kích thước dữ liệu base64
          const approximateSize = Math.round((base64.length * 0.75) / 1024); // Kích thước KB
          console.log(`Kích thước ảnh sau khi nén: ~${approximateSize} KB`);
          
          // Nếu vẫn quá lớn, nén tiếp
          if (approximateSize > 500) {
            // Nén nhiều hơn nữa với kích thước và chất lượng thấp hơn
            compressImage(file, Math.round(width * 0.8), Math.round(height * 0.8), quality * 0.9)
              .then(resolve)
              .catch(reject);
          } else {
            resolve(base64);
          }
        };
        img.onerror = (error) => {
          reject(error);
        };
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Hàm xử lý khi submit form chỉnh sửa
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return
    
    try {
      setLoading(true);
      toast.loading("Đang cập nhật thông tin người dùng...");
      
      // Kiểm tra kích thước avatar trước khi gửi
      const processedAvatar = avatarPreview;
      if (avatarPreview && avatarPreview !== editingUser.avatar) {
        const avatarSizeKB = Math.round((avatarPreview.length * 0.75) / 1024);
        console.log(`Kích thước avatar: ~${avatarSizeKB} KB`);
        
        if (avatarSizeKB > 800) {
          toast.dismiss();
          toast.error(`Avatar quá lớn (${avatarSizeKB} KB). Vui lòng chọn ảnh nhỏ hơn.`);
          setLoading(false);
          return;
        }
      }
      
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        fullname: editFormData.fullname,
        email: editFormData.email,
        username: editFormData.username,
        gender: editFormData.gender,
        status: editFormData.status,
        // Chỉ gửi password nếu đã được thay đổi
        ...(editFormData.password !== editingUser.password ? { password: editFormData.password } : {}),
        // Thêm avatar nếu có cập nhật
        ...(processedAvatar && processedAvatar !== editingUser.avatar ? { avatar: processedAvatar } : {})
      };
      
      console.log('Đang cập nhật thông tin người dùng:', editingUser._id);
      console.log('Dữ liệu gửi đi có chứa avatar:', !!updateData.avatar);
      
      // Lấy token xác thực từ localStorage
      let token;
      try {
        token = localStorage.getItem('admin_token');
        if (!token) {
          toast.dismiss();
          toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          console.error('Token không tìm thấy trong localStorage');
          throw new Error("Phiên làm việc không hợp lệ");
        }
        
        console.log('Đã tìm thấy token xác thực');
      } catch (error) {
        console.error('Lỗi khi truy cập localStorage:', error);
        toast.dismiss();
        toast.error("Không thể xác thực phiên làm việc. Vui lòng tải lại trang và đăng nhập lại.");
        throw new Error("Không thể xác thực phiên làm việc");
      }
      
      const userId = editingUser._id;
      
      // Thử gọi API trực tiếp từ backend trước
      const directUrl = `http://localhost:5000/api/users/${userId}`;
      console.log("Thử gọi API trực tiếp tới:", directUrl);
      
      try {
        // Cấu hình request
        const requestConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Log chi tiết request
        console.log("Request config:", requestConfig);
        
        // Thực hiện request trực tiếp bằng axios
        const response = await axios.put(directUrl, updateData, requestConfig);
        
        // Log kết quả từ API
        console.log("API trực tiếp - Response status:", response.status);
        console.log("API trực tiếp - Response data:", response.data);
        
        // Xử lý response thành công
        toast.dismiss();
        if (response.data && response.data.success) {
          toast.success("Cập nhật thông tin người dùng thành công");
        } else if (response.status >= 200 && response.status < 300) {
          toast.success("Cập nhật thông tin người dùng thành công");
        }
        
        // Cập nhật lại state với thông tin mới
        setUsers(prevUsers => prevUsers.map(u => 
          u._id === userId 
            ? { 
                ...u, 
                fullname: editFormData.fullname,
                email: editFormData.email,
                username: editFormData.username,
                password: editFormData.password,
                gender: editFormData.gender,
                status: editFormData.status,
                avatar: processedAvatar || u.avatar
              } 
            : u
        ));
        
        // Đóng form
        setShowEditForm(false);
        
        return; // Kết thúc xử lý nếu thành công
        
      } catch (directError: unknown) {
        console.error("Lỗi khi gọi API trực tiếp:", directError);
        
        // Thử với API Next.js proxy
        try {
          console.log("Thử gọi API qua Next.js proxy sau khi API trực tiếp thất bại");
          
          // Thiết lập timeout cho fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
          
          // Endpoint qua Next.js
          const proxyUrl = `/api/users/${userId}`;
          console.log("Gọi API qua Next.js proxy tại URL:", proxyUrl);
          
          const proxyResponse = await fetch(proxyUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Đọc response dưới dạng text trước
          const responseText = await proxyResponse.text();
          console.log(`Phản hồi từ proxy (status: ${proxyResponse.status}):`);
          console.log(`Nội dung phản hồi:`, responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''));
          
          // Parse JSON nếu có thể
          let responseData = null;
          try {
            if (responseText && responseText.trim() !== '') {
              responseData = JSON.parse(responseText);
              console.log('Dữ liệu đã parse từ proxy:', responseData);
            } else {
              console.warn('Response text từ proxy rỗng');
              responseData = { success: proxyResponse.ok };
            }
          } catch (e) {
            console.error('Không thể parse JSON từ proxy response:', e);
            throw new Error(`Lỗi xử lý phản hồi từ proxy: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
          }
          
          // Xử lý response
          if (!proxyResponse.ok) {
            console.error('Lỗi từ proxy khi cập nhật người dùng:', responseData);
            let errorMessage = 'Không thể cập nhật thông tin người dùng';
            
            if (responseData && responseData.message) {
              errorMessage = responseData.message;
            } else if (responseData && responseData.error) {
              errorMessage = responseData.error;
            } else if (responseData && responseData.details) {
              errorMessage = responseData.details;
            }
            
            throw new Error(errorMessage);
          }
          
          // Xử lý thành công
          console.log('Cập nhật thành công qua proxy:', responseData);
          toast.dismiss();
          toast.success('Cập nhật thông tin người dùng thành công (qua proxy)');
          
          // Cập nhật lại state với thông tin mới
          setUsers(prevUsers => prevUsers.map(u => 
            u._id === userId 
              ? { 
                  ...u, 
                  fullname: editFormData.fullname,
                  email: editFormData.email,
                  username: editFormData.username,
                  password: editFormData.password,
                  gender: editFormData.gender,
                  status: editFormData.status,
                  avatar: processedAvatar || u.avatar
                } 
              : u
          ));
          
          // Đóng form
          setShowEditForm(false);
          
        } catch (proxyError: unknown) {
          console.error("Lỗi khi gọi API qua proxy:", proxyError);
          // Ném lỗi ban đầu nếu cả hai phương thức đều thất bại
          throw directError;
        }
      }
      
    } catch (error: unknown) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      toast.dismiss();
      
      // Log chi tiết hơn về lỗi
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        // Lỗi từ phía server
        const axiosError = error as { 
          response: { 
            status: number; 
            data?: {
              message?: string;
              error?: string;
              details?: string;
            }; 
            headers?: Record<string, string>;
          } 
        };
        
        console.error("Lỗi response:", {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
        
        // Xử lý các loại lỗi phổ biến dựa trên status code
        if (axiosError.response.status === 401) {
          toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (axiosError.response.status === 409) {
          // Xác định xem là email hay username đã tồn tại
          const responseData = axiosError.response.data;
          let errorMessage = 'Email hoặc tên đăng nhập đã tồn tại.';
          
          if (responseData && responseData.message) {
            if (responseData.message.toLowerCase().includes('email')) {
              errorMessage = 'Email đã được sử dụng bởi tài khoản khác.';
            } else if (responseData.message.toLowerCase().includes('username')) {
              errorMessage = 'Tên đăng nhập đã được sử dụng bởi tài khoản khác.';
            }
          }
          
          toast.error(errorMessage);
        } else {
          toast.error(`Lỗi ${axiosError.response.status}: ${axiosError.response.data?.message || "Cập nhật thất bại"}`);
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        // Không nhận được response
        console.error("Không nhận được response:", (error as {request: unknown}).request);
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        // Lỗi khác
        const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật thông tin";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  // Hàm xử lý khi thay đổi giá trị trong form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Hàm xử lý khi click vào nút thêm người dùng
  const handleAddUser = () => {
    setEditingUser(null)
    setEditFormData({
      fullname: "",
      email: "",
      username: "",
      password: "",
      gender: "Male",
      status: "active"
    })
    setAvatarPreview("")
    setShowAddPassword(false)
    setShowAddForm(true)
  }

  // Hàm xử lý khi submit form thêm người dùng
  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Đặt trạng thái loading trước khi bắt đầu xử lý
    setLoading(true);
    toast.loading("Đang tạo người dùng mới...");
    
    try {
      // Kiểm tra các trường bắt buộc
      if (!editFormData.fullname || !editFormData.email || !editFormData.username || !editFormData.password) {
        toast.dismiss();
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (họ tên, email, tên đăng nhập, mật khẩu)");
        setLoading(false);
        return;
      }
      
      // Kiểm tra gender
      if (!editFormData.gender || !['Male', 'Female'].includes(editFormData.gender)) {
        toast.dismiss();
        toast.error("Giới tính phải là 'Nam' hoặc 'Nữ'");
        setLoading(false);
        return;
      }
      
      // Kiểm tra kích thước avatar trước khi gửi
      let userAvatar = avatarPreview;
      
      if (userAvatar) {
        const avatarSizeKB = Math.round((userAvatar.length * 0.75) / 1024);
        console.log(`Kích thước avatar: ~${avatarSizeKB} KB`);
        
        if (avatarSizeKB > 800) {
          toast.dismiss();
          toast.error(`Avatar quá lớn (${avatarSizeKB} KB). Vui lòng chọn ảnh nhỏ hơn.`);
          setLoading(false);
          return;
        }
      } else {
        // Tạo avatar mặc định nếu không có avatar mới
        userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.fullname)}`;
      }
      
      // Chuẩn bị dữ liệu cho người dùng mới
      const newUserData = {
        fullname: editFormData.fullname,
        email: editFormData.email,
        username: editFormData.username,
        password: editFormData.password,
        gender: editFormData.gender,
        avatar: userAvatar,
        status: editFormData.status,
        role: 'reader', // Đảm bảo role luôn là reader
        idReaderExp: null // Trường idReaderExp theo schema, sẽ được tạo bởi backend
      };
      
      console.log('Đang tạo người dùng mới...');
      console.log('Dữ liệu gửi đi:', {
        ...newUserData,
        password: "[HIDDEN]",
        avatar: userAvatar ? `[Avatar Base64: ${userAvatar.substring(0, 20)}... (${userAvatar.length} chars)]` : "[Không có]"
      });
      
      // Lấy token xác thực từ localStorage
      let token;
      try {
        token = localStorage.getItem('admin_token');
        if (!token) {
          toast.dismiss();
          toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          console.error('Token không tìm thấy trong localStorage');
          throw new Error("Phiên làm việc không hợp lệ");
        }
        
        console.log('Đã tìm thấy token xác thực');
      } catch (error) {
        console.error('Lỗi khi truy cập localStorage:', error);
        toast.dismiss();
        toast.error("Không thể xác thực phiên làm việc. Vui lòng tải lại trang và đăng nhập lại.");
        throw new Error("Không thể xác thực phiên làm việc");
      }
      
      // Thử gọi API trực tiếp từ backend trước
      const directUrl = `http://localhost:5000/api/users`;
      console.log("Thử gọi API trực tiếp tới:", directUrl);
      
      try {
        // Cấu hình request
        const requestConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Log chi tiết request
        console.log("Request config:", requestConfig);
        
        // Thực hiện request trực tiếp bằng axios
        const response = await axios.post(directUrl, newUserData, requestConfig);
        
        // Log kết quả từ API
        console.log("API trực tiếp - Response status:", response.status);
        console.log("API trực tiếp - Response data:", response.data);
        
        // Xử lý response thành công
        toast.dismiss();
        toast.success("Tạo người dùng mới thành công");
        
        // Cập nhật lại danh sách người dùng với người dùng mới
        const newUser: User = {
          _id: response.data.data?._id || response.data._id || String(Date.now()),
          fullname: editFormData.fullname,
          username: editFormData.username,
          password: editFormData.password,
          email: editFormData.email,
          gender: editFormData.gender,
          role: "reader",
          avatar: userAvatar,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: editFormData.status as "active" | "inactive" | "banned"
        };
        
        setUsers(prevUsers => [newUser, ...prevUsers]);
        
        // Reset form và đóng dialog
        setEditFormData({
          fullname: "",
          email: "",
          username: "",
          password: "",
          gender: "Male",
          status: "active"
        });
        setAvatarPreview("");
        setShowAddForm(false);
        
        return; // Kết thúc xử lý nếu thành công
        
      } catch (directError: unknown) {
        console.error("Lỗi khi gọi API trực tiếp:", directError);
        
        // Thử với API Next.js proxy
        try {
          console.log("Thử gọi API qua Next.js proxy sau khi API trực tiếp thất bại");
          
          // Thiết lập timeout cho fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
          
          // Endpoint qua Next.js
          const proxyUrl = `/api/users`;
          console.log("Gọi API qua Next.js proxy tại URL:", proxyUrl);
          
          const proxyResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newUserData),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Đọc response dưới dạng text trước
          const responseText = await proxyResponse.text();
          console.log(`Phản hồi từ proxy (status: ${proxyResponse.status}):`);
          console.log(`Nội dung phản hồi:`, responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''));
          
          // Parse JSON nếu có thể
          let responseData = null;
          try {
            if (responseText && responseText.trim() !== '') {
              responseData = JSON.parse(responseText);
              console.log('Dữ liệu đã parse từ proxy:', responseData);
            } else {
              console.warn('Response text từ proxy rỗng');
              responseData = { success: proxyResponse.ok };
            }
          } catch (e) {
            console.error('Không thể parse JSON từ proxy response:', e);
            throw new Error(`Lỗi xử lý phản hồi từ proxy: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
          }
          
          // Xử lý response
          if (!proxyResponse.ok) {
            console.error('Lỗi từ proxy khi tạo người dùng mới:', responseData);
            let errorMessage = 'Không thể tạo người dùng mới';
            
            if (responseData && responseData.message) {
              errorMessage = responseData.message;
            } else if (responseData && responseData.error) {
              errorMessage = responseData.error;
            } else if (responseData && responseData.details) {
              errorMessage = responseData.details;
            }
            
            throw new Error(errorMessage);
          }
          
          // Xử lý thành công
          console.log('Tạo người dùng thành công qua proxy:', responseData);
          toast.dismiss();
          toast.success('Tạo người dùng mới thành công (qua proxy)');
          
          // Cập nhật lại danh sách người dùng với người dùng mới
          const newUser: User = {
            _id: responseData.data?._id || responseData._id || String(Date.now()),
            fullname: editFormData.fullname,
            username: editFormData.username,
            password: editFormData.password,
            email: editFormData.email,
            gender: editFormData.gender,
            role: "reader",
            avatar: userAvatar,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: editFormData.status as "active" | "inactive" | "banned"
          };
          
          setUsers(prevUsers => [newUser, ...prevUsers]);
          
          // Reset form và đóng dialog
          setEditFormData({
            fullname: "",
            email: "",
            username: "",
            password: "",
            gender: "Male",
            status: "active"
          });
          setAvatarPreview("");
          setShowAddForm(false);
          
        } catch (proxyError: unknown) {
          console.error("Lỗi khi gọi API qua proxy:", proxyError);
          // Ném lỗi ban đầu nếu cả hai phương thức đều thất bại
          throw directError;
        }
      }
      
    } catch (error: unknown) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      toast.dismiss();
      
      // Log chi tiết hơn về lỗi
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        // Lỗi từ phía server
        const axiosError = error as { 
          response: { 
            status: number; 
            data?: {
              message?: string;
              error?: string;
              details?: string;
            }; 
            headers?: Record<string, string>;
          } 
        };
        
        console.error("Lỗi response:", {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
        
        // Xử lý các loại lỗi phổ biến dựa trên status code
        if (axiosError.response.status === 401) {
          toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (axiosError.response.status === 409) {
          // Xác định xem là email hay username đã tồn tại
          const responseData = axiosError.response.data;
          let errorMessage = 'Email hoặc tên đăng nhập đã tồn tại.';
          
          if (responseData && responseData.message) {
            if (responseData.message.toLowerCase().includes('email')) {
              errorMessage = 'Email đã được sử dụng bởi tài khoản khác.';
            } else if (responseData.message.toLowerCase().includes('username')) {
              errorMessage = 'Tên đăng nhập đã được sử dụng bởi tài khoản khác.';
            }
          }
          
          toast.error(errorMessage);
        } else if (axiosError.response.status === 413) {
          toast.error('Kích thước dữ liệu quá lớn. Vui lòng giảm kích thước ảnh avatar.');
        } else {
          toast.error(`Lỗi ${axiosError.response.status}: ${axiosError.response.data?.message || "Tạo người dùng thất bại"}`);
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        // Không nhận được response
        console.error("Không nhận được response:", (error as {request: unknown}).request);
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        // Lỗi khác
        const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi tạo người dùng mới";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  // Lọc người dùng theo các điều kiện
  const filteredUsers = users.filter((user) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = 
      user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    // Lọc theo giới tính
    const matchesGender = genderFilter === "all" || user.gender === genderFilter;
    
    // Lọc theo khoảng thời gian
    const matchesDateRange = !dateRange || !dateRange.from || !dateRange.to || 
      (user.createdAt >= dateRange.from && 
       user.createdAt <= new Date(dateRange.to.getTime() + 86400000));
    
    return matchesSearch && matchesStatus && matchesGender && matchesDateRange;
  });

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  // Lấy người dùng cho trang hiện tại
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tính tổng số tiền nạp
  const totalDeposits = filteredUsers.reduce((sum, user) => sum + (user.totalDeposit || 0), 0);
  
  // Tính tổng số xu
  const totalCoins = filteredUsers.reduce((sum, user) => sum + (user.totalCoins || 0), 0);

  // Hàm xuất dữ liệu ra file CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Tên",
      "Email",
      "Cấp độ",
      "Tổng nạp",
      "Số xu",
      "Trạng thái",
      "Ngày tạo"
    ].join(",");

    const csvData = filteredUsers.map(user => [
      user._id,
      user.fullname,
      user.email,
      user.level?.name,
      user.totalDeposit,
      user.totalCoins,
      user.status,
      format(user.createdAt, "dd/MM/yyyy")
    ].join(",")).join("\n");

    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Đang tải dữ liệu người dùng...</p>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl">Lỗi: {error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Hiển thị dashboard
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Form popup chỉnh sửa thông tin */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chỉnh sửa thông tin người dùng</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEditForm(false)}
                className="h-8 w-8 p-0"
              >
                &times;
              </Button>
            </div>
            
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden mb-2 bg-gray-100">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar xem trước" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-2xl font-medium">
                      {editFormData.fullname.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="edit-avatar" 
                    className="cursor-pointer px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1"
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-id">ID</Label>
                  <Input id="edit-id" value={editingUser._id} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullname">Họ tên</Label>
                  <Input 
                    id="edit-fullname" 
                    name="fullname" 
                    value={editFormData.fullname} 
                    onChange={handleEditFormChange} 
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
                  onChange={handleEditFormChange} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Tài khoản</Label>
                  <Input 
                    id="edit-username" 
                    name="username" 
                    value={editFormData.username} 
                    onChange={handleEditFormChange} 
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
                      onChange={handleEditFormChange} 
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
              
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="banned">Bị cấm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form popup thêm người dùng */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Thêm người dùng mới</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddForm(false)}
                className="h-8 w-8 p-0"
              >
                &times;
              </Button>
            </div>
            
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden mb-2 bg-gray-100">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar xem trước" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-2xl font-medium">
                      {editFormData.fullname ? editFormData.fullname.charAt(0) : "?"}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="add-avatar" 
                    className="cursor-pointer px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Tải lên avatar</span>
                  </Label>
                  <Input 
                    id="add-avatar" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-fullname">Họ tên</Label>
                <Input 
                  id="add-fullname" 
                  name="fullname" 
                  value={editFormData.fullname} 
                  onChange={handleEditFormChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input 
                  id="add-email" 
                  name="email" 
                  type="email" 
                  value={editFormData.email} 
                  onChange={handleEditFormChange} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-username">Tài khoản</Label>
                  <Input 
                    id="add-username" 
                    name="username" 
                    value={editFormData.username} 
                    onChange={handleEditFormChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password">Mật khẩu</Label>
                  <div className="relative">
                    <Input 
                      id="add-password" 
                      name="password" 
                      type={showAddPassword ? "text" : "password"} 
                      value={editFormData.password} 
                      onChange={handleEditFormChange} 
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                    >
                      {showAddPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showAddPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-gender">Giới tính</Label>
                  <Select 
                    name="gender" 
                    value={editFormData.gender} 
                    onValueChange={(value) => setEditFormData(prev => ({
                      ...prev, 
                      gender: value as "Male" | "Female"
                    }))}
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
                  <Label htmlFor="add-status">Trạng thái</Label>
                  <Select 
                    name="status" 
                    value={editFormData.status} 
                    onValueChange={(value) => setEditFormData(prev => ({
                      ...prev, 
                      status: value as "active" | "inactive" | "banned"
                    }))}
                  >
                    <SelectTrigger id="add-status">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                      <SelectItem value="banned">Bị cấm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  Thêm người dùng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý độc giả</h2>
        <div className="flex gap-2">
          <Button 
            onClick={exportToCSV}
            variant="outline"
            size="icon"
            className="h-9 w-9"
          >
            <span className="sr-only">Xuất dữ liệu</span>
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleAddUser}
            variant="default"
            size="icon"
            className="h-9 w-9"
          >
            <span className="sr-only">Thêm người dùng</span>
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng tiền nạp
            </CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalDeposits)}</div>
            <p className="text-xs text-muted-foreground">
              Từ {filteredUsers.length} người dùng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng xu hiện có
            </CardTitle>
            <Coins className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCoins} xu</div>
            <p className="text-xs text-muted-foreground">
              Tỷ giá: 1 xu = 1,000 VND
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="banned">Bị cấm</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={genderFilter}
            onValueChange={setGenderFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
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
        <div className="min-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Thông tin người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tài khoản</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user._id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.fullname} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                                    {user.fullname.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Tên: {user.fullname}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span>{user.fullname}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{getGenderBadge(user.gender)}</TableCell>
                    <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{format(user.createdAt, "dd/MM/yyyy")}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{format(user.createdAt, "dd/MM/yyyy HH:mm:ss")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditUser(user)}
                      >
                        <span className="sr-only">Chỉnh sửa</span>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <User className="h-10 w-10 mb-2" />
                      <p>Không tìm thấy người dùng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border-t">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
} 