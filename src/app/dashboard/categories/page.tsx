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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Trash2, Plus, Edit2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"

// Định nghĩa interface cho Category
interface Category {
  id: number
  name: string
  description: string
  novelCount: number
  createdAt: string
}

// Dữ liệu mẫu
const initialCategories: Category[] = [
  {
    id: 1,
    name: "Fantasy",
    description: "Thể loại kỳ ảo, thường có các yếu tố ma thuật, sinh vật huyền bí.",
    novelCount: 42,
    createdAt: "2022-01-15"
  },
  {
    id: 2,
    name: "Adventure",
    description: "Thể loại phiêu lưu, mạo hiểm, khám phá thế giới.",
    novelCount: 38,
    createdAt: "2022-01-20"
  },
  {
    id: 3,
    name: "Romance",
    description: "Thể loại lãng mạn, tình cảm giữa các nhân vật.",
    novelCount: 65,
    createdAt: "2022-01-25"
  },
  {
    id: 4,
    name: "Action",
    description: "Thể loại hành động, chiến đấu, võ thuật.",
    novelCount: 47,
    createdAt: "2022-02-01"
  },
  {
    id: 5,
    name: "Comedy",
    description: "Thể loại hài hước, vui nhộn.",
    novelCount: 29,
    createdAt: "2022-02-05"
  },
  {
    id: 6,
    name: "Drama",
    description: "Thể loại kịch tính, cảm xúc.",
    novelCount: 33,
    createdAt: "2022-02-10"
  },
  {
    id: 7,
    name: "Horror",
    description: "Thể loại kinh dị, rùng rợn.",
    novelCount: 18,
    createdAt: "2022-02-15"
  },
  {
    id: 8,
    name: "Mystery",
    description: "Thể loại bí ẩn, trinh thám.",
    novelCount: 24,
    createdAt: "2022-02-20"
  },
  {
    id: 9,
    name: "Sci-fi",
    description: "Thể loại khoa học viễn tưởng.",
    novelCount: 31,
    createdAt: "2022-02-25"
  },
  {
    id: 10,
    name: "Slice of Life",
    description: "Thể loại đời thường, cuộc sống hàng ngày.",
    novelCount: 27,
    createdAt: "2022-03-01"
  },
  {
    id: 11,
    name: "Historical",
    description: "Thể loại lịch sử, dựa trên các sự kiện có thật.",
    novelCount: 19,
    createdAt: "2022-03-05"
  },
  {
    id: 12,
    name: "Martial Arts",
    description: "Thể loại võ thuật, tu luyện.",
    novelCount: 36,
    createdAt: "2022-03-10"
  }
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: ""
  })
  const { toast } = useToast()
  const ITEMS_PER_PAGE = 10

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = (id: number) => {
    // Kiểm tra xem thể loại có truyện không
    const category = categories.find(cat => cat.id === id)
    if (category && category.novelCount > 0) {
      toast({
        title: "Không thể xóa",
        description: `Thể loại "${category.name}" đang có ${category.novelCount} truyện. Vui lòng xóa hoặc chuyển truyện sang thể loại khác trước.`,
        variant: "destructive"
      })
      return
    }

    setCategories(categories.filter((category) => category.id !== id))
    toast({
      title: "Đã xóa thể loại",
      description: "Thể loại đã được xóa thành công."
    })
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description
    })
    setIsEditDialogOpen(true)
  }

  const handleAddSubmit = () => {
    if (!newCategory.name) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại không được để trống.",
        variant: "destructive"
      })
      return
    }

    // Kiểm tra trùng tên
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name?.toLowerCase())) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại đã tồn tại.",
        variant: "destructive"
      })
      return
    }

    const newCategoryItem: Category = {
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      name: newCategory.name,
      description: newCategory.description || "",
      novelCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setCategories([...categories, newCategoryItem])
    setNewCategory({ name: "", description: "" })
    setIsAddDialogOpen(false)
    toast({
      title: "Đã thêm thể loại",
      description: "Thể loại mới đã được thêm thành công."
    })
  }

  const handleEditSubmit = () => {
    if (!selectedCategory) return
    if (!newCategory.name) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại không được để trống.",
        variant: "destructive"
      })
      return
    }

    // Kiểm tra trùng tên (trừ chính nó)
    if (categories.some(cat => 
      cat.id !== selectedCategory.id && 
      cat.name.toLowerCase() === newCategory.name?.toLowerCase()
    )) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại đã tồn tại.",
        variant: "destructive"
      })
      return
    }

    setCategories(categories.map(category => 
      category.id === selectedCategory.id 
        ? { 
            ...category, 
            name: newCategory.name || category.name, 
            description: newCategory.description || category.description 
          } 
        : category
    ))
    setSelectedCategory(null)
    setNewCategory({ name: "", description: "" })
    setIsEditDialogOpen(false)
    toast({
      title: "Đã cập nhật thể loại",
      description: "Thể loại đã được cập nhật thành công."
    })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý thể loại</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm thể loại
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm thể loại mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Tên thể loại</label>
                <Input
                  id="name"
                  value={newCategory.name || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Nhập tên thể loại"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Mô tả</label>
                <Input
                  id="description"
                  value={newCategory.description || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Nhập mô tả thể loại"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddSubmit}>Thêm thể loại</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thể loại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="min-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên thể loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Số truyện</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{category.novelCount}</TableCell>
                  <TableCell>{category.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedCategories.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedCategories.length).fill(0).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell colSpan={6}>&nbsp;</TableCell>
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

      {/* Dialog for editing category */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thể loại</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Tên thể loại</label>
              <Input
                id="edit-name"
                value={newCategory.name || ""}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nhập tên thể loại"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Mô tả</label>
              <Input
                id="edit-description"
                value={newCategory.description || ""}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Nhập mô tả thể loại"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleEditSubmit}>Lưu thay đổi</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 