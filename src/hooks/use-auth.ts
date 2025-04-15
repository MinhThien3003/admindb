'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import config from '@/lib/config';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = getCookie(config.auth.tokenCookieName) as string | undefined;
    
    if (storedToken) {
      setToken(storedToken);
      fetchUserInfo(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.data);
      } else {
        deleteCookie(config.auth.tokenCookieName);
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      deleteCookie(config.auth.tokenCookieName);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Gọi API login với:', { username, password });
      
      const response = await axios.post('/api/auth/login', { username, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        setCookie(config.auth.tokenCookieName, token, { 
          maxAge: config.auth.tokenExpiryDays * 24 * 60 * 60,
          path: '/' 
        });
        setToken(token);
        setUser(user);
        return true;
      } else {
        toast.error(response.data.message || 'Đăng nhập thất bại');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Đã xảy ra lỗi khi đăng nhập');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    deleteCookie(config.auth.tokenCookieName);
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 