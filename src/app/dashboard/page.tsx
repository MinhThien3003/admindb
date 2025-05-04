"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, TrendingUp, BookOpen, Award } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { 
  PieChart, 
  Pie, 
  Cell, 
  Line, 
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar 
} from "recharts"
import { getAllUsers } from '@/lib/api/users'
import { getAllAuthorRankings, AuthorRanking } from '@/lib/api/authorRankings'
import { getAllReaderRankings, ReaderRanking } from '@/lib/api/readerRankings'
import { getAllNovelRankings, NovelRanking } from '@/lib/api/novelRankings'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, CreditCard, Coins, CheckCircle, AlertCircle, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Màu sắc cho biểu đồ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Định nghĩa interface cho dữ liệu transaction
interface Transaction {
  _id: string;
  idUser: string;
  amount: number;
  coinsReceived: number;
  orderInfo: string;
  transactionStatus: 'completed' | 'pending' | 'failed';
  status?: 'completed' | 'pending' | 'failed';
  orderId: string;
  createdAt: string;
  date?: string;
  [key: string]: any;
}

// Định nghĩa interface cho dữ liệu người dùng
interface User {
  _id: string;
  fullname?: string;
  username?: string;
  email?: string;
  role?: 'reader' | 'author' | 'admin';
  avatar?: string;
  gender?: 'Male' | 'Female';
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export default function DashboardPage() {
    const { user, isAuthenticated, loading } = useAuth()
    const router = useRouter()
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [users, setUsers] = useState<User[]>([])
    const [authorRankings, setAuthorRankings] = useState<AuthorRanking[]>([])
    const [readerRankings, setReaderRankings] = useState<ReaderRanking[]>([])
    const [novelRankings, setNovelRankings] = useState<NovelRanking[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [dataLoading, setDataLoading] = useState<boolean>(true)
    const [responseData, setResponseData] = useState<any>(null)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login-page')
        }
        if (user) {
            console.log(`Đã đăng nhập với: ${user.username} (${user.email})`);
        }
    }, [isAuthenticated, loading, router, user])

    // Hàm lấy dữ liệu từ API
    const fetchData = async () => {
        try {
            setDataLoading(true)
            
            // Lấy dữ liệu từ các API
            const usersData = await getAllUsers()
            const authorsData = await getAllAuthorRankings()
            const readersData = await getAllReaderRankings()
            const novelsData = await getAllNovelRankings()
            
            // Lấy token từ sessionStorage
            const token = sessionStorage.getItem('admin_token')
            if (!token) {
                console.error('Không tìm thấy token xác thực, cần đăng nhập trước')
                setTransactions([])
                return
            }
            
            // Gọi API transactions với token xác thực
            console.log('Đang gọi API transactions với token')
            const transactionsResponse = await fetch('/api/transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if (!transactionsResponse.ok) {
                console.error('API trả về lỗi:', transactionsResponse.status, transactionsResponse.statusText)
                setTransactions([])
                return
            }
            
            const transactionsData = await transactionsResponse.json()
            console.log('Dữ liệu giao dịch từ API:', transactionsData)
            setResponseData(transactionsData) // Lưu dữ liệu gốc để debug
            
            // Cập nhật state với xử lý an toàn
            setUsers(usersData || [])
            setAuthorRankings(authorsData || [])
            setReaderRankings(readersData || [])
            setNovelRankings(novelsData || [])
            
            // Đảm bảo transactions luôn là mảng
            if (Array.isArray(transactionsData)) {
                console.log('Dữ liệu là mảng với', transactionsData.length, 'phần tử')
                setTransactions(transactionsData)
            } else if (transactionsData && transactionsData.data && Array.isArray(transactionsData.data)) {
                console.log('Dữ liệu có trường data là mảng với', transactionsData.data.length, 'phần tử')
                setTransactions(transactionsData.data)
            } else {
                console.warn('Dữ liệu transactions không phải là mảng:', transactionsData)
                setTransactions([])
            }
            
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error)
            setTransactions([])
        } finally {
            setDataLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Chuẩn bị dữ liệu cho biểu đồ Gender Distribution (phân bố giới tính)
    const prepareGenderData = () => {
        const genderCount = users.reduce((acc, user) => {
            const gender = user.gender || 'Unknown'
            acc[gender] = (acc[gender] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(genderCount).map(([name, value]) => ({
            name: name === 'Male' ? 'Nam' : name === 'Female' ? 'Nữ' : 'Không xác định',
            value
        }))
    }

    // Chuẩn bị dữ liệu cho biểu đồ User Growth (tăng trưởng người dùng)
    const prepareUserGrowthData = () => {
        // Tạo dữ liệu mẫu cho 12 tháng gần nhất
        const currentDate = new Date()
        const data = []
        
        for (let i = 11; i >= 0; i--) {
            const month = new Date(currentDate)
            month.setMonth(currentDate.getMonth() - i)
            
            // Lọc người dùng được tạo trong tháng này
            const monthString = `${month.getMonth() + 1}/${month.getFullYear()}`
            const usersInMonth = users.filter(user => {
                const createdAt = new Date(user.createdAt)
                return createdAt.getMonth() === month.getMonth() && 
                       createdAt.getFullYear() === month.getFullYear()
            })
            
            data.push({
                name: `T${month.getMonth() + 1}`,
                readers: usersInMonth.filter(user => user.role === 'reader').length,
                authors: usersInMonth.filter(user => user.role === 'author').length,
                month: monthString
            })
        }
        
        return data
    }

    // Chuẩn bị dữ liệu cho biểu đồ Novel View Distribution (phân bố lượt xem truyện)
    const prepareNovelViewData = () => {
        return novelRankings.slice(0, 5).map(novel => ({
            name: novel.idNovel?.title || 'Không tên',
            views: novel.viewTotal || 0
        }))
    }

    // Chuẩn bị dữ liệu hiển thị cho Top Users
    const prepareTopUsers = () => {
        return readerRankings.slice(0, 5).map(reader => {
            const exp = reader.idReaderExp?.totalExp || reader.idReaderExp?.exp || 0
            return {
                id: reader._id,
                name: reader.idUser?.fullname || 'Người dùng',
                avatar: reader.idUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reader.idUser?.fullname || 'User')}`,
                exp: exp.toLocaleString(),
                level: Math.floor(exp / 1000) + 1 // Giả định cấp độ
            }
        })
    }

    // Chuẩn bị dữ liệu hiển thị cho Top Authors
    const prepareTopAuthors = () => {
        return authorRankings.slice(0, 5).map(author => ({
            id: author._id,
            name: author.idUser?.fullname || 'Tác giả',
            avatar: author.idUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.idUser?.fullname || 'Author')}`,
            views: author.viewTotal?.toLocaleString() || '0',
            rank: author.rank || 0
        }))
    }

    // Chuẩn bị dữ liệu phân bố transaction theo trạng thái
    const prepareTransactionStatusData = () => {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return [
                { name: 'Không có dữ liệu', value: 1 }
            ]
        }

        const statusCount = transactions.reduce((acc, trans) => {
            const status = trans.transactionStatus || trans.status || 'Unknown'
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(statusCount).map(([name, value]) => ({
            name: name === 'completed' ? 'Hoàn thành' : 
                 name === 'pending' ? 'Đang xử lý' : 
                 name === 'failed' ? 'Thất bại' : 'Không xác định',
            value
        }))
    }

    // Chuẩn bị dữ liệu tăng trưởng doanh thu theo tháng
    const prepareTransactionGrowthData = () => {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - 11 + i)
                return {
                    name: `T${date.getMonth() + 1}`,
                    amount: 0,
                    month: `${date.getMonth() + 1}/${date.getFullYear()}`
                }
            })
        }

        // Tạo dữ liệu mẫu cho 12 tháng gần nhất
        const currentDate = new Date()
        const data = []
        
        for (let i = 11; i >= 0; i--) {
            const month = new Date(currentDate)
            month.setMonth(currentDate.getMonth() - i)
            
            // Lọc transactions được tạo trong tháng này
            const monthString = `${month.getMonth() + 1}/${month.getFullYear()}`
            const transInMonth = transactions.filter(trans => {
                if (!trans.createdAt && !trans.date) return false
                const dateStr = trans.createdAt || trans.date || '';
                try {
                    const transDate = new Date(dateStr);
                    return transDate.getMonth() === month.getMonth() && 
                           transDate.getFullYear() === month.getFullYear();
                } catch (error) {
                    console.error('Lỗi chuyển đổi ngày:', dateStr);
                    return false;
                }
            })
            
            // Chỉ tính giao dịch thành công
            const completedTransactions = transInMonth.filter(t => 
                t.transactionStatus === 'completed' || t.status === 'completed'
            )
            
            const totalAmount = completedTransactions.reduce((sum, trans) => sum + (trans.amount || 0), 0)
            
            data.push({
                name: `T${month.getMonth() + 1}`,
                amount: totalAmount,
                month: monthString
            })
        }
        
        return data
    }

    // Chuẩn bị dữ liệu phân bố coin theo tháng
    const prepareCoinDistributionData = () => {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - 11 + i)
                return {
                    name: `T${date.getMonth() + 1}`,
                    coins: 0,
                    month: `${date.getMonth() + 1}/${date.getFullYear()}`
                }
            })
        }

        // Tạo dữ liệu cho 12 tháng gần nhất
        const currentDate = new Date()
        const data = []
        
        for (let i = 11; i >= 0; i--) {
            const month = new Date(currentDate)
            month.setMonth(currentDate.getMonth() - i)
            
            // Lọc transactions được tạo trong tháng này
            const monthString = `${month.getMonth() + 1}/${month.getFullYear()}`
            const transInMonth = transactions.filter(trans => {
                if (!trans.createdAt && !trans.date) return false
                const dateStr = trans.createdAt || trans.date || '';
                try {
                    const transDate = new Date(dateStr);
                    return transDate.getMonth() === month.getMonth() && 
                           transDate.getFullYear() === month.getFullYear();
                } catch (error) {
                    console.error('Lỗi chuyển đổi ngày cho coin:', dateStr);
                    return false;
                }
            })
            
            // Chỉ tính giao dịch thành công
            const completedTransactions = transInMonth.filter(t => 
                t.transactionStatus === 'completed' || t.status === 'completed'
            )
            
            const totalCoins = completedTransactions.reduce((sum, trans) => sum + (trans.coinsReceived || 0), 0)
            
            data.push({
                name: `T${month.getMonth() + 1}`,
                coins: totalCoins,
                month: monthString
            })
        }
        
        return data
    }

    // Định dạng số tiền VND
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'VNĐ');
    };

    // Hàm hiển thị trạng thái giao dịch
    const getTransactionStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Hoàn thành</span>
                </Badge>;
            case 'pending':
                return <Badge className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Đang xử lý</span>
                </Badge>;
            case 'failed':
                return <Badge className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Thất bại</span>
                </Badge>;
            default:
                return <Badge className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200">
                    <span>Không xác định</span>
                </Badge>;
        }
    };

    if (loading || dataLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-xl">Đang tải...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange
                        date={dateRange}
                        onDateChange={setDateRange}
                    />
                    <Button onClick={() => fetchData()}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Cập nhật
                    </Button>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
                            <CardTitle className="text-sm font-medium text-blue-800">
                                Người dùng
                            </CardTitle>
                            <div className="p-2 rounded-full bg-blue-500/10">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-3">
                            <div className="text-3xl font-bold text-blue-700 group-hover:text-blue-800">{users.length}</div>
                            <div className="flex items-center pt-1">
                                <span className="text-xs text-blue-600">
                                    <span className="font-semibold">{users.filter(u => u.role === 'reader').length}</span> độc giả, <span className="font-semibold">{users.filter(u => u.role === 'author').length}</span> tác giả
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-50 to-purple-100">
                            <CardTitle className="text-sm font-medium text-purple-800">
                                Tác giả
                            </CardTitle>
                            <div className="p-2 rounded-full bg-purple-500/10">
                                <Award className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-3">
                            <div className="text-3xl font-bold text-purple-700">{authorRankings.length}</div>
                            <div className="flex items-center pt-1">
                                <span className="text-xs text-purple-600">
                                    <span className="font-semibold">{authorRankings.reduce((total, author) => total + (author.viewTotal || 0), 0).toLocaleString()}</span> lượt xem
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-green-50 to-green-100">
                            <CardTitle className="text-sm font-medium text-green-800">
                                Tiểu thuyết
                            </CardTitle>
                            <div className="p-2 rounded-full bg-green-500/10">
                                <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-3">
                            <div className="text-3xl font-bold text-green-700">{novelRankings.length}</div>
                            <div className="flex items-center pt-1">
                                <span className="text-xs text-green-600">
                                    <span className="font-semibold">{novelRankings.reduce((total, novel) => total + (novel.viewTotal || 0), 0).toLocaleString()}</span> lượt xem
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-amber-50 to-amber-100">
                            <CardTitle className="text-sm font-medium text-amber-800">
                                Giao dịch
                            </CardTitle>
                            <div className="p-2 rounded-full bg-amber-500/10">
                                <DollarSign className="h-5 w-5 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-3">
                            <div className="text-3xl font-bold text-amber-700">{Array.isArray(transactions) ? transactions.length : 0}</div>
                            <div className="flex items-center pt-1">
                                <span className="text-xs text-amber-600">
                                    <span className="font-semibold">{Array.isArray(transactions) ? formatCurrency(transactions.reduce((sum, trans) => sum + (trans.amount || 0), 0)) : '0 VNĐ'}</span> tổng giá trị
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                        <TabsTrigger value="users">Người dùng</TabsTrigger>
                        <TabsTrigger value="novels">Tiểu thuyết</TabsTrigger>
                        <TabsTrigger value="finance">Tài chính</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Tăng trưởng người dùng</CardTitle>
                                    <CardDescription>
                                        Số lượng người dùng mới theo tháng
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={prepareUserGrowthData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip 
                                                    formatter={(value: number, name: string) => [
                                                        value, 
                                                        name === 'readers' ? 'Độc giả' : 'Tác giả'
                                                    ]}
                                                    labelFormatter={(label) => `Tháng ${label.substring(1)}`}
                                                />
                                                <Legend formatter={(value) => value === 'readers' ? 'Độc giả' : 'Tác giả'} />
                                                <Bar dataKey="readers" name="readers" fill="#3b82f6" />
                                                <Bar dataKey="authors" name="authors" fill="#8b5cf6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Phân bố giới tính</CardTitle>
                                    <CardDescription>
                                        Tỷ lệ người dùng theo giới tính
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={prepareGenderData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {prepareGenderData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [value, 'Số lượng']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Top 5 truyện có lượt xem cao nhất</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={prepareNovelViewData()}
                                                layout="vertical"
                                                margin={{
                                                    top: 5,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={(value) => [`${value.toLocaleString()} lượt xem`, 'Lượt xem']} />
                                                <Bar dataKey="views" fill="#10b981" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Top tác giả</CardTitle>
                                    <CardDescription>
                                        Những tác giả có lượt xem cao nhất
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {prepareTopAuthors().map((author) => (
                                            <div key={author.id} className="flex items-center">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={author.avatar} alt={author.name} />
                                                    <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="ml-4 space-y-1">
                                                    <p className="text-sm font-medium leading-none">{author.name}</p>
                                                    <p className="text-sm text-muted-foreground">Hạng #{author.rank}</p>
                                                </div>
                                                <div className="ml-auto font-medium">{author.views} xem</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="users" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Phân bố cấp độ người dùng</CardTitle>
                                    <CardDescription>
                                        Số lượng người dùng theo cấp độ
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={readerRankings.slice(0, 10).map((reader, index) => ({
                                            name: `Top ${index + 1}`,
                                            exp: reader.idReaderExp?.totalExp || reader.idReaderExp?.exp || 0,
                                            user: reader.idUser?.fullname || 'Người dùng'
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value: number) => [`${value.toLocaleString()} EXP`, 'Kinh nghiệm']}
                                                labelFormatter={(label, payload) => {
                                                    if (payload && payload.length > 0) {
                                                        return payload[0].payload.user
                                                    }
                                                    return label
                                                }}
                                            />
                                            <Bar dataKey="exp" fill="#8b5cf6" name="Kinh nghiệm" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Top người dùng</CardTitle>
                                    <CardDescription>
                                        Người dùng có kinh nghiệm cao nhất
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {prepareTopUsers().map((user) => (
                                            <div key={user.id} className="flex items-center">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="ml-4 space-y-1">
                                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">Cấp {user.level}</p>
                                                </div>
                                                <div className="ml-auto font-medium">{user.exp} EXP</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="novels" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-7">
                                <CardHeader>
                                    <CardTitle>Lượt xem truyện theo tháng</CardTitle>
                                    <CardDescription>
                                        Biểu đồ lượt xem truyện theo thời gian
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={Array.from({ length: 12 }, (_, i) => {
                                                const date = new Date()
                                                date.setMonth(date.getMonth() - 11 + i)
                                                return {
                                                    name: `T${date.getMonth() + 1}`,
                                                    views: Math.floor(Math.random() * 10000) + 5000,
                                                }
                                            })}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`${value.toLocaleString()} lượt xem`, 'Lượt xem']} />
                                            <Line type="monotone" dataKey="views" name="Lượt xem" stroke="#10b981" activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {novelRankings.slice(0, 6).map((novel, index) => (
                                <Card key={novel._id} className="overflow-hidden border shadow hover:shadow-md transition-shadow">
                                    <div className="h-48 bg-gray-100 relative">
                                        <img
                                            src={novel.idNovel?.imageUrl || `https://via.placeholder.com/400x200?text=${encodeURIComponent(novel.idNovel?.title || 'No Title')}`}
                                            alt={novel.idNovel?.title || 'No title'}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                                            #{index + 1}
                                        </div>
                                    </div>
                                    <CardContent className="pt-4">
                                        <h3 className="font-bold truncate">{novel.idNovel?.title || 'Không có tiêu đề'}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm text-muted-foreground">Lượt xem:</span>
                                            <span className="font-medium text-green-600">{novel.viewTotal?.toLocaleString() || '0'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="finance" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Tăng trưởng doanh thu theo tháng</CardTitle>
                                    <CardDescription>
                                        Biểu đồ tổng giá trị giao dịch theo thời gian
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={prepareTransactionGrowthData()}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value: number) => [`${formatCurrency(value)}`, 'Doanh thu']}
                                                labelFormatter={(label) => `Tháng ${label.substring(1)}`}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="amount" name="Doanh thu" stroke="#f59e0b" activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Phân bố trạng thái giao dịch</CardTitle>
                                    <CardDescription>
                                        Tỷ lệ giao dịch theo trạng thái
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={prepareTransactionStatusData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {prepareTransactionStatusData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [value, 'Số lượng']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-7">
                                <CardHeader>
                                    <CardTitle>Thống kê giao dịch</CardTitle>
                                    <CardDescription>
                                        Thông tin chi tiết về giao dịch
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="border rounded-lg p-4 bg-amber-50">
                                            <h3 className="text-sm font-medium text-amber-800 mb-2">Tổng doanh thu</h3>
                                            <p className="text-2xl font-bold text-amber-700">
                                                {Array.isArray(transactions) ? 
                                                    formatCurrency(transactions.reduce((sum, trans) => sum + (trans.amount || 0), 0)) : '0 VNĐ'}
                                            </p>
                                        </div>
                                        
                                        <div className="border rounded-lg p-4 bg-green-50">
                                            <h3 className="text-sm font-medium text-green-800 mb-2">Giao dịch thành công</h3>
                                            <p className="text-2xl font-bold text-green-700">
                                                {Array.isArray(transactions) ? 
                                                    transactions.filter(t => t.transactionStatus === 'completed' || t.status === 'completed').length : 0}
                                            </p>
                                        </div>
                                        
                                        <div className="border rounded-lg p-4 bg-red-50">
                                            <h3 className="text-sm font-medium text-red-800 mb-2">Giao dịch thất bại</h3>
                                            <p className="text-2xl font-bold text-red-700">
                                                {Array.isArray(transactions) ? 
                                                    transactions.filter(t => t.transactionStatus === 'failed' || t.status === 'failed').length : 0}
                                            </p>
                                        </div>
                                        
                                        <div className="border rounded-lg p-4 bg-purple-50">
                                            <h3 className="text-sm font-medium text-purple-800 mb-2">Tổng coin phát hành</h3>
                                            <p className="text-2xl font-bold text-purple-700">
                                                {Array.isArray(transactions) ? 
                                                    transactions.reduce((sum, trans) => sum + (trans.coinsReceived || 0), 0).toLocaleString() : 0} coin
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-7">
                                <CardHeader>
                                    <CardTitle>Phân bố coin theo tháng</CardTitle>
                                    <CardDescription>
                                        Biểu đồ số coin phát hành theo thời gian
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepareCoinDistributionData()}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value: number) => [`${value.toLocaleString()} coin`, 'Coin phát hành']}
                                                labelFormatter={(label) => `Tháng ${label.substring(1)}`}
                                            />
                                            <Legend />
                                            <Bar type="monotone" dataKey="coins" name="Coin" fill="#8b5cf6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="grid gap-4 lg:grid-cols-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Giao dịch gần đây</CardTitle>
                                    <CardDescription>
                                        5 giao dịch mới nhất trong hệ thống
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <div className="min-h-[200px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[180px]">Mã giao dịch</TableHead>
                                                        <TableHead className="w-[120px]">Người dùng</TableHead>
                                                        <TableHead className="w-[130px]">Số tiền</TableHead>
                                                        <TableHead className="w-[80px]">Coins</TableHead>
                                                        <TableHead className="min-w-[250px]">Thông tin đơn hàng</TableHead>
                                                        <TableHead className="w-[120px]">Trạng thái</TableHead>
                                                        <TableHead className="w-[120px]">Ngày tạo</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {dataLoading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="h-24 text-center">
                                                                <div className="flex justify-center items-center">
                                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                                    <span className="ml-2">Đang tải dữ liệu...</span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : !Array.isArray(transactions) || transactions.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="h-24 text-center">
                                                                Không tìm thấy giao dịch nào
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        transactions.slice(0, 5).map((transaction) => (
                                                            <TableRow key={transaction._id} className="hover:bg-muted/50">
                                                                <TableCell className="font-medium">
                                                                    <div className="overflow-hidden text-ellipsis">{transaction.orderId}</div>
                                                                    <div className="text-xs text-muted-foreground mt-1">ID: {transaction._id.substring(0, 10)}...</div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={transaction.idUser}>
                                                                            {transaction.idUser?.substring(0, 8)}...
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                                                                        <span>{transaction.coinsReceived}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="line-clamp-2" title={transaction.orderInfo}>
                                                                        {transaction.orderInfo}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getTransactionStatus(transaction.transactionStatus || transaction.status || 'unknown')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="whitespace-nowrap">
                                                                        {transaction.createdAt ? format(new Date(transaction.createdAt), "dd/MM/yyyy") : 'N/A'}
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {transaction.createdAt ? format(new Date(transaction.createdAt), "HH:mm:ss") : ''}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            
            {/* Debug section */}
            {process.env.NODE_ENV !== 'production' && (
                <details className="mt-8 border p-4 rounded-md">
                    <summary className="cursor-pointer font-medium">Debug: Dữ liệu gốc từ API transactions</summary>
                    <p className="mt-2 text-sm">Số lượng transactions: {transactions.length}</p>
                    <p className="mt-1 text-sm">Token auth: {sessionStorage.getItem('admin_token') ? 'Có' : 'Không có'}</p>
                    <pre className="mt-2 bg-gray-50 p-4 rounded-md overflow-auto text-xs max-h-96">
                        {JSON.stringify(responseData, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    )
}