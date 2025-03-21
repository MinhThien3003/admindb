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
import { Search, Download, BookOpen, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AuthorRevenue {
  id: number
  transactionId: string
  authorId: number
  authorName: string
  authorAvatar: string
  userId: number
  userName: string
  userAvatar: string
  novelId: number
  novelTitle: string
  chapterId: number
  chapterTitle: string
  amount: number
  royaltyRate: number
  earnedAmount: number
  status: 'completed' | 'pending' | 'failed'
  createdAt: Date
}

// Hàm định dạng số tiền
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

const mockRevenues: AuthorRevenue[] = [
  {
    id: 1,
    transactionId: "TRX-2024-0002",
    authorId: 1,
    authorName: "sarah_parker",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Parker",
    userId: 101,
    userName: "Nguyễn Văn A",
    userAvatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 301,
    chapterTitle: "Khởi đầu mới",
    amount: 15000,
    royaltyRate: 0.7, // 70%
    earnedAmount: 10500, // 15000 * 0.7
    status: 'completed',
    createdAt: new Date("2024-05-01T11:00:00")
  },
  {
    id: 2,
    transactionId: "TRX-2024-0004",
    authorId: 2,
    authorName: "michael_chen",
    authorAvatar: "https://ui-avatars.com/api/?name=Michael+Chen",
    userId: 102,
    userName: "Trần Thị B",
    userAvatar: "https://ui-avatars.com/api/?name=Tran+Thi+B",
    novelId: 202,
    novelTitle: "Bí mật đêm trăng",
    chapterId: 302,
    chapterTitle: "Gặp gỡ định mệnh",
    amount: 20000,
    royaltyRate: 0.7,
    earnedAmount: 14000,
    status: 'completed',
    createdAt: new Date("2024-05-01T15:45:00")
  },
  {
    id: 3,
    transactionId: "TRX-2024-0005",
    authorId: 1,
    authorName: "sarah_parker",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Parker",
    userId: 103,
    userName: "Lê Văn C",
    userAvatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 303,
    chapterTitle: "Cuộc phiêu lưu bắt đầu",
    amount: 15000,
    royaltyRate: 0.7,
    earnedAmount: 10500,
    status: 'completed',
    createdAt: new Date("2024-05-01T14:20:00")
  },
  {
    id: 4,
    transactionId: "TRX-2024-0006",
    authorId: 3,
    authorName: "emma_wilson",
    authorAvatar: "https://ui-avatars.com/api/?name=Emma+Wilson",
    userId: 104,
    userName: "Phạm Thị D",
    userAvatar: "https://ui-avatars.com/api/?name=Pham+Thi+D",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 304,
    chapterTitle: "Cánh cổng thời gian",
    amount: 25000,
    royaltyRate: 0.7,
    earnedAmount: 17500,
    status: 'completed',
    createdAt: new Date("2024-05-01T16:10:00")
  },
  {
    id: 5,
    transactionId: "TRX-2024-0008",
    authorId: 3,
    authorName: "emma_wilson",
    authorAvatar: "https://ui-avatars.com/api/?name=Emma+Wilson",
    userId: 102,
    userName: "Trần Thị B",
    userAvatar: "https://ui-avatars.com/api/?name=Tran+Thi+B",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 307,
    chapterTitle: "Bí mật vũ trụ",
    amount: 25000,
    royaltyRate: 0.7,
    earnedAmount: 17500,
    status: 'pending',
    createdAt: new Date("2024-05-02T14:45:00")
  },
  {
    id: 6,
    transactionId: "TRX-2024-0009",
    authorId: 2,
    authorName: "michael_chen",
    authorAvatar: "https://ui-avatars.com/api/?name=Michael+Chen",
    userId: 103,
    userName: "Lê Văn C",
    userAvatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    novelId: 202,
    novelTitle: "Bí mật đêm trăng",
    chapterId: 308,
    chapterTitle: "Bí mật được hé lộ",
    amount: 20000,
    royaltyRate: 0.7,
    earnedAmount: 14000,
    status: 'completed',
    createdAt: new Date("2024-05-02T16:30:00")
  },
  {
    id: 7,
    transactionId: "TRX-2024-0010",
    authorId: 1,
    authorName: "sarah_parker",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Parker",
    userId: 104,
    userName: "Phạm Thị D",
    userAvatar: "https://ui-avatars.com/api/?name=Pham+Thi+D",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 309,
    chapterTitle: "Kết thúc hành trình",
    amount: 15000,
    royaltyRate: 0.7,
    earnedAmount: 10500,
    status: 'completed',
    createdAt: new Date("2024-05-03T09:15:00")
  },
  {
    id: 8,
    transactionId: "TRX-2024-0011",
    authorId: 3,
    authorName: "emma_wilson",
    authorAvatar: "https://ui-avatars.com/api/?name=Emma+Wilson",
    userId: 105,
    userName: "Hoàng Văn E",
    userAvatar: "https://ui-avatars.com/api/?name=Hoang+Van+E",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 310,
    chapterTitle: "Trở về",
    amount: 25000,
    royaltyRate: 0.7,
    earnedAmount: 17500,
    status: 'completed',
    createdAt: new Date("2024-05-03T10:45:00")
  },
  {
    id: 9,
    transactionId: "TRX-2024-0014",
    authorId: 3,
    authorName: "emma_wilson",
    authorAvatar: "https://ui-avatars.com/api/?name=Emma+Wilson",
    userId: 101,
    userName: "Nguyễn Văn A",
    userAvatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 311,
    chapterTitle: "Khám phá mới",
    amount: 25000,
    royaltyRate: 0.7,
    earnedAmount: 17500,
    status: 'completed',
    createdAt: new Date("2024-05-03T14:20:00")
  },
  {
    id: 10,
    transactionId: "TRX-2024-0015",
    authorId: 1,
    authorName: "sarah_parker",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Parker",
    userId: 103,
    userName: "Lê Văn C",
    userAvatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 312,
    chapterTitle: "Phần kết",
    amount: 15000,
    royaltyRate: 0.7,
    earnedAmount: 10500,
    status: 'completed',
    createdAt: new Date("2024-05-03T16:00:00")
  }
];

export default function AuthorRevenuesPage() {
  const [revenues] = useState(mockRevenues)
  const [searchQuery, setSearchQuery] = useState("")
  const [revenueStatus, setRevenueStatus] = useState<string>("all")
  const [authorFilter, setAuthorFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Lọc theo các điều kiện
  const filteredRevenues = revenues.filter((revenue) => {
    // Tìm kiếm theo query
    const matchesQuery = searchQuery === "" ||
      revenue.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.novelTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Lọc theo trạng thái
    const matchesStatus = revenueStatus === "all" || revenue.status === revenueStatus;
    
    // Lọc theo tác giả
    const matchesAuthor = authorFilter === "all" || revenue.authorId.toString() === authorFilter;

    // Lọc theo khoảng thời gian
    const matchesDateRange = !dateRange?.from || (
      revenue.createdAt >= dateRange.from &&
      (!dateRange.to || revenue.createdAt <= dateRange.to)
    );

    return matchesQuery && matchesStatus && matchesAuthor && matchesDateRange;
  })

  const totalPages = Math.ceil(filteredRevenues.length / ITEMS_PER_PAGE)
  const paginatedRevenues = filteredRevenues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Tính tổng doanh thu của tác giả
  const totalRevenue = filteredRevenues
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Tính tổng tiền tác giả nhận được
  const totalEarned = filteredRevenues
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.earnedAmount, 0);
  
  // Tính tổng phí nền tảng
  const totalPlatformFee = filteredRevenues
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount - t.earnedAmount), 0);

  // Hàm hiển thị trạng thái
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string }> = {
      completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Hoàn thành" },
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Đang xử lý" },
      failed: { color: "bg-red-100 text-red-800 border-red-200", label: "Thất bại" }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Xuất dữ liệu ra CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Mã giao dịch",
      "Tác giả",
      "Người dùng",
      "Truyện",
      "Chương",
      "Tổng tiền",
      "Tỷ lệ chia",
      "Tiền nhận được",
      "Trạng thái",
      "Ngày tạo"
    ].join(",");

    const rows = filteredRevenues.map(revenue => [
      revenue.id,
      revenue.transactionId,
      revenue.authorName,
      revenue.userName,
      revenue.novelTitle,
      revenue.chapterTitle,
      revenue.amount,
      `${revenue.royaltyRate * 100}%`,
      revenue.earnedAmount,
      revenue.status,
      format(revenue.createdAt, "dd/MM/yyyy HH:mm:ss")
    ].join(",")).join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `doanh-thu-tac-gia-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.click();
  };

  // Danh sách tác giả duy nhất để lọc
  const uniqueAuthors = [...new Set(revenues.map(r => r.authorId))].map(id => {
    const author = revenues.find(r => r.authorId === id);
    return {
      id: id,
      name: author?.authorName || ""
    };
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Doanh Thu Tác Giả</h2>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Xuất CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Từ {filteredRevenues.filter(t => t.status === 'completed').length} giao dịch mua chương
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Thu nhập tác giả (70%)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalEarned / totalRevenue) * 100).toFixed(1)}% tổng doanh thu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Phí nền tảng (30%)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalPlatformFee)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPlatformFee / totalRevenue) * 100).toFixed(1)}% tổng doanh thu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm doanh thu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={revenueStatus}
            onValueChange={setRevenueStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="pending">Đang xử lý</SelectItem>
              <SelectItem value="failed">Thất bại</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={authorFilter}
            onValueChange={setAuthorFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tác giả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tác giả</SelectItem>
              {uniqueAuthors.map(author => (
                <SelectItem key={author.id} value={author.id.toString()}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={setDateRange} 
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="min-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tác Giả</TableHead>
                <TableHead>Người Mua</TableHead>
                <TableHead>Truyện / Chương</TableHead>
                <TableHead>Tổng Tiền</TableHead>
                <TableHead>Tỷ Lệ</TableHead>
                <TableHead>Nhận Được</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Mua</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRevenues.length > 0 ? (
                paginatedRevenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={revenue.authorAvatar} />
                          <AvatarFallback>{revenue.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{revenue.authorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={revenue.userAvatar} />
                          <AvatarFallback>{revenue.userName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{revenue.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[200px] truncate cursor-help">
                              <div className="font-medium">{revenue.novelTitle}</div>
                              <div className="text-xs text-muted-foreground">{revenue.chapterTitle}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p><strong>Truyện:</strong> {revenue.novelTitle}</p>
                            <p><strong>Chương:</strong> {revenue.chapterTitle}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{formatCurrency(revenue.amount)}</TableCell>
                    <TableCell>{(revenue.royaltyRate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="font-medium">{formatCurrency(revenue.earnedAmount)}</TableCell>
                    <TableCell>{getStatusBadge(revenue.status)}</TableCell>
                    <TableCell>{format(revenue.createdAt, "dd/MM/yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    Không có dữ liệu doanh thu nào.
                  </TableCell>
                </TableRow>
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
    </div>
  )
} 