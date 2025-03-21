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

// Novel Rankings
interface NovelRanking {
  id: number
  title: string
  author: string
  views: number
  likes: number
  rating: number
  chapters: number
  lastUpdated: Date
  coverImage: string
}

const mockNovelRankings: NovelRanking[] = [
  {
    id: 1,
    title: "Đấu La Đại Lục",
    author: "Đường Gia Tam Thiếu",
    views: 1500000,
    likes: 75000,
    rating: 4.8,
    chapters: 500,
    lastUpdated: new Date("2024-03-01"),
    coverImage: "https://ui-avatars.com/api/?name=Đấu+La"
  },
  {
    id: 2,
    title: "Đấu Phá Thương Khung",
    author: "Thiên Tàm Thổ Đậu",
    views: 1200000,
    likes: 65000,
    rating: 4.7,
    chapters: 450,
    lastUpdated: new Date("2024-03-02"),
    coverImage: "https://ui-avatars.com/api/?name=Đấu+Phá"
  },
  {
    id: 3,
    title: "Ngược Dòng Thời Gian Để Yêu Anh",
    author: "Nguyệt Hạ Điệp Ảnh",
    views: 1000000,
    likes: 60000,
    rating: 4.6,
    chapters: 120,
    lastUpdated: new Date("2024-02-28"),
    coverImage: "https://ui-avatars.com/api/?name=Ngược+Dòng"
  },
  {
    id: 4,
    title: "Tu Chân Tứ Vạn Năm",
    author: "Ngã Cật Tây Hồng Thị",
    views: 980000,
    likes: 55000,
    rating: 4.5,
    chapters: 350,
    lastUpdated: new Date("2024-03-03"),
    coverImage: "https://ui-avatars.com/api/?name=Tu+Chân"
  },
  {
    id: 5,
    title: "Võ Luyện Đỉnh Phong",
    author: "Mạc Mặc",
    views: 950000,
    likes: 53000,
    rating: 4.4,
    chapters: 480,
    lastUpdated: new Date("2024-03-01"),
    coverImage: "https://ui-avatars.com/api/?name=Võ+Luyện"
  }
]

// Author Rankings
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

const mockAuthorRankings: AuthorRanking[] = [
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
  {
    id: 2,
    name: "Thiên Tàm Thổ Đậu",
    avatar: "https://ui-avatars.com/api/?name=Thiên+Tàm+Thổ+Đậu",
    totalNovels: 12,
    totalViews: 4800000,
    totalLikes: 240000,
    followers: 95000,
    rating: 4.8,
    level: 'Expert'
  },
  {
    id: 3,
    name: "Mạc Mặc",
    avatar: "https://ui-avatars.com/api/?name=Mạc+Mặc",
    totalNovels: 10,
    totalViews: 3500000,
    totalLikes: 175000,
    followers: 70000,
    rating: 4.7,
    level: 'Expert'
  },
  {
    id: 4,
    name: "Ngã Cật Tây Hồng Thị",
    avatar: "https://ui-avatars.com/api/?name=Ngã+Cật+Tây+Hồng+Thị",
    totalNovels: 8,
    totalViews: 2800000,
    totalLikes: 140000,
    followers: 56000,
    rating: 4.6,
    level: 'Senior'
  },
  {
    id: 5,
    name: "Nguyệt Hạ Điệp Ảnh",
    avatar: "https://ui-avatars.com/api/?name=Nguyệt+Hạ+Điệp+Ảnh",
    totalNovels: 6,
    totalViews: 2000000,
    totalLikes: 100000,
    followers: 40000,
    rating: 4.5,
    level: 'Senior'
  }
]

// User Rankings
interface UserRanking {
  id: number
  username: string
  avatar: string
  exp: number
  totalSpent: number
  memberSince: Date
  level: string
}

