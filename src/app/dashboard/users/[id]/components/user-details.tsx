import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CreditCard,
  Clock,
  BookOpen,
  Smartphone,
  Settings
} from "lucide-react";

interface UserAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface UserPreferences {
  categories: string[];
  notifications: boolean;
  newsletter: boolean;
  theme: string;
}

interface PurchaseItem {
  name: string;
  price: number;
  quantity: number;
}

interface PurchaseHistory {
  id: string;
  date: string;
  amount: number;
  items: PurchaseItem[];
}

interface UserType {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  status: string;
  gender?: string;
  phone?: string;
  experience: number;
  totalDeposit: number;
  coin: number;
  createdAt: string;
  lastLogin: string;
  lastTransaction?: string;
  novelsRead?: number;
  chaptersRead?: number;
  device?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  preferences?: {
    categories?: string[];
    notifications?: boolean;
    newsletter?: boolean;
    theme?: string;
  };
  purchaseHistory?: Array<{
    id: string;
    date: string;
    amount: number;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
  }>;
}

interface UserDetailsProps {
  user: UserType;
}

export default function UserDetails({ user }: UserDetailsProps) {
  // Tạo fallback avatar dựa trên tên người dùng
  const userInitials = user.name ? user.name.substring(0, 2).toUpperCase() : '??';
  
  // Kiểm tra avatar có tồn tại hay không
  const hasAvatar = user.avatar && user.avatar.length > 0 && !user.avatar.includes('null');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {hasAvatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động</TabsTrigger>
              <TabsTrigger value="purchases">Lịch sử giao dịch</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tên đầy đủ:</span>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Số điện thoại:</span>
                    <span className="text-sm font-medium">{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ngày tham gia:</span>
                  <span className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                {user.gender && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Giới tính:</span>
                    <span className="text-sm font-medium">
                      {user.gender === 'male' ? 'Nam' : 'Nữ'}
                    </span>
                  </div>
                )}
                
                {user.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">Địa chỉ:</span>
                    <span className="text-sm font-medium">
                      {[
                        user.address.street,
                        user.address.city,
                        user.address.state,
                        user.address.zip,
                        user.address.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                {user.device && (
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thiết bị:</span>
                    <span className="text-sm font-medium">{user.device}</span>
                  </div>
                )}
              </div>
              
              {user.preferences && (
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Sở thích</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.preferences.categories && user.preferences.categories.length > 0 && (
                        <div className="grid grid-cols-1">
                          <span className="text-sm text-muted-foreground">Thể loại yêu thích:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.preferences.categories.map((category, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Thông báo:</span>
                          <span className="text-sm font-medium ml-2">
                            {user.preferences.notifications ? 'Bật' : 'Tắt'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Bản tin:</span>
                          <span className="text-sm font-medium ml-2">
                            {user.preferences.newsletter ? 'Đăng ký' : 'Chưa đăng ký'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Giao diện:</span>
                          <span className="text-sm font-medium ml-2">
                            {user.preferences.theme === 'sáng' ? 'Sáng' : 'Tối'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Hoạt động đọc truyện</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1 rounded-lg border p-4">
                      <span className="text-sm text-muted-foreground">Truyện đã đọc</span>
                      <span className="text-2xl font-bold">{user.novelsRead || 0}</span>
                    </div>
                    
                    <div className="flex flex-col space-y-1 rounded-lg border p-4">
                      <span className="text-sm text-muted-foreground">Chương đã đọc</span>
                      <span className="text-2xl font-bold">{user.chaptersRead || 0}</span>
                    </div>
                    
                    <div className="flex flex-col space-y-1 rounded-lg border p-4">
                      <span className="text-sm text-muted-foreground">Điểm kinh nghiệm</span>
                      <span className="text-2xl font-bold">{user.experience}</span>
                    </div>
                    
                    <div className="flex flex-col space-y-1 rounded-lg border p-4">
                      <span className="text-sm text-muted-foreground">Đăng nhập gần đây</span>
                      <span className="text-lg font-medium">
                        {new Date(user.lastLogin).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="purchases" className="mt-4">
              {user.purchaseHistory && user.purchaseHistory.length > 0 ? (
                <div className="space-y-4">
                  {user.purchaseHistory.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {new Date(purchase.date).toLocaleDateString('vi-VN')}
                          </CardTitle>
                          <span className="text-base font-medium">
                            {purchase.amount.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                        <CardDescription>
                          Mã giao dịch: {purchase.id}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {purchase.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-sm">{item.name} x{item.quantity}</span>
                              <span className="text-sm font-medium">
                                {item.price.toLocaleString('vi-VN')} VNĐ
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">Chưa có giao dịch</h3>
                  <p className="text-sm text-muted-foreground">
                    Người dùng này chưa thực hiện giao dịch nào.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 