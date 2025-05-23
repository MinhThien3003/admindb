"use client"

import { useState, useEffect } from "react"
import { useAuthorLevels } from "@/hooks/use-author-levels"
import { useReaderLevels, ReaderLevel } from "@/hooks/use-reader-levels"
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

import { AuthorLevel as ApiAuthorLevel, AuthorLevelInput } from "@/hooks/use-author-levels"
import { UserLevelInput } from "@/components/dashboard/user-level-form"

// Interface cho cấp độ người dùng (độc giả) trong UI
interface UIUserLevel {
  id: string;
  name: string;
  level: number;
  requiredExp: number;
  color: string;
  icon: string;
  benefits?: string[];
}

// Interface cho cấp độ tác giả trong UI (mở rộng từ API AuthorLevel)
interface UIAuthorLevel extends ApiAuthorLevel {
  // Thêm các trường UI bổ sung
  displayName?: string
  displayColor?: string
  displayIcon?: string
  benefits?: string[]
}

// Type cho dữ liệu đầu vào của form chỉnh sửa tác giả
interface AuthorLevelFormInput {
  title: string;
  level: string | number;
  requiredExp: string | number;
}

// Hàm chuyển đổi từ API AuthorLevel sang UI AuthorLevel
const mapApiToUiAuthorLevel = (apiLevel: ApiAuthorLevel): UIAuthorLevel => {
  // Xác định màu và icon dựa trên cấp độ
  let displayColor = "blue";
  if (apiLevel.level <= 1) displayColor = "gray";
  else if (apiLevel.level === 2) displayColor = "green";
  else if (apiLevel.level === 3) displayColor = "blue";
  else if (apiLevel.level === 4) displayColor = "purple";
  else if (apiLevel.level === 5) displayColor = "orange";
  else if (apiLevel.level >= 6) displayColor = "red";
  
  // Tạo danh sách đặc quyền dựa trên cấp độ
  const benefits: string[] = [];
  if (apiLevel.level >= 1) {
    benefits.push("Đăng truyện", "Nhận phản hồi");
  }
  if (apiLevel.level >= 2) {
    benefits.push("Đặt giá cho chương truyện");
  }
  if (apiLevel.level >= 3) {
    benefits.push(`Giảm 5% phí nền tảng`);
  }
  if (apiLevel.level >= 4) {
    benefits.push(`Giảm 10% phí nền tảng`, "Huy hiệu tác giả");
  }
  if (apiLevel.level >= 5) {
    benefits.push(`Giảm 15% phí nền tảng`, "Quảng bá truyện");
  }
  if (apiLevel.level >= 6) {
    benefits.push(`Giảm 20% phí nền tảng`, "Hợp đồng đặc biệt");
  }
  
  // Xác định icon dựa trên cấp độ
  let displayIcon = "edit";
  if (apiLevel.level === 2) displayIcon = "pen-tool";
  else if (apiLevel.level === 3) displayIcon = "feather";
  else if (apiLevel.level === 4) displayIcon = "book";
  else if (apiLevel.level === 5) displayIcon = "award";
  else if (apiLevel.level >= 6) displayIcon = "crown";
  
  return {
    ...apiLevel,
    displayName: apiLevel.title,
    displayColor,
    displayIcon,
    benefits
  };
}

