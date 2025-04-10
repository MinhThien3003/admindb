"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { Button } from "@/components/ui/button"
import { DownloadIcon, Users } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login-page')
        }
        if (user) {
            console.log(`Đã đăng nhập với: ${user.username} (${user.email})`);
        }
    }, [isAuthenticated, isLoading, router, user])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl">Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange
                        date={dateRange}
                        onDateChange={setDateRange}
                    />
                    <Button>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Tải xuống
                    </Button>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tổng doanh thu
                            </CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5,231,000đ</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% so với tháng trước
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Người dùng mới
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+2,350</div>
                            <p className="text-xs text-muted-foreground">
                                +180.1% so với tháng trước
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Truyện mới</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+12,234</div>
                            <p className="text-xs text-muted-foreground">
                                +19% so với tháng trước
                            </p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <RevenueChart />
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Người dùng cấp độ cao</CardTitle>
                            <CardDescription>
                                Danh sách người dùng có cấp độ cao nhất trong hệ thống.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentSales />
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Tổng quan doanh thu theo tháng</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Thống kê gần đây</CardTitle>
                            <CardDescription>
                                Các số liệu thống kê trong 7 ngày qua.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium">Tổng số lượt đọc</p>
                                            <p className="text-sm font-medium">45,231</p>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                            <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium">Tổng số lượt mua chương</p>
                                            <p className="text-sm font-medium">12,543</p>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium">Tổng số lượt đánh giá</p>
                                            <p className="text-sm font-medium">8,721</p>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                            <div className="h-2 bg-purple-500 rounded-full" style={{ width: '35%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium">Tổng số lượt bình luận</p>
                                            <p className="text-sm font-medium">6,432</p>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                            <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '25%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}