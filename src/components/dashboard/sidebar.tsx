"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { 
  BookOpen, 
  CircleDollarSign, 
  LayoutDashboard, 
  LogOut, 
  ChevronLeft, 
  User, 
  TrendingUp, 
  UserCheck, 
  Users, 
  ChevronDown, 
  Tag, 
  Award 
} from "lucide-react";
import { useState } from "react";
import { MainNav } from "@/components/dashboard/main-nav";

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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [isRankingOpen, setIsRankingOpen] = useState(false);

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
                        Transactions
                    </h2>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-between"
                        onClick={() => setIsTransactionOpen(!isTransactionOpen)}
                    >
                        <div className="flex items-center">
                            <CircleDollarSign className="mr-2 h-4 w-4 text-green-500" />
                            <span>Transactions</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isTransactionOpen ? "rotate-180" : "")} />
                    </Button>
                    {isTransactionOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                            <Link href="/dashboard/transactions/deposits">
                                <Button variant="ghost" className="w-full justify-start">
                                    <CircleDollarSign className="mr-2 h-4 w-4 text-green-500" />
                                    Deposits
                                </Button>
                            </Link>
                            <Link href="/dashboard/transactions/withdrawals">
                                <Button variant="ghost" className="w-full justify-start">
                                    <CircleDollarSign className="mr-2 h-4 w-4 text-red-500" />
                                    Withdrawals
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Rankings
                    </h2>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-between"
                        onClick={() => setIsRankingOpen(!isRankingOpen)}
                    >
                        <div className="flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4 text-yellow-500" />
                            <span>Rankings</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isRankingOpen ? "rotate-180" : "")} />
                    </Button>
                    {isRankingOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                            <Link href="/dashboard/rankings/novels">
                                <Button variant="ghost" className="w-full justify-start">
                                    <BookOpen className="mr-2 h-4 w-4 text-yellow-500" />
                                    Top Novels
                                </Button>
                            </Link>
                            <Link href="/dashboard/rankings/authors">
                                <Button variant="ghost" className="w-full justify-start">
                                    <UserCheck className="mr-2 h-4 w-4 text-yellow-500" />
                                    Top Authors
                                </Button>
                            </Link>
                            <Link href="/dashboard/rankings/users">
                                <Button variant="ghost" className="w-full justify-start">
                                    <User className="mr-2 h-4 w-4 text-yellow-500" />
                                    Top Users
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
                <div className="px-4 py-2">
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