// Không còn sử dụng dữ liệu mẫu cho cấp độ tác giả, sẽ lấy từ API

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
  // State cho cấp độ người dùng (độc giả)
  const [selectedUserLevel, setSelectedUserLevel] = useState<UIUserLevel | null>(null)
  
  // State cho cấp độ tác giả
  const [selectedAuthorLevel, setSelectedAuthorLevel] = useState<UIAuthorLevel | null>(null)
  
  // State cho phân trang
  const [readerCurrentPage, setReaderCurrentPage] = useState(1)
  const [authorCurrentPage, setAuthorCurrentPage] = useState(1)
  
  // State cho số lượng hiển thị trên mỗi trang
  const [readerItemsPerPage, setReaderItemsPerPage] = useState(5)
  const [authorItemsPerPage, setAuthorItemsPerPage] = useState(5)
  
  // Sử dụng custom hook useAuthorLevels
  const { 
    authorLevels: apiAuthorLevels, 
    isLoading: isLoadingAuthorLevels, 
    fetchAuthorLevels,
    addAuthorLevel,
    updateAuthorLevel,
    deleteAuthorLevel
  } = useAuthorLevels()
  
  // Sử dụng custom hook useReaderLevels
  const {
    readerLevels: apiReaderLevels,
    isLoading: isLoadingReaderLevels,
    fetchReaderLevels,
    addReaderLevel,
    updateReaderLevel,
    deleteReaderLevel
  } = useReaderLevels()
  
  // Chuyển đổi dữ liệu từ API sang định dạng UI
  const authorLevels: UIAuthorLevel[] = apiAuthorLevels.map(mapApiToUiAuthorLevel)
  
  // Hàm chuyển đổi từ API ReaderLevel sang UI ReaderLevel
  const mapApiToUiUserLevel = (apiLevel: ReaderLevel): UIUserLevel => {
    // Xác định màu và icon dựa trên cấp độ
    let color = "blue";
    if (apiLevel.level <= 1) color = "gray";
    else if (apiLevel.level === 2) color = "green";
    else if (apiLevel.level === 3) color = "blue";
    else if (apiLevel.level === 4) color = "purple";
    else if (apiLevel.level === 5) color = "orange";
    else if (apiLevel.level >= 6) color = "red";
    
    // Xác định icon dựa trên cấp độ
    let icon = "user";
    if (apiLevel.level === 2) icon = "book-open";
    else if (apiLevel.level === 3) icon = "bookmark";
    else if (apiLevel.level === 4) icon = "book";
    else if (apiLevel.level === 5) icon = "star";
    else if (apiLevel.level >= 6) icon = "crown";
    
    return {
      id: apiLevel._id,
      name: apiLevel.title,
      level: apiLevel.level,
      requiredExp: apiLevel.requiredExp,
      color,
      icon,
      benefits: getReaderBenefits(apiLevel.level)
    };
  }
  
  // Hàm tạo danh sách đặc quyền cho độc giả dựa trên cấp độ
  const getReaderBenefits = (level: number): string[] => {
    const benefits: string[] = [];
    if (level >= 1) {
      benefits.push("Đọc truyện miễn phí", "Bình luận");
    }
    if (level >= 2) {
      benefits.push("Đánh giá truyện");
    }
    if (level >= 3) {
      benefits.push(`Giảm 5% phí đọc truyện premium`);
    }
    if (level >= 4) {
      benefits.push(`Giảm 10% phí đọc truyện premium`, "Huy hiệu độc giả");
    }
    if (level >= 5) {
      benefits.push(`Giảm 15% phí đọc truyện premium`, "Truy cập sớm nội dung mới");
    }
    if (level >= 6) {
      benefits.push(`Giảm 20% phí đọc truyện premium`, "Quà tặng hàng tháng");
    }
    return benefits;
  };
  
  // Chuyển đổi cấp độ độc giả từ API
  const userLevels: UIUserLevel[] = apiReaderLevels ? apiReaderLevels.map(mapApiToUiUserLevel) : []

  // Gọi API khi component được mount
  useEffect(() => {
    fetchAuthorLevels();
    fetchReaderLevels();
  }, [fetchAuthorLevels, fetchReaderLevels]);

  // Tính toán tổng số trang cho độc giả
  const readerTotalPages = Math.ceil(userLevels.length / readerItemsPerPage)
  
  // Lấy cấp độ độc giả cho trang hiện tại
  const currentReaderLevels = userLevels.slice(
    (readerCurrentPage - 1) * readerItemsPerPage,
    readerCurrentPage * readerItemsPerPage
  )

  // Tính toán tổng số trang cho tác giả
  const authorTotalPages = Math.ceil(authorLevels.length / authorItemsPerPage)
  
  // Lấy cấp độ tác giả cho trang hiện tại
  const currentAuthorLevels = authorLevels.slice(
    (authorCurrentPage - 1) * authorItemsPerPage,
    authorCurrentPage * authorItemsPerPage
  )

  // Xử lý xóa cấp độ người dùng (độc giả)
  const handleDeleteUserLevel = (id: string) => {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (window.confirm('Bạn có chắc chắn muốn xóa cấp độ độc giả này?')) {
      // Gọi API để xóa cấp độ độc giả
      deleteReaderLevel(id);
    }
  }

  // Xử lý xóa cấp độ tác giả
  const handleDeleteAuthorLevel = (levelId: string) => {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (window.confirm('Bạn có chắc chắn muốn xóa cấp độ tác giả này?')) {
      // Gọi API để xóa thông qua custom hook
      deleteAuthorLevel(levelId);
    }
  }

  // Xử lý chỉnh sửa cấp độ tác giả
  const handleEditAuthorLevel = (level: UIAuthorLevel) => {
    setSelectedAuthorLevel(level)
  }
  
  // Xử lý chỉnh sửa cấp độ người dùng
  const handleEditUserLevel = (level: UIUserLevel) => {
    setSelectedUserLevel(level)
  }

  // Xử lý lưu cấp độ người dùng (độc giả)
  const handleSaveUserLevel = (formData: UserLevelInput) => {
    if (selectedUserLevel) {
      // Cập nhật cấp độ hiện có
      updateReaderLevel(selectedUserLevel.id, formData);
    } else {
      // Thêm cấp độ mới
      addReaderLevel(formData);
    }
    setSelectedUserLevel(null);
  }

  // Xử lý lưu cấp độ tác giả
  const handleSaveAuthorLevel = (formData: AuthorLevelInput) => {
    if (selectedAuthorLevel && selectedAuthorLevel._id) {
      // Cập nhật cấp độ hiện có thông qua custom hook
      updateAuthorLevel(selectedAuthorLevel._id, formData);
    } else {
      // Thêm cấp độ mới thông qua custom hook
      addAuthorLevel(formData);
    }
    
    setSelectedAuthorLevel(null);
  }

  // Xử lý chuyển trang cho người dùng
  const goToReaderPage = (page: number) => {
    setReaderCurrentPage(Math.max(1, Math.min(page, readerTotalPages)))
  }

  // Xử lý chuyển trang cho tác giả
  const goToAuthorPage = (page: number) => {
    setAuthorCurrentPage(Math.max(1, Math.min(page, authorTotalPages)))
  }

  // Xử lý thay đổi số lượng hiển thị trên mỗi trang cho người dùng
  const handleReaderItemsPerPageChange = (value: string) => {
    setReaderItemsPerPage(parseInt(value))
    setReaderCurrentPage(1) // Reset về trang đầu tiên khi thay đổi số lượng hiển thị
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
                    {isLoadingReaderLevels ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Đang tải dữ liệu cấp độ người dùng...
                        </TableCell>
                      </TableRow>
                    ) : currentReaderLevels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Không có dữ liệu cấp độ người dùng
                        </TableCell>
                      </TableRow>
                    ) : currentReaderLevels.map((level) => (
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
                            {level.benefits && level.benefits.slice(0, 2).map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="mr-1">
                                {benefit}
                              </Badge>
                            ))}
                            {level.benefits && level.benefits.length > 2 && (
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
                      value={readerItemsPerPage.toString()}
                      onValueChange={handleReaderItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={readerItemsPerPage.toString()} />
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
                      Trang {readerCurrentPage} / {readerTotalPages}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToReaderPage(1)}
                        disabled={readerCurrentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToReaderPage(readerCurrentPage - 1)}
                        disabled={readerCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToReaderPage(readerCurrentPage + 1)}
                        disabled={readerCurrentPage === readerTotalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToReaderPage(readerTotalPages)}
                        disabled={readerCurrentPage === readerTotalPages}
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
                      <TableHead>Kinh nghiệm yêu cầu</TableHead>
                      <TableHead>Cấp độ</TableHead>
                      <TableHead>Đặc quyền</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAuthorLevels ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Đang tải dữ liệu cấp độ tác giả...
                        </TableCell>
                      </TableRow>
                    ) : currentAuthorLevels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Không có dữ liệu cấp độ tác giả
                        </TableCell>
                      </TableRow>
                    ) : currentAuthorLevels.map((level) => (
                      <TableRow key={`author-level-${level._id}`}>
                        <TableCell>{level._id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getIconComponent(level.displayIcon || 'edit')}
                            {level.displayName || level.title}
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(level.level, level.displayColor || 'blue', level.displayIcon || 'edit')}</TableCell>
                        <TableCell>{level.requiredExp} kinh nghiệm</TableCell>
                        <TableCell>Cấp {level.level}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {level.benefits && level.benefits.slice(0, 2).map((benefit: string, index: number) => (
                              <Badge key={index} variant="secondary" className="mr-1">
                                {benefit}
                              </Badge>
                            ))}
                            {level.benefits && level.benefits.length > 2 && (
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
                            onClick={() => handleDeleteAuthorLevel(level._id)}
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