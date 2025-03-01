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
import { Search } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserTransaction {
  id: number
  userId: number
  username: string
  avatar: string
  amount: number
  type: 'deposit' | 'purchase'
  status: 'completed' | 'pending' | 'failed'
  description: string
  createdAt: Date
}

const mockTransactions: UserTransaction[] = [
  {
    id: 1,
    userId: 1,
    username: "john_reader",
    avatar: "https://ui-avatars.com/api/?name=John+Reader",
    amount: 100000,
    type: 'deposit',
    status: 'completed',
    description: 'Nạp tiền vào tài khoản',
    createdAt: new Date("2024-03-01")
  },
  {
    id: 2,
    userId: 1,
    username: "john_reader",
    avatar: "https://ui-avatars.com/api/?name=John+Reader",
    amount: 50000,
    type: 'purchase',
    status: 'completed',
    description: 'Mua chương VIP - Truyện ABC',
    createdAt: new Date("2024-03-02")
  },
  // Thêm mock data...
]

export default function UserTransactionsPage() {
  const [transactions] = useState(mockTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Giao Dịch Người Dùng</h2>
      </div>

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
                <TableHead>ID</TableHead>
                <TableHead>Người Dùng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số Tiền</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Mô Tả</TableHead>
                <TableHead>Ngày Tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={transaction.avatar} />
                        <AvatarFallback>{transaction.username[0]}</AvatarFallback>
                      </Avatar>
                      {transaction.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {transaction.type === 'deposit' ? 'Nạp Tiền' : 'Mua Chương'}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.amount.toLocaleString()} VNĐ</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {transaction.status === 'completed' ? 'Hoàn Thành' :
                        transaction.status === 'pending' ? 'Đang Xử Lý' : 'Thất Bại'}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{format(transaction.createdAt, "dd/MM/yyyy HH:mm")}</TableCell>
                </TableRow>
              ))}
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