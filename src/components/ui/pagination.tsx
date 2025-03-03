import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    // Tạo mảng các trang để hiển thị
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 5
        
        if (totalPages <= maxPagesToShow) {
            // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxPagesToShow
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Luôn hiển thị trang đầu tiên
            pages.push(1)
            
            // Tính toán phạm vi trang để hiển thị
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)
            
            // Điều chỉnh nếu chúng ta đang ở gần đầu hoặc cuối
            if (currentPage <= 2) {
                endPage = 4
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 3
            }
            
            // Thêm dấu ... nếu cần
            if (startPage > 2) {
                pages.push('...')
            }
            
            // Thêm các trang ở giữa
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }
            
            // Thêm dấu ... nếu cần
            if (endPage < totalPages - 1) {
                pages.push('...')
            }
            
            // Luôn hiển thị trang cuối cùng
            pages.push(totalPages)
        }
        
        return pages
    }

    return (
        <div className="flex items-center justify-center space-x-2 py-4">
            <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {getPageNumbers().map((page, index) => (
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                ) : (
                    <Button
                        key={`page-${page}`}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                    >
                        {page}
                    </Button>
                )
            ))}
            
            <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
} 