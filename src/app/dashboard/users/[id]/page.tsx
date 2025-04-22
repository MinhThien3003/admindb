import { Metadata } from 'next';
import UserDetails from './components/user-details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, CornerDownLeft, ArrowLeft, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import UserStats from './components/user-stats';
import UserActivity from './components/user-activity';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import UserActions from './components/user-actions';
import { DashboardHeader } from '@/components/header';
import { DashboardShell } from '@/components/shell';
import { Skeleton } from '@/components/ui/skeleton';
import { appConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Chi tiết người dùng',
  description: 'Xem và quản lý thông tin chi tiết người dùng',
};

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

async function getUserById(id: string) {
  // Mock user data - thay thế bằng API call thực tế
  return {
    id,
    name: 'Nguyễn Văn A',
    username: 'nguyenvana',
    email: 'nguyenvana@example.com',
    avatar: '/avatars/01.png',
    status: 'active',
    gender: 'male',
    phone: '0987654321',
    experience: 1250,
    totalDeposit: 2500000,
    coin: 350,
    createdAt: '2023-05-15T10:30:00Z',
    lastLogin: '2023-10-01T15:20:00Z',
    lastTransaction: '2023-09-25T09:15:00Z',
    novelsRead: 35,
    chaptersRead: 245,
    device: 'Android',
    address: {
      street: '123 Đường ABC',
      city: 'Quận 1',
      state: 'TP.HCM',
      zip: '70000',
      country: 'Việt Nam',
    },
    preferences: {
      categories: ['Tiên hiệp', 'Kiếm hiệp', 'Ngôn tình'],
      notifications: true,
      newsletter: false,
      theme: 'dark',
    },
    purchaseHistory: [
      {
        id: 'pur-001',
        date: '2023-09-25T09:15:00Z',
        amount: 150000,
        items: [
          { name: 'Gói VIP 30 ngày', price: 150000, quantity: 1 }
        ]
      },
      {
        id: 'pur-002',
        date: '2023-08-15T14:30:00Z',
        amount: 200000,
        items: [
          { name: 'Nạp 200 xu', price: 200000, quantity: 1 }
        ]
      }
    ],
    activityLog: [
      { id: 'act-001', action: 'Đọc truyện', target: 'Đấu Phá Thương Khung', timestamp: '2023-10-01T15:20:00Z' },
      { id: 'act-002', action: 'Bình luận', target: 'Chương 56: Tuyệt địa phản kích', timestamp: '2023-10-01T15:45:00Z' },
      { id: 'act-003', action: 'Mua chương VIP', target: 'Chương 57: Khúc mắc giải khai', timestamp: '2023-10-01T16:00:00Z' },
      { id: 'act-004', action: 'Đánh giá', target: 'Tiên Nghịch', timestamp: '2023-09-30T10:15:00Z' },
      { id: 'act-005', action: 'Theo dõi', target: 'Vũ Động Càn Khôn', timestamp: '2023-09-29T19:30:00Z' },
    ],
    stats: {
      readingTime: {
        daily: [25, 30, 15, 45, 20, 35, 40],
        weekly: [150, 180, 210, 165],
        monthly: [720, 650, 830, 700, 780, 810]
      },
      coinSpending: {
        categories: ['Mua chương VIP', 'Quà tặng tác giả', 'Gói VIP', 'Khác'],
        values: [450, 150, 300, 100]
      }
    }
  };
}

async function getUserData(userId: string) {
  // Trong môi trường thực tế, bạn sẽ gọi API để lấy dữ liệu người dùng
  // Ví dụ:
  // const response = await fetch(`${appConfig.apiUrl}/users/${userId}`);
  // if (!response.ok) throw new Error('Failed to fetch user');
  // return response.json();
  
  // Vì demo, chúng ta sẽ sử dụng dữ liệu mẫu
  return getUserById(userId);
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  try {
    const userId = params.id;
    
    // Gọi API để lấy thông tin chi tiết người dùng
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/${userId}`, { 
      cache: 'no-store',
      next: { revalidate: 0 } 
    });
    
    // Xử lý khi API trả về lỗi
    if (!res.ok) {
      let errorMessage = 'Không thể lấy thông tin người dùng';
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Không thể đọc lỗi từ API:', e);
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Lỗi!</h1>
          <p className="text-lg text-gray-600 mb-4">{errorMessage}</p>
          <Button asChild>
            <Link href="/dashboard/users">
              <CornerDownLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách người dùng
            </Link>
          </Button>
        </div>
      );
    }
    
    // Lấy dữ liệu người dùng từ API response
    const user = await getUserData(userId);
    
    return (
      <DashboardShell>
        <DashboardHeader 
          heading="Chi tiết người dùng" 
          text="Xem và quản lý thông tin chi tiết của người dùng"
        >
          <UserActions userId={userId} />
        </DashboardHeader>
        
        <div className="grid gap-8 md:grid-cols-[1fr_250px]">
          <Suspense fallback={<UserDetailsSkeleton />}>
            <UserDetails user={user} />
          </Suspense>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-2">Tổng quan</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Trạng thái:</dt>
                  <dd className="text-sm font-medium">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : user.status === 'inactive' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' 
                        ? 'Hoạt động' 
                        : user.status === 'inactive' 
                          ? 'Không hoạt động' 
                          : 'Bị cấm'}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Ngày tham gia:</dt>
                  <dd className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Đăng nhập gần đây:</dt>
                  <dd className="text-sm font-medium">
                    {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Số xu hiện tại:</dt>
                  <dd className="text-sm font-medium">{user.coin}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Tổng nạp:</dt>
                  <dd className="text-sm font-medium">{user.totalDeposit.toLocaleString('vi-VN')} VNĐ</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    notFound();
  }
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-1/3" />
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 