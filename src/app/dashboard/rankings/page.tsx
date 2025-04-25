"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CalendarIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSearchParams, useRouter } from "next/navigation"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { getAllReaderRankings, ReaderRanking } from "@/lib/api/readerRankings"
import { getAllAuthorRankings, AuthorRanking } from "@/lib/api/authorRankings"
import { getAllNovelRankings, NovelRanking } from "@/lib/api/novelRankings"

export default function RankingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")

  const [activeTab, setActiveTab] = useState<string>("novels")
  const [novelSearchQuery, setNovelSearchQuery] = useState("")
  const [authorSearchQuery, setAuthorSearchQuery] = useState("")
  const [userSearchQuery, setUserSearchQuery] = useState("")
  
  const [novelCurrentPage, setNovelCurrentPage] = useState(1)
  const [authorCurrentPage, setAuthorCurrentPage] = useState(1)
  const [userCurrentPage, setUserCurrentPage] = useState(1)
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [date, setDate] = useState<Date>()
  
  const [readerRankings, setReaderRankings] = useState<ReaderRanking[]>([])
  const [authorRankings, setAuthorRankings] = useState<AuthorRanking[]>([])
  const [novelRankings, setNovelRankings] = useState<NovelRanking[]>([])
  
  const [loadingReaders, setLoadingReaders] = useState(true)
  const [loadingAuthors, setLoadingAuthors] = useState(true)
  const [loadingNovels, setLoadingNovels] = useState(true)
  
  const ITEMS_PER_PAGE = 10

  // Lấy dữ liệu Xếp hạng độc giả
  useEffect(() => {
    const fetchReaderRankings = async () => {
      try {
        setLoadingReaders(true)
        const data = await getAllReaderRankings()
        setReaderRankings(data)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xếp hạng độc giả:", error)
      } finally {
        setLoadingReaders(false)
      }
    }
    
    fetchReaderRankings()
  }, [])
  
  // Lấy dữ liệu Xếp hạng tác giả
  useEffect(() => {
    const fetchAuthorRankings = async () => {
      try {
        setLoadingAuthors(true)
        const data = await getAllAuthorRankings()
        setAuthorRankings(data)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xếp hạng tác giả:", error)
      } finally {
        setLoadingAuthors(false)
      }
    }
    
    fetchAuthorRankings()
  }, [])
  
  // TODO: Implement Novel Rankings API
  useEffect(() => {
    // Gọi API Novel Rankings
    const fetchNovelRankings = async () => {
      try {
        setLoadingNovels(true)
        const data = await getAllNovelRankings()
        setNovelRankings(data)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xếp hạng truyện:", error)
      } finally {
        setLoadingNovels(false)
      }
    }
    
    fetchNovelRankings()
  }, [])

  // Set active tab based on URL query parameter
  useEffect(() => {
    if (tabParam && ["novels", "authors", "users"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard/rankings?tab=${value}`)
  }

  // Novels filtering and pagination
  const filteredNovels = novelRankings.filter((novel) => {
    // Lọc theo truy vấn tìm kiếm
    const matchesSearch = novel.idNovel?.title?.toLowerCase().includes(novelSearchQuery.toLowerCase())
    
    // Lọc theo khoảng thời gian
    const novelDate = novel.updatedAt ? new Date(novel.updatedAt) : null
    const matchesDateRange = !dateRange?.from || !dateRange?.to || !novelDate || 
      (novelDate >= dateRange.from && novelDate <= dateRange.to)
    
    // Lọc theo ngày đơn
    const matchesDate = !date || !novelDate || 
      (novelDate.getDate() === date.getDate() && 
       novelDate.getMonth() === date.getMonth() && 
       novelDate.getFullYear() === date.getFullYear())
    
    return matchesSearch && (matchesDateRange || matchesDate)
  })

  const novelTotalPages = Math.ceil(filteredNovels.length / ITEMS_PER_PAGE)
  const paginatedNovels = filteredNovels.slice(
    (novelCurrentPage - 1) * ITEMS_PER_PAGE,
    novelCurrentPage * ITEMS_PER_PAGE
  )

  // Authors filtering and pagination
  const filteredAuthors = authorRankings.filter((author) => {
    // Lọc theo truy vấn tìm kiếm
    return author.idUser?.fullname?.toLowerCase().includes(authorSearchQuery.toLowerCase())
  })
  
  const authorTotalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE)
  const paginatedAuthors = filteredAuthors.slice(
    (authorCurrentPage - 1) * ITEMS_PER_PAGE,
    authorCurrentPage * ITEMS_PER_PAGE
  )

  // Users filtering and pagination
  const filteredUsers = readerRankings.filter((user) => {
    // Lọc theo truy vấn tìm kiếm
    const matchesSearch = user.idUser?.fullname?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (user.idUser?.username && user.idUser.username.toLowerCase().includes(userSearchQuery.toLowerCase()))
    
    // Lọc theo khoảng thời gian (sử dụng createdAt thay cho memberSince)
    const userDate = user.createdAt ? new Date(user.createdAt) : null
    const matchesDateRange = !dateRange?.from || !dateRange?.to || !userDate || 
      (userDate >= dateRange.from && userDate <= dateRange.to)
    
    // Lọc theo ngày đơn
    const matchesDate = !date || !userDate || 
      (userDate.getDate() === date.getDate() && 
       userDate.getMonth() === date.getMonth() && 
       userDate.getFullYear() === date.getFullYear())
    
    return matchesSearch && (matchesDateRange || matchesDate)
  })
  
  const userTotalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (userCurrentPage - 1) * ITEMS_PER_PAGE,
    userCurrentPage * ITEMS_PER_PAGE
  )

  // Reset các filter
  const handleResetFilters = () => {
    setDateRange(undefined)
    setDate(undefined)
    setNovelSearchQuery("")
    setAuthorSearchQuery("")
    setUserSearchQuery("")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý bảng xếp hạng</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal w-[240px]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    setDate(date)
                    setDateRange(undefined)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={(range) => {
                setDateRange(range)
                setDate(undefined)
              }}
            />
            <Button variant="outline" onClick={handleResetFilters}>Đặt lại</Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="novels">Truyện</TabsTrigger>
          <TabsTrigger value="authors">Tác giả</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
        </TabsList>

        {/* Tab Truyện nổi bật */}
        <TabsContent value="novels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảng xếp hạng truyện</CardTitle>
              <CardDescription>
                Các truyện được xếp hạng dựa trên lượt xem, đánh giá và lượt thích.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên truyện hoặc tác giả..."
                    value={novelSearchQuery}
                    onChange={(e) => setNovelSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Xếp hạng</TableHead>
                      <TableHead>Tên truyện</TableHead>
                      <TableHead>Lượt xem</TableHead>
                      <TableHead>Cập nhật</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingNovels ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                      </TableRow>
                    ) : paginatedNovels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Không tìm thấy dữ liệu xếp hạng truyện</TableCell>
                      </TableRow>
                    ) : (
                      paginatedNovels.map((novel, index) => (
                        <TableRow key={novel._id || index}>
                          <TableCell className="font-medium">
                            #{novel.rank || ((novelCurrentPage - 1) * ITEMS_PER_PAGE + index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={novel.idNovel?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(novel.idNovel?.title || 'Novel')}`} />
                                <AvatarFallback>{(novel.idNovel?.title || 'N').substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span>{novel.idNovel?.title || 'Không có tiêu đề'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{novel.viewTotal?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            {novel.updatedAt ? new Date(novel.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={novelCurrentPage}
                  totalPages={novelTotalPages || 1}
                  onPageChange={setNovelCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Tác giả nổi bật */}
        <TabsContent value="authors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảng xếp hạng tác giả</CardTitle>
              <CardDescription>
                Các tác giả được xếp hạng dựa trên số lượng người theo dõi, tổng lượt xem và đánh giá.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên tác giả..."
                    value={authorSearchQuery}
                    onChange={(e) => setAuthorSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Xếp hạng</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Lượt xem</TableHead>
                      <TableHead>Thông tin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAuthors ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                      </TableRow>
                    ) : paginatedAuthors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Không tìm thấy dữ liệu xếp hạng tác giả</TableCell>
                      </TableRow>
                    ) : (
                      paginatedAuthors.map((author, index) => (
                        <TableRow key={author._id}>
                          <TableCell className="font-medium">
                            #{author.rank || ((authorCurrentPage - 1) * ITEMS_PER_PAGE + index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={author.idUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.idUser?.fullname || 'Author')}`} />
                                <AvatarFallback>{(author.idUser?.fullname || 'A').substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span>{author.idUser?.fullname}</span>
                            </div>
                          </TableCell>
                          <TableCell>{author.viewTotal?.toLocaleString() || '0'}</TableCell>
                          <TableCell>{author.idUser?.gender || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={authorCurrentPage}
                  totalPages={authorTotalPages || 1}
                  onPageChange={setAuthorCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Người dùng tích cực */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảng xếp hạng người dùng tích cực</CardTitle>
              <CardDescription>
                Người dùng được xếp hạng dựa trên kinh nghiệm và hoạt động.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên người dùng..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Xếp hạng</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Kinh nghiệm</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingReaders ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                      </TableRow>
                    ) : paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Không tìm thấy dữ liệu xếp hạng người dùng</TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user, index) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            #{user.rank || ((userCurrentPage - 1) * ITEMS_PER_PAGE + index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.idUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.idUser?.fullname || 'User')}`} />
                                <AvatarFallback>{(user.idUser?.fullname || user.idUser?.username || 'U').charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.idUser?.fullname || user.idUser?.username || 'Người dùng'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{(user.idReaderExp?.totalExp || user.idReaderExp?.exp || 0).toLocaleString()} EXP</TableCell>
                          <TableCell>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={userCurrentPage}
                  totalPages={userTotalPages || 1}
                  onPageChange={setUserCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 