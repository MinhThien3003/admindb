import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    // Lấy dữ liệu đăng nhập từ request
    const { username, password } = await req.json();
    
    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu',
      }, { status: 400 });
    }

    console.log(`Đang cố gắng đăng nhập với tên đăng nhập: ${username}`);
    
    // Gọi API backend để xác thực - sử dụng endpoint từ config
    const apiUrl = `${config.backendUrl}/api${config.api.endpoints.auth.login}`;
    console.log(`Gọi API backend: ${apiUrl}`);
    
    // Dữ liệu đăng nhập
    const loginData = {
      username,
      password
    };
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      // Xử lý trường hợp lỗi kết nối
      if (!response.ok) {
        console.error(`Lỗi từ API backend: ${response.status}`);
        
        // Thử đọc thông báo lỗi dưới dạng text trước
        const errorText = await response.text();
        console.error('Nội dung lỗi:', errorText);
        
        // Thử phân tích dưới dạng JSON nếu có thể
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (jsonError) {
          // Nếu không phải JSON, tiếp tục sử dụng errorText
          console.error('Không thể phân tích phản hồi lỗi như JSON:', jsonError);
        }
        
        // Xử lý các trường hợp lỗi cụ thể
        if (response.status === 401) {
          return NextResponse.json({
            success: false,
            message: errorData?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác',
          }, { status: 401 });
        }
        
        return NextResponse.json({
          success: false,
          message: errorData?.message || 'Lỗi khi đăng nhập',
        }, { status: response.status });
      }
      
      // Xử lý phản hồi thành công
      let responseData;
      try {
        // Thử đọc phản hồi như text trước
        const responseText = await response.text();
        console.log('Phản hồi API:', responseText);
        
        // Sau đó chuyển đổi thành JSON
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Lỗi khi phân tích phản hồi JSON:', parseError);
        return NextResponse.json({
          success: false,
          message: 'Lỗi khi xử lý phản hồi từ server',
        }, { status: 500 });
      }
      
      // Kiểm tra xem phản hồi có thành công không
      if (!responseData.success) {
        return NextResponse.json({
          success: false,
          message: responseData.message || 'Đăng nhập thất bại',
        }, { status: 400 });
      }
      
      // Đảm bảo có token trong phản hồi
      if (!responseData.data || !responseData.data.token) {
        console.error('Không tìm thấy token trong phản hồi');
        return NextResponse.json({
          success: false,
          message: 'Lỗi xác thực từ server',
        }, { status: 500 });
      }
      
      // Lưu token vào cookie
      const { token, user } = responseData.data;
      cookies().set({
        name: config.auth.tokenCookieName,
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: config.auth.tokenExpiryDays * 24 * 60 * 60,
      });
      
      // Trả về thông tin người dùng (không bao gồm mật khẩu)
      return NextResponse.json({
        success: true,
        message: 'Đăng nhập thành công',
        token: token,
        user: user,
      });
      
    } catch (error) {
      console.error('Lỗi khi gọi API backend:', error);
      return NextResponse.json({
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Lỗi xử lý đăng nhập:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi server khi xử lý đăng nhập',
    }, { status: 500 });
  }
} 