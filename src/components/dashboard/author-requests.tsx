"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

export interface AuthorRequest {
  id: number
  userId: number
  username: string
  email: string
  avatar: string
  createdAt: Date
  status: "pending" | "approved" | "rejected"
  reason: string
  bio: string
  experience: string
  genres: string[]
  samples: string[] // Đường dẫn đến các mẫu truyện
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}

interface AuthorRequestsProps {
  requests: AuthorRequest[]
  onApprove: (requestId: number) => void
  onReject: (requestId: number, reason: string) => void
}

export function AuthorRequests({
  requests,
  onApprove,
  onReject
}: AuthorRequestsProps) {
  const [selectedRequest, setSelectedRequest] = useState<AuthorRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [showDetail, setShowDetail] = useState<boolean>(false)
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false)

  const handleRejectClick = (request: AuthorRequest) => {
    setSelectedRequest(request)
    setRejectionReason("")
    setShowRejectDialog(true)
  }

  const handleConfirmReject = () => {
    if (selectedRequest && rejectionReason.trim()) {
      onReject(selectedRequest.id, rejectionReason)
      setShowRejectDialog(false)
      setSelectedRequest(null)
      toast.success(`Đã gửi lý do từ chối thành công`)
    } else {
      toast.error("Vui lòng nhập lý do từ chối")
    }
  }

  const handleViewDetail = (request: AuthorRequest) => {
    setSelectedRequest(request)
    setShowDetail(true)
  }

  const renderStatus = (status: AuthorRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Đang xét duyệt
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Đã duyệt
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            Đã từ chối
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={request.avatar} alt={request.username} />
                        <AvatarFallback>{request.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.username}</div>
                        <div className="text-sm text-muted-foreground">{request.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(request.createdAt, 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {request.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderStatus(request.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(request)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onApprove(request.id)}
                            title="Duyệt yêu cầu"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectClick(request)}
                            title="Từ chối yêu cầu"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Không có yêu cầu trở thành tác giả nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog xác nhận từ chối */}
      <Dialog open={showRejectDialog} onOpenChange={(open) => {
        setShowRejectDialog(open);
        if (!open) setSelectedRequest(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu tác giả</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleConfirmReject();
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <p>Vui lòng cung cấp lý do từ chối yêu cầu của <strong>{selectedRequest?.username}</strong>:</p>
                <Textarea
                  placeholder="Nhập lý do từ chối..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>
                Huỷ bỏ
              </Button>
              <Button 
                type="submit" 
                className={rejectionReason.trim() 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                }
                disabled={!rejectionReason.trim()}
              >
                Gửi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết yêu cầu */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Thông tin người dùng</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <Avatar>
                      <AvatarImage src={selectedRequest.avatar} alt={selectedRequest.username} />
                      <AvatarFallback>{selectedRequest.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedRequest.username}</div>
                      <div className="text-sm text-muted-foreground">{selectedRequest.email}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Tiểu sử</h3>
                  <p className="mt-2 text-sm text-gray-600">{selectedRequest.bio}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Kinh nghiệm viết lách</h3>
                  <p className="mt-2 text-sm text-gray-600">{selectedRequest.experience}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Thể loại chuyên viết</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedRequest.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Mẫu tác phẩm</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {selectedRequest.samples.map((sample, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="text-sm font-medium">Mẫu truyện {index + 1}</div>
                        <a href={sample} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">
                          Xem mẫu truyện
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDetail(false)}>
              Đóng
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowDetail(false)
                    if (selectedRequest) handleRejectClick(selectedRequest)
                  }}
                >
                  Từ chối
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    if (selectedRequest) onApprove(selectedRequest.id)
                    setShowDetail(false)
                  }}
                >
                  Duyệt
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 