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
import { Search } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RewardDialog } from "@/components/dashboard/reward-dialog"
import { getAllAuthorRankings, AuthorRanking } from "@/lib/api/authorRankings"

export default function AuthorRankingsPage() {
  const [rankings, setRankings] = useState<AuthorRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        const data = await getAllAuthorRankings()
        setRankings(data)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xếp hạng tác giả:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  const filteredRankings = rankings.filter((ranking) =>
    ranking.idUser?.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE)
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const top3Rankings = paginatedRankings.slice(0, 3).map(ranking => ({
    id: ranking._id,
    name: ranking.idUser?.fullname || 'Tác giả',
    avatar: ranking.idUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ranking.idUser?.fullname || 'Author')}`,
    rank: ranking.rank || 0
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
                <TableHead>Lượt Xem</TableHead>
                <TableHead>Thông Tin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : paginatedRankings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Không tìm thấy dữ liệu xếp hạng tác giả</TableCell>
                </TableRow>
              ) : (
                paginatedRankings.map((ranking, index) => (
                  <TableRow key={ranking._id}>
                    <TableCell className="font-medium">#{ranking.rank || ((currentPage - 1) * ITEMS_PER_PAGE + index + 1)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ranking.idUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ranking.idUser?.fullname || 'Author')}`} />
                          <AvatarFallback>{(ranking.idUser?.fullname || 'A').substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        {ranking.idUser?.fullname || 'Tác giả'}
                      </div>
                    </TableCell>
                    <TableCell>{ranking.viewTotal?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{ranking.idUser?.gender || 'N/A'}</TableCell>
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
          totalPages={totalPages || 1}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
} 