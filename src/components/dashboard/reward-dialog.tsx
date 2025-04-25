"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RewardDialogProps {
  topRankings: {
    id: string | number
    name: string
    avatar: string
    rank: number
  }[]
  type: 'novel' | 'author' | 'user'
}

const rewardOptions = [
  { value: "coins", label: "Coins", amounts: ["1000", "500", "300"] },
  { value: "badge", label: "Huy Hiệu", amounts: ["Vàng", "Bạc", "Đồng"] },
  { value: "vip", label: "VIP Status", amounts: ["30 ngày", "15 ngày", "7 ngày"] },
]

export function RewardDialog({ topRankings, type }: RewardDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedReward, setSelectedReward] = useState(rewardOptions[0].value)

  const handleReward = () => {
    // Xử lý logic trao thưởng
    console.log("Trao thưởng:", { selectedMonth, selectedReward, topRankings })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Trao Thưởng Top 3
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trao Thưởng Xếp Hạng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chọn tháng */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tháng</label>
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Tháng {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chọn phần thưởng */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại Phần Thưởng</label>
            <Select
              value={selectedReward}
              onValueChange={setSelectedReward}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phần thưởng" />
              </SelectTrigger>
              <SelectContent>
                {rewardOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Danh sách top 3 */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Top 3 {type === 'novel' ? 'Truyện' : type === 'author' ? 'Tác Giả' : 'Người Dùng'}</label>
            {topRankings.map((ranking, index) => (
              <div key={ranking.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white
                    ${index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-600'}`}>
                    #{index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={ranking.avatar} />
                    <AvatarFallback>{ranking.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{ranking.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {rewardOptions.find(o => o.value === selectedReward)?.amounts[index]}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleReward} className="w-full">
            Xác Nhận Trao Thưởng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 