import { Sidebar } from "@/components/dashboard/sidebar";
import { Users } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="flex-1 md:pl-72">
                <div className="px-6 py-4">
                    {children}
                </div>
            </main>
        </div>
    );
}

