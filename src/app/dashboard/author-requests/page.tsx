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
import axios from "axios"

export default function AuthorRequestsPage() {
  const [requests, setRequests] = useState<AuthorRegisterRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true)
        console.log('Đang tải danh sách yêu cầu...')
        
        // Sử dụng axios để gọi API
        const response = await axios.get('/api/authorRegisters/admin')
        console.log('Dữ liệu nhận được:', response.data)
        setRequests(response.data)
      } catch (error: any) {
        console.error('Chi tiết lỗi:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        })
        toast.error('Không thể tải danh sách yêu cầu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleApprove = async (requestId: string) => {
    try {
      // Thêm requestId vào danh sách đang xử lý
      setProcessingIds(prev => [...prev, requestId])
      
      const response = await axios.patch(`/api/authorRegisters/admin/${requestId}/approve`)
      console.log('Approve response:', response.data)
      
      // Cập nhật trạng thái của request trong state thay vì xóa nó
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: 'approved' } 
            : request
        )
      )
      
      toast.success('Đã phê duyệt yêu cầu')
    } catch (error: any) {
      console.error('Chi tiết lỗi khi phê duyệt:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(error.response?.data?.error || 'Không thể phê duyệt yêu cầu')
    } finally {
      // Xóa requestId khỏi danh sách đang xử lý
      setProcessingIds(prev => prev.filter(id => id !== requestId))
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      // Thêm requestId vào danh sách đang xử lý
      setProcessingIds(prev => [...prev, requestId])
      
      const response = await axios.patch(`/api/authorRegisters/admin/${requestId}/refuse`)
      console.log('Reject response:', response.data)
      
      // Cập nhật trạng thái của request trong state thay vì xóa nó
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: 'rejected' } 
            : request
        )
      )
      
      toast.success('Đã từ chối yêu cầu')
    } catch (error: any) {
      console.error('Chi tiết lỗi khi từ chối:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(error.response?.data?.error || 'Không thể từ chối yêu cầu')
    } finally {
      // Xóa requestId khỏi danh sách đang xử lý
      setProcessingIds(prev => prev.filter(id => id !== requestId))
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Yêu cầu trở thành tác giả</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
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
                              disabled={processingIds.includes(request._id)}
                            >
                              {processingIds.includes(request._id) ? (
                                <span className="flex items-center">
                                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-green-600 rounded-full"></span>
                                  Đang xử lý...
                                </span>
                              ) : 'Duyệt'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={processingIds.includes(request._id)}
                            >
                              {processingIds.includes(request._id) ? (
                                <span className="flex items-center">
                                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-red-600 rounded-full"></span>
                                  Đang xử lý...
                                </span>
                              ) : 'Từ chối'}
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
    </div>
  )
} 