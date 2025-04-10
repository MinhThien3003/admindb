import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/lib/config';

// Interface cho thông tin đăng nhập
interface UserCredentials {
  username: string;
  password: string;
}

// Hàm xử lý yêu cầu POST đến API đăng nhập
export async function POST(request: Request) {
  try {
    // Lấy thông tin đăng nhập từ request body
    const body = await request.json();
    const { username, password }: UserCredentials = body;

    // URL API thực tế - endpoint chính xác cho đăng nhập
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.auth.login}`;
    console.log('Gọi API đăng nhập:', apiUrl);

    // MOCK DATA - Chỉ sử dụng khi test và không kết nối được backend
    /* Tạm thời comment mã này lại
    if (username === "admin" && password === "admin123") {
      console.log('Sử dụng mock data cho đăng nhập thành công');
      
      const token = "mock_token_" + Date.now();
      cookies().set({
        name: config.auth.tokenCookieName,
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * config.auth.tokenExpiryDays,
      });
      
      // Mock response thành công
      return NextResponse.json({
        success: true,
        user: {
          id: "mock123",
          username: "admin",
          email: "admin@example.com",
          gender: "Male",
          role: "Admin",
          createdAt: new Date().toISOString(),
        },
        token,
        message: "Đăng nhập thành công (MOCK DATA)"
      });
    }
    */

    // Gọi API thực tế
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      console.log('API Status:', response.status);
      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);
        console.log('API Response:', data);

        // Nếu đăng nhập thành công
        if (data.success) {
          // Lưu token từ API vào cookies
          cookies().set({
            name: config.auth.tokenCookieName,
            value: data.token, // Token từ API MongoDB
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * config.auth.tokenExpiryDays, // Thời gian từ cấu hình
          });

          // Chuyển tiếp response từ API
          return NextResponse.json(data);
        }

        // Nếu đăng nhập thất bại, chuyển tiếp lỗi từ API
        return NextResponse.json(
          { success: false, message: data.message || "Đăng nhập thất bại" },
          { status: response.status }
        );
      } catch (jsonError) {
        console.error("Phản hồi không phải JSON:", responseText);
        return NextResponse.json(
          { success: false, message: "Phản hồi từ server không hợp lệ" },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      console.error("Lỗi khi gọi API:", fetchError);
      // Nếu không kết nối được backend
      return NextResponse.json(
        { success: false, message: "Không thể kết nối đến server backend" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Lỗi xử lý đăng nhập:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý yêu cầu đăng nhập" },
      { status: 500 }
    );
  }
} 