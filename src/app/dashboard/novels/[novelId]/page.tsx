"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Star, Clock, CheckCircle, Edit, ArrowLeft, Eye, Bookmark, Lock, Unlock, Plus, Pencil, Save, FileText, Hash, Type, CreditCard, BookOpenText, ImageIcon, Trash2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Định nghĩa các keyframes animation
const styles = `
  @keyframes shake {
    0% { transform: translateX(0); }
    10%, 90% { transform: translateX(-1px); }
    20%, 80% { transform: translateX(2px); }
    30%, 50%, 70% { transform: translateX(-3px); }
    40%, 60% { transform: translateX(3px); }
    100% { transform: translateX(0); }
  }
  
  @keyframes appear {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-shake {
    animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
  }
  
  .animate-appear {
    animation: appear 0.2s ease-out forwards;
  }
  
  .delete-button-hover:hover {
    animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
  }
`;

// Interface cho Novel
interface Novel {
  _id: string;
  idCategories: Array<{_id: string; name: string}> | string[];
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

// Interface cho Chapter
interface Chapter {
  _id?: string;
  id?: number;
  idNovel?: string;
  title: string;
  order: number;
  wordCount?: number;
  view?: number;
  role?: string;
  isPremium?: boolean;
  price?: number;
  createdAt?: Date;
  updatedAt?: Date;
  imageUrl?: string;
  content?: string;
}

export default function NovelDetailsPage({ params }: { params: { novelId: string } }) {
  const router = useRouter()
  const novelId = params.novelId;
  const [novel, setNovel] = useState<Novel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loadingChapters, setLoadingChapters] = useState(false)
  
