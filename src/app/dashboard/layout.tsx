"use client"

import { Sidebar } from "@/components/dashboard/sidebar";
import { Toaster } from "@/components/ui/toaster";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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

