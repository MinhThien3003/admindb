"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { BookOpen, CircleDollarSign, LayoutDashboard, LogOut, ChevronLeft, User, TrendingUp, UserCheck, Users, ChevronDown } from "lucide-react";
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
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [isRankingOpen, setIsRankingOpen] = useState(false);

    return (
        <>
            <div className={cn(
                "fixed inset-y-0 z-40 flex flex-col bg-[#4F75FF] text-white transition-all duration-300",
                isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "w-72"
            )}>
                <div className="px-3 py-4 flex-1">
                    <div className="relative">
                        <div className={cn(
                            "flex items-center px-3 mb-14",
                            isCollapsed && "md:justify-center"
                        )}>
                            <Link href="/dashboard">
                                <h1 className={cn(
                                    "text-2xl font-bold",
                                    isCollapsed && "md:hidden"
                                )}>
                                    Novel Saga Admin
                                </h1>
                                {isCollapsed && (
                                    <h1 className="hidden md:block text-2xl font-bold">
                                        NS
                                    </h1>
                                )}
                            </Link>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-[-16px] top-0 h-7 w-7 rounded-full bg-[#4F75FF] hover:bg-[#4F75FF] hidden md:flex items-center justify-center"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            <ChevronLeft className={cn(
                                "h-4 w-4 transition-transform",
                                isCollapsed && "rotate-180"
                            )} />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="space-y-1">
                            {routes.map((route) => (
                                <Button
                                    key={route.href}
                                    variant={pathname === route.href ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full",
                                        isCollapsed ? "md:justify-center" : "justify-start",
                                        pathname === route.href && "bg-white/10"
                                    )}
                                    asChild
                                >
                                    <Link href={route.href}>
                                        <route.icon className={cn("h-5 w-5", !isCollapsed && "mr-3", route.color)}/>
                                        <span className={cn(
                                            isCollapsed && "md:hidden"
                                        )}>
                                            {route.label}
                                        </span>
                                    </Link>
                                </Button>
                            ))}

                            {/* Transaction Menu with Submenu */}
                            <div>
                                <button
                                    onClick={() => setIsTransactionOpen(!isTransactionOpen)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md hover:bg-white/10",
                                        isTransactionOpen && "bg-white/10"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <CircleDollarSign className="h-5 w-5 text-sky-500 mr-3" />
                                        <span className={cn(
                                            isCollapsed && "md:hidden"
                                        )}>
                                            Transactions
                                        </span>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-transform",
                                        isTransactionOpen && "transform rotate-180",
                                        isCollapsed && "md:hidden"
                                    )} />
                                </button>
                                
                                {isTransactionOpen && !isCollapsed && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        <Link
                                            href="/dashboard/transactions/users"
                                            className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-white/10"
                                        >
                                            Giao Dịch Người Dùng
                                        </Link>
                                        <Link
                                            href="/dashboard/transactions/authors"
                                            className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-white/10"
                                        >
                                            Giao Dịch Tác Giả
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Rankings Menu with Submenu */}
                            <div>
                                <button
                                    onClick={() => setIsRankingOpen(!isRankingOpen)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md hover:bg-white/10",
                                        isRankingOpen && "bg-white/10"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <TrendingUp className="h-5 w-5 text-sky-500 mr-3" />
                                        <span className={cn(
                                            isCollapsed && "md:hidden"
                                        )}>
                                            Rankings
                                        </span>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-transform",
                                        isRankingOpen && "transform rotate-180",
                                        isCollapsed && "md:hidden"
                                    )} />
                                </button>
                                
                                {isRankingOpen && !isCollapsed && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        <Link
                                            href="/dashboard/rankings/novels"
                                            className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-white/10"
                                        >
                                            Xếp Hạng Truyện
                                        </Link>
                                        <Link
                                            href="/dashboard/rankings/authors"
                                            className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-white/10"
                                        >
                                            Xếp Hạng Tác Giả
                                        </Link>
                                        <Link
                                            href="/dashboard/rankings/users"
                                            className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-white/10"
                                        >
                                            Xếp Hạng Người Dùng
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
                <div className="px-3 py-2 space-y-2 border-t border-slate-700">
                    <h2 className={cn(
                        "px-4 text-xs font-semibold text-slate-400",
                        isCollapsed && "md:text-center"
                    )}>
                        Tài khoản Admin
                    </h2>
                    <Button 
                        variant="ghost" 
                        className={cn(
                            "w-full",
                            isCollapsed ? "md:justify-center" : "justify-start",
                            "hover:bg-white/10"
                        )}
                        onClick={() => router.push("/dashboard/profile")}
                    >
                        <User className="h-5 w-5" />
                        <span className={cn("ml-3", isCollapsed && "md:hidden")}>
                            Hồ sơ
                        </span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        className={cn(
                            "w-full",
                            isCollapsed ? "md:justify-center" : "justify-start",
                            "text-red-500 hover:text-red-400 hover:bg-white/10"
                        )}
                        onClick={() => router.push("/login-page")}
                    >
                        <LogOut className="h-5 w-5" />
                        <span className={cn("ml-3", isCollapsed && "md:hidden")}>
                            Đăng xuất
                        </span>
                    </Button>
                </div>
            </div>
        </>
    );
}