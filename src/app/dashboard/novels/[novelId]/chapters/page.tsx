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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  DollarSign, 
  Lock, 
  Unlock,
  ArrowUpDown
} from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { ChapterPriceForm } from "@/components/dashboard/chapter-price-form"

// Định nghĩa interface cho chương
interface Chapter {
  _id?: string
  id?: number
  idNovel?: string
  title: string
  order: number
  wordCount?: number
  view?: number
  role?: string
  isPremium?: boolean
  price?: number
  createdAt?: Date
  updatedAt?: Date
}

// Định nghĩa interface cho truyện
interface Novel {
  _id?: string
  id?: number
  title: string
  author?: string
  coverImage?: string
  description?: string
  status?: string
  totalChapters?: number
  totalViews?: number
  totalRevenue?: number
}

// Hàm định dạng số tiền
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

// Dữ liệu mẫu cho truyện
const novel: Novel = {
  id: 1,
  title: "Hành trình kỳ diệu",
  author: "sarah_parker",
  coverImage: "https://example.com/cover.jpg",
  description: "Một cuộc phiêu lưu kỳ thú vào thế giới giả tưởng...",
  status: "Đang tiến hành",
  totalChapters: 15,
  totalViews: 25000,
  totalRevenue: 2500000
};

// Dữ liệu mẫu cho các chương
const initialChapters: Chapter[] = [
  {
    id: 1,
    title: "Khởi đầu mới",
    order: 1,
    wordCount: 2500,
    view: 3200,
    isPremium: false,
    price: 0,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: 2,
    title: "Gặp gỡ định mệnh",
    order: 2,
    wordCount: 2800,
    view: 2900,
    isPremium: false,
    price: 0,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: 3,
    title: "Cuộc phiêu lưu bắt đầu",
    order: 3,
    wordCount: 3100,
    view: 2700,
    isPremium: false,
    price: 0,
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25")
  },
  {
    id: 4,
    title: "Cánh cổng thời gian",
    order: 4,
    wordCount: 3500,
    view: 2500,
    isPremium: true,
    price: 15000,
    createdAt: new Date("2024-01-30"),
    updatedAt: new Date("2024-01-30")
  },
  {
    id: 5,
    title: "Lời tiên tri",
    order: 5,
    wordCount: 2900,
    view: 2300,
    isPremium: true,
    price: 15000,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05")
  }
];

export default function ChaptersPage({ params }: { params: { novelId: string } }) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [loading, setLoading] = useState(true)
  const [novelData, setNovelData] = useState<Novel>(novel)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false)
  const ITEMS_PER_PAGE = 10
  
  // Tải dữ liệu chương từ API
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/chapters?novelId=${params.novelId}`)
        
        if (!response.ok) {
          throw new Error(`API trả về lỗi: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Dữ liệu chapters từ API:", data)
        
        // Chuẩn hóa dữ liệu chapters
        const normalizedChapters = Array.isArray(data) ? data.map(chapter => ({
          ...chapter,
          id: chapter._id || chapter.id,
          isPremium: chapter.role === 'vip',
          view: chapter.view || 0,
          wordCount: chapter.wordCount || 0,
          createdAt: chapter.createdAt ? new Date(chapter.createdAt) : new Date(),
          updatedAt: chapter.updatedAt ? new Date(chapter.updatedAt) : new Date()
        })) : []
        
        setChapters(normalizedChapters)
      } catch (error) {
        console.error("Lỗi khi tải danh sách chương:", error)
        // Giữ dữ liệu mẫu trong trường hợp lỗi
      } finally {
        setLoading(false)
      }
    }
    
    fetchChapters()
  }, [params.novelId])

  // Lọc và sắp xếp chương
  const filteredChapters = chapters
    .filter((chapter) => 
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => 
      sortOrder === "asc" 
        ? a.order - b.order 
        : b.order - a.order
    );

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredChapters.length / ITEMS_PER_PAGE);
  
  // Lấy chương cho trang hiện tại
  const paginatedChapters = filteredChapters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Xử lý xóa chương
  const handleDeleteChapter = (id: number | string) => {
    setChapters(chapters.filter((chapter) => (chapter.id || chapter._id) !== id));
  };

  // Xử lý thay đổi thứ tự sắp xếp
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Xử lý mở dialog chỉnh giá
  const handleOpenPriceDialog = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsPriceDialogOpen(true);
  };

  // Xử lý lưu giá chương
  const handleSavePrice = (chapterId: number, isPremium: boolean, price: number) => {
    setChapters(chapters.map((chapter) => 
      (chapter.id === chapterId || chapter._id === chapterId)
        ? { 
            ...chapter, 
            isPremium, 
            role: isPremium ? 'vip' : 'normal',
            price, 
            updatedAt: new Date() 
          } 
        : chapter
    ));
    setIsPriceDialogOpen(false);
    setSelectedChapter(null);
  };

  // Tính tổng doanh thu từ các chương premium
  const totalPremiumRevenue = chapters
    .filter(chapter => chapter.isPremium || chapter.role === 'vip')
    .reduce((sum, chapter) => sum + ((chapter.price || 0) * (chapter.view || 0)), 0);

  // Tính tổng số chương premium
  const totalPremiumChapters = chapters.filter(chapter => chapter.isPremium || chapter.role === 'vip').length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{novelData.title}</h2>
          <p className="text-muted-foreground">Quản lý danh sách các chương</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm chương mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Tổng lượt xem</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{chapters.reduce((sum, chapter) => sum + (chapter.view || 0), 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Doanh thu premium</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(totalPremiumRevenue)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Chương premium</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{totalPremiumChapters} / {chapters.length}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm chương..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" onClick={toggleSortOrder}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {sortOrder === "asc" ? "Cũ nhất trước" : "Mới nhất trước"}
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="min-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Tên chương</TableHead>
                <TableHead>Lượt xem</TableHead>
                <TableHead>Số từ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : paginatedChapters.length > 0 ? (
                paginatedChapters.map((chapter) => (
                  <TableRow key={chapter._id || chapter.id}>
                    <TableCell>{chapter.order}</TableCell>
                    <TableCell className="font-medium">{chapter.title}</TableCell>
                    <TableCell>{(chapter.view || 0).toLocaleString()}</TableCell>
                    <TableCell>{(chapter.wordCount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {chapter.isPremium || chapter.role === 'vip' ? (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                          <Unlock className="h-3 w-3" />
                          Miễn phí
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {chapter.isPremium || chapter.role === 'vip' ? formatCurrency(chapter.price || 0) : "Miễn phí"}
                    </TableCell>
                    <TableCell>{format(chapter.createdAt || new Date(), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenPriceDialog(chapter)}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteChapter(chapter._id || chapter.id || 0)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">Không có chương nào</TableCell>
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

      {/* Dialog chỉnh giá chương */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giá chương</DialogTitle>
          </DialogHeader>
          {selectedChapter && (
            <ChapterPriceForm
              chapterId={selectedChapter.id || Number(selectedChapter._id) || 0}
              chapterTitle={selectedChapter.title}
              novelTitle={novelData.title}
              isPremium={selectedChapter.isPremium || selectedChapter.role === 'vip'}
              currentPrice={selectedChapter.price || 0}
              onSave={handleSavePrice}
              onCancel={() => setIsPriceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 