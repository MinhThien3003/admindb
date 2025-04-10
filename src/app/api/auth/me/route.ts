import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/lib/config';

export async function GET() {
  try {
    // Lấy token từ cookies
    const token = cookies().get(config.auth.tokenCookieName)?.value;
    
    // Nếu không có token, trả về không có thông tin người dùng
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Chưa đăng nhập"
      });
    }
    
    // URL API thực tế để lấy thông tin admin từ token
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.auth.me}`;
    
    // Gọi API thực tế
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      // Đọc response dưới dạng text
      const responseText = await response.text();
      
      try {
        // Thử parse JSON
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch (jsonError) {
        console.error("Phản hồi không phải JSON:", responseText);
        return NextResponse.json({
          success: false,
          message: "Phản hồi từ server không hợp lệ"
        }, { status: 500 });
      }
    } catch (fetchError) {
      console.error("Lỗi khi gọi API:", fetchError);
      return NextResponse.json({
        success: false,
        message: "Không thể kết nối đến server backend"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return NextResponse.json({
      success: false,
      message: "Lỗi kết nối đến server"
    }, { status: 500 });
  }
} 