  // State để chỉnh sửa chương
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null)

  // Tải thông tin chi tiết novel từ API
  useEffect(() => {
    async function fetchNovelData() {
      if (!novelId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/novels/${novelId}`);
        
        if (!response.ok) {
          throw new Error(`API trả về lỗi: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Novel data from API:', data);
        
        setNovel(data);
      } catch (error) {
        console.error('Lỗi khi tải thông tin novel:', error);
        setError('Không thể tải thông tin novel. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNovelData();
  }, [novelId]);

  // Tải danh sách các chương khi tab "chapters" được chọn
  useEffect(() => {
    async function fetchChaptersEffect() {
      if (activeTab === "chapters" && novelId) {
        fetchChapters();
      }
    }
    
    fetchChaptersEffect();
  }, [activeTab, novelId]);
  
  // Tái sử dụng hàm fetchChapters
  const fetchChapters = async () => {
    if (!novelId) return;
    
    try {
      setLoadingChapters(true);
      const response = await fetch(`/api/chapters?novelId=${novelId}`);
      
      if (!response.ok) {
        throw new Error(`API trả về lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Dữ liệu chapters từ API:", data);
      
      // Chuẩn hóa dữ liệu chapters
      const normalizedChapters = Array.isArray(data) ? data.map(chapter => ({
        ...chapter,
        id: chapter._id || chapter.id,
        isPremium: chapter.role === 'vip',
        imageUrl: chapter.imageUrl || '',
        view: chapter.view || 0,
        price: chapter.price || 0,
        createdAt: chapter.createdAt ? new Date(chapter.createdAt) : new Date(),
        updatedAt: chapter.updatedAt ? new Date(chapter.updatedAt) : new Date()
      })) : [];
      
      // API đã lọc các chương thuộc về novel hiện tại, nhưng vẫn kiểm tra thêm để đảm bảo
      const filteredChapters = normalizedChapters.filter(chapter => 
        chapter.idNovel === novelId || 
        (typeof chapter.idNovel === 'object' && chapter.idNovel?._id === novelId)
      );
      
      console.log(`Tìm thấy ${filteredChapters.length} chương thuộc về truyện ID: ${novelId}`);
      
      // Sắp xếp theo thứ tự chương
      filteredChapters.sort((a, b) => a.order - b.order);
      
      setChapters(filteredChapters);
    } catch (error) {
      console.error("Lỗi khi tải danh sách chương:", error);
    } finally {
      setLoadingChapters(false);
    }
  };

  // Hàm định dạng số tiền
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Đang cập nhật
          </div>
        )
      case 'completed':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </div>
        )
    }
  }

  // Hàm mở dialog chỉnh sửa
  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter({...chapter})
    setShowEditDialog(true)
  }
  
  // Hàm cập nhật trường của chương đang chỉnh sửa
  const handleUpdateChapterField = (field: string, value: string | number | boolean) => {
    if (editingChapter) {
      setEditingChapter({
        ...editingChapter,
        [field]: value
      })
    }
  }
  
  // Hàm lưu chương đã chỉnh sửa
  const handleSaveChapter = async () => {
    if (!editingChapter || !editingChapter._id) return;
    
    try {
      setIsEditing(true);
      
      // Chuẩn bị dữ liệu để gửi lên server
      const chapterData = {
        title: editingChapter.title,
        order: editingChapter.order,
        role: editingChapter.role || (editingChapter.isPremium ? 'vip' : 'normal'),
        price: editingChapter.isPremium ? editingChapter.price : 0,
        imageUrl: editingChapter.imageUrl,
        content: editingChapter.content
      };
      
      console.log('Đang gửi dữ liệu cập nhật chương:', chapterData);
      
      // Gửi request PUT để cập nhật chương
      const response = await fetch(`/api/chapters/${editingChapter._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chapterData)
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Không thể cập nhật chương. Lỗi: ${response.status} - ${text}`);
      }
      
      const updatedChapter = await response.json();
      console.log('Đã cập nhật chương thành công:', updatedChapter);
      
      // Cập nhật lại danh sách chương
      await fetchChapters();
      
      // Đóng dialog
      setShowEditDialog(false);
      setEditingChapter(null);
      
      // Hiển thị thông báo thành công
      alert('Đã cập nhật chương thành công!');
      
    } catch (error) {
      console.error('Lỗi khi cập nhật chương:', error);
      alert('Không thể cập nhật chương. Vui lòng thử lại sau.');
    } finally {
      setIsEditing(false);
    }
  };

  // Hàm mở dialog xóa chương
  const handleDeleteChapter = (chapter: Chapter) => {
    setChapterToDelete(chapter)
    setShowDeleteDialog(true)
  }
  
  // Hàm xác nhận xóa chương
  const confirmDeleteChapter = async () => {
    if (!chapterToDelete || !chapterToDelete._id) return;
    
    try {
      setIsDeleting(true);
      
      console.log('Đang xóa chương có ID:', chapterToDelete._id);
      
      // Gửi request DELETE để xóa chương
      const response = await fetch(`/api/chapters/${chapterToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Không thể xóa chương. Lỗi: ${response.status} - ${text}`);
      }
      
      console.log('Đã xóa chương thành công');
      
      // Cập nhật lại danh sách chương
      await fetchChapters();
      
      // Đóng dialog
      setShowDeleteDialog(false);
      setChapterToDelete(null);
      
      // Hiển thị thông báo thành công
      alert('Đã xóa chương thành công!');
      
    } catch (error) {
      console.error('Lỗi khi xóa chương:', error);
      alert('Không thể xóa chương. Vui lòng thử lại sau.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Đang tải thông tin tiểu thuyết...</p>
      </div>
    )
  }

  if (error || !novel) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-xl">{error || 'Không tìm thấy thông tin tiểu thuyết'}</p>
        <Button onClick={() => router.push('/dashboard/novels')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Thêm style cho animations */}
      <style jsx global>{styles}</style>
      
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard/novels')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm chương mới
          </Button>
          <Button variant="outline">
            <Link href={`/dashboard/novels/${novel._id}/edit`} className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative h-60 w-40 overflow-hidden rounded-md shadow-md mb-4">
                  {novel.imageUrl ? (
                    <Image
                      src={novel.imageUrl}
                      alt={novel.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-center mb-2">{novel.title}</h2>
                {getStatusBadge(novel.status)}
                
                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <Eye className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-sm text-muted-foreground">Lượt xem</span>
                    <span className="font-bold">{novel.view?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <Star className="h-5 w-5 text-yellow-500 mb-1" />
                    <span className="text-sm text-muted-foreground">Đánh giá</span>
                    <span className="font-bold">{novel.rate?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md col-span-2">
                    <Bookmark className="h-5 w-5 text-purple-500 mb-1" />
                    <span className="text-sm text-muted-foreground">Tác giả</span>
                    <span className="font-bold text-center">
                      {typeof novel.idUser === 'object' ? 
                        (novel.idUser.name || novel.idUser.username) : 
                        'Chưa có tác giả'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-3/4">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="chapters">Danh sách chương</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết tiểu thuyết</CardTitle>
                  <CardDescription>
                    Tạo lúc: {new Date(novel.createdAt).toLocaleDateString('vi-VN')}
                    {novel.updatedAt && ` | Cập nhật: ${new Date(novel.updatedAt).toLocaleDateString('vi-VN')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Mô tả</h3>
                      <p className="mt-1 whitespace-pre-wrap">{novel.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Thể loại</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {novel.idCategories && Array.isArray(novel.idCategories) && novel.idCategories.length > 0 ? (
                          novel.idCategories.map((category, index) => {
                            // Kiểm tra cấu trúc dữ liệu thể loại
                            const categoryName = typeof category === 'object' && category !== null
                              ? (category.name || '') 
                              : String(category);
                              
                            return (
                              <div 
                                key={typeof category === 'object' && category !== null ? (category._id || index) : index}
                                className="px-3 py-1 rounded-full bg-gray-100 text-gray-800"
                              >
                                {categoryName}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-muted-foreground">Chưa có thể loại nào</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="chapters" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách chương</CardTitle>
                  <CardDescription>
                    Tổng số: {chapters.length} chương | Premium: {chapters.filter(ch => ch.isPremium || ch.role === 'vip').length} chương
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingChapters ? (
                    <div className="flex justify-center items-center h-40">
                      <p>Đang tải danh sách chương...</p>
                    </div>
                  ) : chapters.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên chương</TableHead>
                            <TableHead>Lượt xem</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chapters.map((chapter) => (
                            <TableRow key={chapter._id || chapter.id}>
                              <TableCell>{chapter.order}</TableCell>
                              <TableCell className="font-medium">{chapter.title}</TableCell>
                              <TableCell>{(chapter.view || 0).toLocaleString()}</TableCell>
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
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditChapter(chapter)}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Chỉnh sửa chương</span>
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteChapter(chapter)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Xóa chương</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10 border rounded-md">
                      <p className="text-muted-foreground">Chưa có chương nào</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm chương mới
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Chỉnh sửa chương
            </DialogTitle>
            <DialogDescription className="text-base">
              Chỉnh sửa thông tin của chương. Nhấn Lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          
          {editingChapter && (
            <div className="grid gap-6 py-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cột thông tin cơ bản */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
                      <Type className="h-4 w-4 text-slate-500" />
                      Tiêu đề <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={editingChapter.title}
                      onChange={(e) => handleUpdateChapterField('title', e.target.value)}
                      className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-base font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4 text-slate-500" />
                      Số thứ tự <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      value={editingChapter.order}
                      onChange={(e) => handleUpdateChapterField('order', parseInt(e.target.value) || 0)}
                      className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-base font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      Loại chương <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={editingChapter.role || (editingChapter.isPremium ? 'vip' : 'normal')}
                      onValueChange={(value) => {
                        handleUpdateChapterField('role', value);
                        handleUpdateChapterField('isPremium', value === 'vip');
                      }}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus-visible:ring-primary">
                        <SelectValue placeholder="Chọn loại chương" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">
                          <div className="flex items-center gap-2">
                            <Unlock className="h-4 w-4 text-green-500" />
                            <span>Miễn phí</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="vip">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-orange-500" />
                            <span>Premium (VIP)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(editingChapter.role === 'vip' || editingChapter.isPremium) && (
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-base font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-500" />
                        Giá (VND)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={editingChapter.price || 0}
                        onChange={(e) => handleUpdateChapterField('price', parseInt(e.target.value) || 0)}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-base font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                      Ảnh banner
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="imageUrl"
                        value={editingChapter.imageUrl || ''}
                        onChange={(e) => handleUpdateChapterField('imageUrl', e.target.value)}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                        placeholder="URL ảnh banner"
                      />
                      {editingChapter.imageUrl && (
                        <div className="relative h-36 w-full rounded-md overflow-hidden border border-slate-200">
                          <Image
                            src={editingChapter.imageUrl}
                            alt="Xem trước ảnh banner"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 rounded-md bg-slate-50 p-4 border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Thông tin thống kê</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Lượt xem: {(editingChapter.view || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Cập nhật: {editingChapter.updatedAt ? format(editingChapter.updatedAt, 'dd/MM/yyyy') : 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cột nội dung */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Nội dung <span className="text-red-500">*</span>
                  </Label>
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <div className="bg-slate-100 p-2 flex items-center gap-2 border-b border-slate-200">
                      <BookOpenText className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Trình soạn thảo</span>
                    </div>
                    <textarea
                      id="content"
                      className="w-full min-h-[380px] p-3 border-0 focus:ring-0 resize-y"
                      value={editingChapter.content || ''}
                      onChange={(e) => handleUpdateChapterField('content', e.target.value)}
                      placeholder="Nhập nội dung chương"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Sử dụng định dạng văn bản thông thường. Hỗ trợ xuống dòng.</p>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="text-red-500">*</span> Trường bắt buộc
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-slate-200">
              Hủy
            </Button>
            <Button onClick={handleSaveChapter} disabled={isEditing} className="gap-1">
              {isEditing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[450px] border-red-200 shadow-md animate-appear">
          <DialogHeader className="border-b border-red-100 pb-3">
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Xác nhận xóa chương
            </DialogTitle>
            <DialogDescription className="text-base">
              Bạn có chắc chắn muốn xóa chương này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {chapterToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-md mb-4">
                <div className="font-medium mb-1 text-red-700">Thông tin chương sẽ bị xóa:</div>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Tiêu đề:</span> {chapterToDelete.title}</div>
                  <div><span className="font-medium">Số thứ tự:</span> {chapterToDelete.order}</div>
                  <div>
                    <span className="font-medium">Loại chương:</span> 
                    {chapterToDelete.isPremium || chapterToDelete.role === 'vip' ? ' Premium (VIP)' : ' Miễn phí'}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>Lưu ý: Thao tác này sẽ xóa vĩnh viễn chương này khỏi cơ sở dữ liệu và không thể khôi phục.</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-slate-200">
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteChapter} 
              disabled={isDeleting} 
              className="gap-1 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm delete-button-hover"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Xác nhận xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 