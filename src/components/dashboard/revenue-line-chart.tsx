"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataItem {
  name: string
  value: number
  [key: string]: any
}

interface RevenueLineChartProps {
  data: DataItem[]
  dataKey: string
  title?: string
  color?: string
  xAxisKey?: string
  yAxisFormatter?: (value: number) => string
}

export function RevenueLineChart({
  data,
  dataKey,
  title,
  color = '#3b82f6',
  xAxisKey = 'name',
  yAxisFormatter,
}: RevenueLineChartProps) {
  const formatValue = (value: number) => {
    if (yAxisFormatter) {
      return yAxisFormatter(value)
    }
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis tickFormatter={formatValue} />
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number') {
                return [
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0,
                  }).format(value),
                  'Doanh thu'
                ]
              }
              return [value, 'Doanh thu']
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 