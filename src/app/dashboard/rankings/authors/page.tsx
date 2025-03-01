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

interface AuthorRanking {
  id: number
  name: string
  avatar: string
  totalNovels: number
  totalViews: number
  totalLikes: number
  followers: number
  rating: number
  level: 'Junior' | 'Senior' | 'Expert'
}

const mockRankings: AuthorRanking[] = [
  {
    id: 1,
    name: "Đường Gia Tam Thiếu",
    avatar: "https://ui-avatars.com/api/?name=Đường+Gia+Tam+Thiếu",
    totalNovels: 15,
    totalViews: 5000000,
    totalLikes: 250000,
    followers: 100000,
    rating: 4.9,
    level: 'Expert'
  },
  // Thêm mock data...
]

export default function AuthorRankingsPage() {
  const [rankings] = useState(mockRankings)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const filteredRankings = rankings.filter((ranking) =>
    ranking.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE)
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const top3Rankings = paginatedRankings.slice(0, 3).map(ranking => ({
    id: ranking.id,
    name: ranking.name,
    avatar: ranking.avatar,
    rank: ranking.id
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Xếp Hạng Tác Giả</h2>
        <RewardDialog topRankings={top3Rankings} type="author" />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tác giả..."
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
                <TableHead>Tác Giả</TableHead>
                <TableHead>Cấp Độ</TableHead>
                <TableHead>Số Truyện</TableHead>
                <TableHead>Lượt Xem</TableHead>
                <TableHead>Lượt Thích</TableHead>
                <TableHead>Người Theo Dõi</TableHead>
                <TableHead>Đánh Giá</TableHead>
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
                        <AvatarFallback>{ranking.name[0]}</AvatarFallback>
                      </Avatar>
                      {ranking.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${ranking.level === 'Expert' ? 'bg-green-100 text-green-800' :
                        ranking.level === 'Senior' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {ranking.level}
                    </span>
                  </TableCell>
                  <TableCell>{ranking.totalNovels}</TableCell>
                  <TableCell>{ranking.totalViews.toLocaleString()}</TableCell>
                  <TableCell>{ranking.totalLikes.toLocaleString()}</TableCell>
                  <TableCell>{ranking.followers.toLocaleString()}</TableCell>
                  <TableCell>{ranking.rating.toFixed(1)}/5</TableCell>
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