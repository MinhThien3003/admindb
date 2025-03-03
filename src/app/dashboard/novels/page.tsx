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
import { Search, Trash2, Plus, Edit2, Star, Clock, CheckCircle, XCircle, Calendar } from "lucide-react"
import { NovelForm } from "@/components/dashboard/novel-form"
import { Pagination } from "@/components/ui/pagination"
import { RatingDetails } from "@/components/dashboard/rating-details"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

// Định nghĩa enum cho trạng thái truyện
export enum NovelStatus {
  ONGOING = "ongoing",
  COMPLETED = "completed",
  DROPPED = "dropped"
}

// Định nghĩa interface cho Rating
interface Rating {
  userId: number;
  username: string;
  stars: number; // 1-5 sao
  comment?: string;
  createdAt: string;
}

// Định nghĩa interface cho Chapter
interface Chapter {
  title: string;
  content: string;
  price?: number;
  isPremium?: boolean;
  ratings?: Rating[]; // Thêm mảng đánh giá cho mỗi chương
}

// Định nghĩa interface cho Novel
interface Novel {
  id: number;
  name: string;
  image: string;
  categories: string[];
  chapters: Chapter[];
  views: number;
  createdAt: string;
  description: string;
  averageRating?: number; // Điểm trung bình của truyện
  totalRatings?: number; // Tổng số lượt đánh giá
  status: NovelStatus; // Trạng thái truyện
}

