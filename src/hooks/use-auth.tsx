'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { config } from '@/lib/config';

// Định nghĩa interface cho thông tin người dùng dựa vào adminSchema
interface User {
  id: string;
  username: string;
  email: string;
  gender: "Male" | "Female";
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dummy data cho người dùng phù hợp với adminSchema
const DUMMY_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    gender: "Male" as const,
    role: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    gender: "Female" as const,
    role: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cấu hình axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Kiểm tra và lấy thông tin người dùng đã đăng nhập từ localStorage
  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Sử dụng try-catch để xử lý trường hợp localStorage chưa khả dụng
      try {
        // Kiểm tra trong localStorage
        const savedUser = localStorage.getItem('auth_user');
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          setIsAuthenticated(true);
          
          // Cập nhật token cho các request API tiếp theo
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } else {
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (storageError) {
        console.error('Lỗi khi truy cập localStorage:', storageError);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hàm đăng nhập
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Đang đăng nhập với email:', email);
      
      // Gọi API đăng nhập thực tế
      const response = await api.post('/admins/login', {
        email,
        password
      });

      console.log('API Response:', response.data);
      
      if (response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;
        
        // Lưu thông tin vào state
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);
        
        // Cập nhật token cho các request API tiếp theo
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Lưu vào localStorage trong try-catch
        try {
          localStorage.setItem('auth_user', JSON.stringify(user));
          localStorage.setItem('auth_token', token);
        } catch (storageError) {
          console.error('Lỗi khi lưu vào localStorage:', storageError);
        }
        
        toast.success('Đăng nhập thành công!');
        
        // Sử dụng setTimeout để đảm bảo state đã được cập nhật trước khi chuyển hướng
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
        
        return true;
      } else {
        // Trường hợp response không có đủ thông tin cần thiết
        throw new Error('Phản hồi từ máy chủ không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      // Xử lý thông báo lỗi từ API
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Đăng nhập thất bại';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError(error instanceof Error ? error.message : 'Đăng nhập thất bại');
        toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      setIsLoading(true);

      // Xóa dữ liệu trong localStorage
      try {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      } catch (storageError) {
        console.error('Lỗi khi xóa localStorage:', storageError);
      }

      // Xóa token trong header
      delete api.defaults.headers.common['Authorization'];

      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      toast.success('Đăng xuất thành công');
      router.push('/login-page');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      toast.error('Lỗi khi đăng xuất');
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra đăng nhập khi component được mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchUser();
    }
  }, [fetchUser]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 