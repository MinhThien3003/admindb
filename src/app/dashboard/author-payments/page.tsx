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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, DollarSign, BookOpen, User, PieChart, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

// Định nghĩa interface cho tác giả
interface Author {
  id: number
  username: string
  email: string
  avatar: string
  level: string
  totalSales: number
  authorShare: number
  platformShare: number
  lastPaymentDate: Date | null
  pendingPayment: boolean
}

// Hàm định dạng số tiền
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

// Dữ liệu mẫu cho tác giả
const initialAuthors: Author[] = [
  {
    id: 1,
    username: "sarah_parker",
    email: "sarah.parker@example.com",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Parker",
    level: "Senior",
    totalSales: 4650000,
    authorShare: 3255000, // 70% của totalSales
    platformShare: 1395000, // 30% của totalSales
    lastPaymentDate: new Date("2024-05-02"),
    pendingPayment: false
  },
  {
    id: 2,
    username: "michael_chen",
    email: "michael.chen@example.com",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen",
    level: "Expert",
    totalSales: 7320000,
    authorShare: 5124000, // 70% của totalSales
    platformShare: 2196000, // 30% của totalSales
    lastPaymentDate: new Date("2024-05-03"),
    pendingPayment: false
  },
  {
    id: 3,
    username: "emma_wilson",
    email: "emma.wilson@example.com",
    avatar: "https://ui-avatars.com/api/?name=Emma+Wilson",
    level: "Junior",
    totalSales: 1250000,
    authorShare: 875000, // 70% của totalSales
    platformShare: 375000, // 30% của totalSales
    lastPaymentDate: null,
    pendingPayment: true
  },
  {
    id: 4,
    username: "david_brown",
    email: "david.brown@example.com",
    avatar: "https://ui-avatars.com/api/?name=David+Brown",
    level: "Expert",
    totalSales: 9150000,
    authorShare: 6405000, // 70% của totalSales
    platformShare: 2745000, // 30% của totalSales
    lastPaymentDate: new Date("2024-04-28"),
    pendingPayment: true
  },
  {
    id: 5,
    username: "lisa_zhang",
    email: "lisa.zhang@example.com",
    avatar: "https://ui-avatars.com/api/?name=Lisa+Zhang",
    level: "Senior",
    totalSales: 5320000,
    authorShare: 3724000, // 70% của totalSales
    platformShare: 1596000, // 30% của totalSales
    lastPaymentDate: new Date("2024-05-01"),
    pendingPayment: false
  },
  {
    id: 6,
    username: "james_wilson",
    email: "james.wilson@example.com",
    avatar: "https://ui-avatars.com/api/?name=James+Wilson",
    level: "Junior",
    totalSales: 980000,
    authorShare: 686000, // 70% của totalSales
    platformShare: 294000, // 30% của totalSales
    lastPaymentDate: null,
    pendingPayment: true
  },
  {
    id: 7,
    username: "maria_garcia",
    email: "maria.garcia@example.com",
    avatar: "https://ui-avatars.com/api/?name=Maria+Garcia",
    level: "Expert",
    totalSales: 8450000,
    authorShare: 5915000, // 70% của totalSales
    platformShare: 2535000, // 30% của totalSales
    lastPaymentDate: new Date("2024-04-30"),
    pendingPayment: true
  },
  {
    id: 8,
    username: "alex_kim",
    email: "alex.kim@example.com",
    avatar: "https://ui-avatars.com/api/?name=Alex+Kim",
    level: "Senior",
    totalSales: 4780000,
    authorShare: 3346000, // 70% của totalSales
    platformShare: 1434000, // 30% của totalSales
    lastPaymentDate: new Date("2024-05-02"),
    pendingPayment: false
  }
];

