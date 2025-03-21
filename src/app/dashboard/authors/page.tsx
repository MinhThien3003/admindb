"use client"

import { useState } from "react"
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
import { Search, Trash2, Pencil, DollarSign, Eye, User, Trophy, Star, Award, Shield, Zap, Bell } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthorRequests, AuthorRequest } from "@/components/dashboard/author-requests"
import { toast } from "sonner"

interface Author {
  id: number;
  username: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  level: number;
  experiencePoints: number;
  bio: string;
  createdAt: Date;
  avatar: string;
  totalViews: number;
  totalTransactions: number;
  totalEarnings: number;
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
const getAuthorLevel = (exp: number) => {
  return authorLevels.find(level => exp >= level.minExp && exp <= level.maxExp) || authorLevels[authorLevels.length - 1];
}

// Hàm định dạng số lượng view
const formatViews = (views: number): string => {
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
    id: 1,
    username: "nguyenvana",
    email: "nguyenvana@example.com",
    password: "123456",
    gender: "male",
    level: 50,
    experiencePoints: 75000,
    bio: "Tác giả chuyên viết truyện ngôn tình, hiện đại",
    createdAt: new Date("2024-01-15"),
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
    totalViews: 150000,
    totalTransactions: 2500,
    totalEarnings: 25000000
  },
  {
    id: 2, 
    username: "tranthib",
    email: "tranthib@example.com",
    password: "123456",
    gender: "female",
    level: 30,
    experiencePoints: 25000,
    bio: "Tác giả truyện ngắn, tản văn",
    createdAt: new Date("2024-02-01"),
    avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B",
    totalViews: 80000,
    totalTransactions: 1200,
    totalEarnings: 12000000
  },
  {
    id: 3,
    username: "levanc",
    email: "levanc@example.com", 
    password: "123456",
    gender: "male",
    level: 10,
    experiencePoints: 2000,
    bio: "Tác giả mới, chuyên viết truyện kiếm hiệp",
    createdAt: new Date("2024-03-01"),
    avatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    totalViews: 20000,
    totalTransactions: 300,
    totalEarnings: 3000000
  }
];

// Dữ liệu mẫu về yêu cầu trở thành tác giả
const initialAuthorRequests: AuthorRequest[] = [
  {
    id: 1,
    userId: 101,
    username: "vothanhd",
    email: "vothanhd@example.com",
    avatar: "https://ui-avatars.com/api/?name=Vo+Thanh+D",
    createdAt: new Date("2024-04-01"),
    status: "pending",
    reason: "Muốn chia sẻ những tác phẩm văn học của mình",
    bio: "Tốt nghiệp ngành Văn học Việt Nam, ĐH Khoa học Xã hội và Nhân văn. Đã có 3 năm kinh nghiệm viết truyện ngắn cho một số trang web văn học.",
    experience: "Đã xuất bản 1 tập truyện ngắn 'Những ngày xanh biếc' năm 2022. Đã có một số truyện ngắn được đăng trên các tạp chí văn học.",
    genres: ["Ngôn Tình", "Đô Thị", "Truyện Teen"],
    samples: ["/samples/vothanhd_sample1.pdf", "/samples/vothanhd_sample2.pdf"]
  },
  {
    id: 2,
    userId: 102,
    username: "phamthue",
    email: "phamthue@example.com",
    avatar: "https://ui-avatars.com/api/?name=Pham+Thu+E",
    createdAt: new Date("2024-04-03"),
    status: "pending",
    reason: "Yêu thích viết truyện kiếm hiệp và muốn chia sẻ với độc giả",
    bio: "Tôi là người yêu thích văn học cổ điển Trung Quốc và các truyện kiếm hiệp từ nhỏ. Tôi đã viết truyện từ năm 18 tuổi và đã có một lượng độc giả nhất định trên các diễn đàn.",
    experience: "Đã viết và hoàn thành 3 bộ truyện kiếm hiệp dài kỳ trên diễn đàn, mỗi bộ trên 500.000 chữ.",
    genres: ["Kiếm Hiệp", "Tiên Hiệp", "Huyền Huyễn"],
    samples: ["/samples/phamthue_sample1.pdf", "/samples/phamthue_sample2.docx", "/samples/phamthue_sample3.docx"]
  },
  {
    id: 3,
    userId: 103,
    username: "tranthif",
    email: "tranthif@example.com",
    avatar: "https://ui-avatars.com/api/?name=Tran+Thi+F",
    createdAt: new Date("2024-04-05"),
    status: "approved",
    reason: "Muốn chia sẻ những câu chuyện về tình yêu và cuộc sống",
    bio: "Tôi là giáo viên dạy văn ở trường THPT, có niềm đam mê với văn chương và muốn chia sẻ những câu chuyện ý nghĩa về tình yêu và cuộc sống.",
    experience: "Đã có 5 năm kinh nghiệm viết blog cá nhân về các chủ đề tình yêu, gia đình. Một số bài viết đã được chia sẻ rộng rãi trên mạng xã hội.",
    genres: ["Ngôn Tình", "Truyện Teen", "Đời Thường"],
    samples: ["/samples/tranthif_sample1.docx", "/samples/tranthif_sample2.pdf"],
    reviewedBy: "Admin",
    reviewedAt: new Date("2024-04-06")
  },
  {
    id: 4,
    userId: 104,
    username: "levanx",
    email: "levanx@example.com",
    avatar: "https://ui-avatars.com/api/?name=Le+Van+X",
    createdAt: new Date("2024-04-02"),
    status: "rejected",
    reason: "Muốn trở thành tác giả trên nền tảng",
    bio: "Tôi là sinh viên đam mê viết lách và muốn chia sẻ tác phẩm của mình.",
    experience: "Mới bắt đầu viết truyện được 6 tháng. Chưa có tác phẩm nào được xuất bản.",
    genres: ["Kinh Dị", "Trinh Thám"],
    samples: ["/samples/levanx_sample1.txt"],
    reviewedBy: "Admin",
    reviewedAt: new Date("2024-04-03"),
    rejectionReason: "Mẫu truyện chưa đạt yêu cầu về chất lượng. Bạn cần trau dồi thêm kỹ năng viết và gửi lại sau."
  }
];

