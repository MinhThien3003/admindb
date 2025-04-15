"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Book, DollarSign, Edit, Eye, MessageSquare, Star, Users } from "lucide-react"
import { format } from "date-fns"
import { AuthorLevelDisplay } from "@/components/dashboard/author-level-display"

interface Author {
  _id: string
  username: string
  email: string
  fullname?: string
  gender: 'Male' | 'Female'
  role: 'reader' | 'author'
  avatar: string
  createdAt: Date
  updatedAt: Date
  status?: 'active' | 'inactive' | 'banned'
  level?: string
  levelId?: string
  experiencePoints?: number
  bio?: string
  totalViews?: number
  totalTransactions?: number
  totalEarnings?: number
}

export default function AuthorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [author, setAuthor] = useState<Author | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        setIsLoading(true)
        // Gọi API để lấy thông tin chi tiết tác giả
        const response = await axios.get(`/api/authors/${params.id}`)
        
        if (response.data) {
          // Chuyển đổi ngày từ string sang Date
          const authorData = {
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
          }
          setAuthor(authorData)
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tác giả:", error)
        toast.error("Không thể tải thông tin tác giả")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchAuthorDetails()
    }
  }, [params.id])

  // Hàm hiển thị trạng thái tác giả
  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusMap: Record<string, { color: string, label: string }> = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Hoạt động' },
      'inactive': { color: 'bg-gray-100 text-gray-800', label: 'Không hoạt động' },
      'banned': { color: 'bg-red-100 text-red-800', label: 'Đã khóa' }
    }
    
    const { color, label } = statusMap[status] || statusMap.inactive
    
    return (
      <Badge className={`${color}`}>
        {label}
      </Badge>
    )
  }

  // Hàm hiển thị giới tính
  const getGenderBadge = (gender?: string) => {
    if (!gender) return null
    
    const genderMap: Record<string, { color: string, label: string }> = {
      'Male': { color: 'bg-blue-100 text-blue-800', label: 'Nam' },
      'Female': { color: 'bg-pink-100 text-pink-800', label: 'Nữ' }
    }
    
    const { color, label } = genderMap[gender] || { color: 'bg-gray-100 text-gray-800', label: 'Khác' }
    
    return (
      <Badge className={`${color}`}>
        {label}
      </Badge>
    )
  }

  // Hàm định dạng số lượng view
  const formatViews = (views: number = 0): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    } else {
      return views.toString()
    }
  }

  // Hàm định dạng số tiền
  const formatCurrency = (amount: number = 0): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-1/4" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Không tìm thấy tác giả</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lỗi</CardTitle>
            <CardDescription>Không tìm thấy thông tin tác giả với ID: {params.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Chi tiết tác giả</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        {/* Thông tin cơ bản */}
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center space-y-0 gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={author.avatar} alt={author.username} />
              <AvatarFallback>{author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{author.fullname || author.username}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2 mt-1">
                {getStatusBadge(author.status)}
                {getGenderBadge(author.gender)}
                <Badge variant="outline">@{author.username}</Badge>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{author.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ngày tham gia</p>
                  <p className="text-sm text-muted-foreground">
                    {format(author.createdAt, "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Tiểu sử</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {author.bio || "Tác giả chưa cập nhật tiểu sử"}
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 pt-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Book className="h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Truyện</p>
                    <p className="text-lg font-bold">0</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Eye className="h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Lượt xem</p>
                    <p className="text-lg font-bold">{formatViews(author.totalViews)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Star className="h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Đánh giá</p>
                    <p className="text-lg font-bold">0</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Người theo dõi</p>
                    <p className="text-lg font-bold">0</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Thông tin cấp độ */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Cấp độ tác giả</CardTitle>
            <CardDescription>
              Thông tin cấp độ và đặc quyền của tác giả
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Sử dụng component AuthorLevelDisplay để hiển thị thông tin cấp độ tác giả */}
            <AuthorLevelDisplay authorLevelId={author.levelId} />
            
            <div className="mt-4">
              <p className="text-sm font-medium">Kinh nghiệm hiện tại</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (author.experiencePoints || 0) / 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {author.experiencePoints || 0} điểm kinh nghiệm
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="novels">Truyện đã đăng</TabsTrigger>
          <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          <TabsTrigger value="comments">Bình luận</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
              <CardDescription>Thống kê hoạt động của tác giả trong 30 ngày qua</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{formatCurrency(author.totalEarnings)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{formatViews(author.totalViews)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Giao dịch</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{author.totalTransactions || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="novels">
          <Card>
            <CardHeader>
              <CardTitle>Truyện đã đăng</CardTitle>
              <CardDescription>Danh sách truyện tác giả đã đăng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <p>Chưa có dữ liệu truyện</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử giao dịch</CardTitle>
              <CardDescription>Lịch sử giao dịch của tác giả</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <p>Chưa có dữ liệu giao dịch</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Bình luận</CardTitle>
              <CardDescription>Bình luận của tác giả</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <p>Chưa có dữ liệu bình luận</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
