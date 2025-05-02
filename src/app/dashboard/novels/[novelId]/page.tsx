"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Star, Clock, CheckCircle, Edit, ArrowLeft, Eye, Bookmark, Lock, Unlock, Plus, Pencil, Save, FileText, Hash, Type, CreditCard, BookOpenText, ImageIcon, Trash2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
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
import { toast } from "react-hot-toast"

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
  idCategories: Array<{
    _id: string;
    titleCategory: string;
  }> | string[];
  idUser: {
    _id: string;
    username: string;
    fullname?: string;
    email?: string;
    role?: string;
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
  const [novel, setNovel] = useState<Novel | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [showAddChapterDialog, setShowAddChapterDialog] = useState(false)
  const [showEditNovelDialog, setShowEditNovelDialog] = useState(false)
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [categories, setCategories] = useState<Array<{_id: string, titleCategory: string}>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [currentPage, setCurrentPage] = useState(1);
  const chaptersPerPage = 10;
  const novelId = params.novelId;

  // Tải thông tin chi tiết novel từ API
  const fetchNovelDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/novels/${novelId}`);
        if (!response.ok) {
        throw new Error("Không thể lấy thông tin tiểu thuyết");
        }
        const data = await response.json();
      console.log("Novel data:", data);
        setNovel(data);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin tiểu thuyết:", err);
      toast.error("Không thể lấy thông tin tiểu thuyết");
      } finally {
        setLoading(false);
      }
  };
    
  // Gọi API lấy thông tin tiểu thuyết khi component mount
  useEffect(() => {
    fetchNovelDetails();
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
  
  // Tải danh sách chương từ API
  const fetchChapters = async () => {
    try {
      setLoadingChapters(true);
      const response = await fetch(`/api/chapters/novel/${novelId}`);
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách chương");
      }
      const data = await response.json();
      setChapters(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách chương:", err);
      toast.error("Không thể lấy danh sách chương");
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

  // Xử lý chỉnh sửa chương
  const handleEditChapter = async (chapterId: string, chapterData: Partial<Chapter>) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapterData),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật chương');
      }

      const updatedChapter = await response.json();
      setChapters(chapters.map(chapter => 
        chapter._id === chapterId ? updatedChapter : chapter
      ));
      setShowEditDialog(false);
      toast.success('Cập nhật chương thành công');
    } catch (err) {
      console.error('Lỗi khi cập nhật chương:', err);
      toast.error('Không thể cập nhật chương');
    }
  };
  
  // Hàm cập nhật trường của chương đang chỉnh sửa
  const handleUpdateChapterField = (field: keyof Chapter, value: string | number | boolean) => {
    if (!editingChapter) return;
      setEditingChapter({
        ...editingChapter,
        [field]: value
    });
  };
  
  // Xử lý lưu chương
  const handleSaveChapter = async () => {
    if (!editingChapter) return;
    
    try {
      setIsUpdating(true);
      const chapterData = {
        title: editingChapter.title,
        content: editingChapter.content,
        order: editingChapter.order,
        role: editingChapter.role,
        price: editingChapter.role === 'vip' ? editingChapter.price : 0,
        imageUrl: editingChapter.imageUrl,
      };

      await handleEditChapter(editingChapter._id || '', chapterData);
    } catch (err) {
      console.error('Lỗi khi lưu chương:', err);
      toast.error('Không thể lưu chương');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý xóa chương
  const handleDeleteChapter = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Không thể xóa chương');
      }
      
      setChapters(chapters.filter(chapter => chapter._id !== chapterId));
      setShowDeleteDialog(false);
      setChapterToDelete(null);
      toast.success('Xóa chương thành công');
    } catch (err) {
      console.error('Lỗi khi xóa chương:', err);
      toast.error('Không thể xóa chương');
    }
  };

  // Hàm mở dialog chỉnh sửa tiểu thuyết
  const handleEditNovel = () => {
    if (novel) {
      setEditingNovel({...novel})
      setShowEditNovelDialog(true)
      fetchCategories();
    }
  }

  // Hàm cập nhật trường của tiểu thuyết đang chỉnh sửa
  const handleUpdateNovelField = (field: keyof Novel, value: string | number | boolean) => {
    if (!editingNovel) return;
    setEditingNovel({
      ...editingNovel,
      [field]: value
    });
  };

  // Hàm xử lý upload ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Không thể tải lên ảnh');
      }

      const data = await response.json();
      if (editingNovel) {
        setEditingNovel({
          ...editingNovel,
          imageUrl: data.url,
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải lên ảnh:', err);
      toast.error('Không thể tải lên ảnh');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý lưu tiểu thuyết
  const handleSaveNovel = async () => {
    if (!editingNovel) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/novels/${novelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingNovel.title,
          description: editingNovel.description,
          status: editingNovel.status,
          imageUrl: editingNovel.imageUrl,
          idCategories: editingNovel.idCategories,
        }),
      });

      if (!response.ok) {
        throw new Error(`Không thể cập nhật tiểu thuyết. Lỗi: ${response.status}`);
      }

      const updatedNovel = await response.json();
      setNovel(updatedNovel);
      setShowEditNovelDialog(false);
      toast.success('Cập nhật tiểu thuyết thành công');
    } catch (err) {
      console.error('Lỗi khi cập nhật tiểu thuyết:', err);
      toast.error('Không thể cập nhật tiểu thuyết');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý thêm chương mới
  const handleAddChapter = async (chapterData: Partial<Chapter>) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idNovel: novelId,
          title: chapterData.title,
          content: chapterData.content,
          order: chapterData.order,
          role: chapterData.role || 'normal',
          price: chapterData.role === 'vip' ? chapterData.price : 0,
          imageUrl: chapterData.imageUrl,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Không thể thêm chương mới');
      }

      const newChapter = await response.json();
      setChapters([...chapters, newChapter]);
      setShowAddChapterDialog(false);
      toast.success('Thêm chương mới thành công');
      
      // Reset form
      setEditingChapter(null);
    } catch (err) {
      console.error('Lỗi khi thêm chương mới:', err);
      toast.error('Không thể thêm chương mới');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý thay đổi thể loại
  const handleCategoryChange = (categoryId: string) => {
    if (!editingNovel) return;

    const currentCategories = editingNovel.idCategories || [];
    const categoryExists = currentCategories.some(
      (c) => (typeof c === 'object' ? c._id === categoryId : c === categoryId)
    );

    let newCategories: { _id: string; titleCategory: string }[] = [];
    if (categoryExists) {
      newCategories = currentCategories.filter(
        (c) => (typeof c === 'object' ? c._id !== categoryId : c !== categoryId)
      ).map(c => typeof c === 'object' ? c : { _id: c, titleCategory: '' });
    } else {
      const selectedCategory = categories.find(c => c._id === categoryId);
      if (selectedCategory) {
        newCategories = [...currentCategories.map(c => typeof c === 'object' ? c : { _id: c, titleCategory: '' }), selectedCategory];
      }
    }

    setEditingNovel({
      ...editingNovel,
      idCategories: newCategories,
    });
  };

  // Fetch categories khi component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Hàm fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`/api/categories`);
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách thể loại");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thể loại:", err);
      toast.error("Không thể lấy danh sách thể loại");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Tính toán các chương cho trang hiện tại
  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = chapters.slice(indexOfFirstChapter, indexOfLastChapter);
  const totalPages = Math.ceil(chapters.length / chaptersPerPage);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Đang tải thông tin tiểu thuyết...</p>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-xl">Không tìm thấy thông tin tiểu thuyết</p>
        <Button onClick={() => router.push('/dashboard/novels')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Thêm style cho animations */}
      <style jsx global>{styles}</style>
      
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard/novels')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditNovel}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
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
                      {typeof novel.idUser === 'object' && novel.idUser ? 
                        (novel.idUser.fullname || novel.idUser.username || 'Chưa có tên') : 
                        'Chưa có tác giả'}
                    </span>
                    {typeof novel.idUser === 'object' && novel.idUser && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {novel.idUser.email || ''}
                      </span>
                    )}
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
                          novel.idCategories.map((category: {_id: string, titleCategory?: string} | string) => {
                            console.log("Category data:", category);
                            let categoryName = '';
                            
                            if (typeof category === 'object' && category !== null && 'titleCategory' in category) {
                              // Trường hợp category là object có titleCategory
                              categoryName = category.titleCategory || '';
                            } else if (typeof category === 'string' || (typeof category === 'object' && '_id' in category)) {
                              // Trường hợp category là string (ID) hoặc object chỉ có _id
                              const categoryId = typeof category === 'string' ? category : category._id;
                              const foundCategory = categories.find(c => c._id === categoryId);
                              categoryName = foundCategory?.titleCategory || 'Không xác định';
                            }
                              
                            return (
                              <div 
                                key={typeof category === 'object' ? category._id : category}
                                className="px-3 py-1 rounded-full bg-gray-100 text-gray-800"
                              >
                                {categoryName || 'Không xác định'}
                              </div>
                            );
                          })
                        ) : loadingCategories ? (
                          <div className="animate-pulse">
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                          </div>
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
                  <div className="flex items-center justify-between">
                    <div>
                  <CardTitle>Danh sách chương</CardTitle>
                  <CardDescription>
                        Tổng số: {chapters.length} chương | Premium: {chapters.filter(ch => ch.role === 'vip').length} chương
                  </CardDescription>
                    </div>
                    <Button onClick={() => setShowAddChapterDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm chương mới
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingChapters ? (
                    <div className="flex justify-center items-center h-40">
                      <p>Đang tải danh sách chương...</p>
                    </div>
                  ) : chapters.length > 0 ? (
                    <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên chương</TableHead>
                            <TableHead>Lượt xem</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentChapters.map((chapter) => (
                              <TableRow key={chapter._id}>
                              <TableCell>{chapter.order}</TableCell>
                              <TableCell className="font-medium">{chapter.title}</TableCell>
                              <TableCell>{(chapter.view || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                  {chapter.role === 'vip' ? (
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
                                  {chapter.role === 'vip' ? formatCurrency(chapter.price || 0) : "Miễn phí"}
                              </TableCell>
                              <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8" 
                                      onClick={() => {
                                        setEditingChapter(chapter);
                                        setShowEditDialog(true);
                                      }}
                                    >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Chỉnh sửa chương</span>
                                  </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        setChapterToDelete(chapter);
                                        setShowDeleteDialog(true);
                                      }}
                                    >
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

                      {/* Phân trang */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Trước
                          </Button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <Button
                              key={pageNumber}
                              variant={pageNumber === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Sau
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 border rounded-md">
                      <p className="text-muted-foreground">Chưa có chương nào</p>
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
                      value={editingChapter.role || 'normal'}
                      onValueChange={(value) => handleUpdateChapterField('role', value)}
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
                  
                  {editingChapter.role === 'vip' && (
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
                      URL ảnh
                    </Label>
                      <Input
                        id="imageUrl"
                        value={editingChapter.imageUrl || ''}
                        onChange={(e) => handleUpdateChapterField('imageUrl', e.target.value)}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                      placeholder="https://example.com/image.jpg"
                      />
                      {editingChapter.imageUrl && (
                        <div className="relative h-36 w-full rounded-md overflow-hidden border border-slate-200">
                          <Image
                            src={editingChapter.imageUrl}
                          alt="Ảnh chương"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
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
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div>ID: {editingChapter._id}</div>
                  <div>Lượt xem: {editingChapter.view || 0}</div>
                  <div>Ngày tạo: {editingChapter.createdAt ? new Date(editingChapter.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}</div>
                  {editingChapter.updatedAt && (
                    <div>Cập nhật: {new Date(editingChapter.updatedAt).toLocaleDateString('vi-VN')}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveChapter} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa chương
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa chương này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {chapterToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-md mb-4">
                <h4 className="font-medium text-red-900 mb-2">Thông tin chương sẽ bị xóa:</h4>
                <div className="space-y-2 text-sm text-red-800">
                  <p><span className="font-medium">ID:</span> {chapterToDelete._id}</p>
                  <p><span className="font-medium">Tiêu đề:</span> {chapterToDelete.title}</p>
                  <p><span className="font-medium">Số thứ tự:</span> {chapterToDelete.order}</p>
                  <p>
                    <span className="font-medium">Loại chương:</span> 
                    {chapterToDelete.role === 'vip' ? ' Premium (VIP)' : ' Miễn phí'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md text-red-800 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <p>Lưu ý: Tất cả nội dung của chương này sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setChapterToDelete(null);
              }}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => chapterToDelete && handleDeleteChapter(chapterToDelete._id || '')}
              className="bg-red-600 hover:bg-red-700"
              disabled={!chapterToDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm chương mới */}
      <Dialog open={showAddChapterDialog} onOpenChange={setShowAddChapterDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Thêm chương mới
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chương mới. Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Cột thông tin cơ bản */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-title" className="text-base font-medium flex items-center gap-2">
                  <Type className="h-4 w-4 text-slate-500" />
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-title"
                  placeholder="Nhập tiêu đề chương"
                  value={editingChapter?.title || ''}
                  onChange={(e) => setEditingChapter(prev => ({
                    ...prev,
                    title: e.target.value
                  } as Chapter))}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-order" className="text-base font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-500" />
                  Số thứ tự <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-order"
                  type="number"
                  placeholder="Nhập số thứ tự"
                  value={editingChapter?.order || ''}
                  onChange={(e) => setEditingChapter(prev => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0
                  } as Chapter))}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-role" className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  Loại chương <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingChapter?.role || 'normal'}
                  onValueChange={(value) => setEditingChapter(prev => ({
                    ...prev,
                    role: value
                  } as Chapter))}
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

              {editingChapter?.role === 'vip' && (
                <div className="space-y-2">
                  <Label htmlFor="add-price" className="text-base font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    Giá (VND)
                  </Label>
                  <Input
                    id="add-price"
                    type="number"
                    placeholder="Nhập giá chương"
                    value={editingChapter?.price || 0}
                    onChange={(e) => setEditingChapter(prev => ({
                      ...prev,
                      price: parseInt(e.target.value) || 0
                    } as Chapter))}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="add-imageUrl" className="text-base font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  URL ảnh
                </Label>
                <Input
                  id="add-imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={editingChapter?.imageUrl || ''}
                  onChange={(e) => setEditingChapter(prev => ({
                    ...prev,
                    imageUrl: e.target.value
                  } as Chapter))}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-primary"
                />
                {editingChapter?.imageUrl && (
                  <div className="relative h-36 w-full rounded-md overflow-hidden border border-slate-200">
                    <Image
                      src={editingChapter.imageUrl}
                      alt="Ảnh chương"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Cột nội dung */}
            <div className="space-y-2">
              <Label htmlFor="add-content" className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Nội dung <span className="text-red-500">*</span>
              </Label>
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-100 p-2 flex items-center gap-2 border-b border-slate-200">
                  <BookOpenText className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Trình soạn thảo</span>
                </div>
                <textarea
                  id="add-content"
                  className="w-full min-h-[380px] p-3 border-0 focus:ring-0 resize-y"
                  placeholder="Nhập nội dung chương"
                  value={editingChapter?.content || ''}
                  onChange={(e) => setEditingChapter(prev => ({
                    ...prev,
                    content: e.target.value
                  } as Chapter))}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddChapterDialog(false);
                setEditingChapter(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => editingChapter && handleAddChapter(editingChapter)}
              disabled={isUpdating || !editingChapter?.title || !editingChapter?.content || !editingChapter?.order}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full mr-2"></div>
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm chương
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa tiểu thuyết */}
      {showEditNovelDialog && editingNovel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa tiểu thuyết</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                <input
                  type="text"
                  value={editingNovel.title}
                  onChange={(e) => handleUpdateNovelField('title', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  value={editingNovel.description}
                  onChange={(e) => handleUpdateNovelField('description', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={editingNovel.status}
                  onChange={(e) => handleUpdateNovelField('status', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="ongoing">Đang cập nhật</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ảnh bìa</label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                  {isUpdating && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mt-2"></div>
                  )}
                </div>
                {editingNovel.imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={editingNovel.imageUrl}
                      alt="Xem trước ảnh bìa"
                      width={200}
                      height={200}
                      className="mt-2 rounded-md"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thể loại</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {loadingCategories ? (
                    <div className="col-span-2 text-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category._id}
                        onClick={() => handleCategoryChange(category._id)}
                        className={`p-2 rounded cursor-pointer text-sm ${
                          editingNovel.idCategories?.some((c) => 
                            typeof c === 'object' ? c._id === category._id : c === category._id
                          )
                            ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                            : "bg-gray-100 hover:bg-gray-200 border-2 border-transparent"
                        }`}
                      >
                        {category.titleCategory}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowEditNovelDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveNovel}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 