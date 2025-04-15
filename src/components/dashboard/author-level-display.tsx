"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthorLevels } from "@/hooks/use-author-levels"
import { Award, Book, Crown, Edit, Feather, PenTool } from "lucide-react"
import { AuthorLevel } from "@/hooks/use-author-levels"

interface AuthorLevelDisplayProps {
  authorLevelId: string | null | undefined
}

export function AuthorLevelDisplay({ authorLevelId }: AuthorLevelDisplayProps) {
  const { isLoading } = useAuthorLevels()
  const [authorLevel, setAuthorLevel] = useState<AuthorLevel | null>(null)
  const [benefits, setBenefits] = useState<string[]>([])
  const [displayColor, setDisplayColor] = useState("blue")
  const [displayIcon, setDisplayIcon] = useState("edit")

  useEffect(() => {
    // Hàm lấy thông tin cấp độ tác giả
    const loadAuthorLevel = async () => {
      if (!authorLevelId) return
      
      try {
        // Gọi API để lấy thông tin cấp độ tác giả
        const response = await fetch(`/api/authorLevels/${authorLevelId}`)
        if (!response.ok) return
        
        const levelData = await response.json()
        if (!levelData) return
        
        // Lưu thông tin cấp độ
        setAuthorLevel(levelData)
        
        // Xác định màu dựa trên cấp độ
        let color = "blue"
        if (levelData.level <= 1) color = "gray"
        else if (levelData.level === 2) color = "green"
        else if (levelData.level === 3) color = "blue"
        else if (levelData.level === 4) color = "purple"
        else if (levelData.level === 5) color = "orange"
        else if (levelData.level >= 6) color = "red"
        setDisplayColor(color)
        
        // Xác định icon dựa trên cấp độ
        let icon = "edit"
        if (levelData.level === 2) icon = "pen-tool"
        else if (levelData.level === 3) icon = "feather"
        else if (levelData.level === 4) icon = "book"
        else if (levelData.level === 5) icon = "award"
        else if (levelData.level >= 6) icon = "crown"
        setDisplayIcon(icon)
        
        // Tạo danh sách đặc quyền dựa trên cấp độ
        const levelBenefits: string[] = []
        if (levelData.level >= 1) {
          levelBenefits.push("Đăng truyện", "Nhận phản hồi")
        }
        if (levelData.level >= 2) {
          levelBenefits.push("Đặt giá cho chương truyện")
        }
        if (levelData.level >= 3) {
          levelBenefits.push(`Giảm 5% phí nền tảng`)
        }
        if (levelData.level >= 4) {
          levelBenefits.push(`Giảm 10% phí nền tảng`, "Huy hiệu tác giả")
        }
        if (levelData.level >= 5) {
          levelBenefits.push(`Giảm 15% phí nền tảng`, "Quảng bá truyện")
        }
        if (levelData.level >= 6) {
          levelBenefits.push(`Giảm 20% phí nền tảng`, "Hợp đồng đặc biệt")
        }
        setBenefits(levelBenefits)
      } catch (error) {
        console.error("Lỗi khi lấy thông tin cấp độ tác giả:", error)
      }
    }
    
    loadAuthorLevel()
  }, [authorLevelId])

  // Hàm trả về component icon tương ứng
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'edit':
        return <Edit className="h-4 w-4" />
      case 'pen-tool':
        return <PenTool className="h-4 w-4" />
      case 'feather':
        return <Feather className="h-4 w-4" />
      case 'book':
        return <Book className="h-4 w-4" />
      case 'award':
        return <Award className="h-4 w-4" />
      case 'crown':
        return <Crown className="h-4 w-4" />
      default:
        return <Edit className="h-4 w-4" />
    }
  }

  // Hàm tạo badge cấp độ với màu tương ứng
  const getLevelBadge = (level: number, color: string, iconName: string) => {
    const colorClasses: Record<string, string> = {
      gray: "bg-gray-100 text-gray-800",
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800"
    }
    
    return (
      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[color] || colorClasses.blue}`}>
        {getIconComponent(iconName)}
        <span className="ml-1">Cấp {level}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!authorLevel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cấp độ tác giả</CardTitle>
          <CardDescription>Tác giả chưa được gán cấp độ</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getIconComponent(displayIcon)}
              {authorLevel.title}
            </CardTitle>
            <CardDescription>
              {getLevelBadge(authorLevel.level, displayColor, displayIcon)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Yêu cầu kinh nghiệm</h4>
            <p className="text-sm text-muted-foreground">{authorLevel.requiredExp} điểm kinh nghiệm</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium">Đặc quyền</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
