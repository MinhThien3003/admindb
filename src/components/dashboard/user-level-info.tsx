"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Award, Shield, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LevelInfo {
  level: number;
  title: string;
  color: string;
  icon: JSX.Element;
  minExp: number;
  maxExp: number;
  benefits: string[];
}

export function UserLevelInfo() {
  // Danh sách các cấp độ trong hệ thống
  const levels: LevelInfo[] = [
    {
      level: 50,
      title: "Đại Cao Thủ",
      color: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
      icon: <Trophy className="h-5 w-5 text-yellow-400" />,
      minExp: 50000,
      maxExp: 100000,
      benefits: [
        "Giảm giá 50% tất cả chương truyện premium",
        "Nhận 500 xu mỗi ngày đăng nhập",
        "Ưu tiên đọc chương mới trước 24h",
        "Huy hiệu đặc biệt trên bình luận",
        "Quyền truy cập vào nội dung độc quyền"
      ]
    },
    {
      level: 40,
      title: "Cao Thủ",
      color: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
      icon: <Star className="h-5 w-5 text-yellow-400" />,
      minExp: 30000,
      maxExp: 49999,
      benefits: [
        "Giảm giá 40% tất cả chương truyện premium",
        "Nhận 300 xu mỗi ngày đăng nhập",
        "Ưu tiên đọc chương mới trước 12h",
        "Huy hiệu đặc biệt trên bình luận"
      ]
    },
    {
      level: 30,
      title: "Tinh Anh",
      color: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
      icon: <Award className="h-5 w-5 text-yellow-400" />,
      minExp: 15000,
      maxExp: 29999,
      benefits: [
        "Giảm giá 30% tất cả chương truyện premium",
        "Nhận 200 xu mỗi ngày đăng nhập",
        "Ưu tiên đọc chương mới trước 6h"
      ]
    },
    {
      level: 20,
      title: "Kim Cương",
      color: "bg-gradient-to-r from-sky-600 to-blue-600 text-white",
      icon: <Shield className="h-5 w-5 text-blue-200" />,
      minExp: 5000,
      maxExp: 14999,
      benefits: [
        "Giảm giá 20% tất cả chương truyện premium",
        "Nhận 100 xu mỗi ngày đăng nhập"
      ]
    },
    {
      level: 10,
      title: "Bạch Kim",
      color: "bg-gradient-to-r from-gray-600 to-slate-600 text-white",
      icon: <Shield className="h-5 w-5 text-gray-200" />,
      minExp: 1000,
      maxExp: 4999,
      benefits: [
        "Giảm giá 10% tất cả chương truyện premium",
        "Nhận 50 xu mỗi ngày đăng nhập"
      ]
    },
    {
      level: 1,
      title: "Tân Thủ",
      color: "bg-gradient-to-r from-green-600 to-lime-600 text-white",
      icon: <Zap className="h-5 w-5 text-yellow-200" />,
      minExp: 0,
      maxExp: 999,
      benefits: [
        "Nhận 10 xu mỗi ngày đăng nhập",
        "Đọc miễn phí 5 chương premium đầu tiên"
      ]
    }
  ];

  // Sắp xếp cấp độ từ cao đến thấp
  const sortedLevels = [...levels].sort((a, b) => b.level - a.level);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold">Hệ thống cấp độ người dùng</h2>
        <p className="text-muted-foreground">
          Người dùng sẽ nhận được nhiều đặc quyền hơn khi đạt cấp độ cao hơn. Kinh nghiệm được tích lũy thông qua việc đọc truyện, mua chương và tương tác với nội dung.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedLevels.map((level) => (
          <Card key={level.level} className="overflow-hidden">
            <div className={`h-2 w-full ${level.color.split(' ')[0]}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {level.icon}
                  {level.title}
                </CardTitle>
                <Badge className={level.color}>Lv.{level.level}</Badge>
              </div>
              <CardDescription>
                {level.minExp.toLocaleString()} - {level.maxExp.toLocaleString()} EXP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến trình</span>
                  <span>{level.minExp.toLocaleString()} / {level.maxExp.toLocaleString()}</span>
                </div>
                <Progress value={0} className="h-2" />
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Đặc quyền:</h4>
                  <ul className="text-sm space-y-1">
                    {level.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-green-500">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 