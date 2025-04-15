'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

// Định nghĩa interface cho ReaderLevel
export interface ReaderLevel {
  _id: string;
  level: number;
  requiredExp: number;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa interface cho dữ liệu đầu vào khi tạo/cập nhật ReaderLevel
export interface ReaderLevelInput {
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

export const useReaderLevels = () => {
  const [readerLevels, setReaderLevels] = useState<ReaderLevel[]>([]);
  const [readerLevel, setReaderLevel] = useState<ReaderLevel | null>(null);
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

  // Lấy danh sách cấp độ độc giả
  const fetchReaderLevels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/readerLevels');
      console.log('Reader Levels API Response:', response.data);
      
      if (response.data) {
        let levelsData: ReaderLevel[] = [];
        
        if (Array.isArray(response.data)) {
          levelsData = [...response.data];
        } else if (response.data.data && Array.isArray(response.data.data)) {
          levelsData = [...response.data.data];
        }
        
        setReaderLevels(levelsData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cấp độ độc giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể tải danh sách cấp độ độc giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi tải danh sách cấp độ độc giả');
        toast.error('Đã xảy ra lỗi khi tải danh sách cấp độ độc giả');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lấy chi tiết cấp độ độc giả
  const fetchReaderLevel = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/readerLevels/${id}`);
      console.log('Reader Level Detail API Response:', response.data);
      
      if (response.data) {
        setReaderLevel(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết cấp độ độc giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể tải chi tiết cấp độ độc giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi tải chi tiết cấp độ độc giả');
        toast.error('Đã xảy ra lỗi khi tải chi tiết cấp độ độc giả');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Thêm cấp độ độc giả mới
  const addReaderLevel = useCallback(async (levelData: ReaderLevelInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/readerLevels', levelData);
      
      console.log('Add Reader Level API Response:', response.data);
      
      if (response.data) {
        // Cập nhật danh sách cấp độ độc giả sau khi thêm thành công
        setReaderLevels(prevLevels => [...prevLevels, response.data]);
        toast.success('Thêm cấp độ độc giả thành công');
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi thêm cấp độ độc giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể thêm cấp độ độc giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi thêm cấp độ độc giả');
        toast.error('Đã xảy ra lỗi khi thêm cấp độ độc giả');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cập nhật cấp độ độc giả
  const updateReaderLevel = useCallback(async (id: string, levelData: Partial<ReaderLevelInput>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.put(`/readerLevels/${id}`, levelData);
      
      console.log('Update Reader Level API Response:', response.data);
      
      if (response.data) {
        // Cập nhật danh sách cấp độ độc giả sau khi cập nhật thành công
        setReaderLevels(prevLevels => 
          prevLevels.map(level => 
            level._id === id ? { ...level, ...response.data } : level
          )
        );
        // Cập nhật chi tiết cấp độ độc giả nếu đang xem
        if (readerLevel && readerLevel._id === id) {
          setReaderLevel({ ...readerLevel, ...response.data });
        }
        
        toast.success('Cập nhật cấp độ độc giả thành công');
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật cấp độ độc giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể cập nhật cấp độ độc giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi cập nhật cấp độ độc giả');
        toast.error('Đã xảy ra lỗi khi cập nhật cấp độ độc giả');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [readerLevel]);

  // Xóa cấp độ độc giả
  const deleteReaderLevel = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await api.delete(`/readerLevels/${id}`);
      
      // Cập nhật danh sách cấp độ độc giả sau khi xóa thành công
      setReaderLevels(prevLevels => prevLevels.filter(level => level._id !== id));
      
      // Nếu đang xem chi tiết cấp độ độc giả bị xóa, reset state
      if (readerLevel && readerLevel._id === id) {
        setReaderLevel(null);
      }
      
      toast.success('Xóa cấp độ độc giả thành công');
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa cấp độ độc giả:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể xóa cấp độ độc giả';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi xóa cấp độ độc giả');
        toast.error('Đã xảy ra lỗi khi xóa cấp độ độc giả');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [readerLevel]);

  return {
    readerLevels,
    readerLevel,
    isLoading,
    error,
    fetchReaderLevels,
    fetchReaderLevel,
    addReaderLevel,
    updateReaderLevel,
    deleteReaderLevel,
  };
};
