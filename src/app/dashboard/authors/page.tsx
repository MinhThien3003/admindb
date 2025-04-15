"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Search, Pencil, DollarSign, Eye, Trophy, Star, Award, Shield, Zap, Download } from "lucide-react"
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

// Dữ liệu mẫu về cấp độ từ trang levels
const authorLevels = [
  {
    level: 50,
    title: "Đại Cao Thủ",
    color: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
    icon: <Trophy className="h-5 w-5 text-yellow-400" />,
    minExp: 50000,
    maxExp: 100000,
    benefits: [
      "Được đăng tối đa 50 truyện",
      "Hoa hồng 70% doanh thu",
      "Ưu tiên hiển thị truyện",
      "Hỗ trợ marketing",
      "Công cụ viết truyện nâng cao"
    ]
  },
  {
    level: 40,
    title: "Cao Thủ",
    color: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white", 
    icon: <Star className="h-5 w-5 text-yellow-400" />,
    minExp: 30000,
    maxExp: 49999,
    benefits: [
      "Được đăng tối đa 30 truyện",
      "Hoa hồng 60% doanh thu",
      "Ưu tiên xét duyệt",
      "Hỗ trợ biên tập"
    ]
  },
  {
    level: 30,
    title: "Tinh Anh",
    color: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    icon: <Award className="h-5 w-5 text-yellow-400" />,
    minExp: 15000,
    maxExp: 29999,
    benefits: [
      "Được đăng tối đa 20 truyện",
      "Hoa hồng 50% doanh thu",
      "Công cụ viết truyện cơ bản"
    ]
  },
  {
    level: 20,
    title: "Kim Cương",
    color: "bg-gradient-to-r from-sky-600 to-blue-600 text-white",
    icon: <Shield className="h-5 w-5 text-blue-200" />,
    minExp: 5000,
    maxExp: 14999,
    benefits: [
      "Được đăng tối đa 10 truyện",
      "Hoa hồng 40% doanh thu"
    ]
  },
  {
    level: 10,
    title: "Bạch Kim",
    color: "bg-gradient-to-r from-gray-600 to-slate-600 text-white",
    icon: <Shield className="h-5 w-5 text-gray-200" />,
    minExp: 1000,
    maxExp: 4999,
    benefits: [
      "Được đăng tối đa 5 truyện",
      "Hoa hồng 30% doanh thu"
    ]
  },
  {
    level: 1,
    title: "Tân Thủ",
    color: "bg-gradient-to-r from-green-600 to-lime-600 text-white",
    icon: <Zap className="h-5 w-5 text-yellow-200" />,
    minExp: 0,
    maxExp: 999,
    benefits: [
      "Được đăng tối đa 3 truyện",
      "Hoa hồng 20% doanh thu"
    ]
  }
];

// Hàm lấy thông tin cấp độ dựa trên điểm kinh nghiệm
const getAuthorLevel = (exp: number = 0) => {
  return authorLevels.find(level => exp >= level.minExp && exp <= level.maxExp) || authorLevels[authorLevels.length - 1];
}

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

export default function AuthorsPage() {
  const router = useRouter()
  const [authors, setAuthors] = useState<Author[]>(initialAuthors)
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  // Đã xóa state levelFilter
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const ITEMS_PER_PAGE = 10
  
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
      "Cấp độ",
      "Lượt xem",
      "Doanh thu",
      "Trạng thái",
      "Ngày tạo"
    ].join(",");

    const csvData = filteredAuthors.map(author => [
      author._id,
      author.username,
      author.email,
      getAuthorLevel(author.experiencePoints || 0).title,
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
          <Button 
            onClick={exportToCSV}
            variant="outline"
            size="icon"
            className="h-9 w-9"
          >
            <span className="sr-only">Xuất dữ liệu</span>
            <Download className="h-4 w-4" />
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
              {/* Đã xóa filter cấp độ */}
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
                    <TableHead>Thông tin tác giả</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Giới tính</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAuthors.length > 0 ? (
                    paginatedAuthors.map((author) => {
                      // Đã xóa phần lấy cấp độ tác giả
                      return (
                        <TableRow key={author._id}>
                          <TableCell className="font-medium">{author._id.substring(0, 8)}...</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                                      {author.avatar ? (
                                        <img src={author.avatar} alt={author.username} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                                          {author.username.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Tác giả: {author.username}</p>
                                    {author.bio && <p className="text-xs mt-1">{author.bio}</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span>{author.fullname || author.username}</span>
                            </div>
                          </TableCell>
                          <TableCell>{author.email}</TableCell>
                          <TableCell>{getGenderBadge(author.gender)}</TableCell>
                          <TableCell>{getStatusBadge(author.status || 'active')}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">{format(author.createdAt, "dd/MM/yyyy")}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{format(author.createdAt, "dd/MM/yyyy HH:mm:ss")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => router.push(`/dashboard/authors/${author._id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xem chi tiết</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Chỉnh sửa</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <DollarSign className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Thanh toán</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Shield className="h-10 w-10 mb-2" />
                          <p>Không tìm thấy tác giả nào</p>
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
    </div>
  );
}