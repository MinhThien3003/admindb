import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import appConfig from '@/lib/config';

export function middleware(request: NextRequest) {
  // Lấy token từ cookie (nếu có)
  const token = request.cookies.get(appConfig.auth.tokenCookieName)?.value;
  
  const isLoggedIn = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login-page');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isProtectedApiRoute = 
    (request.nextUrl.pathname.startsWith('/api/admins') && !request.nextUrl.pathname.includes('/login')) ||
    request.nextUrl.pathname.startsWith('/api/auth/me');
    
  // Cho phép truy cập dashboard dù không có cookie token
  // vì chúng ta đang sử dụng localStorage để lưu token
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  
  // Nếu là trang đăng nhập và đã đăng nhập, chuyển hướng đến dashboard
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Chỉ kiểm tra token khi truy cập API được bảo vệ
  if (isProtectedApiRoute && !isLoggedIn) {
    return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn này
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login-page',
    '/api/admins/:path*',
    '/api/auth/me'
  ],
}; 