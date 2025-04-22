'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/lib/config';
import { User } from '@/app/types';
import { toast } from 'sonner';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';

// Hàm hook xác thực
function useAuthHook() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Hàm lưu token vào tất cả các nơi lưu trữ
  const saveTokenToStorage = useCallback((authToken: string) => {
    if (typeof window !== 'undefined') {
      // Lưu vào localStorage để giữ qua các phiên
      localStorage.setItem('admin_token', authToken);
      
      // Lưu vào sessionStorage để duy trì trong phiên hiện tại
      sessionStorage.setItem('admin_token', authToken);
      
      // Cập nhật cookie qua API nếu cần
      setCookie(config.auth.tokenCookieName, authToken, {
        maxAge: 60 * 60 * 24 * config.auth.tokenExpiryDays,
        path: '/',
      });
      
      console.log("Token đã được lưu vào tất cả các storage");
    }
  }, []);
  
  // Hàm xóa token từ tất cả các nơi lưu trữ
  const clearTokenFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      deleteCookie(config.auth.tokenCookieName);
      console.log("Token đã được xóa khỏi tất cả các storage");
    }
  }, []);

  useEffect(() => {
    // Kiểm tra token từ tất cả các nguồn
    let storedToken = null;
    
    if (typeof window !== 'undefined') {
      // Thử lấy từ sessionStorage trước (ưu tiên nhất, chỉ tồn tại trong phiên hiện tại)
      storedToken = sessionStorage.getItem('admin_token');
      
      // Nếu không có, thử lấy từ localStorage
      if (!storedToken) {
        storedToken = localStorage.getItem('admin_token');
        // Nếu tìm thấy trong localStorage, cập nhật vào sessionStorage
        if (storedToken) {
          sessionStorage.setItem('admin_token', storedToken);
          console.log("Đã sao chép token từ localStorage sang sessionStorage");
        }
      }
      
      // Nếu vẫn không có, thử lấy từ cookie
      if (!storedToken) {
        storedToken = getCookie(config.auth.tokenCookieName) as string;
        // Nếu tìm thấy trong cookie, cập nhật vào cả localStorage và sessionStorage
        if (storedToken) {
          localStorage.setItem('admin_token', storedToken);
          sessionStorage.setItem('admin_token', storedToken);
          console.log("Đã sao chép token từ cookie sang localStorage và sessionStorage");
        }
      }
    }
    
    // Nếu tìm thấy token, sử dụng nó để lấy thông tin người dùng
    if (storedToken) {
      console.log("Tìm thấy token trong storage:", storedToken.substring(0, 10) + "...");
      setToken(storedToken);
      fetchUser(storedToken).catch(err => {
        console.error("Lỗi khi tự động lấy thông tin người dùng:", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Lấy thông tin người dùng hiện tại
  const fetchUser = useCallback(async (authToken: string) => {
    try {
      setError(null);
      console.log("Đang lấy thông tin người dùng từ API với token:", authToken.substring(0, 10) + "...");
      
      // Cập nhật token trong state
      setToken(authToken);
      
      // Lưu token vào tất cả các storage
      saveTokenToStorage(authToken);
      
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        // Thêm cache: 'no-store' để không cache kết quả
        cache: 'no-store'
      });

      // Ghi log trạng thái response
      console.log("API /me response status:", response.status);
      
      if (!response.ok) {
        console.error("API /me trả về lỗi:", response.status);
        
        // Kiểm tra nếu token hết hạn hoặc không hợp lệ (401)
        if (response.status === 401) {
          console.log("Token không hợp lệ hoặc hết hạn");
          clearTokenFromStorage();
          throw new Error('Token xác thực không hợp lệ hoặc đã hết hạn');
        }
        
        throw new Error(`Lỗi khi lấy thông tin người dùng: ${response.status}`);
      }

      const data = await response.json();
      console.log("API /me response data:", JSON.stringify(data).substring(0, 100) + "...");
      
      if (data.success && data.data) {
        console.log("Lấy thông tin người dùng thành công:", data.data.username || data.data.name);
        setUser(data.data);
        
        // Lưu thông tin user vào cả localStorage và sessionStorage
        if (typeof window !== 'undefined') {
          const userJson = JSON.stringify(data.data);
          localStorage.setItem('user', userJson);
          sessionStorage.setItem('user', userJson);
          console.log("Đã lưu thông tin người dùng vào tất cả các storage");
        }
        
        return data.data;
      } else {
        console.log("Không tìm thấy phiên đăng nhập hoặc dữ liệu không hợp lệ:", JSON.stringify(data).substring(0, 100));
        
        // Xóa token khỏi tất cả các storage
        clearTokenFromStorage();
        
        setUser(null);
        setToken(null);
        throw new Error(data.message || 'Không tìm thấy thông tin người dùng');
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      
      // Xóa token khỏi tất cả các storage
      clearTokenFromStorage();
      
      setUser(null);
      setToken(null);
      throw error; // Ném lỗi để xử lý ở bên ngoài
    } finally {
      setLoading(false);
    }
  }, [saveTokenToStorage, clearTokenFromStorage]);

  // Đăng nhập
  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Đang gọi API đăng nhập với username: ${username}`);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Đang xử lý phản hồi API đăng nhập...');
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Đăng nhập thất bại:', data.message);
        setError(data.message);
        toast.error(data.message || 'Đăng nhập thất bại');
        return false;
      }

      if (data.token) {
        setToken(data.token);
        
        // Lưu token vào tất cả các storage
        saveTokenToStorage(data.token);

        if (data.user) {
          setUser(data.user);
          
          // Lưu thông tin user vào localStorage và sessionStorage
          if (typeof window !== 'undefined') {
            const userJson = JSON.stringify(data.user);
            localStorage.setItem('user', userJson);
            sessionStorage.setItem('user', userJson);
            console.log("Thông tin người dùng đã được lưu vào storage");
          }
        }

        toast.success('Đăng nhập thành công!');
        router.push('/dashboard');
        return true;
      } else {
        throw new Error('Không tìm thấy token trong phản hồi');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  }, [router, saveTokenToStorage]);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log("Đang đăng xuất...");
      
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Xóa dữ liệu trong state
      setUser(null);
      setToken(null);
      
      // Xóa token và user khỏi tất cả các storage
      clearTokenFromStorage();
      
      router.push('/');
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      setLoading(false);
    }
  }, [router, clearTokenFromStorage]);

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    fetchUser,
    isAuthenticated: !!token,
  };
}

export default useAuthHook;
// Thêm named export
export const useAuth = useAuthHook; 