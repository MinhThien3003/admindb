"use client"

import { Sidebar } from "@/components/dashboard/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, token, loading, fetchUser } = useAuth();
    const router = useRouter();
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    
    // Thêm một state để theo dõi xem trang đã được tải lại hay chưa
    const [isPageReloaded, setIsPageReloaded] = useState(false);

    // Kiểm tra xem trang có phải tải lại không
    useEffect(() => {
        // Xác định nếu trang đang được tải lại
        if (typeof window !== 'undefined') {
            // Thêm event listener cho beforeunload để đánh dấu nếu trang tải lại
            const handleBeforeUnload = () => {
                sessionStorage.setItem('reloading', 'true');
            };
            
            window.addEventListener('beforeunload', handleBeforeUnload);
            
            // Kiểm tra xem trang có đang được tải lại không
            const isReloading = sessionStorage.getItem('reloading') === 'true';
            if (isReloading) {
                console.log("Trang đang được tải lại...");
                setIsPageReloaded(true);
                // Xóa cờ tải lại
                sessionStorage.removeItem('reloading');
            }
            
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, []);

    // Hàm kiểm tra xác thực
    useEffect(() => {
        // Nếu đã kiểm tra rồi thì không kiểm tra lại
        if (authChecked) return;

        const checkAuth = async () => {
            console.log("Dashboard layout loaded - Checking auth...");
            setIsAuthChecking(true);
            
            try {
                // Kiểm tra token từ các nguồn khác nhau
                let localToken = null;
                
                if (typeof window !== 'undefined') {
                    // Ưu tiên lấy từ sessionStorage trước
                    localToken = sessionStorage.getItem('admin_token');
                    
                    // Nếu không có trong sessionStorage, thử lấy từ localStorage
                    if (!localToken) {
                        localToken = localStorage.getItem('admin_token');
                        if (localToken) {
                            console.log("Tìm thấy token trong localStorage");
                            // Sao chép vào sessionStorage
                            sessionStorage.setItem('admin_token', localToken);
                        }
                    } else {
                        console.log("Tìm thấy token trong sessionStorage");
                    }
                }
                
                // Nếu đã có token trong context và giống với token từ storage
                if (token && localToken && token === localToken) {
                    console.log("Token trong context trùng với token trong storage");
                    setIsAuthChecking(false);
                    setAuthChecked(true);
                    return;
                }
                
                // Nếu có token trong storage nhưng chưa có hoặc khác token trong context
                if (localToken && typeof fetchUser === 'function') {
                    try {
                        console.log("Đang xác thực với token từ storage...");
                        await fetchUser(localToken);
                        console.log("Xác thực thành công");
                        setIsAuthChecking(false);
                        setAuthChecked(true);
                        return;
                    } catch (error) {
                        console.error("Lỗi khi xác thực token:", error);
                    }
                } else if (localToken) {
                    console.log("Không thể xác thực token vì fetchUser không khả dụng");
                    // Có token nhưng không thể xác thực - coi như hợp lệ tạm thời
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('admin_token', localToken);
                        if (token !== localToken) {
                            localStorage.setItem('admin_token', localToken);
                        }
                    }
                    setIsAuthChecking(false);
                    setAuthChecked(true);
                    return;
                }
                
                // Nếu có token trong context nhưng không có trong storage
                if (token && !localToken) {
                    console.log("Đã có token trong context nhưng không có trong storage - cập nhật storage");
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('admin_token', token);
                        localStorage.setItem('admin_token', token);
                    }
                    setIsAuthChecking(false);
                    setAuthChecked(true);
                    return;
                }
                
                // Nếu không tìm thấy token nào hợp lệ
                console.log("Không tìm thấy token hợp lệ, đang chuyển hướng đến trang đăng nhập");
                router.push("/login-page");
            } catch (error) {
                console.error("Lỗi trong quá trình kiểm tra xác thực:", error);
            } finally {
                setIsAuthChecking(false);
                setAuthChecked(true);
            }
        };
        
        // Chỉ kiểm tra xác thực sau khi trang đã tải hoàn tất
        const timeoutId = setTimeout(() => {
            checkAuth();
        }, 50);
        
        return () => clearTimeout(timeoutId);
    }, [token, fetchUser, router, authChecked, isPageReloaded]);

    // Ghi log trạng thái hiện tại
    useEffect(() => {
        console.log("Dashboard trạng thái hiện tại:", {
            isAuthenticated: !!token,
            loading,
            isAuthChecking,
            authChecked,
            isPageReloaded,
            user: user ? `${user.username || user.name} (${user.email})` : "chưa có"
        });
    }, [token, loading, isAuthChecking, authChecked, isPageReloaded, user]);

    // Hiển thị loading khi đang kiểm tra xác thực
    if (isAuthChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang kiểm tra xác thực...</p>
                </div>
            </div>
        );
    }

    // Hiển thị dashboard
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


