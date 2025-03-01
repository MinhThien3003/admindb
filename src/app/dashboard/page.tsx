import { RecentAuthors } from "@/components/dashboard/recent-authors";
import { RevenueLineChart } from "@/components/dashboard/revenue-line-chart";
import { RevenuePieChart } from "@/components/dashboard/revenue-pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, CircleDollarSign } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Dashboard
                </h2>
                <div className="flex items-center gap-4">
                    <select className="p-2 rounded-md border">
                        <option>7 ngày qua</option>
                        <option>30 ngày qua</option>
                        <option>90 ngày qua</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng Truyện
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,000</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% so với tháng trước
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Người Dùng
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">10,000</div>
                        <p className="text-xs text-muted-foreground">
                            +15.2% so với tháng trước
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Doanh Thu
                        </CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100,000,000đ</div>
                        <p className="text-xs text-muted-foreground">
                            +12.3% so với tháng trước
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 md:col-span-4">
                    <CardHeader>
                        <CardTitle>Doanh Thu Theo Tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueLineChart />
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-3">
                    <CardHeader>
                        <CardTitle>Phân Bổ Doanh Thu Theo Thể Loại</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenuePieChart />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Authors */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 md:col-span-4">
                    <CardHeader>
                        <CardTitle>Tác Giả Nổi Bật</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentAuthors/>
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-3">
                    <CardHeader>
                        <CardTitle>Người Dùng Mới</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentAuthors/>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}