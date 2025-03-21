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
import { Search, Download, DollarSign, BookOpen, Coins } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Định nghĩa interface cho giao dịch
interface Transaction {
  id: number
  transactionId: string
  userId: number
  userName: string
  userAvatar: string
  authorId: number | null
  authorName: string | null
  novelId: number | null
  novelTitle: string | null
  chapterId: number | null
  chapterTitle: string | null
  amount: number // Số tiền (VND) hoặc số xu
  coins: number | null // Số xu nhận được (chỉ áp dụng cho giao dịch nạp tiền)
  status: 'completed' | 'pending' | 'failed'
  type: 'deposit' | 'purchase' | 'author_payment' | 'refund' // Các loại giao dịch
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

// Dữ liệu mẫu cho giao dịch
const initialTransactions: Transaction[] = [
  {
    id: 1,
    transactionId: "TRX-2024-0001",
    userId: 101,
    userName: "Nguyễn Văn A",
    userAvatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
    authorId: null,
    authorName: null,
    novelId: null,
    novelTitle: null,
    chapterId: null,
    chapterTitle: null,
    amount: 100000,
    coins: 100, // 1000 VND = 1 xu
    status: 'completed',
    type: 'deposit',
    createdAt: new Date("2024-05-01T10:30:00")
  },
  {
    id: 2,
    transactionId: "TRX-2024-0002",
    userId: 101,
    userName: "Nguyễn Văn A",
    userAvatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
    authorId: 1,
    authorName: "sarah_parker",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 301,
    chapterTitle: "Khởi đầu mới",
    amount: 15, // 15 xu
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-01T11:00:00")
  },
  {
    id: 3,
    transactionId: "TRX-2024-0003",
    userId: 102,
    userName: "Trần Thị B",
    userAvatar: "https://ui-avatars.com/api/?name=Tran+Thi+B",
    authorId: null,
    authorName: null,
    novelId: null,
    novelTitle: null,
    chapterId: null,
    chapterTitle: null,
    amount: 200000,
    coins: 200,
    status: 'completed',
    type: 'deposit',
    createdAt: new Date("2024-05-01T14:20:00")
  },
  {
    id: 4,
    transactionId: "TRX-2024-0004",
    userId: 102,
    userName: "Trần Thị B",
    userAvatar: "https://ui-avatars.com/api/?name=Tran+Thi+B",
    authorId: 2,
    authorName: "michael_chen",
    novelId: 202,
    novelTitle: "Bí mật đêm trăng",
    chapterId: 302,
    chapterTitle: "Gặp gỡ định mệnh",
    amount: 20, // 20 xu
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-01T15:45:00")
  },
  {
    id: 5,
    transactionId: "TRX-2024-0005",
    userId: 103,
    userName: "Lê Văn C",
    userAvatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    authorId: 1,
    authorName: "sarah_parker",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 303,
    chapterTitle: "Cuộc phiêu lưu bắt đầu",
    amount: 15000,
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-01T14:20:00")
  },
  {
    id: 6,
    transactionId: "TRX-2024-0006",
    userId: 104,
    userName: "Phạm Thị D",
    userAvatar: "https://ui-avatars.com/api/?name=Pham+Thi+D",
    authorId: 3,
    authorName: "emma_wilson",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 304,
    chapterTitle: "Cánh cổng thời gian",
    amount: 25000,
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-01T16:10:00")
  },
  {
    id: 7,
    transactionId: "TRX-2024-0007",
    userId: 0,
    userName: "Hệ thống",
    userAvatar: "",
    authorId: 1,
    authorName: "sarah_parker",
    novelId: 0,
    novelTitle: "",
    chapterId: 0,
    chapterTitle: "",
    amount: 450000,
    coins: null,
    status: 'completed',
    type: 'author_payment',
    createdAt: new Date("2024-05-02T12:00:00")
  },
  {
    id: 8,
    transactionId: "TRX-2024-0008",
    userId: 102,
    userName: "Trần Thị B",
    userAvatar: "https://ui-avatars.com/api/?name=Tran+Thi+B",
    authorId: 3,
    authorName: "emma_wilson",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 307,
    chapterTitle: "Bí mật vũ trụ",
    amount: 25000,
    coins: null,
    status: 'pending',
    type: 'purchase',
    createdAt: new Date("2024-05-02T14:45:00")
  },
  {
    id: 9,
    transactionId: "TRX-2024-0009",
    userId: 103,
    userName: "Lê Văn C",
    userAvatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    authorId: 2,
    authorName: "michael_chen",
    novelId: 202,
    novelTitle: "Bí mật đêm trăng",
    chapterId: 308,
    chapterTitle: "Bí mật được hé lộ",
    amount: 20000,
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-02T16:30:00")
  },
  {
    id: 10,
    transactionId: "TRX-2024-0010",
    userId: 104,
    userName: "Phạm Thị D",
    userAvatar: "https://ui-avatars.com/api/?name=Pham+Thi+D",
    authorId: 1,
    authorName: "sarah_parker",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 309,
    chapterTitle: "Kết thúc hành trình",
    amount: 15000,
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-03T09:15:00")
  },
  {
    id: 11,
    transactionId: "TRX-2024-0011",
    userId: 105,
    userName: "Hoàng Văn E",
    userAvatar: "https://ui-avatars.com/api/?name=Hoang+Van+E",
    authorId: 3,
    authorName: "emma_wilson",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 310,
    chapterTitle: "Trở về",
    amount: 25000,
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-03T10:45:00")
  },
  {
    id: 12,
    transactionId: "TRX-2024-0012",
    userId: 105,
    userName: "Hoàng Văn E",
    userAvatar: "https://ui-avatars.com/api/?name=Hoang+Van+E",
    authorId: 2,
    authorName: "michael_chen",
    novelId: 202,
    novelTitle: "Bí mật đêm trăng",
    chapterId: 0,
    chapterTitle: "",
    amount: 50000,
    coins: null,
    status: 'completed',
    type: 'refund',
    createdAt: new Date("2024-05-03T11:30:00")
  },
  {
    id: 13,
    transactionId: "TRX-2024-0013",
    userId: 0,
    userName: "Hệ thống",
    userAvatar: "",
    authorId: 2,
    authorName: "michael_chen",
    novelId: 0,
    novelTitle: "",
    chapterId: 0,
    chapterTitle: "",
    amount: 380000,
    coins: null,
    status: 'completed',
    type: 'author_payment',
    createdAt: new Date("2024-05-03T12:00:00")
  },
  {
    id: 14,
    transactionId: "TRX-2024-0014",
    userId: 101,
    userName: "Nguyễn Văn A",
    userAvatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
    authorId: 3,
    authorName: "emma_wilson",
    novelId: 203,
    novelTitle: "Vũ trụ song song",
    chapterId: 311,
    chapterTitle: "Khám phá mới",
    amount: 25000,
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-03T14:20:00")
  },
  {
    id: 15,
    transactionId: "TRX-2024-0015",
    userId: 103,
    userName: "Lê Văn C",
    userAvatar: "https://ui-avatars.com/api/?name=Le+Van+C",
    authorId: 1,
    authorName: "sarah_parker",
    novelId: 201,
    novelTitle: "Hành trình kỳ diệu",
    chapterId: 312,
    chapterTitle: "Phần kết",
    amount: 15000,
    coins: null,
    status: 'completed',
    type: 'purchase',
    createdAt: new Date("2024-05-03T16:00:00")
  }
];

export default function TransactionsPage() {
  const [transactions] = useState(initialTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<string>("all")
  const [transactionType, setTransactionType] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Lọc theo người dùng (chỉ lấy giao dịch deposit và purchase, không lấy author_payment)
  const filteredTransactions = transactions
    .filter(transaction => transaction.type !== 'author_payment')
    .filter((transaction) => {
      // Tìm kiếm theo query
      const matchesQuery = searchQuery === "" ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.novelTitle && transaction.novelTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.chapterTitle && transaction.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Lọc theo trạng thái
      const matchesStatus = transactionStatus === "all" || transaction.status === transactionStatus;
      
      // Lọc theo loại giao dịch
      const matchesType = transactionType === "all" || transaction.type === transactionType;

      // Lọc theo khoảng thời gian
      const matchesDateRange = !dateRange?.from || (
        transaction.createdAt >= dateRange.from &&
        (!dateRange.to || transaction.createdAt <= dateRange.to)
      );

      return matchesQuery && matchesStatus && matchesType && matchesDateRange;
    })

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  
  // Lấy giao dịch cho trang hiện tại
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tính tổng doanh thu từ nạp tiền
  const totalDeposits = filteredTransactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Tính tổng xu đã phát hành
  const totalCoinsIssued = filteredTransactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.coins || 0), 0);

