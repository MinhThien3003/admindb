"use client"

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
import { Search, Pencil, DollarSign, Eye, Download, Eye as EyeIcon, EyeOff, Trash, Plus } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthorRequests, AuthorRequest } from "@/components/dashboard/author-requests"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import axios from "axios"

interface Author {
  _id: string;          // ID từ MongoDB
  username: string;     // Tên đăng nhập
  email: string;        // Email
  fullname?: string;    // Tên đầy đủ
  password: string;     // Mật khẩu (đã mã hóa)
  gender: 'Male' | 'Female'; // Giới tính
  role: 'reader' | 'author'; // Vai trò
  avatar: string;       // URL ảnh đại diện
  createdAt: Date;      // Ngày tạo
  updatedAt: Date;      // Ngày cập nhật
  status?: 'active' | 'inactive' | 'banned'; // Trạng thái tài khoản
  
  // Các trường bổ sung cho UI (có thể không có trong API)
  level?: number;
  experiencePoints?: number;
  bio?: string;
  totalViews?: number;
  totalTransactions?: number;
  totalEarnings?: number;
}

// Dữ liệu mẫu về tác giả
const initialAuthors: Author[] = [
  {
    _id: "1",
    username: "nguyenvana",
    email: "nguyenvana@example.com",
    fullname: "Nguyễn Văn A",
    password: "hashedpassword",
    gender: "Male",
    role: "author",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-06-20"),
    status: "active",
    level: 30,
    experiencePoints: 15000,
    bio: "Tác giả chuyên viết truyện ngắn và tiểu thuyết lịch sử",
    totalViews: 25000,
    totalTransactions: 120,
    totalEarnings: 5000000
  },
  {
    _id: "2",
    username: "tranthib",
    email: "tranthib@example.com",
    fullname: "Trần Thị B",
    password: "hashedpassword",
    gender: "Female",
    role: "author",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-07-15"),
    status: "active",
    level: 40,
    experiencePoints: 32000,
    bio: "Tác giả chuyên viết truyện ngộ ngại và lãng mạn",
    totalViews: 45000,
    totalTransactions: 200,
    totalEarnings: 8500000
  },
  {
    _id: "3",
    username: "levanc",
    email: "levanc@example.com",
    fullname: "Lê Văn C",
    password: "hashedpassword",
    gender: "Male",
    role: "author",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-08-10"),
    status: "inactive",
    level: 20,
    experiencePoints: 8000,
    bio: "Tác giả chuyên viết truyện kinh dị và giả tưởng",
    totalViews: 12000,
    totalTransactions: 50,
    totalEarnings: 2000000
  }
];

// Dữ liệu mẫu về yêu cầu trở thành tác giả
const initialAuthorRequests: AuthorRequest[] = [];

// Hàm hiển thị màu cho trạng thái
const getStatusBadge = (status: string) => {
  const statusClasses: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    banned: "bg-red-100 text-red-800 border-red-200"
  };

  const statusLabels: Record<string, string> = {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    banned: "Bị cấm"
  };

  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {statusLabels[status]}
    </Badge>
  );
};

// Hàm hiển thị giới tính
const getGenderBadge = (gender: string) => {
  const genderClasses: Record<string, string> = {
    Male: "bg-blue-100 text-blue-800 border-blue-200",
    Female: "bg-pink-100 text-pink-800 border-pink-200"
  };

  const genderLabels: Record<string, string> = {
    Male: "Nam",
    Female: "Nữ"
  };

  return (
    <Badge variant="outline" className={genderClasses[gender]}>
      {genderLabels[gender]}
    </Badge>
  );
};

// Hàm định dạng số lượng view
const formatViews = (views: number = 0): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  } else {
    return views.toString();
  }
};

