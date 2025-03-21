"use client"

import { useState } from "react"
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  BookOpen, 
  Bookmark, 
  Award, 
  Star, 
  Crown, 
  MoreHorizontal, 
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

// Định nghĩa interface cho người dùng
interface User {
  id: number
  name: string
  email: string
  avatar: string
  username: string // Thêm trường tài khoản
  password: string // Thêm trường mật khẩu
  exp: number
  level: UserLevel
  totalDeposit: number // Tổng số tiền đã nạp
  totalCoins: number // Tổng số xu hiện có
  createdAt: Date
  status: "active" | "inactive" | "banned"
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

// Dữ liệu mẫu cho người dùng
const initialUsers: User[] = [
  {
    id: 101,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
    username: "nguyenvana",
    password: "password123",
    exp: 2500,
    level: getUserLevel(2500),
    totalDeposit: 500000,
    totalCoins: 350,
    createdAt: new Date("2024-01-15"),
    status: "active"
  },
  {
    id: 102,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B",
    username: "tranthib",
    password: "password123",
    exp: 150,
    level: getUserLevel(150),
    totalDeposit: 1000000,
    totalCoins: 800,
    createdAt: new Date("2024-01-20"),
    status: "active"
  },
  {
    id: 103,
    name: "Lê Văn C",
    email: "levanc@example.com",
    avatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    username: "levanc",
    password: "password123",
    exp: 50,
    level: getUserLevel(50),
    totalDeposit: 200000,
    totalCoins: 150,
    createdAt: new Date("2024-02-01"),
    status: "inactive"
  },
  {
    id: 104,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    avatar: "https://ui-avatars.com/api/?name=Pham+Thi+D",
    username: "phamthid",
    password: "password123",
    exp: 800,
    level: getUserLevel(800),
    totalDeposit: 2000000,
    totalCoins: 1500,
    createdAt: new Date("2024-02-10"),
    status: "active"
  },
  {
    id: 105,
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    avatar: "https://ui-avatars.com/api/?name=Hoang+Van+E",
    username: "hoangvane",
    password: "password123",
    exp: 3500,
    level: getUserLevel(3500),
    totalDeposit: 100000,
    totalCoins: 80,
    createdAt: new Date("2024-02-15"),
    status: "banned"
  },
  {
    id: 106,
    name: "Ngô Thị F",
    email: "ngothif@example.com",
    avatar: "/avatars/06.png",
    username: "ngothif",
    password: "password123",
    exp: 400,
    level: getUserLevel(400),
    totalDeposit: 0,
    totalCoins: 0,
    createdAt: new Date("2023-06-18"),
    status: "active"
  },
  {
    id: 107,
    name: "Đỗ Văn G",
    email: "dovang@example.com",
    avatar: "/avatars/07.png",
    username: "dovang",
    password: "password123",
    exp: 1200,
    level: getUserLevel(1200),
    totalDeposit: 0,
    totalCoins: 0,
    createdAt: new Date("2023-07-22"),
    status: "active"
  },
  {
    id: 108,
    name: "Vũ Thị H",
    email: "vuthih@example.com",
    avatar: "/avatars/08.png",
    username: "vuthih",
    password: "password123",
    exp: 0,
    level: getUserLevel(0),
    totalDeposit: 0,
    totalCoins: 0,
    createdAt: new Date("2023-08-30"),
    status: "inactive"
  }
];

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

// Hàm định dạng số tiền
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  
  // State cho form popup
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    exp: 0,
    totalDeposit: 0,
    totalCoins: 0,
    status: "active" as "active" | "inactive" | "banned"
  })
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [showAddPassword, setShowAddPassword] = useState(false)

  // Hàm xử lý khi click vào nút chỉnh sửa thông tin
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password,
      exp: user.exp,
      totalDeposit: user.totalDeposit,
      totalCoins: user.totalCoins,
      status: user.status
    })
    setAvatarPreview(user.avatar)
    setShowPassword(false)
    setShowEditForm(true)
  }

  // Hàm xử lý khi submit form chỉnh sửa
  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return
    
    const updatedUsers = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editFormData.name,
          email: editFormData.email,
          username: editFormData.username,
          password: editFormData.password,
          exp: editFormData.exp,
          level: getUserLevel(editFormData.exp),
          totalDeposit: editFormData.totalDeposit,
          totalCoins: editFormData.totalCoins,
          status: editFormData.status,
          avatar: avatarPreview // Cập nhật avatar mới
        }
      }
      return u
    })
    
    setUsers(updatedUsers)
    setShowEditForm(false)
  }

  // Hàm xử lý khi thay đổi giá trị trong form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'exp' || name === 'totalDeposit' || name === 'totalCoins' 
        ? parseInt(value) 
        : value
    }))
  }

  // Hàm xử lý khi thay đổi avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Tạo URL cho ảnh xem trước
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Hàm xử lý khi click vào nút thêm người dùng
  const handleAddUser = () => {
    setEditingUser(null)
    setEditFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      exp: 0,
      totalDeposit: 0,
      totalCoins: 0,
      status: "active"
    })
    setAvatarPreview("")
    setShowAddPassword(false)
    setShowAddForm(true)
  }

  // Hàm xử lý khi submit form thêm người dùng
  const handleAddFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Tạo ID mới
    const newId = Math.max(...users.map(u => u.id)) + 1
    
    // Tạo avatar mặc định nếu không có avatar mới
    const userAvatar = avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.name)}`
    
    // Tạo người dùng mới
    const newUser: User = {
      id: newId,
      name: editFormData.name,
      email: editFormData.email,
      username: editFormData.username,
      password: editFormData.password,
      avatar: userAvatar,
      exp: editFormData.exp,
      level: getUserLevel(editFormData.exp),
      totalDeposit: editFormData.totalDeposit,
      totalCoins: editFormData.totalCoins,
      createdAt: new Date(),
      status: editFormData.status
    }
    
    // Cập nhật danh sách người dùng
    setUsers([...users, newUser])
    setShowAddForm(false)
  }

  // Lọc người dùng theo các điều kiện
  const filteredUsers = users.filter((user) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    // Lọc theo cấp độ
    const matchesLevel = levelFilter === "all" || user.level.level === parseInt(levelFilter);
    
    // Lọc theo khoảng thời gian
    const matchesDateRange = !dateRange || !dateRange.from || !dateRange.to || 
      (user.createdAt >= dateRange.from && 
       user.createdAt <= new Date(dateRange.to.getTime() + 86400000));
    
    return matchesSearch && matchesStatus && matchesLevel && matchesDateRange;
  });

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  // Lấy người dùng cho trang hiện tại
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tính tổng số tiền nạp
  const totalDeposits = filteredUsers.reduce((sum, user) => sum + user.totalDeposit, 0);
  
  // Tính tổng số xu
  const totalCoins = filteredUsers.reduce((sum, user) => sum + user.totalCoins, 0);

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
      user.id,
      user.name,
      user.email,
      user.level.level,
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
                      {editFormData.name.charAt(0)}
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
                  <Input id="edit-id" value={editingUser.id} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tên</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    value={editFormData.name} 
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
                  <Label htmlFor="edit-exp">Kinh nghiệm</Label>
                  <Input 
                    id="edit-exp" 
                    name="exp" 
                    type="number" 
                    value={editFormData.exp} 
                    onChange={handleEditFormChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Cấp độ</Label>
                  <Input 
                    id="edit-level" 
                    value={getUserLevel(editFormData.exp).name} 
                    disabled 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-deposit">Tổng tiền nạp</Label>
                  <Input 
                    id="edit-deposit" 
                    name="totalDeposit" 
                    type="number" 
                    value={editFormData.totalDeposit} 
                    onChange={handleEditFormChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-coins">Số xu</Label>
                  <Input 
                    id="edit-coins" 
                    name="totalCoins" 
                    type="number" 
                    value={editFormData.totalCoins} 
                    onChange={handleEditFormChange} 
                    required 
                  />
                </div>
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
              
              <div className="space-y-2">
                <Label htmlFor="edit-created">Ngày tạo</Label>
                <Input 
                  id="edit-created" 
                  value={format(editingUser.createdAt, "dd/MM/yyyy HH:mm:ss")} 
                  disabled 
                />
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
                      {editFormData.name ? editFormData.name.charAt(0) : "?"}
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
                <Label htmlFor="add-name">Tên</Label>
                <Input 
                  id="add-name" 
                  name="name" 
                  value={editFormData.name} 
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
                  <Label htmlFor="add-exp">Kinh nghiệm</Label>
                  <Input 
                    id="add-exp" 
                    name="exp" 
                    type="number" 
                    value={editFormData.exp} 
                    onChange={handleEditFormChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-level">Cấp độ</Label>
                  <Input 
                    id="add-level" 
                    value={getUserLevel(editFormData.exp).name} 
                    disabled 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-deposit">Tổng tiền nạp</Label>
                  <Input 
                    id="add-deposit" 
                    name="totalDeposit" 
                    type="number" 
                    value={editFormData.totalDeposit} 
                    onChange={handleEditFormChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-coins">Số xu</Label>
                  <Input 
                    id="add-coins" 
                    name="totalCoins" 
                    type="number" 
                    value={editFormData.totalCoins} 
                    onChange={handleEditFormChange} 
                    required 
                  />
                </div>
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
        <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
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
            value={levelFilter}
            onValueChange={setLevelFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp độ</SelectItem>
              <SelectItem value="1">Cấp 1</SelectItem>
              <SelectItem value="2">Cấp 2</SelectItem>
              <SelectItem value="3">Cấp 3</SelectItem>
              <SelectItem value="4">Cấp 4</SelectItem>
              <SelectItem value="5">Cấp 5</SelectItem>
              <SelectItem value="6">Cấp 6</SelectItem>
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
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Tổng nạp</TableHead>
                <TableHead>Số xu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">#{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tên: {user.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getLevelBadge(user.level)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(user.totalDeposit)}</TableCell>
                  <TableCell>{user.totalCoins} xu</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
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
              ))}
              {paginatedUsers.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedUsers.length).fill(0).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell colSpan={9}>&nbsp;</TableCell>
                  </TableRow>
                ))
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
  )
} 