"use client"

import { Sidebar } from "@/components/dashboard/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log("Dashboard layout loaded");
        console.log("Auth state:", { 
            isAuthenticated: !!token, 
            user: user ? `${user.username} (${user.email})` : null,
            token: token ? `${token.substring(0, 10)}...` : null,
            isLoading
        });

        if (!isLoading && !token) {
            console.log("Không có token, redirect to login");
            router.push("/login");
        }
    }, [token, user, isLoading, router]);

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Đang tải...</div>;
    }

    if (!token) {
        return <div className="flex min-h-screen items-center justify-center">Chuyển hướng đến trang đăng nhập...</div>;
    }

    return (
        <div className="flex min-h-screen">
            <div className="hidden md:flex md:w-64 md:flex-col">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col">
                <main className="flex-1">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
}

