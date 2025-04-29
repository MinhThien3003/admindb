"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { toast } from "sonner"
import { AuthorRegisterRequest } from "@/types/author"

interface AuthorRequestsProps {
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

export function AuthorRequests({ onApprove, onReject }: AuthorRequestsProps) {
  const [requests, setRequests] = useState<AuthorRegisterRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true)
        console.log('Đang tải danh sách yêu cầu...')
        const response = await fetch('/api/authorRegisters/admin')
        if (!response.ok) {
          throw new Error('Không thể tải danh sách yêu cầu')
        }
        const data = await response.json()
        console.log('Dữ liệu nhận được:', data)
        setRequests(data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách yêu cầu:', error)
        toast.error('Không thể tải danh sách yêu cầu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/authorRegisters/${requestId}/approve`, {
        method: 'PUT'
      })
      if (!response.ok) {
        throw new Error('Không thể phê duyệt yêu cầu')
      }
      setRequests(requests.filter(request => request._id !== requestId))
      toast.success('Đã phê duyệt yêu cầu')
      if (onApprove) onApprove(requestId)
    } catch (error) {
      console.error('Lỗi khi phê duyệt yêu cầu:', error)
      toast.error('Không thể phê duyệt yêu cầu')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/api/authorRegisters/${requestId}/reject`, {
        method: 'PUT'
      })
      if (!response.ok) {
        throw new Error('Không thể từ chối yêu cầu')
      }
      setRequests(requests.filter(request => request._id !== requestId))
      toast.success('Đã từ chối yêu cầu')
      if (onReject) onReject(requestId)
    } catch (error) {
      console.error('Lỗi khi từ chối yêu cầu:', error)
      toast.error('Không thể từ chối yêu cầu')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Đang chờ' },
      'approved': { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Đã từ chối' }
    }
    
    const { color, label } = statusMap[status] || statusMap.pending
    
    return (
      <Badge className={`${color}`}>
        {label}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yêu cầu trở thành tác giả</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Ngày yêu cầu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <p className="text-gray-500">Không có yêu cầu nào</p>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map(request => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.idUser.avatar} />
                          <AvatarFallback>
                            {request.idUser.fullname.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.idUser.fullname}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.idUser.email}</TableCell>
                    <TableCell>{request.idUser.gender}</TableCell>
                    <TableCell>{format(new Date(request.createdAt), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(request._id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            Duyệt
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 