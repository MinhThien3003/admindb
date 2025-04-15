'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

// Định nghĩa interface cho AuthorLevel
export interface AuthorLevel {
  _id: string;
  level: number;
  requiredExp: number;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa interface cho dữ liệu đầu vào khi tạo/cập nhật AuthorLevel
export interface AuthorLevelInput {
  level: number;
  requiredExp: number;
  title: string;
}

// Cấu hình axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const useAuthorLevels = () => {
  const [authorLevels, setAuthorLevels] = useState<AuthorLevel[]>([]);
  const [authorLevel, setAuthorLevel] = useState<AuthorLevel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Đảm bảo token được thêm vào header cho mỗi request
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Lấy danh sách cấp độ tác giả
  const fetchAuthorLevels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/authorLevels');
      console.log('Author Levels API Response:', response.data);
      
      if (response.data) {
        let levelsData: AuthorLevel[] = [];
        
        if (Array.isArray(response.data)) {
          levelsData = [...response.data];
        } else if (response.data.data && Array.isArray(response.data.data)) {
          levelsData = [...response.data.data];
        }
        
        setAuthorLevels(levelsData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cấp độ tác giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể tải danh sách cấp độ tác giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi tải danh sách cấp độ tác giả');
        toast.error('Đã xảy ra lỗi khi tải danh sách cấp độ tác giả');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lấy chi tiết cấp độ tác giả
  const fetchAuthorLevel = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/authorLevels/${id}`);
      console.log('Author Level Detail API Response:', response.data);
      
      if (response.data) {
        setAuthorLevel(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết cấp độ tác giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể tải chi tiết cấp độ tác giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi tải chi tiết cấp độ tác giả');
        toast.error('Đã xảy ra lỗi khi tải chi tiết cấp độ tác giả');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Thêm cấp độ tác giả mới
  const addAuthorLevel = useCallback(async (levelData: AuthorLevelInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/authorLevels', levelData);
      
      console.log('Add Author Level API Response:', response.data);
      
      if (response.data) {
        // Cập nhật danh sách cấp độ tác giả sau khi thêm thành công
        setAuthorLevels(prevLevels => [...prevLevels, response.data]);
        toast.success('Thêm cấp độ tác giả thành công');
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi thêm cấp độ tác giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể thêm cấp độ tác giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi thêm cấp độ tác giả');
        toast.error('Đã xảy ra lỗi khi thêm cấp độ tác giả');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cập nhật cấp độ tác giả
  const updateAuthorLevel = useCallback(async (id: string, levelData: Partial<AuthorLevelInput>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.put(`/authorLevels/${id}`, levelData);
      
      console.log('Update Author Level API Response:', response.data);
      
      if (response.data) {
        // Cập nhật danh sách cấp độ tác giả sau khi cập nhật thành công
        setAuthorLevels(prevLevels => 
          prevLevels.map(level => 
            level._id === id ? { ...level, ...response.data } : level
          )
        );
        // Cập nhật chi tiết cấp độ tác giả nếu đang xem
        if (authorLevel && authorLevel._id === id) {
          setAuthorLevel({ ...authorLevel, ...response.data });
        }
        
        toast.success('Cập nhật cấp độ tác giả thành công');
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật cấp độ tác giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể cập nhật cấp độ tác giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi cập nhật cấp độ tác giả');
        toast.error('Đã xảy ra lỗi khi cập nhật cấp độ tác giả');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authorLevel]);

  // Xóa cấp độ tác giả
  const deleteAuthorLevel = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await api.delete(`/authorLevels/${id}`);
      
      // Cập nhật danh sách cấp độ tác giả sau khi xóa thành công
      setAuthorLevels(prevLevels => prevLevels.filter(level => level._id !== id));
      
      // Nếu đang xem chi tiết cấp độ tác giả bị xóa, reset state
      if (authorLevel && authorLevel._id === id) {
        setAuthorLevel(null);
      }
      
      toast.success('Xóa cấp độ tác giả thành công');
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa cấp độ tác giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể xóa cấp độ tác giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi xóa cấp độ tác giả');
        toast.error('Đã xảy ra lỗi khi xóa cấp độ tác giả');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authorLevel]);

  return {
    authorLevels,
    authorLevel,
    isLoading,
    error,
    fetchAuthorLevels,
    fetchAuthorLevel,
    addAuthorLevel,
    updateAuthorLevel,
    deleteAuthorLevel,
  };
};
