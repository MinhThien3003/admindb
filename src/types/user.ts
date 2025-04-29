export interface User {
  _id: string
  fullname: string
  email: string
  gender: 'male' | 'female' | 'other'
  status: 'active' | 'inactive'
  role: 'admin' | 'author' | 'users'
  createdAt: string
  updatedAt: string
} 