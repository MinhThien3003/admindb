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
import { RewardDialog } from "@/components/dashboard/reward-dialog"

interface NovelRanking {
  id: number
  title: string
  author: string
  views: number
  likes: number
  rating: number
  chapters: number
  lastUpdated: Date
}

const mockRankings: NovelRanking[] = [
  {
    id: 1,
    title: "Đấu La Đại Lục",
    author: "Đường Gia Tam Thiếu",
    views: 1500000,
    likes: 75000,
    rating: 4.8,
    chapters: 500,
    lastUpdated: new Date("2024-03-01")
  },
  // Thêm mock data...
]

export default function NovelRankingsPage() {
  const [rankings] = useState(mockRankings)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const filteredRankings = rankings.filter((ranking) =>
    ranking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ranking.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE)
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const top3Rankings = paginatedRankings.slice(0, 3).map(ranking => ({
    id: ranking.id,
    name: ranking.title,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ranking.title)}`,
    rank: ranking.id
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Xếp Hạng Truyện</h2>
        <RewardDialog topRankings={top3Rankings} type="novel" />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm truyện..."
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
                <TableHead>Tên Truyện</TableHead>
                <TableHead>Tác Giả</TableHead>
                <TableHead>Lượt Xem</TableHead>
                <TableHead>Lượt Thích</TableHead>
                <TableHead>Đánh Giá</TableHead>
                <TableHead>Số Chương</TableHead>
                <TableHead>Cập Nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRankings.map((ranking, index) => (
                <TableRow key={ranking.id}>
                  <TableCell className="font-medium">#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell>{ranking.title}</TableCell>
                  <TableCell>{ranking.author}</TableCell>
                  <TableCell>{ranking.views.toLocaleString()}</TableCell>
                  <TableCell>{ranking.likes.toLocaleString()}</TableCell>
                  <TableCell>{ranking.rating.toFixed(1)}/5</TableCell>
                  <TableCell>{ranking.chapters}</TableCell>
                  <TableCell>{new Date(ranking.lastUpdated).toLocaleDateString()}</TableCell>
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