export default function AuthorsPage() {
  const [authors, setAuthors] = useState(initialAuthors);
  const [authorRequests, setAuthorRequests] = useState<AuthorRequest[]>(initialAuthorRequests);
  const [activeTab, setActiveTab] = useState<string>("authors");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
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
        id: authors.length + 1,
        username: request.username,
        email: request.email,
        password: "defaultPassword", // Cần một cơ chế tạo mật khẩu an toàn hơn
        gender: "other", // Giá trị mặc định, có thể cập nhật sau
      level: 1,
      experiencePoints: 0,
        bio: request.bio,
      createdAt: new Date(),
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

  // Tìm kiếm tác giả
  const filteredAuthors = authors.filter(author => 
    author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản Lý Tác Giả</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab(activeTab === "authors" ? "requests" : "authors")}
          >
            {activeTab === "authors" ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Yêu cầu
                {pendingCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Tác giả
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="authors">Danh sách tác giả</TabsTrigger>
          <TabsTrigger value="requests">
            Yêu cầu đăng ký
            {pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="authors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Tìm kiếm tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp độ</SelectItem>
                  {authorLevels.map((level) => (
                    <SelectItem key={level.level} value={level.level.toString()}>
                      {level.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
      </div>

          <div className="bg-white rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead className="w-[250px]">Tác giả</TableHead>
                <TableHead>Cấp độ</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                <TableHead>Lượt xem</TableHead>
                  <TableHead>Doanh thu</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredAuthors.map((author) => {
                const authorLevel = getAuthorLevel(author.experiencePoints);
                return (
                  <TableRow key={author.id}>
                    <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={author.avatar} alt={author.username} />
                            <AvatarFallback>{author.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{author.username}</div>
                            <div className="text-sm text-muted-foreground">{author.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`px-2 py-1 rounded-md text-xs inline-flex items-center gap-1 ${authorLevel.color}`}>
                          {authorLevel.icon}
                          <span>{authorLevel.title}</span>
                      </div>
                    </TableCell>
                      <TableCell>{format(author.createdAt, "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatViews(author.totalViews)}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(author.totalEarnings)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xóa</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                  )
                })}
            </TableBody>
          </Table>
      </div>

          <div className="mt-4 flex justify-end">
            <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
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