// Hàm định dạng số tiền
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function AuthorsPage() {
  //const router = useRouter()
  const [authors, setAuthors] = useState<Author[]>(initialAuthors)
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const ITEMS_PER_PAGE = 10
  
  // State cho form chỉnh sửa
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  // State cho form thêm tác giả mới
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    gender: "Male" as "Male" | "Female",
    status: "active" as "active" | "inactive" | "banned",
    bio: ""
  })
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Áp dụng các bộ lọc cho danh sách tác giả
  useEffect(() => {
    // Lọc tác giả theo các điều kiện
    const filtered = authors.filter(author => {
      // Lọc theo từ khóa tìm kiếm
      const matchesSearch = 
        author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (author.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      // Đã xóa phần lọc theo cấp độ
      const matchesLevel = true; // Luôn trả về true vì đã xóa filter cấp độ
      
      // Lọc theo trạng thái
      const matchesStatus = statusFilter === "all" || author.status === statusFilter;
      
      // Lọc theo giới tính
      const matchesGender = genderFilter === "all" || author.gender === genderFilter;
      
      // Lọc theo khoảng thời gian
      const matchesDateRange = !dateRange || !dateRange.from || !dateRange.to || 
        (author.createdAt >= dateRange.from && 
         author.createdAt <= new Date(dateRange.to.getTime() + 86400000));
      
      return matchesSearch && matchesLevel && matchesStatus && matchesGender && matchesDateRange;
    });
    
    setFilteredAuthors(filtered);
  }, [authors, searchQuery, statusFilter, genderFilter, dateRange]);

  // Tính toán số trang
  const totalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE);
  
  // Lấy tác giả cho trang hiện tại
  const paginatedAuthors = filteredAuthors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tính tổng doanh thu của các tác giả
  const totalEarnings = filteredAuthors.reduce((sum, author) => sum + (author.totalEarnings || 0), 0);
  
  // Tổng lượt xem của tất cả tác giả
  const totalViews = filteredAuthors.reduce((sum, author) => sum + (author.totalViews || 0), 0);

  // Tải danh sách tác giả từ API
  const fetchAuthors = async () => {
    try {
      setIsLoading(true);
      console.log('Đang tải dữ liệu tác giả từ API...');

      const response = await fetch('/api/authors');
      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Không thể tải danh sách tác giả: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Nhận được dữ liệu:', data.length, 'tác giả');

      if (!Array.isArray(data)) {
        console.error('Dữ liệu không phải là mảng:', data);
        throw new Error('Dữ liệu không đúng định dạng');
      }

      // Chuyển đổi dữ liệu API để phù hợp với cấu trúc UI hiện tại
      const formattedAuthors = data.map((author: Partial<Author>) => ({
        ...author,
        // Đảm bảo dữ liệu có giá trị mặc định khi cần thiết
        level: author.level || 1,
        experiencePoints: author.experiencePoints || 0,
        bio: author.bio || "Chưa cập nhật",
        totalViews: author.totalViews || 0,
        totalTransactions: author.totalTransactions || 0,
        totalEarnings: author.totalEarnings || 0,
        status: author.status || "active",
        createdAt: new Date(author.createdAt || new Date()),
        updatedAt: new Date(author.updatedAt || new Date())
      }));

      setAuthors(formattedAuthors as Author[]);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu tác giả:', error);
      toast.error('Không thể tải dữ liệu tác giả');
    } finally {
      setIsLoading(false);
    }
  };

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchAuthors();
  }, []);

  const [authorRequests, setAuthorRequests] = useState<AuthorRequest[]>(initialAuthorRequests);
  
  // Đếm số lượng yêu cầu đang chờ phê duyệt
  const pendingCount = authorRequests.filter(req => req.status === "pending").length;

  // Xử lý yêu cầu tác giả
  const handleApproveRequest = (requestId: number) => {
    setAuthorRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: "approved", 
              reviewedBy: "Admin", 
              reviewedAt: new Date() 
            } 
          : req
      )
    );

    // Chuyển yêu cầu thành tác giả mới
    const request = authorRequests.find(req => req.id === requestId);
    if (request) {
      const newAuthor: Author = {
        _id: String(Date.now()),
        username: request.username,
        email: request.email,
        password: "defaultPassword", // Cần một cơ chế tạo mật khẩu an toàn hơn
        gender: "Male", // Giá trị mặc định, có thể cập nhật sau
        role: "author",
        level: 1,
        experiencePoints: 0,
        bio: request.bio,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: request.avatar,
        totalViews: 0,
        totalTransactions: 0,
        totalEarnings: 0
      };
      
      setAuthors(prevAuthors => [...prevAuthors, newAuthor]);
      toast.success(`Đã duyệt yêu cầu của ${request.username}`);
    }
  };

  const handleRejectRequest = (requestId: number, reason: string) => {
    setAuthorRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: "rejected", 
              reviewedBy: "Admin", 
              reviewedAt: new Date(),
              rejectionReason: reason 
            } 
          : req
      )
    );
    
    const request = authorRequests.find(req => req.id === requestId);
    if (request) {
      toast.success(`Đã từ chối yêu cầu của ${request.username}`);
    }
  };

  // Xuất dữ liệu ra file CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Tên người dùng",
      "Email",
      "Lượt xem",
      "Doanh thu",
      "Trạng thái",
      "Ngày tạo"
    ].join(",");

    const csvData = filteredAuthors.map(author => [
      author._id,
      author.username,
      author.email,
      author.totalViews || 0,
      author.totalEarnings || 0,
      author.status || "active",
      format(author.createdAt, "dd/MM/yyyy")
    ].join(",")).join("\n");

    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `authors_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hàm xử lý khi click vào nút chỉnh sửa thông tin
  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author)
    setEditFormData({
      fullname: author.fullname || "",
      email: author.email,
      username: author.username,
      password: author.password,
      gender: author.gender,
      status: author.status || "active",
      bio: author.bio || ""
    })
    setAvatarPreview(author.avatar)
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
          
          // Chuyển đổi canvas thành base64
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  }

  // Hàm xử lý khi submit form chỉnh sửa
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAuthor) return;
    
    try {
      setIsLoading(true);
      toast.loading("Đang cập nhật thông tin tác giả...");
      
      // Kiểm tra kích thước avatar trước khi gửi
      const processedAvatar = avatarPreview;
      if (avatarPreview && avatarPreview !== editingAuthor.avatar) {
        const avatarSizeKB = Math.round((avatarPreview.length * 0.75) / 1024);
        console.log(`Kích thước avatar: ~${avatarSizeKB} KB`);
        
        if (avatarSizeKB > 800) {
          toast.dismiss();
          toast.error(`Avatar quá lớn (${avatarSizeKB} KB). Vui lòng chọn ảnh nhỏ hơn.`);
          setIsLoading(false);
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
        bio: editFormData.bio,
        role: 'author', // Đảm bảo vai trò vẫn là tác giả
        // Chỉ gửi password nếu đã được thay đổi
        ...(editFormData.password !== editingAuthor.password ? { password: editFormData.password } : {}),
        // Thêm avatar nếu có cập nhật
        ...(processedAvatar && processedAvatar !== editingAuthor.avatar ? { avatar: processedAvatar } : {})
      };
      
      console.log('Đang cập nhật thông tin tác giả:', editingAuthor._id);
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
      
      const authorId = editingAuthor._id;
      
      // Thử gọi API trực tiếp từ backend trước
      const directUrl = `http://localhost:5000/api/users/${authorId}`;
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
          toast.success("Cập nhật thông tin tác giả thành công");
        } else if (response.status >= 200 && response.status < 300) {
          toast.success("Cập nhật thông tin tác giả thành công");
        }
        
        // Cập nhật lại state với thông tin mới
        setAuthors(prevAuthors => prevAuthors.map(a => 
          a._id === authorId 
            ? { 
                ...a, 
                fullname: editFormData.fullname,
                email: editFormData.email,
                username: editFormData.username,
                password: editFormData.password,
                gender: editFormData.gender,
                status: editFormData.status,
                bio: editFormData.bio,
                avatar: processedAvatar || a.avatar
              } 
            : a
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
          const proxyUrl = `/api/users/${authorId}`;
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
            console.error('Lỗi từ proxy khi cập nhật tác giả:', responseData);
            let errorMessage = 'Không thể cập nhật thông tin tác giả';
            
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
          toast.success('Cập nhật thông tin tác giả thành công (qua proxy)');
          
          // Cập nhật lại state với thông tin mới
          setAuthors(prevAuthors => prevAuthors.map(a => 
            a._id === authorId 
              ? { 
                  ...a, 
                  fullname: editFormData.fullname,
                  email: editFormData.email,
                  username: editFormData.username,
                  password: editFormData.password,
                  gender: editFormData.gender,
                  status: editFormData.status,
                  bio: editFormData.bio,
                  avatar: processedAvatar || a.avatar
                } 
              : a
          ));
          
          // Đóng form
          setShowEditForm(false);
          
        } catch (proxyError) {
          console.error('Lỗi khi gọi API qua proxy:', proxyError);
          throw proxyError;
        }
      }
      
    } catch (error) {
      console.error('Lỗi khi cập nhật tác giả:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật thông tin tác giả');
    } finally {
      setIsLoading(false);
    }
  }

  // Hàm xử lý khi thay đổi form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // Thêm hàm xử lý xóa role author
  const handleRemoveAuthorRole = async (author: Author) => {
    try {
      setIsLoading(true);
      toast.loading(`Đang xóa quyền tác giả của ${author.fullname || author.username}...`);
      
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
      } catch (error) {
        console.error('Lỗi khi truy cập localStorage:', error);
        toast.dismiss();
        toast.error("Không thể xác thực phiên làm việc. Vui lòng tải lại trang và đăng nhập lại.");
        throw new Error("Không thể xác thực phiên làm việc");
      }
      
      // Dữ liệu cập nhật - thay đổi role thành 'reader'
      const updateData = {
        role: 'reader'
      };
      
      // Gọi API để cập nhật thông tin
      try {
        // Cấu hình request
        const requestConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Thực hiện request trực tiếp
        const response = await axios.put(
          `http://localhost:5000/api/users/${author._id}`, 
          updateData, 
          requestConfig
        );
        
        if (response.status >= 200 && response.status < 300) {
          // Cập nhật danh sách authors - loại bỏ tác giả đã bị xóa role
          setAuthors(prev => prev.filter(a => a._id !== author._id));
          
          toast.dismiss();
          toast.success(`Đã xóa quyền tác giả của ${author.fullname || author.username}`);
        }
      } catch (error) {
        console.error('Lỗi khi xóa quyền tác giả:', error);
        
        // Thử với proxy
        try {
          const proxyResponse = await fetch(`/api/users/${author._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });
          
          if (proxyResponse.ok) {
            // Cập nhật danh sách authors - loại bỏ tác giả đã bị xóa role
            setAuthors(prev => prev.filter(a => a._id !== author._id));
            
            toast.dismiss();
            toast.success(`Đã xóa quyền tác giả của ${author.fullname || author.username}`);
          } else {
            const errorText = await proxyResponse.text();
            throw new Error(`Không thể xóa quyền tác giả: ${proxyResponse.status} - ${errorText}`);
          }
        } catch (proxyError) {
          console.error('Lỗi khi xóa quyền tác giả qua proxy:', proxyError);
          throw proxyError;
        }
      }
    } catch (error) {
      console.error('Lỗi khi xóa quyền tác giả:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Không thể xóa quyền tác giả');
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm mở form thêm tác giả mới
  const handleAddAuthor = () => {
    setEditingAuthor(null)
    setEditFormData({
      fullname: "",
      email: "",
      username: "",
      password: "",
      gender: "Male",
      status: "active",
      bio: ""
    })
    setAvatarPreview("")
    setShowAddPassword(false)
    setShowAddForm(true)
  }

  // Hàm xử lý khi submit form thêm tác giả
  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Đặt trạng thái loading trước khi bắt đầu xử lý
    setIsLoading(true);
    toast.loading("Đang tạo tác giả mới...");
    
    try {
      // Kiểm tra các trường bắt buộc
      if (!editFormData.fullname || !editFormData.email || !editFormData.username || !editFormData.password) {
        toast.dismiss();
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (họ tên, email, tên đăng nhập, mật khẩu)");
        setIsLoading(false);
        return;
      }
      
      // Kiểm tra gender
      if (!editFormData.gender || !['Male', 'Female'].includes(editFormData.gender)) {
        toast.dismiss();
        toast.error("Giới tính phải là 'Nam' hoặc 'Nữ'");
        setIsLoading(false);
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
          setIsLoading(false);
          return;
        }
      } else {
        // Tạo avatar mặc định nếu không có avatar mới
        userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.fullname)}`;
      }
      
      // Chuẩn bị dữ liệu cho tác giả mới
      const newAuthorData = {
        fullname: editFormData.fullname,
        email: editFormData.email,
        username: editFormData.username,
        password: editFormData.password,
        gender: editFormData.gender,
        avatar: userAvatar,
        status: editFormData.status,
        bio: editFormData.bio,
        role: 'author', // Đảm bảo role luôn là author
      };
      
      console.log('Đang tạo tác giả mới...');
      console.log('Dữ liệu gửi đi:', {
        ...newAuthorData,
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
        const response = await axios.post(directUrl, newAuthorData, requestConfig);
        
        // Log kết quả từ API
        console.log("API trực tiếp - Response status:", response.status);
        console.log("API trực tiếp - Response data:", response.data);
        
        // Xử lý response thành công
        toast.dismiss();
        toast.success("Tạo tác giả mới thành công");
        
        // Cập nhật lại danh sách tác giả với tác giả mới
        const newAuthor: Author = {
          _id: response.data.data?._id || response.data._id || String(Date.now()),
          fullname: editFormData.fullname,
          username: editFormData.username,
          password: editFormData.password,
          email: editFormData.email,
          gender: editFormData.gender,
          role: "author",
          avatar: userAvatar,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: editFormData.status as "active" | "inactive" | "banned",
          bio: editFormData.bio,
          totalViews: 0,
          totalTransactions: 0,
          totalEarnings: 0
        };
        
        setAuthors(prevAuthors => [newAuthor, ...prevAuthors]);
        
        // Reset form và đóng dialog
        setEditFormData({
          fullname: "",
          email: "",
          username: "",
          password: "",
          gender: "Male",
          status: "active",
          bio: ""
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
            body: JSON.stringify(newAuthorData),
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
          
          // Xử lý phản hồi từ proxy
          if (!proxyResponse.ok) {
            console.error('Lỗi từ proxy khi tạo tác giả:', responseData);
            let errorMessage = 'Không thể tạo tác giả mới';
            
            if (responseData && responseData.message) {
              errorMessage = responseData.message;
            } else if (responseData && responseData.error) {
              errorMessage = responseData.error;
            }
            
            throw new Error(errorMessage);
          }
          
          // Xử lý thành công
          console.log('Tạo tác giả mới thành công qua proxy:', responseData);
          toast.dismiss();
          toast.success("Tạo tác giả mới thành công (qua proxy)");
          
          // Lấy ID từ response nếu có
          const newAuthorId = responseData.data?._id || responseData._id || String(Date.now());
          
          // Cập nhật lại danh sách tác giả
          const newAuthor: Author = {
            _id: newAuthorId,
            fullname: editFormData.fullname,
            username: editFormData.username,
            password: editFormData.password,
            email: editFormData.email,
            gender: editFormData.gender,
            role: "author",
            avatar: userAvatar,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: editFormData.status as "active" | "inactive" | "banned",
            bio: editFormData.bio,
            totalViews: 0,
            totalTransactions: 0,
            totalEarnings: 0
          };
          
          setAuthors(prevAuthors => [newAuthor, ...prevAuthors]);
          
          // Reset form và đóng dialog
          setEditFormData({
            fullname: "",
            email: "",
            username: "",
            password: "",
            gender: "Male",
            status: "active",
            bio: ""
          });
          setAvatarPreview("");
          setShowAddForm(false);
          
        } catch (proxyError) {
          console.error('Lỗi khi gọi API qua proxy:', proxyError);
          throw proxyError;
        }
      }
      
    } catch (error) {
      console.error('Lỗi khi tạo tác giả mới:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Không thể tạo tác giả mới');
    } finally {
      setIsLoading(false);
    }
  }

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Đang tải dữ liệu tác giả...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý tác giả</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
          <Button className="h-9" onClick={handleAddAuthor}>
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
              Từ {filteredAuthors.length} tác giả
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

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Danh sách tác giả</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Yêu cầu trở thành tác giả
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
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
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Thông tin</TableHead>
                    <TableHead>Lượt xem</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                          <p className="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedAuthors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <p className="text-gray-500">Không có tác giả nào phù hợp với tìm kiếm</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAuthors.map(author => {
                      return (
                        <TableRow key={author._id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img 
                                src={author.avatar || "https://via.placeholder.com/40"} 
                                alt={author.username}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                              />
                              <div>
                                <p className="font-medium">{author.fullname || author.username}</p>
                                <p className="text-sm text-gray-500">{author.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                {getStatusBadge(author.status || "active")}
                                {getGenderBadge(author.gender)}
                              </div>
                              <p className="text-sm text-gray-500 truncate max-w-[200px] mt-1">
                                {author.bio || "Chưa cập nhật tiểu sử"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4 text-blue-500" />
                              <span>{formatViews(author.totalViews)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span>{formatCurrency(author.totalEarnings || 0)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(author.createdAt, "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAuthor(author);
                                    }}
                                    className="mr-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Bạn có chắc chắn muốn xóa quyền tác giả của ${author.fullname || author.username}?`)) {
                                        handleRemoveAuthorRole(author);
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xóa quyền tác giả</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
        </TabsContent>

        <TabsContent value="requests">
          <div className="bg-white rounded-md shadow">
            <AuthorRequests 
              requests={authorRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog form chỉnh sửa tác giả */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin tác giả</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết của tác giả. Nhấn Lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditFormSubmit} className="space-y-6 py-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border border-gray-200">
                <img 
                  src={avatarPreview || "https://via.placeholder.com/150"} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              </div>
              <Label htmlFor="avatar" className="mt-2 cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                Thay đổi ảnh đại diện
              </Label>
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditFormChange}
                  placeholder="Tên đăng nhập"
                  readOnly // Username không được thay đổi
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  placeholder="Email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullname">Họ và tên</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  value={editFormData.fullname}
                  onChange={handleEditFormChange}
                  placeholder="Họ và tên"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select name="gender" value={editFormData.gender} onValueChange={(value) => setEditFormData(prev => ({ ...prev, gender: value as "Male" | "Female" }))}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Nam</SelectItem>
                    <SelectItem value="Female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select name="status" value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as "active" | "inactive" | "banned" }))}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="banned">Bị cấm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={editFormData.password}
                  onChange={handleEditFormChange}
                  placeholder="Mật khẩu"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Tiểu sử</Label>
              <textarea
                id="bio"
                name="bio"
                value={editFormData.bio}
                onChange={handleEditFormChange}
                placeholder="Tiểu sử tác giả"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                Hủy
              </Button>
              <Button type="submit">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog form thêm tác giả mới */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm tác giả mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết của tác giả mới. Nhấn Tạo tác giả khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddFormSubmit} className="space-y-6 py-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border border-gray-200">
                <img 
                  src={avatarPreview || "https://via.placeholder.com/150"} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              </div>
              <Label htmlFor="add-avatar" className="mt-2 cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                Chọn ảnh đại diện
              </Label>
              <Input 
                id="add-avatar" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-username">Tên đăng nhập *</Label>
                <Input
                  id="add-username"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditFormChange}
                  placeholder="Tên đăng nhập"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  placeholder="Email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-fullname">Họ và tên *</Label>
                <Input
                  id="add-fullname"
                  name="fullname"
                  value={editFormData.fullname}
                  onChange={handleEditFormChange}
                  placeholder="Họ và tên"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-gender">Giới tính</Label>
                <Select name="gender" value={editFormData.gender} onValueChange={(value) => setEditFormData(prev => ({ ...prev, gender: value as "Male" | "Female" }))}>
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
                <Select name="status" value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as "active" | "inactive" | "banned" }))}>
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-password">Mật khẩu *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                  >
                    {showAddPassword ? <EyeOff className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <Input
                  id="add-password"
                  name="password"
                  type={showAddPassword ? "text" : "password"}
                  value={editFormData.password}
                  onChange={handleEditFormChange}
                  placeholder="Mật khẩu"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-bio">Tiểu sử</Label>
              <textarea
                id="add-bio"
                name="bio"
                value={editFormData.bio}
                onChange={handleEditFormChange}
                placeholder="Tiểu sử tác giả"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Hủy
              </Button>
              <Button type="submit">
                Tạo tác giả
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}