export default function AuthorPaymentsPage() {
  const [authors] = useState(initialAuthors)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Lọc tác giả theo các điều kiện
  const filteredAuthors = authors.filter((author) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = 
      author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Lọc theo cấp độ
    const matchesLevel = levelFilter === "all" || author.level === levelFilter;
    
    // Lọc theo trạng thái thanh toán
    const matchesPayment = 
      paymentFilter === "all" || 
      (paymentFilter === "pending" && author.pendingPayment) ||
      (paymentFilter === "paid" && !author.pendingPayment);
    
    // Lọc theo ngày thanh toán cuối cùng
    const matchesDateRange = 
      !dateRange || 
      !dateRange.from || 
      !dateRange.to || 
      !author.lastPaymentDate || 
      (author.lastPaymentDate >= dateRange.from && 
       author.lastPaymentDate <= new Date(dateRange.to.getTime() + 86400000)); // +1 day to include the end date
    
    return matchesSearch && matchesLevel && matchesPayment && matchesDateRange;
  });

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE);
  
  // Lấy tác giả cho trang hiện tại
  const paginatedAuthors = filteredAuthors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tính tổng doanh thu
  const totalSales = filteredAuthors.reduce((sum, author) => sum + author.totalSales, 0);
  
  // Tính tổng phần chia cho tác giả
  const totalAuthorShare = filteredAuthors.reduce((sum, author) => sum + author.authorShare, 0);
  
  // Tính tổng phần chia cho nền tảng
  const totalPlatformShare = filteredAuthors.reduce((sum, author) => sum + author.platformShare, 0);

  // Tính tổng thanh toán đang chờ xử lý
  const totalPendingPayments = filteredAuthors
    .filter(author => author.pendingPayment)
    .reduce((sum, author) => sum + author.authorShare, 0);

  // Hàm xuất dữ liệu ra file CSV
  const exportToCSV = () => {
    // Tạo header cho file CSV
    const headers = [
      "ID",
      "Tên tác giả",
      "Email",
      "Cấp độ",
      "Tổng doanh thu",
      "Phần chia tác giả (70%)",
      "Phần chia nền tảng (30%)",
      "Ngày thanh toán cuối",
      "Trạng thái thanh toán"
    ].join(",");

    // Tạo dữ liệu cho file CSV
    const csvData = filteredAuthors.map(author => [
      author.id,
      author.username,
      author.email,
      author.level,
      author.totalSales,
      author.authorShare,
      author.platformShare,
      author.lastPaymentDate ? format(author.lastPaymentDate, "dd/MM/yyyy") : "Chưa thanh toán",
      author.pendingPayment ? "Đang chờ thanh toán" : "Đã thanh toán"
    ].join(",")).join("\n");

    // Tạo file CSV
    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Tạo link tải xuống
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `author_payments_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hàm xử lý thanh toán cho tác giả
  const handlePayAuthor = (authorId: number) => {
    // Trong thực tế, đây sẽ là API call để xử lý thanh toán
    alert(`Đã thanh toán cho tác giả có ID: ${authorId}`);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý thanh toán tác giả</h2>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Xuất dữ liệu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              Từ {filteredAuthors.length} tác giả
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Phần chia tác giả (70%)
            </CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAuthorShare)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalAuthorShare / totalSales) * 100).toFixed(1)}% tổng doanh thu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Phần chia nền tảng (30%)
            </CardTitle>
            <PieChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalPlatformShare)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPlatformShare / totalSales) * 100).toFixed(1)}% tổng doanh thu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Thanh toán đang chờ
            </CardTitle>
            <ArrowRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalPendingPayments)}</div>
            <p className="text-xs text-muted-foreground">
              Từ {filteredAuthors.filter(a => a.pendingPayment).length} tác giả đang chờ
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={levelFilter}
            onValueChange={setLevelFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp độ</SelectItem>
              <SelectItem value="Junior">Junior</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={paymentFilter}
            onValueChange={setPaymentFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Đang chờ thanh toán</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
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
                <TableHead>Tác giả</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Tổng doanh thu</TableHead>
                <TableHead>Phân chia</TableHead>
                <TableHead>Thanh toán cuối</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAuthors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                        {author.avatar ? (
                          <img src={author.avatar} alt={author.username} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                            {author.username.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{author.username}</div>
                        <div className="text-xs text-muted-foreground">{author.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${author.level === "Expert" ? "bg-green-100 text-green-800 border-green-200" : 
                        author.level === "Senior" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                        "bg-gray-100 text-gray-800 border-gray-200"}
                    `}>
                      {author.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(author.totalSales)}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-2 cursor-help">
                            <div className="flex justify-between text-xs">
                              <span>Tác giả: {formatCurrency(author.authorShare)}</span>
                              <span>Nền tảng: {formatCurrency(author.platformShare)}</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tác giả (70%): {formatCurrency(author.authorShare)}</p>
                          <p>Nền tảng (30%): {formatCurrency(author.platformShare)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {author.lastPaymentDate ? (
                      format(author.lastPaymentDate, "dd/MM/yyyy")
                    ) : (
                      <span className="text-muted-foreground">Chưa thanh toán</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={author.pendingPayment ? "outline" : "secondary"} className={
                      author.pendingPayment 
                        ? "bg-orange-100 text-orange-800 border-orange-200" 
                        : "bg-green-100 text-green-800"
                    }>
                      {author.pendingPayment ? "Đang chờ thanh toán" : "Đã thanh toán"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePayAuthor(author.id)}
                      disabled={!author.pendingPayment}
                      className={author.pendingPayment ? "text-green-600 hover:text-green-700 hover:bg-green-50" : ""}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Thanh toán
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedAuthors.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedAuthors.length).fill(0).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell colSpan={7}>&nbsp;</TableCell>
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
    </div>
  )
} 