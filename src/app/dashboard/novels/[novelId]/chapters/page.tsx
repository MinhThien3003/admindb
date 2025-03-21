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
  id: number
  title: string
  order: number
  wordCount: number
  views: number
  isPremium: boolean
  price: number
  createdAt: Date
  updatedAt: Date
}

// Định nghĩa interface cho truyện
interface Novel {
  id: number
  title: string
  author: string
  coverImage: string
  description: string
  status: string
  totalChapters: number
  totalViews: number
  totalRevenue: number
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
    views: 3200,
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
    views: 2900,
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
    views: 2700,
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
    views: 2500,
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
    views: 2300,
    isPremium: true,
    price: 15000,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05")
  },
  {
    id: 6,
    title: "Đối mặt thử thách",
    order: 6,
    wordCount: 3200,
    views: 2100,
    isPremium: true,
    price: 20000,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10")
  },
  {
    id: 7,
    title: "Bí mật được hé lộ",
    order: 7,
    wordCount: 3400,
    views: 1900,
    isPremium: true,
    price: 20000,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15")
  },
  {
    id: 8,
    title: "Kết thúc hành trình",
    order: 8,
    wordCount: 3800,
    views: 1800,
    isPremium: true,
    price: 25000,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20")
  },
  {
    id: 9,
    title: "Khám phá mới",
    order: 9,
    wordCount: 3000,
    views: 1600,
    isPremium: true,
    price: 25000,
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-02-25")
  },
  {
    id: 10,
    title: "Phần kết",
    order: 10,
    wordCount: 4000,
    views: 1500,
    isPremium: true,
    price: 30000,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01")
  }
];

export default function ChaptersPage({ params }: { params: { novelId: string } }) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false)
  const ITEMS_PER_PAGE = 5

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
  const handleDeleteChapter = (id: number) => {
    setChapters(chapters.filter((chapter) => chapter.id !== id));
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
      chapter.id === chapterId 
        ? { ...chapter, isPremium, price, updatedAt: new Date() } 
        : chapter
    ));
    setIsPriceDialogOpen(false);
    setSelectedChapter(null);
  };

  // Tính tổng doanh thu từ các chương premium
  const totalPremiumRevenue = chapters
    .filter(chapter => chapter.isPremium)
    .reduce((sum, chapter) => sum + (chapter.price * chapter.views), 0);

  // Tính tổng số chương premium
  const totalPremiumChapters = chapters.filter(chapter => chapter.isPremium).length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{novel.title}</h2>
          <p className="text-muted-foreground">Tác giả: {novel.author}</p>
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
          <p className="mt-1 text-2xl font-bold">{novel.totalViews.toLocaleString()}</p>
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
              {paginatedChapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell>{chapter.order}</TableCell>
                  <TableCell className="font-medium">{chapter.title}</TableCell>
                  <TableCell>{chapter.views.toLocaleString()}</TableCell>
                  <TableCell>{chapter.wordCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {chapter.isPremium ? (
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
                    {chapter.isPremium ? formatCurrency(chapter.price) : "Miễn phí"}
                  </TableCell>
                  <TableCell>{format(chapter.createdAt, "dd/MM/yyyy")}</TableCell>
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
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedChapters.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedChapters.length).fill(0).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell colSpan={8}>&nbsp;</TableCell>
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

      {/* Dialog chỉnh giá chương */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giá chương</DialogTitle>
          </DialogHeader>
          {selectedChapter && (
            <ChapterPriceForm
              chapterId={selectedChapter.id}
              chapterTitle={selectedChapter.title}
              novelTitle={novel.title}
              isPremium={selectedChapter.isPremium}
              currentPrice={selectedChapter.price}
              onSave={handleSavePrice}
              onCancel={() => setIsPriceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 