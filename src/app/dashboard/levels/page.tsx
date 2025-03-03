"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, User, BookOpen, Bookmark, Award, Star, Crown, Edit, PenTool, Feather, Book, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserLevelForm } from "@/components/dashboard/user-level-form"
import { AuthorLevelForm } from "@/components/dashboard/author-level-form"
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

// Định nghĩa interface cho cấp độ tác giả
interface AuthorLevel {
  id: number
  name: string
  level: number
  requiredNovel: number
  requiredRating: number
  benefits: string[]
  color: string
  icon: string
}

// Dữ liệu mẫu cho cấp độ người dùng
const initialUserLevels: UserLevel[] = [
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

// Dữ liệu mẫu cho cấp độ tác giả
const initialAuthorLevels: AuthorLevel[] = [
  {
    id: 1,
    name: "Tác giả mới",
    level: 1,
    requiredNovel: 0,
    requiredRating: 0,
    benefits: ["Đăng truyện", "Nhận phản hồi"],
    color: "gray",
    icon: "edit"
  },
  {
    id: 2,
    name: "Tác giả nghiệp dư",
    level: 2,
    requiredNovel: 1,
    requiredRating: 3.0,
    benefits: ["Đăng truyện", "Nhận phản hồi", "Đặt giá cho chương truyện"],
    color: "green",
    icon: "pen-tool"
  },
  {
    id: 3,
    name: "Tác giả tiềm năng",
    level: 3,
    requiredNovel: 3,
    requiredRating: 3.5,
    benefits: ["Đăng truyện", "Nhận phản hồi", "Đặt giá cho chương truyện", "Giảm 5% phí nền tảng"],
    color: "blue",
    icon: "feather"
  },
  {
    id: 4,
    name: "Tác giả chuyên nghiệp",
    level: 4,
    requiredNovel: 5,
    requiredRating: 4.0,
    benefits: ["Đăng truyện", "Nhận phản hồi", "Đặt giá cho chương truyện", "Giảm 10% phí nền tảng", "Huy hiệu tác giả"],
    color: "purple",
    icon: "book"
  },
  {
    id: 5,
    name: "Tác giả nổi tiếng",
    level: 5,
    requiredNovel: 10,
    requiredRating: 4.3,
    benefits: ["Đăng truyện", "Nhận phản hồi", "Đặt giá cho chương truyện", "Giảm 15% phí nền tảng", "Huy hiệu tác giả", "Quảng bá truyện"],
    color: "orange",
    icon: "award"
  },
  {
    id: 6,
    name: "Tác giả huyền thoại",
    level: 6,
    requiredNovel: 15,
    requiredRating: 4.5,
    benefits: ["Đăng truyện", "Nhận phản hồi", "Đặt giá cho chương truyện", "Giảm 20% phí nền tảng", "Huy hiệu tác giả", "Quảng bá truyện", "Hợp đồng đặc biệt"],
    color: "red",
    icon: "crown"
  }
]

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
    case 'edit':
      return <Edit className="h-4 w-4" />;
    case 'pen-tool':
      return <PenTool className="h-4 w-4" />;
    case 'feather':
      return <Feather className="h-4 w-4" />;
    case 'book':
      return <Book className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

// Hàm hiển thị màu cho cấp độ
const getLevelBadge = (level: number, color: string, icon: string) => {
  const colorClasses: Record<string, string> = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    red: "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <Badge variant="outline" className={`${colorClasses[color]} flex items-center gap-1`}>
      {getIconComponent(icon)}
      <span>Cấp {level}</span>
    </Badge>
  )
}

