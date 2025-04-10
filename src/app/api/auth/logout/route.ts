import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/lib/config';

export async function POST() {
  try {
    const token = cookies().get(config.auth.tokenCookieName)?.value;

    // Nếu có token, gọi API đăng xuất thực tế
    if (token) {
      // URL API thực tế 
      const apiUrl = `${config.api.baseUrl}${config.api.endpoints.auth.logout}`;

      // Gọi API thực tế
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    }

    // Xóa cookie token
    cookies().delete(config.auth.tokenCookieName);

    return NextResponse.json({
      success: true,
      message: "Đăng xuất thành công"
    });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);

    // Vẫn xóa cookie token ngay cả khi có lỗi
    cookies().delete(config.auth.tokenCookieName);

    return NextResponse.json({
      success: false,
      message: "Lỗi kết nối đến server, nhưng đã đăng xuất khỏi trình duyệt"
    }, { status: 500 });
  }
} 