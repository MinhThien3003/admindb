"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DropdownMenuSeparator, 
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  exp: number
  level: UserLevel
  createdAt: string
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
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    avatar: "/avatars/01.png",
    exp: 2500,
    level: getUserLevel(2500),
    createdAt: "2023-01-15",
    status: "active"
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    avatar: "/avatars/02.png",
    exp: 150,
    level: getUserLevel(150),
    createdAt: "2023-02-20",
    status: "active"
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    avatar: "/avatars/03.png",
    exp: 50,
    level: getUserLevel(50),
    createdAt: "2023-03-10",
    status: "inactive"
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    avatar: "/avatars/04.png",
    exp: 800,
    level: getUserLevel(800),
    createdAt: "2023-04-05",
    status: "active"
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    avatar: "/avatars/05.png",
    exp: 3500,
    level: getUserLevel(3500),
    createdAt: "2023-05-12",
    status: "banned"
  },
  {
    id: 6,
    name: "Ngô Thị F",
    email: "ngothif@example.com",
    avatar: "/avatars/06.png",
    exp: 400,
    level: getUserLevel(400),
    createdAt: "2023-06-18",
    status: "active"
  },
  {
    id: 7,
    name: "Đỗ Văn G",
    email: "dovang@example.com",
    avatar: "/avatars/07.png",
    exp: 1200,
    level: getUserLevel(1200),
    createdAt: "2023-07-22",
    status: "active"
  },
  {
    id: 8,
    name: "Vũ Thị H",
    email: "vuthih@example.com",
    avatar: "/avatars/08.png",
    exp: 0,
    level: getUserLevel(0),
    createdAt: "2023-08-30",
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Lọc người dùng theo từ khóa tìm kiếm
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Tính toán tổng số trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  
  // Lấy người dùng cho trang hiện tại
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Xử lý xóa người dùng
  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id))
  }

  // Xử lý thay đổi trạng thái người dùng
  const handleChangeStatus = (id: number, status: "active" | "inactive" | "banned") => {
    setUsers(users.map(user => user.id === id ? { ...user, status } : user))
  }

  // Xử lý chuyển trang
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Xử lý thay đổi số lượng hiển thị trên mỗi trang
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1) // Reset về trang đầu tiên khi thay đổi số lượng hiển thị
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Quản lý tất cả người dùng trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Kinh nghiệm</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getLevelBadge(user.level)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{user.exp.toLocaleString()} EXP</span>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className={`h-2 rounded-full ${user.level.color === 'gray' ? 'bg-gray-500' : `bg-${user.level.color}-500`}`}
                          style={{ 
                            width: `${Math.min(100, ((user.exp - user.level.requiredExp) / (getUserLevel(user.exp + 1).requiredExp - user.level.requiredExp)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleChangeStatus(user.id, "active")}>
                          Kích hoạt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(user.id, "inactive")}>
                          Vô hiệu hóa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(user.id, "banned")}>
                          Cấm
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Hiển thị</p>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm font-medium">trên trang</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 