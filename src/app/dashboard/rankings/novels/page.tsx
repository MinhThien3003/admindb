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
import { RewardDialog } from "@/components/dashboard/reward-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAllNovelRankings, NovelRanking } from "@/lib/api/novelRankings"

export default function NovelRankingsPage() {
  const [rankings, setRankings] = useState<NovelRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        const data = await getAllNovelRankings()
        setRankings(data)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xếp hạng truyện:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  const filteredRankings = rankings.filter((ranking) =>
    ranking.idNovel?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE)
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const top3Rankings = paginatedRankings.slice(0, 3).map(ranking => ({
    id: ranking._id,
    name: ranking.idNovel?.title || 'Truyện',
    avatar: ranking.idNovel?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ranking.idNovel?.title || 'Novel')}`,
    rank: ranking.rank || 0
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
                <TableHead>Lượt Xem</TableHead>
                <TableHead>Cập Nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : paginatedRankings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Không tìm thấy dữ liệu xếp hạng truyện</TableCell>
                </TableRow>
              ) : (
                paginatedRankings.map((ranking, index) => (
                  <TableRow key={ranking._id}>
                    <TableCell className="font-medium">#{ranking.rank || ((currentPage - 1) * ITEMS_PER_PAGE + index + 1)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ranking.idNovel?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ranking.idNovel?.title || 'Novel')}`} />
                          <AvatarFallback>{(ranking.idNovel?.title || 'N').substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        {ranking.idNovel?.title || 'Không có tiêu đề'}
                      </div>
                    </TableCell>
                    <TableCell>{ranking.viewTotal.toLocaleString()}</TableCell>
                    <TableCell>{new Date(ranking.updatedAt).toLocaleDateString('vi-VN')}</TableCell>
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