export default function LevelsPage() {
  const [userLevels, setUserLevels] = useState<UserLevel[]>(initialUserLevels)
  const [authorLevels, setAuthorLevels] = useState<AuthorLevel[]>(initialAuthorLevels)
  const [selectedUserLevel, setSelectedUserLevel] = useState<UserLevel | null>(null)
  const [selectedAuthorLevel, setSelectedAuthorLevel] = useState<AuthorLevel | null>(null)
  const [userCurrentPage, setUserCurrentPage] = useState(1)
  const [authorCurrentPage, setAuthorCurrentPage] = useState(1)
  const [userItemsPerPage, setUserItemsPerPage] = useState(5)
  const [authorItemsPerPage, setAuthorItemsPerPage] = useState(5)

  // Tính toán tổng số trang cho người dùng
  const userTotalPages = Math.ceil(userLevels.length / userItemsPerPage)
  
  // Lấy cấp độ người dùng cho trang hiện tại
  const currentUserLevels = userLevels.slice(
    (userCurrentPage - 1) * userItemsPerPage,
    userCurrentPage * userItemsPerPage
  )

  // Tính toán tổng số trang cho tác giả
  const authorTotalPages = Math.ceil(authorLevels.length / authorItemsPerPage)
  
  // Lấy cấp độ tác giả cho trang hiện tại
  const currentAuthorLevels = authorLevels.slice(
    (authorCurrentPage - 1) * authorItemsPerPage,
    authorCurrentPage * authorItemsPerPage
  )

  // Xử lý xóa cấp độ người dùng
  const handleDeleteUserLevel = (id: number) => {
    setUserLevels(userLevels.filter(level => level.id !== id))
  }

  // Xử lý xóa cấp độ tác giả
  const handleDeleteAuthorLevel = (id: number) => {
    setAuthorLevels(authorLevels.filter(level => level.id !== id))
  }

  // Xử lý chỉnh sửa cấp độ người dùng
  const handleEditUserLevel = (level: UserLevel) => {
    setSelectedUserLevel(level)
  }

  // Xử lý chỉnh sửa cấp độ tác giả
  const handleEditAuthorLevel = (level: AuthorLevel) => {
    setSelectedAuthorLevel(level)
  }

  // Xử lý lưu cấp độ người dùng
  const handleSaveUserLevel = (level: UserLevel) => {
    if (selectedUserLevel) {
      // Cập nhật cấp độ hiện có
      setUserLevels(userLevels.map(l => l.id === level.id ? level : l))
    } else {
      // Thêm cấp độ mới
      setUserLevels([...userLevels, { ...level, id: userLevels.length + 1 }])
    }
    setSelectedUserLevel(null)
  }

  // Xử lý lưu cấp độ tác giả
  const handleSaveAuthorLevel = (level: AuthorLevel) => {
    if (selectedAuthorLevel) {
      // Cập nhật cấp độ hiện có
      setAuthorLevels(authorLevels.map(l => l.id === level.id ? level : l))
    } else {
      // Thêm cấp độ mới
      setAuthorLevels([...authorLevels, { ...level, id: authorLevels.length + 1 }])
    }
    setSelectedAuthorLevel(null)
  }

  // Xử lý chuyển trang cho người dùng
  const goToUserPage = (page: number) => {
    setUserCurrentPage(Math.max(1, Math.min(page, userTotalPages)))
  }

  // Xử lý chuyển trang cho tác giả
  const goToAuthorPage = (page: number) => {
    setAuthorCurrentPage(Math.max(1, Math.min(page, authorTotalPages)))
  }

  // Xử lý thay đổi số lượng hiển thị trên mỗi trang cho người dùng
  const handleUserItemsPerPageChange = (value: string) => {
    setUserItemsPerPage(parseInt(value))
    setUserCurrentPage(1) // Reset về trang đầu tiên khi thay đổi số lượng hiển thị
  }

  // Xử lý thay đổi số lượng hiển thị trên mỗi trang cho tác giả
  const handleAuthorItemsPerPageChange = (value: string) => {
    setAuthorItemsPerPage(parseInt(value))
    setAuthorCurrentPage(1) // Reset về trang đầu tiên khi thay đổi số lượng hiển thị
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý cấp độ</h2>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Cấp độ người dùng</TabsTrigger>
          <TabsTrigger value="authors">Cấp độ tác giả</TabsTrigger>
        </TabsList>

        {/* Tab cấp độ người dùng */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between">
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cấp độ người dùng</CardTitle>
                    <CardDescription>
                      Quản lý các cấp độ và đặc quyền của người dùng trong hệ thống.
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm cấp độ
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm cấp độ người dùng mới</DialogTitle>
                      </DialogHeader>
                      <UserLevelForm 
                        initialData={null} 
                        onSubmit={handleSaveUserLevel} 
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên cấp độ</TableHead>
                      <TableHead>Cấp</TableHead>
                      <TableHead>Kinh nghiệm yêu cầu</TableHead>
                      <TableHead>Đặc quyền</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUserLevels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell>{level.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getIconComponent(level.icon)}
                            {level.name}
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(level.level, level.color, level.icon)}</TableCell>
                        <TableCell>{level.requiredExp.toLocaleString()} EXP</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {level.benefits.slice(0, 2).map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="mr-1">
                                {benefit}
                              </Badge>
                            ))}
                            {level.benefits.length > 2 && (
                              <Badge variant="outline">+{level.benefits.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUserLevel(level)}
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Chỉnh sửa cấp độ người dùng</DialogTitle>
                              </DialogHeader>
                              <UserLevelForm 
                                initialData={selectedUserLevel} 
                                onSubmit={handleSaveUserLevel} 
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUserLevel(level.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination for User Levels */}
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Hiển thị</p>
                    <Select
                      value={userItemsPerPage.toString()}
                      onValueChange={handleUserItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={userItemsPerPage.toString()} />
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
                      Trang {userCurrentPage} / {userTotalPages}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToUserPage(1)}
                        disabled={userCurrentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToUserPage(userCurrentPage - 1)}
                        disabled={userCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToUserPage(userCurrentPage + 1)}
                        disabled={userCurrentPage === userTotalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToUserPage(userTotalPages)}
                        disabled={userCurrentPage === userTotalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab cấp độ tác giả */}
        <TabsContent value="authors" className="space-y-4">
          <div className="flex justify-between">
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cấp độ tác giả</CardTitle>
                    <CardDescription>
                      Quản lý các cấp độ và đặc quyền của tác giả trong hệ thống.
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm cấp độ
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm cấp độ tác giả mới</DialogTitle>
                      </DialogHeader>
                      <AuthorLevelForm 
                        initialData={null} 
                        onSubmit={handleSaveAuthorLevel} 
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên cấp độ</TableHead>
                      <TableHead>Cấp</TableHead>
                      <TableHead>Truyện yêu cầu</TableHead>
                      <TableHead>Đánh giá yêu cầu</TableHead>
                      <TableHead>Đặc quyền</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAuthorLevels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell>{level.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getIconComponent(level.icon)}
                            {level.name}
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(level.level, level.color, level.icon)}</TableCell>
                        <TableCell>{level.requiredNovel} truyện</TableCell>
                        <TableCell>{level.requiredRating} sao</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {level.benefits.slice(0, 2).map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="mr-1">
                                {benefit}
                              </Badge>
                            ))}
                            {level.benefits.length > 2 && (
                              <Badge variant="outline">+{level.benefits.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditAuthorLevel(level)}
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Chỉnh sửa cấp độ tác giả</DialogTitle>
                              </DialogHeader>
                              <AuthorLevelForm 
                                initialData={selectedAuthorLevel} 
                                onSubmit={handleSaveAuthorLevel} 
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAuthorLevel(level.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination for Author Levels */}
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Hiển thị</p>
                    <Select
                      value={authorItemsPerPage.toString()}
                      onValueChange={handleAuthorItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={authorItemsPerPage.toString()} />
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
                      Trang {authorCurrentPage} / {authorTotalPages}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToAuthorPage(1)}
                        disabled={authorCurrentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToAuthorPage(authorCurrentPage - 1)}
                        disabled={authorCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToAuthorPage(authorCurrentPage + 1)}
                        disabled={authorCurrentPage === authorTotalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToAuthorPage(authorTotalPages)}
                        disabled={authorCurrentPage === authorTotalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 