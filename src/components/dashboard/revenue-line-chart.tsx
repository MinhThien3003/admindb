"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", revenue: 150000000 },
  { month: "Feb", revenue: 180000000 },
  { month: "Mar", revenue: 220000000 },
  { month: "Apr", revenue: 240000000 },
  { month: "May", revenue: 280000000 },
  { month: "Jun", revenue: 310000000 },
  { month: "Jul", revenue: 350000000 },
  { month: "Aug", revenue: 400000000 },
  { month: "Sep", revenue: 380000000 },
  { month: "Oct", revenue: 420000000 },
  { month: "Nov", revenue: 450000000 },
  { month: "Dec", revenue: 500000000 },
]

export function RevenueLineChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis 
          dataKey="month" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value/1000000}M`}
        />
        <Tooltip 
          formatter={(value: number) => 
            new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value)
          }
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#4F75FF" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 