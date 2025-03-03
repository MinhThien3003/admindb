import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Award, Shield } from "lucide-react"

interface UserLevel {
  level: number;
  title: string;
  color: string;
  icon: JSX.Element;
}

interface TopUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  spent: string;
  level: UserLevel;
}

export function RecentSales() {
  // Danh sách người dùng cấp độ cao
  const topUsers: TopUser[] = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      avatar: "/avatars/01.png",
      spent: "3,250,000đ",
      level: {
        level: 50,
        title: "Đại Cao Thủ",
        color: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
        icon: <Trophy className="h-4 w-4 text-yellow-400" />
      }
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@example.com",
      avatar: "/avatars/02.png",
      spent: "2,890,000đ",
      level: {
        level: 45,
        title: "Cao Thủ",
        color: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
        icon: <Star className="h-4 w-4 text-yellow-400" />
      }
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@example.com",
      avatar: "/avatars/03.png",
      spent: "2,450,000đ",
      level: {
        level: 42,
        title: "Tinh Anh",
        color: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
        icon: <Award className="h-4 w-4 text-yellow-400" />
      }
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@example.com",
      avatar: "/avatars/04.png",
      spent: "2,150,000đ",
      level: {
        level: 38,
        title: "Kim Cương",
        color: "bg-gradient-to-r from-sky-600 to-blue-600 text-white",
        icon: <Shield className="h-4 w-4 text-blue-200" />
      }
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoangvane@example.com",
      avatar: "/avatars/05.png",
      spent: "1,890,000đ",
      level: {
        level: 35,
        title: "Bạch Kim",
        color: "bg-gradient-to-r from-gray-600 to-slate-600 text-white",
        icon: <Shield className="h-4 w-4 text-gray-200" />
      }
    },
  ]

  return (
    <div className="space-y-8">
      {topUsers.map((user) => (
        <div key={user.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <Badge className={`text-xs ${user.level.color}`}>
                <span className="flex items-center gap-1">
                  {user.level.icon}
                  Lv.{user.level.level} - {user.level.title}
                </span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto font-medium">+{user.spent}</div>
        </div>
      ))}
    </div>
  )
} 