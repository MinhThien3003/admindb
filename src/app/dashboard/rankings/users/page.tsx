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
import { Search, Trophy, Medal, Award, AlertCircle } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RewardDialog } from "@/components/dashboard/reward-dialog"
import { getAllReaderRankings, ReaderRanking } from "@/lib/api/readerRankings"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function UserRankingsPage() {
  const [rankings, setRankings] = useState<ReaderRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllReaderRankings()
        setRankings(data)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xếp hạng:", error)
        setError(error instanceof Error ? error.message : "Lỗi không xác định khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  const filteredRankings = rankings.filter((ranking) =>
    ranking.idUser.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ranking.idUser.username && ranking.idUser.username.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE)
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const top3Rankings = filteredRankings.slice(0, 3).map(ranking => ({
    id: ranking._id,
    name: ranking.idUser.fullname || ranking.idUser.username || 'Người dùng',
    avatar: ranking.idUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ranking.idUser.fullname || 'User')}`,
    rank: ranking.rank || 0,
    exp: ranking.idReaderExp.totalExp || ranking.idReaderExp.exp || 0
  } as {id: string | number, name: string, avatar: string, rank: number, exp: number}))

  // Render huy hiệu dựa trên thứ hạng
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-yellow-600">Hạng 1</span>
        </div>
      )
    } else if (rank === 2) {
      return (
        <div className="flex items-center gap-1">
          <Medal className="h-5 w-5 text-gray-400" />
          <span className="font-bold text-gray-600">Hạng 2</span>
        </div>
      )
    } else if (rank === 3) {
      return (
        <div className="flex items-center gap-1">
          <Award className="h-5 w-5 text-amber-600" />
          <span className="font-bold text-amber-700">Hạng 3</span>
        </div>
      )
    }
    
    return <span className="font-medium">#{rank}</span>
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Xếp Hạng Người Dùng</h2>
        <RewardDialog topRankings={top3Rankings} type="user" />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Hiển thị Top 3 nổi bật */}
      {!loading && !error && top3Rankings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Top Người Dùng Xuất Sắc</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3Rankings.map((user, index) => (
              <Card key={user.id} className={`overflow-hidden border-2 shadow-lg ${
                index === 0 
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400' 
                  : index === 1 
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-400' 
                    : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400'
              }`}>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className={`h-24 w-24 border-4 shadow-md ${
                      index === 0 
                        ? 'border-yellow-500' 
                        : index === 1 
                          ? 'border-gray-400' 
                          : 'border-amber-600'
                    }`}>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className={`${
                        index === 0 
                          ? 'bg-yellow-200 text-yellow-800' 
                        : index === 1 
                          ? 'bg-gray-200 text-gray-800' 
                        : 'bg-amber-200 text-amber-800'
                      }`}>
                        {user.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-3 -right-3 p-2 rounded-full shadow-lg ${
                      index === 0 
                        ? 'bg-yellow-500' 
                        : index === 1 
                          ? 'bg-gray-500' 
                        : 'bg-amber-600'
                    }`}>
                      {index === 0 ? (
                        <Trophy className="h-6 w-6 text-white" />
                      ) : index === 1 ? (
                        <Medal className="h-6 w-6 text-white" />
                      ) : (
                        <Award className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-2 line-clamp-2">{user.name}</h4>
                  <Badge className={`px-3 py-1 text-sm font-semibold ${
                    index === 0 
                      ? 'bg-yellow-200 text-yellow-800 border-yellow-300 hover:bg-yellow-300' 
                    : index === 1 
                      ? 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300' 
                    : 'bg-amber-200 text-amber-800 border-amber-300 hover:bg-amber-300'
                  }`}>
                    {index === 0 ? 'Hạng Nhất 🏆' : index === 1 ? 'Hạng Nhì 🥈' : 'Hạng Ba 🥉'}
                  </Badge>
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    <span className={`font-bold ${
                      index === 0 
                        ? 'text-yellow-700' 
                      : index === 1 
                        ? 'text-gray-700' 
                      : 'text-amber-700'
                    }`}>
                      {user.exp.toLocaleString()}
                    </span> EXP
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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

      <div className="rounded-md border shadow">
        <div className="min-h-[500px]">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-24">Xếp Hạng</TableHead>
                <TableHead>Người Dùng</TableHead>
                <TableHead>Kinh Nghiệm</TableHead>
                <TableHead>Ngày Tham Gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    Không thể tải dữ liệu. Vui lòng thử lại sau.
                  </TableCell>
                </TableRow>
              ) : paginatedRankings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Không tìm thấy dữ liệu xếp hạng</TableCell>
                </TableRow>
              ) : (
                paginatedRankings.map((ranking, index) => {
                  const rank = ranking.rank || ((currentPage - 1) * ITEMS_PER_PAGE + index + 1)
                  const isTop3 = rank <= 3
                  
                  return (
                    <TableRow 
                      key={ranking._id}
                      className={`${
                        isTop3 
                          ? rank === 1 
                            ? 'bg-yellow-50 hover:bg-yellow-100' 
                            : rank === 2 
                              ? 'bg-gray-50 hover:bg-gray-100' 
                              : 'bg-amber-50 hover:bg-amber-100'
                          : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <TableCell className="font-medium">
                        {renderRankBadge(rank)}
                      </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-10 w-10 ${
                            isTop3 
                              ? rank === 1 
                                ? 'border-2 border-yellow-400 ring-2 ring-yellow-200' 
                                : rank === 2 
                                  ? 'border-2 border-gray-400 ring-2 ring-gray-200' 
                                  : 'border-2 border-amber-400 ring-2 ring-amber-200'
                              : ''
                          }`}>
                          <AvatarImage src={ranking.idUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ranking.idUser.fullname || 'User')}`} />
                          <AvatarFallback>{(ranking.idUser.fullname || ranking.idUser.username || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                          <div>
                            <p className={`${isTop3 ? 'font-bold' : 'font-medium'}`}>
                        {ranking.idUser.fullname || ranking.idUser.username || 'Người dùng'}
                            </p>
                            {ranking.idUser.username && (
                              <p className="text-xs text-gray-500">@{ranking.idUser.username}</p>
                            )}
                          </div>
                      </div>
                    </TableCell>
                      <TableCell>
                        <span className={`${isTop3 ? 'font-semibold' : ''} ${
                          rank === 1 
                            ? 'text-yellow-600' 
                            : rank === 2 
                              ? 'text-gray-600' 
                              : rank === 3 
                                ? 'text-amber-600' 
                                : ''
                        }`}>
                          {(ranking.idReaderExp.totalExp || ranking.idReaderExp.exp || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">EXP</span>
                      </TableCell>
                    <TableCell>{new Date(ranking.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  </TableRow>
                  )
                })
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