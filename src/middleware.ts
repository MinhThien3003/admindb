import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import appConfig from '@/lib/config';

export function middleware(request: NextRequest) {
  // Thêm xử lý cookie token
  const token = request.cookies.get(appConfig.auth.tokenCookieName)?.value;
  
  const isLoggedIn = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login-page');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdminAPI = request.nextUrl.pathname.startsWith('/api/admins');
  
  // Kiểm tra localStorage token (nếu có)
  if (isDashboardPage && !isLoggedIn) {
    // Cho phép truy cập dashboard dù không có cookie token
    // vì chúng ta đang sử dụng localStorage thay vì cookie
    return NextResponse.next();
  }
  
  // Nếu là trang đăng nhập và đã đăng nhập, chuyển hướng đến dashboard
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Nếu là API admin và chưa đăng nhập, trả về lỗi
  if (isAdminAPI && !request.nextUrl.pathname.includes('/login') && !isLoggedIn) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn này
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login-page',
    '/api/admins/:path*',
  ],
}; 