  // Tính tổng giao dịch mua chương
  const totalPurchases = filteredTransactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Hàm hiển thị trạng thái giao dịch
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

  // Hàm hiển thị loại giao dịch
  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { color: string, label: string }> = {
      deposit: { color: "bg-green-100 text-green-800 border-green-200", label: "Nạp tiền" },
      purchase: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Mua chương" }
    };

    const config = typeConfig[type] || typeConfig.deposit;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Hàm xuất dữ liệu ra file CSV
  const exportToCSV = () => {
    // Tạo header cho file CSV
    const headers = [
      "ID",
      "Mã giao dịch",
      "Người dùng",
      "Số tiền",
      "Loại giao dịch",
      "Trạng thái",
      "Ngày tạo"
    ].join(",");

    // Tạo dữ liệu cho file CSV
    const csvData = filteredTransactions.map(transaction => [
      transaction.id,
      transaction.transactionId,
      transaction.userName,
      transaction.amount,
      transaction.type,
      transaction.status,
      format(transaction.createdAt, "dd/MM/yyyy HH:mm:ss")
    ].join(",")).join("\n");

    // Tạo file CSV
    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Tạo link tải xuống
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Giao Dịch Người Dùng</h2>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Xuất CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng nạp tiền
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits)}</div>
            <p className="text-xs text-muted-foreground">
              Từ {filteredTransactions.filter(t => t.type === 'deposit' && t.status === 'completed').length} giao dịch thành công
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng xu đã phát hành
            </CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalCoinsIssued} xu</div>
            <p className="text-xs text-muted-foreground">
              Giá trị: {formatCurrency(totalCoinsIssued * 1000)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng mua chương
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPurchases} xu</div>
            <p className="text-xs text-muted-foreground">
              Từ {filteredTransactions.filter(t => t.type === 'purchase' && t.status === 'completed').length} giao dịch mua chương
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm giao dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={transactionStatus}
            onValueChange={setTransactionStatus}
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
            value={transactionType}
            onValueChange={setTransactionType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="deposit">Nạp tiền</SelectItem>
              <SelectItem value="purchase">Mua chương</SelectItem>
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
                <TableHead>Mã giao dịch</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Loại giao dịch</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                              {transaction.userAvatar ? (
                                <img src={transaction.userAvatar} alt={transaction.userName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                                  {transaction.userName.charAt(0)}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>ID: {transaction.userId}</p>
                            <p>Tên: {transaction.userName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span>{transaction.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.type === 'deposit' ? (
                      <div>
                        <div>{formatCurrency(transaction.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          Nhận: {transaction.coins} xu
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>{transaction.amount} xu</div>
                        <div className="text-xs text-muted-foreground">
                          = {formatCurrency(transaction.amount * 1000)}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{format(transaction.createdAt, "dd/MM/yyyy")}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(transaction.createdAt, "dd/MM/yyyy HH:mm:ss")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedTransactions.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedTransactions.length).fill(0).map((_, index) => (
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