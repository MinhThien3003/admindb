"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "T1",
    total: 1800000,
  },
  {
    name: "T2",
    total: 2200000,
  },
  {
    name: "T3",
    total: 2700000,
  },
  {
    name: "T4",
    total: 3100000,
  },
  {
    name: "T5",
    total: 3500000,
  },
  {
    name: "T6",
    total: 4100000,
  },
  {
    name: "T7",
    total: 4300000,
  },
  {
    name: "T8",
    total: 4800000,
  },
  {
    name: "T9",
    total: 5100000,
  },
  {
    name: "T10",
    total: 5400000,
  },
  {
    name: "T11",
    total: 5800000,
  },
  {
    name: "T12",
    total: 6200000,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => `${value / 1000000}M`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
          labelFormatter={(label) => `Tháng ${label.substring(1)}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
} 