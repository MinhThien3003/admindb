"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Eye } from "lucide-react"

interface UserRequest {
  id: number
  username: string
  email: string
  avatar: string
  requestDate: Date
  bio: string
  totalNovels: number
  totalViews: number
  status: 'pending' | 'approved' | 'rejected'
}

const mockRequests: UserRequest[] = [
  {
    id: 1,
    username: "john_writer",
    email: "john@example.com",
    avatar: "https://ui-avatars.com/api/?name=John+Writer",
    requestDate: new Date("2024-03-01"),
    bio: "Passionate writer with 3 years experience",
    totalNovels: 5,
    totalViews: 15000,
    status: 'pending'
  },
  // Thêm mock data khác...
]

export function AuthorRequests() {
  const [requests] = useState(mockRequests)
  const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Yêu Cầu Phê Duyệt
          <div className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {requests.filter(r => r.status === 'pending').length}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Danh Sách Yêu Cầu Phê Duyệt</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người Dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ngày Yêu Cầu</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right">Chi Tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback>{request.username[0]}</AvatarFallback>
                    </Avatar>
                    {request.username}
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{format(request.requestDate, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}`}>
                      {request.status === 'pending' ? 'Đang chờ' :
                        request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thông Tin Chi Tiết</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={request.avatar} />
                              <AvatarFallback>{request.username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{request.username}</h3>
                              <p className="text-sm text-gray-500">{request.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Tổng số truyện</p>
                              <p>{request.totalNovels}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Tổng lượt xem</p>
                              <p>{request.totalViews.toLocaleString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Giới thiệu</p>
                            <p className="text-sm text-gray-600">{request.bio}</p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="destructive">Từ chối</Button>
                            <Button>Phê duyệt</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
} 