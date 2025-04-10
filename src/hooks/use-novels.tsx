'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

// Định nghĩa interface cho Category
interface Category {
  _id: string;
  name: string;
}

// Định nghĩa interface cho User (Author)
interface Author {
  _id: string;
  username: string;
  name?: string;
}

// Định nghĩa interface cho Novel dựa trên Schema
export interface Novel {
  _id: string;
  idCategories: Category[] | string[];
  idUser: Author | string;
  title: string;
  description: string;
  view: number;
  imageUrl: string;
  rate: number;
  status: "ongoing" | "completed";
  createdAt: string;
  updatedAt: string;
}

// Cấu hình axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const useNovels = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [novel, setNovel] = useState<Novel | null>(null);
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

  // Lấy thông tin người dùng từ ID
  const fetchUserInfo = useCallback(async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      console.log('User Info Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      return null;
    }
  }, []);

  // Thêm populate cho idUser khi lấy thông tin novel
  const fetchNovelWithPopulatedUser = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/novels/${id}`);
      console.log('Novel Detail API Response:', response.data);
      
      if (response.data) {
        const novelData = {...response.data};
        
        // Nếu idUser là chuỗi, thực hiện truy vấn bổ sung để lấy thông tin người dùng
        if (typeof novelData.idUser === 'string') {
          try {
            const userData = await fetchUserInfo(novelData.idUser);
            if (userData) {
              novelData.idUser = userData;
            }
          } catch (err) {
            console.error('Lỗi khi populate user:', err);
          }
        }
        
        setNovel(novelData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết tiểu thuyết:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể tải chi tiết tiểu thuyết';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi tải chi tiết tiểu thuyết');
        toast.error('Đã xảy ra lỗi khi tải chi tiết tiểu thuyết');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserInfo]);

  // Thêm populate cho idUser trong danh sách novels
  const fetchNovelsWithPopulatedUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/novels');
      console.log('Novels API Response:', response.data);
      
      if (response.data) {
        let novelsData;
        
        if (Array.isArray(response.data)) {
          novelsData = [...response.data];
        } else if (response.data.data && Array.isArray(response.data.data)) {
          novelsData = [...response.data.data];
          console.log('Đã nhận dữ liệu tiểu thuyết từ response.data.data');
        } else {
          console.error('Dữ liệu API không đúng định dạng mảng:', response.data);
          setNovels([]);
          toast.error('Dữ liệu tiểu thuyết không đúng định dạng');
          return;
        }
        
        // Tiến hành truy vấn thông tin người dùng cho mỗi novel nếu cần
        for (let i = 0; i < novelsData.length; i++) {
          if (typeof novelsData[i].idUser === 'string') {
            try {
              const userData = await fetchUserInfo(novelsData[i].idUser);
              if (userData) {
                novelsData[i].idUser = userData;
              }
            } catch (err) {
              console.error(`Lỗi khi populate user cho novel ${novelsData[i]._id}:`, err);
            }
          }
        }
        
        setNovels(novelsData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tiểu thuyết:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể tải danh sách tiểu thuyết';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi tải danh sách tiểu thuyết');
        toast.error('Đã xảy ra lỗi khi tải danh sách tiểu thuyết');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserInfo]);

  // Thêm tiểu thuyết mới
  const addNovel = useCallback(async (novelData: Omit<Novel, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/novels', novelData);
      
      console.log('Add Novel API Response:', response.data);
      
      if (response.data) {
        // Cập nhật danh sách tiểu thuyết sau khi thêm thành công
        setNovels(prevNovels => [...prevNovels, response.data]);
        toast.success('Thêm tiểu thuyết thành công');
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi thêm tiểu thuyết:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể thêm tiểu thuyết';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi thêm tiểu thuyết');
        toast.error('Đã xảy ra lỗi khi thêm tiểu thuyết');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cập nhật tiểu thuyết
  const updateNovel = useCallback(async (id: string, novelData: Partial<Novel>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.put(`/novels/${id}`, novelData);
      
      console.log('Update Novel API Response:', response.data);
      
      if (response.data) {
        // Cập nhật danh sách tiểu thuyết sau khi cập nhật thành công
        setNovels(prevNovels => 
          prevNovels.map(novel => 
            novel._id === id ? { ...novel, ...response.data } : novel
          )
        );
        // Cập nhật chi tiết tiểu thuyết nếu đang xem
        if (novel && novel._id === id) {
          setNovel({ ...novel, ...response.data });
        }
        
        toast.success('Cập nhật tiểu thuyết thành công');
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật tiểu thuyết:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể cập nhật tiểu thuyết';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi cập nhật tiểu thuyết');
        toast.error('Đã xảy ra lỗi khi cập nhật tiểu thuyết');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [novel]);

  // Xóa tiểu thuyết
  const deleteNovel = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await api.delete(`/novels/${id}`);
      
      // Cập nhật danh sách tiểu thuyết sau khi xóa thành công
      setNovels(prevNovels => prevNovels.filter(novel => novel._id !== id));
      
      // Nếu đang xem chi tiết tiểu thuyết bị xóa, reset state
      if (novel && novel._id === id) {
        setNovel(null);
      }
      
      toast.success('Xóa tiểu thuyết thành công');
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa tiểu thuyết:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Không thể xóa tiểu thuyết';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Đã xảy ra lỗi khi xóa tiểu thuyết');
        toast.error('Đã xảy ra lỗi khi xóa tiểu thuyết');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [novel]);

  return {
    novels,
    novel,
    isLoading,
    error,
    fetchNovels: fetchNovelsWithPopulatedUsers,
    fetchNovel: fetchNovelWithPopulatedUser,
    addNovel,
    updateNovel,
    deleteNovel,
  };
}; 