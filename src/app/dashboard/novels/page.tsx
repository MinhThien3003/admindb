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
import { Search, Trash2, Plus, Edit, Eye, MoreHorizontal, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useNovels } from "@/hooks/use-novels"
import { useAuth } from "@/hooks/use-auth"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
/* eslint-disable @typescript-eslint/no-unused-vars */
interface Novel {
  _id?: string;
  id?: number;
  idCategories?: Array<{_id: string; name: string}> | string[];
  idUser?: {
    _id: string;
    username: string;
    name?: string;
  } | string;
  title: string;
  image?: string;
  imageUrl?: string;
  categories?: string[];
  chapters?: Chapter[];
  views?: number;
  view?: number;
  createdAt: string;
  updatedAt?: string;
  description: string;
  averageRating?: number; // Điểm trung bình của truyện
  rate?: number;
  totalRatings?: number; // Tổng số lượt đánh giá
  status: NovelStatus | string; // Trạng thái truyện
}
/* eslint-enable @typescript-eslint/no-unused-vars */

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const starsToPoints = (stars: number) => {
  return (stars / 5) * 10;
};

// Hàm tạo mảng sao dựa trên điểm đánh giá
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Danh sách thể loại mẫu để sử dụng với NovelEditDialog
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const novelCategories = [
  "Tiên Hiệp",
  "Kiếm Hiệp",
  "Ngôn Tình",
  "Đô Thị",
  "Huyền Huyễn",
  "Dị Giới",
  "Khoa Huyễn",
  "Kỳ Ảo",
  "Võng Du",
  "Lịch Sử",
  "Quân Sự",
  "Trinh Thám",
  "Xuyên Không",
  "Trọng Sinh",
  "Mạt Thế",
  "Cổ Đại",
  "Hiện Đại",
  "Huyền Nghi"
]

export default function NovelsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { novels, fetchNovels, isLoading, addNovel, updateNovel, deleteNovel } = useNovels()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNovelAddDialog, setShowNovelAddDialog] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNovelEditDialog, setShowNovelEditDialog] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const itemsPerPage = 5

  // Lấy danh sách tiểu thuyết khi trang được tải
  useEffect(() => {
    if (user) {
      fetchNovels();
    }
  }, [fetchNovels, user]);

  // Lọc tiểu thuyết theo tìm kiếm và trạng thái
  const filteredNovels = Array.isArray(novels) 
    ? novels
        .filter(novel => 
          novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          novel.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(novel => statusFilter === 'all' || novel.status === statusFilter)
    : [];

  // Phân trang
  const totalPages = Math.ceil(filteredNovels.length / itemsPerPage);
  const paginatedNovels = filteredNovels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm xử lý xóa tiểu thuyết
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tiểu thuyết này?')) {
      await deleteNovel(id);
    }
  };

  // Format trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đang cập nhật</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Hoàn thành</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format đánh giá sao
  const formatRating = (rate: number) => {
    return (
      <div className="flex items-center justify-end w-full">
        <Star className="h-4 w-4 text-yellow-400 mr-1" />
        <span>{rate.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý tiểu thuyết</h2>
        <Button>
          <Link href="/dashboard/novels/add" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tiểu thuyết
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số tiểu thuyết</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(novels) ? novels.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đang cập nhật</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(novels) ? novels.filter(novel => novel.status === 'ongoing').length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(novels) ? novels.filter(novel => novel.status === 'completed').length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm tiểu thuyết..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="border rounded px-3 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="ongoing">Đang cập nhật</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiểu thuyết</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Lượt xem</TableHead>
                <TableHead className="text-right">Đánh giá</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNovels && Array.isArray(paginatedNovels) && paginatedNovels.filter(novel => novel != null).map((novel) => (
                <TableRow key={novel._id || Math.random().toString()}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-10 overflow-hidden rounded">
                        {novel.imageUrl && (
                          <Image
                            src={novel.imageUrl}
                            alt={novel.title}
                            width={40}
                            height={48}
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{novel.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {novel.description?.substring(0, 50) || ''}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeof novel.idUser === 'object' ? 
                      (novel.idUser.name || novel.idUser.username) : 
                      'Chưa có tác giả'
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(novel.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      {novel.view ? novel.view.toLocaleString() : 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{novel.rate ? formatRating(novel.rate) : formatRating(0)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/dashboard/novels/${novel._id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Chi tiết</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/dashboard/novels/${novel._id}/edit`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Chỉnh sửa</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(novel._id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}