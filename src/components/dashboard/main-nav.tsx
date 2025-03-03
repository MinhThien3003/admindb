import Link from "next/link"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Tổng quan
      </Link>
      <Link
        href="/dashboard/novels"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Truyện
      </Link>
      <Link
        href="/dashboard/categories"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Thể loại
      </Link>
      <Link
        href="/dashboard/levels"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Quản lý cấp độ
      </Link>
      <Link
        href="/dashboard/settings"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Cài đặt
      </Link>
    </nav>
  )
} 