const mockUserRankings: UserRanking[] = [
  {
    id: 1,
    username: "reader_king",
    avatar: "https://ui-avatars.com/api/?name=Reader+King",
    exp: 5000,
    totalSpent: 5000000,
    memberSince: new Date("2023-01-01"),
    level: "VIP Diamond"
  },
  {
    id: 2,
    username: "novel_addict",
    avatar: "https://ui-avatars.com/api/?name=Novel+Addict",
    exp: 4800,
    totalSpent: 4800000,
    memberSince: new Date("2023-02-15"),
    level: "VIP Gold"
  },
  {
    id: 3,
    username: "book_lover",
    avatar: "https://ui-avatars.com/api/?name=Book+Lover",
    exp: 4200,
    totalSpent: 4000000,
    memberSince: new Date("2023-03-20"),
    level: "VIP Silver"
  },
  {
    id: 4,
    username: "night_reader",
    avatar: "https://ui-avatars.com/api/?name=Night+Reader",
    exp: 3500,
    totalSpent: 3500000,
    memberSince: new Date("2023-04-10"),
    level: "VIP Bronze"
  },
  {
    id: 5,
    username: "story_seeker",
    avatar: "https://ui-avatars.com/api/?name=Story+Seeker",
    exp: 3000,
    totalSpent: 3000000,
    memberSince: new Date("2023-05-05"),
    level: "Pro Member"
  }
]

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
  
  const ITEMS_PER_PAGE = 10

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
  const filteredNovels = mockNovelRankings.filter((novel) => {
    // Lọc theo truy vấn tìm kiếm
    const matchesSearch = novel.title.toLowerCase().includes(novelSearchQuery.toLowerCase()) ||
      novel.author.toLowerCase().includes(novelSearchQuery.toLowerCase())
    
    // Lọc theo khoảng thời gian
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (novel.lastUpdated >= dateRange.from && novel.lastUpdated <= dateRange.to)
    
    // Lọc theo ngày đơn
    const matchesDate = !date || 
      (novel.lastUpdated.getDate() === date.getDate() && 
       novel.lastUpdated.getMonth() === date.getMonth() && 
       novel.lastUpdated.getFullYear() === date.getFullYear())
    
    return matchesSearch && (matchesDateRange || matchesDate)
  })

  const novelTotalPages = Math.ceil(filteredNovels.length / ITEMS_PER_PAGE)
  const paginatedNovels = filteredNovels.slice(
    (novelCurrentPage - 1) * ITEMS_PER_PAGE,
    novelCurrentPage * ITEMS_PER_PAGE
  )

  // Authors filtering and pagination
  const filteredAuthors = mockAuthorRankings.filter((author) => {
    // Lọc theo truy vấn tìm kiếm
    return author.name.toLowerCase().includes(authorSearchQuery.toLowerCase())
  })
  
  const authorTotalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE)
  const paginatedAuthors = filteredAuthors.slice(
    (authorCurrentPage - 1) * ITEMS_PER_PAGE,
    authorCurrentPage * ITEMS_PER_PAGE
  )

  // Users filtering and pagination
  const filteredUsers = mockUserRankings.filter((user) => {
    // Lọc theo truy vấn tìm kiếm
    const matchesSearch = user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
    
    // Lọc theo khoảng thời gian
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (user.memberSince >= dateRange.from && user.memberSince <= dateRange.to)
    
    // Lọc theo ngày đơn
    const matchesDate = !date || 
      (user.memberSince.getDate() === date.getDate() && 
       user.memberSince.getMonth() === date.getMonth() && 
       user.memberSince.getFullYear() === date.getFullYear())
    
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
            <div className="flex items-center">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(range) => {
                  setDateRange(range)
                  setDate(undefined)
                }}
              />
            </div>
            <Button variant="outline" onClick={handleResetFilters}>Đặt lại</Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="novels">Truyện nổi bật</TabsTrigger>
          <TabsTrigger value="authors">Tác giả nổi bật</TabsTrigger>
          <TabsTrigger value="users">Người dùng tích cực</TabsTrigger>
        </TabsList>

        {/* Tab Truyện nổi bật */}
        <TabsContent value="novels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Truyện nổi bật</CardTitle>
              <CardDescription>
                Bảng xếp hạng các truyện nổi bật trên nền tảng. Các tiêu chí xếp hạng bao gồm lượt xem, lượt thích và đánh giá.
              </CardDescription>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder="Tìm kiếm theo tên truyện hoặc tác giả..."
                  value={novelSearchQuery}
                  onChange={(e) => setNovelSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Xếp hạng</TableHead>
                      <TableHead>Truyện</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Lượt xem</TableHead>
                      <TableHead>Lượt thích</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Số chương</TableHead>
                      <TableHead>Cập nhật</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedNovels.map((novel, index) => (
                      <TableRow key={novel.id}>
                        <TableCell className="font-medium">
                          #{(novelCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={novel.coverImage} />
                              <AvatarFallback>{novel.title.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>{novel.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{novel.author}</TableCell>
                        <TableCell>{novel.views.toLocaleString()}</TableCell>
                        <TableCell>{novel.likes.toLocaleString()}</TableCell>
                        <TableCell>{novel.rating}</TableCell>
                        <TableCell>{novel.chapters}</TableCell>
                        <TableCell>
                          {novel.lastUpdated.toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={novelCurrentPage}
                  totalPages={novelTotalPages}
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
              <CardTitle>Tác giả nổi bật</CardTitle>
              <CardDescription>
                Bảng xếp hạng các tác giả nổi bật trên nền tảng. Các tiêu chí xếp hạng bao gồm số lượng truyện, lượt xem và đánh giá.
              </CardDescription>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder="Tìm kiếm theo tên tác giả..."
                  value={authorSearchQuery}
                  onChange={(e) => setAuthorSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Xếp hạng</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Cấp độ</TableHead>
                      <TableHead>Số truyện</TableHead>
                      <TableHead>Lượt xem</TableHead>
                      <TableHead>Lượt thích</TableHead>
                      <TableHead>Người theo dõi</TableHead>
                      <TableHead>Đánh giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAuthors.map((author, index) => (
                      <TableRow key={author.id}>
                        <TableCell className="font-medium">
                          #{(authorCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={author.avatar} />
                              <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>{author.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${author.level === 'Expert' ? 'bg-green-100 text-green-800' :
                              author.level === 'Senior' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {author.level}
                          </span>
                        </TableCell>
                        <TableCell>{author.totalNovels}</TableCell>
                        <TableCell>{author.totalViews.toLocaleString()}</TableCell>
                        <TableCell>{author.totalLikes.toLocaleString()}</TableCell>
                        <TableCell>{author.followers.toLocaleString()}</TableCell>
                        <TableCell>{author.rating}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={authorCurrentPage}
                  totalPages={authorTotalPages}
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
              <CardTitle>Người dùng tích cực</CardTitle>
              <CardDescription>
                Bảng xếp hạng người dùng tích cực nhất trên nền tảng. Các tiêu chí xếp hạng bao gồm kinh nghiệm (EXP) và chi tiêu.
              </CardDescription>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder="Tìm kiếm theo tên người dùng..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Xếp hạng</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Cấp độ</TableHead>
                      <TableHead>EXP</TableHead>
                      <TableHead>Chi tiêu</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          #{(userCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.username.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${user.level.includes('Diamond') ? 'bg-purple-100 text-purple-800' :
                              user.level.includes('Gold') ? 'bg-yellow-100 text-yellow-800' :
                              user.level.includes('Silver') ? 'bg-gray-100 text-gray-800' :
                              user.level.includes('Bronze') ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'}`}>
                            {user.level}
                          </span>
                        </TableCell>
                        <TableCell>{user.exp.toLocaleString()}</TableCell>
                        <TableCell>{user.totalSpent.toLocaleString()} đ</TableCell>
                        <TableCell>
                          {user.memberSince.toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={userCurrentPage}
                  totalPages={userTotalPages}
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