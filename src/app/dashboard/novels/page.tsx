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
import { Search, Trash2, Eye, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useNovels } from "@/hooks/use-novels"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"

// Định nghĩa interface cho Novel
interface Novel {
  _id: string;
  idCategories: Array<{_id: string; titleCategory: string}> | string[];
  idUser: {
    _id: string;
    username: string;
    name?: string;
  } | string;
  title: string;
  description: string;
  view: number;
  imageUrl: string;
  rate: number;
  status: "ongoing" | "completed";
  createdAt: string;
  updatedAt?: string;
}

export default function NovelsPage() {
  const { novels, fetchNovels, isLoading, deleteNovel } = useNovels()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
  const formatRating = (rate: number | undefined) => {
    const rating = rate || 0;
    return (
      <div className="flex items-center justify-end w-full">
        <Star className="h-4 w-4 text-yellow-400 mr-1" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Hàm xử lý xóa tiểu thuyết
  const handleDelete = async (id: string) => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn xóa tiểu thuyết này?')) {
        const success = await deleteNovel(id);
        if (!success) {
          toast.error('Không thể xóa tiểu thuyết. Vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      console.error('Lỗi khi xóa tiểu thuyết:', error);
      toast.error('Đã xảy ra lỗi khi xóa tiểu thuyết');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Danh sách tiểu thuyết</h2>
      </div>

        <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-3">
          <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số tiểu thuyết</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(novels) ? novels.length : 0}</div>
          </CardContent>
        </Card>
          <Card className="col-span-1">
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
          <Card className="col-span-1">
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
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 p-4 md:p-6">
                <div className="flex-1 w-full md:w-auto md:max-w-[440px]">
                  <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm tiểu thuyết..."
                      className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                </div>
                <div>
            <select 
                    className="w-full md:w-[180px] h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
                    <option value="all">Tất cả trạng thái</option>
              <option value="ongoing">Đang cập nhật</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
        </div>
              <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                      <TableHead className="min-w-[400px]">Tiểu thuyết</TableHead>
                      <TableHead className="min-w-[150px]">Tác giả</TableHead>
                      <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                      <TableHead className="text-right min-w-[100px]">Lượt xem</TableHead>
                      <TableHead className="text-right min-w-[100px]">Đánh giá</TableHead>
                      <TableHead className="text-right min-w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNovels && Array.isArray(paginatedNovels) && paginatedNovels.filter(novel => novel != null).map((novel) => (
                <TableRow key={novel._id || Math.random().toString()}>
                  <TableCell className="font-medium">
                          <div className="flex items-center space-x-4">
                            <div className="relative h-20 w-14 overflow-hidden rounded-md">
                        {novel.imageUrl && (
                          <Image
                            src={novel.imageUrl}
                            alt={novel.title}
                                  fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{novel.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {novel.description || ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                          {typeof novel.idUser === 'object' && novel.idUser ? 
                      (novel.idUser.name || novel.idUser.username) : 
                      'Chưa có tác giả'
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(novel.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                            {(novel.view || 0).toLocaleString()}
                    </div>
                  </TableCell>
                        <TableCell className="text-right">{formatRating(novel.rate)}</TableCell>
                  <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <Link href={`/dashboard/novels/${novel._id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Xem chi tiết</span>
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(novel._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Xóa</span>
                        </Button>
                          </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
            </CardContent>
          </Card>

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
    </div>
  );
}