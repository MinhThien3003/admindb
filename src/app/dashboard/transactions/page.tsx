"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Loader2, User, CreditCard, Coins, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Định nghĩa kiểu dữ liệu cho giao dịch
interface Transaction {
  _id: string;
  idUser: string;
  amount: number;
  coinsReceived: number;
  orderInfo: string;
  transactionStatus: 'completed' | 'pending' | 'failed';
  orderId: string;
  createdAt: string;
  __v?: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const ITEMS_PER_PAGE = 10;

  // Tải dữ liệu từ API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = sessionStorage.getItem('admin_token');
        
        if (!token) {
          throw new Error('Vui lòng đăng nhập để xem danh sách giao dịch');
        }
        
        const response = await fetch('/api/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`Không thể tải giao dịch: ${response.status}`);
        }
        
        console.log('Dữ liệu giao dịch:', data);
        setResponseData(data);
        
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (data.data && Array.isArray(data.data)) {
          setTransactions(data.data);
        } else {
          setTransactions([]);
          throw new Error('Dữ liệu không đúng định dạng');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải giao dịch';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  // Lọc giao dịch theo tìm kiếm
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.orderInfo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.idUser?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  // Tính tổng số tiền và số coin
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCoins = transactions.reduce((sum, t) => sum + t.coinsReceived, 0);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Giao Dịch</h2>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số giao dịch
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {transactions.length}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">
              Giao dịch người dùng
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số tiền
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-green-600/80 mt-1">
              Tổng giá trị giao dịch
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-fuchsia-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số coin
            </CardTitle>
            <Coins className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {totalCoins} coin
            </div>
            <p className="text-xs text-purple-600/80 mt-1">
              Tổng số coin đã phát hành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hiển thị thông tin debug */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <p className="font-medium">Lỗi:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm giao dịch..."
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Không tìm thấy giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="overflow-hidden text-ellipsis">{transaction.orderId}</div>
                      <div className="text-xs text-muted-foreground mt-1">ID: {transaction._id.substring(0, 10)}...</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={transaction.idUser}>
                          {transaction.idUser.substring(0, 8)}...
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
                      {getTransactionStatus(transaction.transactionStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-nowrap">
                        {format(new Date(transaction.createdAt), "dd/MM/yyyy")}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.createdAt), "HH:mm:ss")}
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

      <div className="border-t">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Debug section */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 border p-4 rounded-md">
          <summary className="cursor-pointer font-medium">Debug: Dữ liệu gốc từ API</summary>
          <pre className="mt-2 bg-gray-50 p-4 rounded-md overflow-auto text-xs">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
} 