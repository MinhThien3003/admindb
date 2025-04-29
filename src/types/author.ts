export interface Author {
  _id: string;
  username: string;
  email: string;
  fullname?: string;
  gender: 'Male' | 'Female';
  role: 'reader' | 'author';
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  status?: 'active' | 'inactive' | 'banned';
  level?: string;
  levelId?: string;
  experiencePoints?: number;
  bio?: string;
  totalViews?: number;
  totalTransactions?: number;
  totalEarnings?: number;
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