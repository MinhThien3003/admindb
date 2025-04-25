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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Trash2, Plus, Edit2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"
import axios from "axios"

// Định nghĩa interface cho Category
interface Category {
  _id: string
  titleCategory: string
  description: string
  novelCount?: number // Thêm field này để tương thích với UI hiện tại 
  createdAt: string
  updatedAt: string
}

// Dữ liệu mẫu - sẽ được thay thế bằng dữ liệu từ API
const initialCategories: Category[] = []

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    titleCategory: "",
    description: ""
  })
  const { toast } = useToast()
  const ITEMS_PER_PAGE = 10
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Đang tải dữ liệu thể loại từ API...');
        
        const response = await fetch('/api/categories');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error:', errorData);
          throw new Error(`Không thể tải danh sách thể loại: ${response.status} - ${errorData}`);
        }
        
        const data = await response.json();
        console.log('Dữ liệu nhận được:', typeof data, Array.isArray(data) ? 'là mảng' : 'không phải mảng');
        
        // Kiểm tra kĩ hơn cấu trúc dữ liệu
        if (!data) {
          throw new Error('Dữ liệu trống');
        }
        
        // Nếu response là một object error
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Đảm bảo data là một mảng để xử lý
        let categoriesArray = data;
        
        // Nếu không phải mảng mà là object có trường data là mảng
        if (!Array.isArray(data) && data.data && Array.isArray(data.data)) {
          categoriesArray = data.data;
        }
        
        if (!Array.isArray(categoriesArray)) {
          console.error('Dữ liệu không phải là mảng:', data);
          throw new Error('Dữ liệu không đúng định dạng');
        }
        
        console.log('Số lượng thể loại:', categoriesArray.length);
        
        // Thêm số lượng truyện (novelCount) nếu không có từ API
        const formattedCategories = categoriesArray.map((category: Partial<Category>) => ({
          ...category,
          _id: category._id || String(Date.now()),
          titleCategory: category.titleCategory || '',
          description: category.description || '',
          novelCount: category.novelCount || 0,
          createdAt: new Date(category.createdAt || '').toISOString().split('T')[0],
          updatedAt: category.updatedAt || new Date().toISOString()
        })) as Category[];
        
        setCategories(formattedCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
        console.error('Error fetching categories:', err);
        toast({
          title: "Lỗi",
          description: err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const filteredCategories = categories.filter((category) =>
    category.titleCategory.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = (id: string) => {
    // Kiểm tra xem thể loại có truyện không
    const category = categories.find(cat => cat._id === id)
    if (category && category.novelCount && category.novelCount > 0) {
      toast({
        title: "Không thể xóa",
        description: `Thể loại "${category.titleCategory}" đang có ${category.novelCount} truyện. Vui lòng xóa hoặc chuyển truyện sang thể loại khác trước.`,
        variant: "destructive"
      })
      return
    }

    setCategories(categories.filter((category) => category._id !== id))
    toast({
      title: "Đã xóa thể loại",
      description: "Thể loại đã được xóa thành công."
    })
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setNewCategory({
      titleCategory: category.titleCategory,
      description: category.description
    })
    setIsEditDialogOpen(true)
  }

  const handleAddSubmit = async () => {
    if (!newCategory.titleCategory) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại không được để trống.",
        variant: "destructive"
      })
      return
    }

    // Kiểm tra trùng tên
    if (categories.some(cat => cat.titleCategory.toLowerCase() === newCategory.titleCategory?.toLowerCase())) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại đã tồn tại.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    toast({
      title: "Đang xử lý",
      description: "Đang thêm thể loại mới...",
    })
    
    try {
      // Chuẩn bị dữ liệu thể loại mới
      const categoryData = {
        titleCategory: newCategory.titleCategory,
        description: newCategory.description || ""
      }
      
      console.log('Đang tạo thể loại mới');
      console.log('Dữ liệu gửi đi:', categoryData);
      
      // Lấy token xác thực từ localStorage
      let token;
      try {
        token = localStorage.getItem('admin_token');
        if (!token) {
          toast({
            title: "Lỗi xác thực",
            description: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
            variant: "destructive"
          })
          console.error('Token không tìm thấy trong localStorage');
          throw new Error("Phiên làm việc không hợp lệ");
        }
        
        console.log('Đã tìm thấy token xác thực');
      } catch (error) {
        console.error('Lỗi khi truy cập localStorage:', error);
        toast({
          title: "Lỗi xác thực",
          description: "Không thể xác thực phiên làm việc. Vui lòng tải lại trang.",
          variant: "destructive"
        })
        setIsSubmitting(false);
        return;
      }
      
      // Thử gọi API trực tiếp từ backend trước
      const directUrl = `http://localhost:5000/api/categories`;
      console.log("Thử gọi API trực tiếp tới:", directUrl);
      
      try {
        // Cấu hình request
        const requestConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Log chi tiết request
        console.log("Request config:", requestConfig);
        
        // Thực hiện request trực tiếp bằng axios
        const response = await axios.post(directUrl, categoryData, requestConfig);
        
        // Log kết quả từ API
        console.log("API trực tiếp - Response status:", response.status);
        console.log("API trực tiếp - Response data:", response.data);
        
        // Xử lý response thành công
        toast({
          title: "Thành công",
          description: `Đã thêm thể loại "${categoryData.titleCategory}" thành công.`,
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800"
        })
        
        // Cập nhật lại state với thông tin mới
        const newCategoryItem: Category = {
          _id: response.data._id || response.data.data?._id || String(Date.now()),
          titleCategory: categoryData.titleCategory,
          description: categoryData.description,
          novelCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString()
        }
        
        setCategories([...categories, newCategoryItem])
        
        // Đóng form và reset dữ liệu
        setNewCategory({ titleCategory: "", description: "" })
        setIsAddDialogOpen(false)
        
        return; // Kết thúc xử lý nếu thành công
        
      } catch (directError) {
        console.error("Lỗi khi gọi API trực tiếp:", directError);
        
        // Thử với API Next.js proxy
        try {
          console.log("Thử gọi API qua Next.js proxy sau khi API trực tiếp thất bại");
          
          // Endpoint qua Next.js
          const proxyUrl = `/api/categories`;
          console.log("Gọi API qua Next.js proxy tại URL:", proxyUrl);
          
          const proxyResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoryData)
          });
          
          // Đọc response dưới dạng text trước
          const responseText = await proxyResponse.text();
          console.log(`Phản hồi từ proxy (status: ${proxyResponse.status}):`);
          console.log(`Nội dung phản hồi:`, responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''));
          
          // Parse JSON nếu có thể
          let responseData = null;
          try {
            if (responseText && responseText.trim() !== '') {
              responseData = JSON.parse(responseText);
              console.log('Dữ liệu đã parse từ proxy:', responseData);
            } else {
              console.warn('Response text từ proxy rỗng');
              responseData = { success: proxyResponse.ok };
            }
          } catch (e) {
            console.error('Không thể parse JSON từ proxy response:', e);
            throw new Error(`Lỗi xử lý phản hồi từ proxy: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
          }
          
          // Xử lý response
          if (!proxyResponse.ok) {
            console.error('Lỗi từ proxy khi tạo thể loại:', responseData);
            let errorMessage = 'Không thể tạo thể loại mới';
            
            if (responseData && responseData.message) {
              errorMessage = responseData.message;
            }
            
            throw new Error(errorMessage);
          }
          
          // Xử lý thành công
          console.log('Tạo thể loại thành công qua proxy:', responseData);
          toast({
            title: "Thành công",
            description: `Đã thêm thể loại "${categoryData.titleCategory}" thành công (qua proxy).`,
            variant: "default", 
            className: "bg-green-50 border-green-200 text-green-800"
          })
          
          // Cập nhật lại state với thông tin mới
    const newCategoryItem: Category = {
            _id: responseData._id || responseData.data?._id || String(Date.now()),
            titleCategory: categoryData.titleCategory,
            description: categoryData.description,
      novelCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    }

    setCategories([...categories, newCategoryItem])
          
          // Đóng form và reset dữ liệu
    setNewCategory({ titleCategory: "", description: "" })
    setIsAddDialogOpen(false)
          
        } catch (proxyError) {
          console.error("Lỗi khi gọi API qua proxy:", proxyError);
          throw proxyError; // Ném lỗi để xử lý bên ngoài
        }
      }
      
    } catch (error) {
      console.error('Lỗi khi tạo thể loại mới:', error);
      
      // Log chi tiết hơn về lỗi
      if (error && typeof error === 'object' && 'response' in error) {
        // Lỗi từ axios
        interface AxiosErrorResponse {
          response?: {
            status?: number;
            data?: {
              message?: string;
              error?: string;
            };
          };
        }
        
        const axiosError = error as AxiosErrorResponse;
        console.error("Lỗi response:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        });
        
        if (axiosError.response?.status === 409) {
          toast({
            title: "Lỗi",
            description: "Tên thể loại đã tồn tại.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Lỗi",
            description: axiosError.response?.data?.message || "Không thể tạo thể loại mới.",
            variant: "destructive"
          })
        }
      } else {
        // Lỗi khác
    toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi tạo thể loại mới.",
          variant: "destructive"
    })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!selectedCategory) return
    if (!newCategory.titleCategory) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại không được để trống.",
        variant: "destructive"
      })
      return
    }

    // Kiểm tra trùng tên (trừ chính nó)
    if (categories.some(cat => 
      cat._id !== selectedCategory._id && 
      cat.titleCategory.toLowerCase() === newCategory.titleCategory?.toLowerCase()
    )) {
      toast({
        title: "Lỗi",
        description: "Tên thể loại đã tồn tại.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    toast({
      title: "Đang cập nhật",
      description: "Đang lưu thông tin thể loại..."
    })
    
    try {
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        titleCategory: newCategory.titleCategory || selectedCategory.titleCategory,
        description: newCategory.description || selectedCategory.description
      }
      
      console.log('Đang cập nhật thể loại:', selectedCategory._id);
      console.log('Dữ liệu gửi đi:', updateData);
      
      // Lấy token xác thực từ localStorage
      let token;
      try {
        token = localStorage.getItem('admin_token');
        if (!token) {
          toast({
            title: "Lỗi xác thực",
            description: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
            variant: "destructive"
          })
          console.error('Token không tìm thấy trong localStorage');
          throw new Error("Phiên làm việc không hợp lệ");
        }
        
        console.log('Đã tìm thấy token xác thực');
      } catch (error) {
        console.error('Lỗi khi truy cập localStorage:', error);
        toast({
          title: "Lỗi xác thực",
          description: "Không thể xác thực phiên làm việc. Vui lòng tải lại trang.",
          variant: "destructive"
        })
        setIsSubmitting(false);
        return;
      }
      
      // Thử gọi API trực tiếp từ backend trước
      const categoryId = selectedCategory._id;
      const directUrl = `http://localhost:5000/api/categories/${categoryId}`;
      console.log("Thử gọi API trực tiếp tới:", directUrl);
      
      try {
        // Cấu hình request
        const requestConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Log chi tiết request
        console.log("Request config:", requestConfig);
        
        // Thực hiện request trực tiếp bằng axios
        const response = await axios.put(directUrl, updateData, requestConfig);
        
        // Log kết quả từ API
        console.log("API trực tiếp - Response status:", response.status);
        console.log("API trực tiếp - Response data:", response.data);
        
        // Xử lý response thành công
        toast({
          title: "Thành công",
          description: `Đã cập nhật thể loại "${newCategory.titleCategory}" thành công.`,
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800"
        })
        
        // Cập nhật lại state với thông tin mới
        setCategories(categories.map(category => 
          category._id === selectedCategory._id 
            ? { 
                ...category, 
                titleCategory: newCategory.titleCategory || category.titleCategory, 
                description: newCategory.description || category.description,
                updatedAt: new Date().toISOString()
              } 
            : category
        ))
        
        // Đóng form
        setSelectedCategory(null)
        setNewCategory({ titleCategory: "", description: "" })
        setIsEditDialogOpen(false)
        
        return; // Kết thúc xử lý nếu thành công
        
      } catch (directError) {
        console.error("Lỗi khi gọi API trực tiếp:", directError);
        
        // Thử với API Next.js proxy
        try {
          console.log("Thử gọi API qua Next.js proxy sau khi API trực tiếp thất bại");
          
          // Endpoint qua Next.js
          const proxyUrl = `/api/categories/${categoryId}`;
          console.log("Gọi API qua Next.js proxy tại URL:", proxyUrl);
          
          const proxyResponse = await fetch(proxyUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });
          
          // Đọc response dưới dạng text trước
          const responseText = await proxyResponse.text();
          console.log(`Phản hồi từ proxy (status: ${proxyResponse.status}):`);
          console.log(`Nội dung phản hồi:`, responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''));
          
          // Parse JSON nếu có thể
          let responseData = null;
          try {
            if (responseText && responseText.trim() !== '') {
              responseData = JSON.parse(responseText);
              console.log('Dữ liệu đã parse từ proxy:', responseData);
            } else {
              console.warn('Response text từ proxy rỗng');
              responseData = { success: proxyResponse.ok };
            }
          } catch (e) {
            console.error('Không thể parse JSON từ proxy response:', e);
            throw new Error(`Lỗi xử lý phản hồi từ proxy: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
          }
          
          // Xử lý response
          if (!proxyResponse.ok) {
            console.error('Lỗi từ proxy khi cập nhật thể loại:', responseData);
            let errorMessage = 'Không thể cập nhật thể loại';
            
            if (responseData && responseData.message) {
              errorMessage = responseData.message;
            }
            
            throw new Error(errorMessage);
          }
          
          // Xử lý thành công
          console.log('Cập nhật thể loại thành công qua proxy:', responseData);
          toast({
            title: "Thành công",
            description: `Đã cập nhật thể loại "${newCategory.titleCategory}" thành công (qua proxy).`,
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800"
          })
          
          // Cập nhật lại state với thông tin mới
    setCategories(categories.map(category => 
      category._id === selectedCategory._id 
        ? { 
            ...category, 
            titleCategory: newCategory.titleCategory || category.titleCategory, 
            description: newCategory.description || category.description,
            updatedAt: new Date().toISOString()
          } 
        : category
    ))
          
          // Đóng form
    setSelectedCategory(null)
    setNewCategory({ titleCategory: "", description: "" })
    setIsEditDialogOpen(false)
          
        } catch (proxyError) {
          console.error("Lỗi khi gọi API qua proxy:", proxyError);
          throw proxyError; // Ném lỗi để xử lý bên ngoài
        }
      }
      
    } catch (error) {
      console.error('Lỗi khi cập nhật thể loại:', error);
      
      // Log chi tiết hơn về lỗi
      if (error && typeof error === 'object' && 'response' in error) {
        // Lỗi từ axios
        interface AxiosErrorResponse {
          response?: {
            status?: number;
            data?: {
              message?: string;
              error?: string;
            };
          };
        }
        
        const axiosError = error as AxiosErrorResponse;
        console.error("Lỗi response:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        });
        
        if (axiosError.response?.status === 409) {
          toast({
            title: "Lỗi",
            description: "Tên thể loại đã tồn tại.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Lỗi",
            description: axiosError.response?.data?.message || "Không thể cập nhật thể loại.",
            variant: "destructive"
          })
        }
      } else {
        // Lỗi khác
    toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật thể loại.",
          variant: "destructive"
    })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-500" />
          <p className="mt-4">Đang tải dữ liệu thể loại...</p>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl">Lỗi: {error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
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
                  value={newCategory.titleCategory || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, titleCategory: e.target.value })}
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
                <Button 
                  onClick={handleAddSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    "Thêm thể loại"
                  )}
                </Button>
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
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>{category._id.substring(0, 8)}...</TableCell>
                    <TableCell className="font-medium">{category.titleCategory}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.novelCount || 0}</TableCell>
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
                        onClick={() => handleDelete(category._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>Không tìm thấy thể loại nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {paginatedCategories.length > 0 && paginatedCategories.length < ITEMS_PER_PAGE && (
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
                value={newCategory.titleCategory || ""}
                onChange={(e) => setNewCategory({ ...newCategory, titleCategory: e.target.value })}
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
              <Button 
                onClick={handleEditSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 