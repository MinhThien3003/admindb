import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import config from '@/lib/config';
import axios from 'axios';

// API endpoint để lấy thông tin người dùng hiện tại từ token
export async function GET(request: Request) {
  console.log("API Route: /api/auth/me - Đang lấy thông tin người dùng hiện tại");
  
  try {
    // Lấy token từ request headers hoặc cookies
    const authHeader = request.headers.get('Authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("Lấy token từ Authorization header:", token.substring(0, 10) + "...");
    } else {
      // Thử lấy từ cookies nếu không có trong header
      const cookieStore = cookies();
      token = cookieStore.get(config.auth.tokenCookieName)?.value;
      console.log("Thử lấy token từ cookie:", token ? (token.substring(0, 10) + "...") : "không có");
    }
    
    // Kiểm tra token có tồn tại không
    if (!token) {
      console.log("Không tìm thấy token trong request");
      return NextResponse.json(
        { success: false, message: "Không tìm thấy token xác thực" },
        { status: 401 }
      );
    }
    
    console.log("Token tồn tại, đang gọi API lấy thông tin người dùng");
    
    // Gọi API backend để lấy thông tin người dùng từ token
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    console.log(`Gọi API backend: ${apiUrl}/admins/me với token: ${token.substring(0, 10)}...`);
    
    try {
      // Tăng timeout để tránh lỗi timeout khi server chậm
      const response = await axios.get(`${apiUrl}/admins/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 15000 // Tăng lên 15 giây
      });
      
      console.log("API response status:", response.status);
      
      // Kiểm tra dữ liệu trả về
      if (response.data && (response.data.data || response.data.admin || response.data.user)) {
        const userData = response.data.data || response.data.admin || response.data.user || response.data;
        
        console.log("API response data (success):", {
          id: userData.id || userData._id,
          username: userData.username,
          email: userData.email
        });
        
        // Trả về thông tin người dùng
        return NextResponse.json({
          success: true,
          data: userData
        });
      } else {
        // Trường hợp API trả về success nhưng không có dữ liệu
        console.log("API trả về thành công nhưng không có dữ liệu hợp lệ:", response.data);
        return NextResponse.json(
          { success: false, message: "Dữ liệu người dùng không hợp lệ" },
          { status: 400 }
        );
      }
    } catch (axiosError) {
      if (axios.isAxiosError(axiosError)) {
        console.error("Lỗi khi gọi API backend:", {
          status: axiosError.response?.status,
          message: axiosError.message,
          data: axiosError.response?.data,
          configUrl: axiosError.config?.url,
          isNetworkError: axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ECONNABORTED'
        });
        
        // Xử lý lỗi timeout hoặc không kết nối được
        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ECONNABORTED') {
          return NextResponse.json(
            { 
              success: false, 
              message: "Không thể kết nối đến máy chủ xác thực, vui lòng kiểm tra kết nối hoặc thử lại sau"
            },
            { status: 503 } // Service Unavailable
          );
        }
        
        // Trả về lỗi khi token không hợp lệ hoặc hết hạn
        if (axiosError.response?.status === 401) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Token không hợp lệ hoặc đã hết hạn",
              status: 401
            },
            { status: 401 }
          );
        }
        
        // Trả về lỗi chi tiết
        return NextResponse.json(
          { 
            success: false, 
            message: axiosError.response?.data?.message || axiosError.message || "Lỗi khi lấy thông tin người dùng",
            status: axiosError.response?.status,
            error: axiosError.response?.data
          },
          { status: axiosError.response?.status || 500 }
        );
      } else {
        throw axiosError; // Ném lỗi để xử lý ở catch bên ngoài
      }
    }
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    
    // Xử lý lỗi chi tiết
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message || "Lỗi không xác định";
      
      console.error(`API Error (${status}): ${message}`);
      
      return NextResponse.json(
        { success: false, message, error: error.response?.data || "Không có dữ liệu chi tiết" },
        { status }
      );
    }
    
    // Lỗi không phải từ Axios
    return NextResponse.json(
      { success: false, message: "Lỗi không xác định khi lấy thông tin người dùng" },
      { status: 500 }
    );
  }
} 