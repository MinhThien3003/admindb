"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { 
  BookOpen, 
  CircleDollarSign, 
  LayoutDashboard, 
  LogOut, 
  TrendingUp, 
  UserCheck, 
  Users, 
  ChevronDown, 
  Tag, 
  Award,
  Receipt,
  CreditCard,
  UserCog,
  Clipboard
} from "lucide-react";
import { useState } from "react";

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: "text-sky-500"
    },
    {
        label: 'Novels',
        icon: BookOpen,
        href: '/dashboard/novels',
        color: "text-sky-500"
    },
    {
        label: 'Categories',
        icon: Tag,
        href: '/dashboard/categories',
        color: "text-sky-500"
    },
    {
        label: 'Levels',
        icon: Award,
        href: '/dashboard/levels',
        color: "text-sky-500"
    },
    {
        label: 'Tasks',
        icon: Clipboard,
        href: '/dashboard/tasks',
        color: "text-green-500"
    },
    {
        label: 'Authors',
        icon: UserCheck,
        href: '/dashboard/authors',
        color: "text-sky-500"
    },
    {
        label: 'Users',
        icon: Users,
        href: '/dashboard/users',
        color: "text-sky-500"
    },
    {
        label: 'Admins',
        icon: UserCog,
        href: '/dashboard/admins',
        color: "text-purple-500"
    },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Admin Dashboard
                    </h2>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link href={route.href} key={route.href}>
                                <Button 
                                    variant={pathname === route.href ? "secondary" : "ghost"} 
                                    className="w-full justify-start"
                                >
                                    <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                                    {route.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Giao dịch
                    </h2>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-between mt-1"
                        onClick={() => setIsTransactionOpen(!isTransactionOpen)}
                    >
                        <div className="flex items-center">
                            <Receipt className="mr-2 h-4 w-4 text-green-500" />
                            <span>Quản lý giao dịch</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isTransactionOpen ? "rotate-180" : "")} />
                    </Button>
                    {isTransactionOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                            <Link href="/dashboard/transactions">
                                <Button 
                                    variant={pathname === "/dashboard/transactions" ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                >
                                    <CircleDollarSign className="mr-2 h-4 w-4 text-blue-500" />
                                    Giao dịch người dùng
                                </Button>
                            </Link>
                            <Link href="/dashboard/transactions/authors">
                                <Button 
                                    variant={pathname === "/dashboard/transactions/authors" ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                >
                                    <CreditCard className="mr-2 h-4 w-4 text-purple-500" />
                                    Doanh thu tác giả
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Rankings
                    </h2>
                    <Link href="/dashboard/rankings">
                        <Button 
                            variant={pathname === "/dashboard/rankings" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                        >
                            <TrendingUp className="mr-2 h-4 w-4 text-yellow-500" />
                            <span>Rankings</span>
                        </Button>
                    </Link>
                </div>
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Tài khoản
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/auth/login')}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}