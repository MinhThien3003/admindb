"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays, format, differenceInDays, eachDayOfInterval } from "date-fns"
import { vi } from "date-fns/locale"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Hàm tạo dữ liệu mẫu
const generateSampleData = (startDate: Date, endDate: Date) => {
  // Tạo mảng các ngày trong khoảng
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  // Tạo dữ liệu cho mỗi ngày
  return days.map(day => {
    // Tạo giá trị ngẫu nhiên cho thu nhập, dao động từ 1 triệu đến 10 triệu
    const revenue = Math.floor(Math.random() * 9000000) + 1000000
    
    // Tạo giá trị ngẫu nhiên cho số lượng giao dịch, dao động từ 10 đến 100
    const transactions = Math.floor(Math.random() * 90) + 10
    
    return {
      date: format(day, 'dd/MM/yyyy'),
      revenue,
      transactions,
      averageValue: Math.round(revenue / transactions)
    }
  })
}

// Hàm định dạng số tiền
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value)
}

// Component tooltip tùy chỉnh
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-green-600">
          Doanh thu: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-sm text-blue-600">
          Giao dịch: {payload[1].value}
        </p>
        <p className="text-sm text-purple-600">
          Giá trị TB: {formatCurrency(payload[2].value)}
        </p>
      </div>
    )
  }

  return null
}

export function RevenueChart() {
  // Mặc định hiển thị dữ liệu 30 ngày gần nhất
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  
  const [data, setData] = useState<any[]>([])
  
  // Cập nhật dữ liệu khi thay đổi khoảng ngày
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setData(generateSampleData(dateRange.from, dateRange.to))
    }
  }, [dateRange])
  
  // Tính tổng doanh thu trong khoảng thời gian
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  
  // Tính tổng số giao dịch trong khoảng thời gian
  const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0)
  
  // Tính giá trị trung bình mỗi giao dịch
  const averageTransactionValue = totalTransactions > 0 
    ? totalRevenue / totalTransactions 
    : 0

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Thu nhập theo ngày</CardTitle>
          <CardDescription>
            Biểu đồ thu nhập và số lượng giao dịch theo ngày
          </CardDescription>
        </div>
        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Tổng giao dịch</p>
            <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Giá trị TB/giao dịch</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageTransactionValue)}</p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Nếu có nhiều ngày, chỉ hiển thị một số ngày để tránh quá đông
                  if (data.length > 15) {
                    const index = data.findIndex(item => item.date === value)
                    return index % 3 === 0 ? value : ''
                  }
                  return value
                }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(0)}M`
                  }
                  return value
                }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#10b981"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="transactions"
                name="Giao dịch"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="averageValue"
                name="Giá trị TB"
                stroke="#8b5cf6"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 