// Temporary data - replace with actual data fetching
const initialNovels: Novel[] = [
  { 
    id: 1, 
    name: "The Lost Kingdom", 
    image: "/images/novels/lost-kingdom.jpg",
    categories: ["Fantasy", "Adventure"],
    chapters: [
      { 
        title: "Chapter 1", 
        content: "Content of Chapter 1", 
        isPremium: false,
        ratings: [
          { userId: 1, username: "user1", stars: 5, comment: "Tuyệt vời!", createdAt: "2023-05-10" },
          { userId: 2, username: "user2", stars: 4, comment: "Hay lắm", createdAt: "2023-05-11" },
          { userId: 3, username: "user3", stars: 5, comment: "Quá đỉnh", createdAt: "2023-05-12" },
          { userId: 4, username: "user4", stars: 4, comment: "Rất thú vị", createdAt: "2023-05-13" },
          { userId: 5, username: "user5", stars: 5, comment: "Không thể tin được", createdAt: "2023-05-14" }
        ]
      }, 
      { 
        title: "Chapter 2", 
        content: "Content of Chapter 2", 
        isPremium: true, 
        price: 5,
        ratings: [
          { userId: 1, username: "user1", stars: 4, comment: "Hay", createdAt: "2023-05-15" },
          { userId: 2, username: "user2", stars: 5, comment: "Tuyệt vời", createdAt: "2023-05-16" },
          { userId: 3, username: "user3", stars: 3, comment: "Bình thường", createdAt: "2023-05-17" },
          { userId: 4, username: "user4", stars: 4, comment: "Khá hay", createdAt: "2023-05-18" },
          { userId: 5, username: "user5", stars: 4, comment: "Tốt", createdAt: "2023-05-19" }
        ]
      }
    ], 
    views: 12500, 
    createdAt: "2022-01-01", 
    description: "An epic tale of adventure.",
    averageRating: 4.3,
    totalRatings: 10,
    status: NovelStatus.ONGOING
  },
  { 
    id: 2, 
    name: "Eternal Flame", 
    image: "/images/novels/eternal-flame.jpg",
    categories: ["Romance", "Drama"],
    chapters: [
      { 
        title: "Chapter 1", 
        content: "Content of Chapter 1", 
        isPremium: false,
        ratings: [
          { userId: 1, username: "user1", stars: 5, comment: "Cảm động quá", createdAt: "2023-06-10" },
          { userId: 2, username: "user2", stars: 5, comment: "Rất hay", createdAt: "2023-06-11" },
          { userId: 3, username: "user3", stars: 4, comment: "Thú vị", createdAt: "2023-06-12" },
          { userId: 4, username: "user4", stars: 5, comment: "Tuyệt vời", createdAt: "2023-06-13" },
          { userId: 5, username: "user5", stars: 4, comment: "Hay", createdAt: "2023-06-14" }
        ]
      },
      { 
        title: "Chapter 2", 
        content: "Content of Chapter 2", 
        isPremium: true, 
        price: 3,
        ratings: [
          { userId: 1, username: "user1", stars: 3, comment: "Bình thường", createdAt: "2023-06-15" },
          { userId: 2, username: "user2", stars: 4, comment: "Khá hay", createdAt: "2023-06-16" },
          { userId: 3, username: "user3", stars: 3, comment: "Tạm được", createdAt: "2023-06-17" },
          { userId: 4, username: "user4", stars: 4, comment: "Thú vị", createdAt: "2023-06-18" },
          { userId: 5, username: "user5", stars: 3, comment: "Ổn", createdAt: "2023-06-19" }
        ]
      }
    ], 
    views: 8900, 
    createdAt: "2022-02-15", 
    description: "A story of love and sacrifice.",
    averageRating: 4.0,
    totalRatings: 10,
    status: NovelStatus.COMPLETED
  },
  { 
    id: 3, 
    name: "Shadow Walker", 
    image: "/novels/shadow-walker.jpg",
    categories: ["Mystery", "Horror"],
    chapters: [
      { 
        title: "Chapter 1", 
        content: "Content of Chapter 1",
        ratings: [
          { userId: 1, username: "user1", stars: 4, createdAt: "2023-07-10" },
          { userId: 2, username: "user2", stars: 3, createdAt: "2023-07-11" },
          { userId: 3, username: "user3", stars: 4, createdAt: "2023-07-12" },
          { userId: 4, username: "user4", stars: 3, createdAt: "2023-07-13" },
          { userId: 5, username: "user5", stars: 4, createdAt: "2023-07-14" }
        ]
      }
    ],
    views: 7800, 
    createdAt: "2022-03-01", 
    description: "A supernatural mystery.",
    averageRating: 3.6,
    totalRatings: 5,
    status: NovelStatus.DROPPED
  },
  { 
    id: 4, 
    name: "Digital Dreams", 
    image: "/novels/digital-dreams.jpg",
    categories: ["Sci-fi", "Adventure"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 9200, 
    createdAt: "2022-03-15", 
    description: "A cyberpunk adventure.",
    status: NovelStatus.ONGOING
  },
  { 
    id: 5, 
    name: "Heart's Echo", 
    image: "/novels/hearts-echo.jpg",
    categories: ["Romance", "Drama"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 11300, 
    createdAt: "2022-04-01", 
    description: "A touching love story.",
    status: NovelStatus.ONGOING
  },
  { 
    id: 6, 
    name: "Dragon's Call", 
    image: "/novels/dragons-call.jpg",
    categories: ["Fantasy", "Action"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 13400, 
    createdAt: "2022-04-15", 
    description: "A dragon tamer's journey.",
    status: NovelStatus.ONGOING
  },
  { 
    id: 7, 
    name: "Urban Legends", 
    image: "/novels/urban-legends.jpg",
    categories: ["Horror", "Mystery"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 8700, 
    createdAt: "2022-05-01", 
    description: "Modern horror stories.",
    status: NovelStatus.DROPPED
  },
  { 
    id: 8, 
    name: "Time Travelers", 
    image: "/novels/time-travelers.jpg",
    categories: ["Sci-fi", "Adventure"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 10200, 
    createdAt: "2022-05-15", 
    description: "A journey through time.",
    status: NovelStatus.ONGOING
  },
  { 
    id: 9, 
    name: "School Days", 
    image: "/novels/school-days.jpg",
    categories: ["Slice of Life", "Comedy"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 9500, 
    createdAt: "2022-06-01", 
    description: "Hilarious school adventures.",
    status: NovelStatus.COMPLETED
  },
  { 
    id: 10, 
    name: "Warrior's Path", 
    image: "/novels/warriors-path.jpg",
    categories: ["Action", "Fantasy"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 14200, 
    createdAt: "2022-06-15", 
    description: "A martial arts epic.",
    status: NovelStatus.ONGOING
  },
  { 
    id: 11, 
    name: "Ocean's Heart", 
    image: "/novels/oceans-heart.jpg",
    categories: ["Adventure", "Romance"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 12100, 
    createdAt: "2022-07-01", 
    description: "A seafaring romance.",
    status: NovelStatus.COMPLETED
  },
  { 
    id: 12, 
    name: "Night Watch", 
    image: "/novels/night-watch.jpg",
    categories: ["Mystery", "Action"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 11800, 
    createdAt: "2022-07-15", 
    description: "A detective's story.",
    status: NovelStatus.ONGOING
  }
]

// Hàm tính điểm trung bình của một chương (giữ lại nhưng đánh dấu là đã sử dụng)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateChapterRating = (ratings: Rating[] = []) => {
  if (ratings.length === 0) return 0;
  const totalStars = ratings.reduce((sum, rating) => sum + rating.stars, 0);
  return parseFloat((totalStars / ratings.length).toFixed(1));
};

// Hàm tính điểm trung bình của một truyện (giữ lại nhưng đánh dấu là đã sử dụng)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateNovelRating = (chapters: Chapter[] = []) => {
  let totalStars = 0;
  let totalRatings = 0;
  
  chapters.forEach(chapter => {
    if (chapter.ratings && chapter.ratings.length > 0) {
      totalStars += chapter.ratings.reduce((sum, rating) => sum + rating.stars, 0);
      totalRatings += chapter.ratings.length;
    }
  });
  
  if (totalRatings === 0) return 0;
  return parseFloat((totalStars / totalRatings).toFixed(1));
};

// Hàm chuyển đổi số sao sang điểm (5 sao = 10 điểm)
const starsToPoints = (stars: number) => {
  return (stars / 5) * 10;
};

// Hàm tạo mảng sao dựa trên điểm đánh giá
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }

  if (hasHalfStar) {
    stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 fill-half" />);
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }

  return stars;
};

// Hàm hiển thị trạng thái truyện
const renderNovelStatus = (status: NovelStatus) => {
  switch (status) {
    case NovelStatus.ONGOING:
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          Đang tiến hành
        </Badge>
      );
    case NovelStatus.COMPLETED:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Hoàn thành
        </Badge>
      );
    case NovelStatus.DROPPED:
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Đã drop
        </Badge>
      );
    default:
      return null;
  }
};

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>(initialNovels)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [showRatingDetails, setShowRatingDetails] = useState(false)
  const [selectedNovelForRating, setSelectedNovelForRating] = useState<Novel | null>(null)
  const [statusFilter, setStatusFilter] = useState<NovelStatus | "all">("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const ITEMS_PER_PAGE = 10

  const filteredNovels = novels.filter((novel) => {
    const matchesSearch = novel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || novel.status === statusFilter;
    
    // Lọc theo ngày
    let matchesDate = true;
    if (dateRange?.from) {
      const novelDate = new Date(novel.createdAt);
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = novelDate >= fromDate && novelDate <= toDate;
      } else {
        matchesDate = novelDate >= fromDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  })

  const totalPages = Math.ceil(filteredNovels.length / ITEMS_PER_PAGE)
  const paginatedNovels = filteredNovels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = (id: number) => {
    setNovels(novels.filter((novel) => novel.id !== id))
  }

  const handleEdit = (novel: Novel) => {
    setSelectedNovel(novel)
    setSelectedChapter(novel.chapters[0])
  }

  const handleClose = () => {
    setSelectedNovel(null)
    setSelectedChapter(null)
  }

  const handleSubmit = (data: Partial<Novel>, isEdit: boolean = false) => {
    if (isEdit && selectedNovel) {
      setNovels(novels.map((novel) => 
        novel.id === selectedNovel.id ? { ...novel, ...data } : novel
      ));
      handleClose();
    } else {
      // Thêm novel mới
      const newNovel: Novel = {
        id: novels.length + 1,
        name: data.name || "",
        image: data.image || "",
        categories: data.categories || [],
        chapters: data.chapters || [{ title: "Chapter 1", content: "" }],
        views: 0,
        createdAt: new Date().toISOString().split('T')[0],
        description: data.description || "",
        averageRating: 0,
        totalRatings: 0,
        status: data.status || NovelStatus.ONGOING
      };
      setNovels([...novels, newNovel]);
    }
  }

  const handleViewRatings = (novel: Novel) => {
    setSelectedNovelForRating(novel);
    setShowRatingDetails(true);
  }

  const handleStatusChange = (status: NovelStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  }

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange(undefined);
    setCurrentPage(1);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Truyện</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm truyện
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm truyện mới</DialogTitle>
            </DialogHeader>
            <NovelForm
              initialData={{
                id: novels.length + 1,
                name: "",
                image: "",
                categories: [],
                chapters: [{ title: "Chapter 1", content: "" }],
                views: 0,
                createdAt: new Date().toISOString().split('T')[0],
                description: "",
                status: NovelStatus.ONGOING
              }}
              selectedChapter={{ title: "Chapter 1", content: "" }}
              onChapterChange={() => {}}
              onSubmit={(data) => handleSubmit(data)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm truyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex-1 max-w-sm">
            <DatePickerWithRange 
              date={dateRange} 
              onDateChange={handleDateRangeChange} 
            />
          </div>
          
          {(searchQuery || statusFilter !== "all" || dateRange) && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-10"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange("all")}
          >
            Tất cả
          </Button>
          <Button 
            variant={statusFilter === NovelStatus.ONGOING ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange(NovelStatus.ONGOING)}
            className={statusFilter === NovelStatus.ONGOING ? "" : "text-blue-600"}
          >
            <Clock className="h-4 w-4 mr-1" />
            Đang tiến hành
          </Button>
          <Button 
            variant={statusFilter === NovelStatus.COMPLETED ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange(NovelStatus.COMPLETED)}
            className={statusFilter === NovelStatus.COMPLETED ? "" : "text-green-600"}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Hoàn thành
          </Button>
          <Button 
            variant={statusFilter === NovelStatus.DROPPED ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange(NovelStatus.DROPPED)}
            className={statusFilter === NovelStatus.DROPPED ? "" : "text-red-600"}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Đã drop
          </Button>
        </div>
        
        {dateRange && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Lọc từ ngày: {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: vi }) : ''}
              {dateRange.to ? ` đến ${format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <div className="min-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên truyện</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Chương</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Lượt xem</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNovels.map((novel) => (
                <TableRow key={novel.id}>
                  <TableCell>{novel.id}</TableCell>
                  <TableCell className="font-medium">{novel.name}</TableCell>
                  <TableCell>{renderNovelStatus(novel.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{novel.chapters.length} chương</span>
                      <span className="text-xs text-muted-foreground">
                        {novel.chapters.filter(chapter => chapter.isPremium).length} chương trả phí
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(novel.averageRating || 0)}
                        </div>
                        <span className="text-sm font-medium">
                          {novel.averageRating || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {novel.totalRatings || 0} đánh giá
                        </span>
                        <span className="text-xs text-blue-500">
                          {starsToPoints(novel.averageRating || 0).toFixed(1)}/10 điểm
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-1 text-blue-500 hover:text-blue-700 p-0 h-auto"
                        onClick={() => handleViewRatings(novel)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{novel.views.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(novel.createdAt), 'dd/MM/yyyy', { locale: vi })}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(novel)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(novel.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedNovels.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedNovels.length).fill(0).map((_, index) => (
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

      {/* Dialog for editing novel */}
      <Dialog open={!!selectedNovel} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Truyện</DialogTitle>
          </DialogHeader>
          {selectedNovel && (
            <NovelForm
              initialData={selectedNovel}
              selectedChapter={selectedChapter}
              onChapterChange={setSelectedChapter}
              onSubmit={(data: Partial<Novel>) => {
                setNovels(novels.map((novel) => 
                  novel.id === selectedNovel.id ? { ...novel, ...data } : novel
                ));
                handleClose();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for viewing ratings */}
      <Dialog open={showRatingDetails} onOpenChange={setShowRatingDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá - {selectedNovelForRating?.name}</DialogTitle>
          </DialogHeader>
          {selectedNovelForRating && (
            <RatingDetails novel={selectedNovelForRating} />
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .fill-half {
          mask-image: linear-gradient(to right, #000 50%, transparent 50%);
        }
      `}</style>
    </div>
  )
}