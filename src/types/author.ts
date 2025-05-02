export interface Author {
  _id: string;
  username: string;
  email: string;
  fullname: string;
  gender: 'Male' | 'Female';
  role: 'author';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'banned';
  level?: string;
  levelId?: string;
  experiencePoints?: number;
  bio?: string;
  totalViews?: number;
  totalTransactions?: number;
  totalEarnings?: number;
}

export interface AuthorFormData {
  username: string;
  email: string;
  password?: string;
  fullname: string;
  gender: 'Male' | 'Female';
  status: 'active' | 'inactive' | 'banned';
  bio?: string;
  avatar?: string;
  role: 'author';
  level?: string;
  experiencePoints?: number;
}

export interface AuthorApiData extends AuthorFormData {
  // Thêm các trường bổ sung khi gửi lên API
  levelId?: string;
}

export interface AuthorRegisterRequest {
  _id: string;
  idUser: {
    _id: string;
    fullname: string;
    email: string;
    gender: string;
    avatar: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  __v: number;
} 