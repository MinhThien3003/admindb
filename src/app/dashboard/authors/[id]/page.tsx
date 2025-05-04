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
import { ArrowLeft, Book, DollarSign, Edit, Eye, MessageSquare, Star, Users, Wallet } from "lucide-react"
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

interface AuthorWallet {
  _id: string
  userId: {
    _id: string
    fullname: string
    username: string
    avatar: string
  }
  totalRevenue: number
  monthlyRevenue: Record<string, number>
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

export default function AuthorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [author, setAuthor] = useState<Author | null>(null)
  const [wallet, setWallet] = useState<AuthorWallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWalletLoading, setIsWalletLoading] = useState(true)
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

  useEffect(() => {
    const fetchAuthorWallet = async () => {
      try {
        setIsWalletLoading(true)
        // Lấy token từ sessionStorage
        const token = sessionStorage.getItem('admin_token')
        if (!token) {
          console.error("Không tìm thấy token xác thực")
          return
        }

        console.log(`Đang gọi API wallet với ID: ${params.id}`)
        // Gọi API để lấy thông tin ví của tác giả
        const response = await axios.get(`/api/wallets/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.data) {
          console.log("Dữ liệu ví nhận được:", response.data)
          setWallet(response.data)
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin ví tác giả:", error)
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log("Không tìm thấy ví của tác giả này")
        } else {
          console.error("Lỗi chi tiết:", error)
        }
        // Không hiển thị toast để tránh gây khó chịu nếu API chưa có
      } finally {
        setIsWalletLoading(false)
      }
    }

    if (params.id) {
      fetchAuthorWallet()
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
        
        {/* Thông tin doanh thu */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-amber-500" />
              Ví tác giả
            </CardTitle>
            <CardDescription>
              Thông tin doanh thu chi tiết của tác giả
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isWalletLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : wallet ? (
              <>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-5 border border-amber-100">
                  <p className="text-sm text-amber-700 mb-2">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-amber-700">{formatCurrency(wallet.totalRevenue)}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Cập nhật lần cuối: {format(new Date(wallet.lastUpdated), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
                
                {Object.keys(wallet.monthlyRevenue).length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Doanh thu theo tháng</h3>
                    <div className="space-y-2">
                      {Object.entries(wallet.monthlyRevenue)
                        .sort((a, b) => b[0].localeCompare(a[0])) // Sắp xếp giảm dần theo thời gian
                        .map(([month, revenue]) => (
                          <div key={month} className="flex justify-between items-center py-2 border-b">
                            <p className="text-sm">{month}</p>
                            <p className="text-sm font-medium">{formatCurrency(revenue)}</p>
                          </div>
                        ))}
                    </div>
                    
                    {/* Thêm biểu đồ đơn giản */}
                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-3">Biểu đồ doanh thu</h3>
                      <div className="relative h-40 flex items-end space-x-2">
                        {Object.entries(wallet.monthlyRevenue)
                          .sort((a, b) => a[0].localeCompare(b[0])) // Sắp xếp tăng dần theo thời gian
                          .slice(-6) // Chỉ lấy 6 tháng gần nhất
                          .map(([month, revenue], index) => {
                            // Tìm giá trị cao nhất để tính toán tỷ lệ
                            const maxRevenue = Math.max(...Object.values(wallet.monthlyRevenue));
                            const percentage = maxRevenue ? (revenue / maxRevenue) * 100 : 0;
                            
                            return (
                              <div key={index} className="flex flex-col items-center flex-1">
                                <div 
                                  className="w-full bg-amber-400 rounded-t"
                                  style={{ height: `${percentage}%` }}
                                ></div>
                                <span className="text-xs mt-1 truncate w-full text-center">
                                  {month.split('/')[0]}
                                </span>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu theo tháng</p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Chưa có thông tin ví tác giả</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Phần còn lại của trang */}
        <Card className="md:col-span-3">
            <CardHeader>
            <CardTitle>Cấp độ tác giả</CardTitle>
            <CardDescription>Cấp độ hiện tại và tiến độ</CardDescription>
            </CardHeader>
            <CardContent>
            <AuthorLevelDisplay 
              level={author.level || 'Beginner'} 
              experiencePoints={author.experiencePoints || 0}
            />
                  </CardContent>
                </Card>
                
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
            <CardDescription>Tổng quan về doanh thu và giao dịch</CardDescription>
                  </CardHeader>
                  <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                <p className="text-2xl font-bold">{formatCurrency(author.totalEarnings || 0)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Giao dịch</p>
                <p className="text-2xl font-bold">{author.totalTransactions || 0}</p>
              </div>
                    </div>
                  </CardContent>
                </Card>
                
        <Card className="md:col-span-7">
          <CardHeader>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="novels">Truyện</TabsTrigger>
                <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
                <TabsTrigger value="followers">Người theo dõi</TabsTrigger>
              </TabsList>
            </Tabs>
                  </CardHeader>
                  <CardContent>
            <TabsContent value="overview" className="mt-0">
              <div className="text-muted-foreground">
                Đang phát triển tính năng...
              </div>
        </TabsContent>
            <TabsContent value="novels" className="mt-0">
              <div className="text-muted-foreground">
                Đang phát triển tính năng...
              </div>
        </TabsContent>
            <TabsContent value="transactions" className="mt-0">
              <div className="text-muted-foreground">
                Đang phát triển tính năng...
              </div>
        </TabsContent>
            <TabsContent value="followers" className="mt-0">
              <div className="text-muted-foreground">
                Đang phát triển tính năng...
              </div>
            </TabsContent>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
