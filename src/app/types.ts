// Định nghĩa các kiểu dữ liệu cho toàn bộ ứng dụng

// Kiểu dữ liệu người dùng
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  username: string;
  gender?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Kiểu dữ liệu phản hồi đăng nhập
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Kiểu dữ liệu chung cho API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

// Kiểu dữ liệu cho Novel (Truyện)
export interface Novel {
  _id?: string;
  title: string;
  author: string;
  authorId?: string;
  description?: string;
  coverImage?: string;
  status?: 'ongoing' | 'completed' | 'dropped';
  categories?: string[];
  tags?: string[];
  views?: number;
  rating?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Kiểu dữ liệu cho Chapter (Chương)
export interface Chapter {
  _id?: string;
  novelId: string;
  number: number;
  title: string;
  content: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Kiểu dữ liệu cho Category (Thể loại)
export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
}

// Kiểu dữ liệu cho Author (Tác giả)
export interface Author {
  _id?: string;
  name: string;
  avatar?: string;
  description?: string;
  novels?: number;
  followers?: number;
}

// Định nghĩa loại báo lỗi
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
} 