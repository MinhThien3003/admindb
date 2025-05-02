"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { 
  BookOpen, 
  TrendingUp, 
  LayoutDashboard, 
  LogOut, 
  UserCheck, 
  Users, 
  Tag, 
  Award,
  UserCog,
  Clipboard,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
        label: 'Transactions',
        icon: CreditCard,
        href: '/dashboard/transactions',
        color: "text-indigo-500"
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
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login-page');
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };

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
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}