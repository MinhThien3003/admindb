"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Truyện Tiên Hiệp", value: 35 },
  { name: "Truyện Kiếm Hiệp", value: 25 },
  { name: "Truyện Ngôn Tình", value: 20 },
  { name: "Truyện Đô Thị", value: 15 },
  { name: "Thể loại khác", value: 5 },
]

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']

export function RevenuePieChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value}%`}
        />
      </PieChart>
    </ResponsiveContainer>
  )
} 