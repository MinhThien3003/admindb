"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RewardDialog } from "@/components/dashboard/reward-dialog"

interface UserRanking {
  id: number
  username: string
  avatar: string
  totalComments: number
  totalLikes: number
  totalReviews: number
  totalSpent: number
  memberSince: Date
  level: string
}

const mockRankings: UserRanking[] = [
  {
    id: 1,
    username: "reader_king",
    avatar: "https://ui-avatars.com/api/?name=Reader+King",
    totalComments: 1500,
    totalLikes: 3000,
    totalReviews: 200,
    totalSpent: 5000000,
    memberSince: new Date("2023-01-01"),
    level: "VIP Diamond"
  },
  // Thêm mock data...
]

export default function UserRankingsPage() {
  const [rankings] = useState(mockRankings)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const filteredRankings = rankings.filter((ranking) =>
    ranking.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE)
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const top3Rankings = paginatedRankings.slice(0, 3).map(ranking => ({
    id: ranking.id,
    name: ranking.username,
    avatar: ranking.avatar,
    rank: ranking.id
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Xếp Hạng Người Dùng</h2>
        <RewardDialog topRankings={top3Rankings} type="user" />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm người dùng..."
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
                <TableHead>Xếp Hạng</TableHead>
                <TableHead>Người Dùng</TableHead>
                <TableHead>Cấp Độ</TableHead>
                <TableHead>Bình Luận</TableHead>
                <TableHead>Lượt Thích</TableHead>
                <TableHead>Đánh Giá</TableHead>
                <TableHead>Tổng Chi Tiêu</TableHead>
                <TableHead>Ngày Tham Gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRankings.map((ranking, index) => (
                <TableRow key={ranking.id}>
                  <TableCell className="font-medium">#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={ranking.avatar} />
                        <AvatarFallback>{ranking.username[0]}</AvatarFallback>
                      </Avatar>
                      {ranking.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      {ranking.level}
                    </span>
                  </TableCell>
                  <TableCell>{ranking.totalComments.toLocaleString()}</TableCell>
                  <TableCell>{ranking.totalLikes.toLocaleString()}</TableCell>
                  <TableCell>{ranking.totalReviews.toLocaleString()}</TableCell>
                  <TableCell>{ranking.totalSpent.toLocaleString()} VNĐ</TableCell>
                  <TableCell>{new Date(ranking.memberSince).toLocaleDateString()}</TableCell>
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