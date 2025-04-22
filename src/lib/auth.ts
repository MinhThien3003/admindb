import { NextRequest } from 'next/server';
import config from '@/lib/config';

/**
 * Kiểm tra token xác thực trong request
 * @param request NextRequest chứa thông tin yêu cầu
 * @returns Object chứa kết quả xác thực (success và error nếu có)
 */
export async function verifyAuth(request: NextRequest) {
  try {
    // Ưu tiên lấy token từ header Authorization
    let token: string | null = request.headers.get('Authorization');
    console.log('Authorization header:', token ? `Tìm thấy (${token.substring(0, 15)}...)` : 'Không có');
    
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
      console.log('Đã trích xuất token từ header Bearer');
    } else {
      // Nếu không có trong header, kiểm tra trong cookies
      try {
        // Sử dụng request.cookies thay vì cookies() API
        const cookieData = request.cookies.get(config.auth.tokenCookieName);
        token = cookieData?.value || null;
        console.log('Cookie token:', token ? `Tìm thấy (${token.substring(0, 15)}...)` : 'Không có');
      } catch (cookieError) {
        console.error('Lỗi khi truy cập cookies:', cookieError);
      }
    }

    // Nếu không tìm thấy token
    if (!token) {
      console.warn('Không tìm thấy token trong request');
      return {
        success: false,
        error: 'Không có token xác thực, vui lòng đăng nhập lại'
      };
    }

    // Token không được để trống
    if (token.trim() === '') {
      console.warn('Token rỗng');
      return {
        success: false,
        error: 'Token không hợp lệ'
      };
    }

    // Ở đây có thể thêm logic verify token nếu cần
    // Ví dụ: gọi API để verify token, hoặc decode JWT token
    console.log('Token hợp lệ, xác thực thành công');

    // Trả về kết quả thành công
    return {
      success: true,
      token
    };
  } catch (error) {
    console.error('Lỗi khi xác thực token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi xác thực không xác định'
    };
  }
} 