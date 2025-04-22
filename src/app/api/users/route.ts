import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/api/users';
import { verifyAuth } from '@/lib/auth';

// API Routes for /api/users

// Xử lý GET request - lấy danh sách tất cả người dùng
export async function GET() {
  try {
    // Gọi hàm API để lấy danh sách người dùng
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy danh sách người dùng' },
      { status: 500 }
    );
  }
}

// Xử lý POST request - tạo người dùng mới
export async function POST(request: NextRequest) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      console.log('Xác thực token thất bại:', authResult.error);
      return NextResponse.json(
        { message: 'Không có quyền truy cập hoặc phiên làm việc đã hết hạn', error: authResult.error },
        { status: 401 }
      );
    }
    
    console.log('Xác thực token thành công, tiếp tục xử lý request');
    
    // Đọc và xử lý dữ liệu theo cách an toàn cho payload lớn
    let requestText;
    try {
      requestText = await request.text();
      console.log('Request body đã nhận (raw):', requestText.substring(0, 200) + '...');
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu request:', error);
      return NextResponse.json(
        { message: 'Không thể đọc dữ liệu yêu cầu', error: String(error) },
        { status: 400 }
      );
    }
    
    let userData;
    
    try {
      userData = JSON.parse(requestText);
      console.log('Dữ liệu người dùng đã parse:', {
        ...userData, 
        password: userData.password ? '[HIDDEN]' : undefined,
        avatar: userData.avatar ? `[Avatar: ${userData.avatar.substring(0, 20)}...]` : undefined
      });
    } catch (error) {
      console.error('Lỗi khi parse dữ liệu JSON:', error);
      return NextResponse.json(
        { message: 'Dữ liệu không hợp lệ', error: String(error) },
        { status: 400 }
      );
    }
    
    // Kiểm tra các trường bắt buộc
    if (!userData.username || !userData.email || !userData.fullname || !userData.password || !userData.gender) {
      console.error('Thiếu trường bắt buộc:', { 
        hasUsername: !!userData.username,
        hasEmail: !!userData.email,
        hasFullname: !!userData.fullname,
        hasPassword: !!userData.password,
        hasGender: !!userData.gender
      });
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc (username, email, fullname, password, gender)' },
        { status: 400 }
      );
    }
    
    // Kiểm tra gender
    if (!['Male', 'Female'].includes(userData.gender)) {
      return NextResponse.json(
        { message: 'Giới tính phải là "Male" hoặc "Female"' },
        { status: 400 }
      );
    }
    
    // Kiểm tra kích thước avatar
    if (userData.avatar && typeof userData.avatar === 'string') {
      // Ước tính kích thước base64 (3/4 * chiều dài chuỗi)
      const avatarSizeKB = Math.round((userData.avatar.length * 0.75) / 1024);
      console.log(`Kích thước avatar nhận được: ~${avatarSizeKB} KB`);
      
      // Giới hạn kích thước (800KB)
      if (avatarSizeKB > 800) {
        return NextResponse.json(
          { message: 'Kích thước avatar quá lớn, vui lòng giảm kích thước ảnh (<800KB)' },
          { status: 413 }
        );
      }
      
      // Nếu ảnh quá lớn (>400KB), thông báo nhưng vẫn xử lý
      if (avatarSizeKB > 400) {
        console.warn(`Avatar có kích thước lớn: ${avatarSizeKB}KB, có thể gây chậm`);
      }
    }
    
    // Đảm bảo role luôn là "reader" khi tạo mới
    userData = {
      ...userData,
      role: 'reader' // Luôn set role là "reader" theo yêu cầu
    };
    
    console.log('Gọi createUser API với dữ liệu đã chuẩn bị');
    
    // Gọi hàm API để tạo người dùng mới
    try {
      const newUser = await createUser(userData);
      console.log('Tạo người dùng thành công:', newUser);
      
      return NextResponse.json({
        message: 'Tạo người dùng mới thành công',
        data: newUser
      }, { status: 201 });
    } catch (createError) {
      console.error('Lỗi từ hàm createUser:', createError);
      
      // Kiểm tra lỗi cụ thể (email hoặc username đã tồn tại)
      const errorMessage = createError instanceof Error ? createError.message : String(createError);
      
      if (errorMessage.includes('email') && errorMessage.includes('exist')) {
        return NextResponse.json(
          { message: 'Email đã được sử dụng' },
          { status: 409 }
        );
      }
      
      if (errorMessage.includes('username') && errorMessage.includes('exist')) {
        return NextResponse.json(
          { message: 'Tên đăng nhập đã được sử dụng' },
          { status: 409 }
        );
      }
      
      throw createError; // Ném lỗi để xử lý ở catch bên ngoài
    }
  } catch (error) {
    console.error('Lỗi khi tạo người dùng mới:', error);
    
    // Lấy thông tin chi tiết về lỗi
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('Chi tiết lỗi:', errorMessage);
    console.error('Stack trace:', errorStack);
    
    // Kiểm tra xem có phải lỗi PayloadTooLargeError không
    if (errorMessage.includes('request entity too large')) {
      return NextResponse.json(
        { message: 'Kích thước dữ liệu quá lớn, vui lòng giảm kích thước ảnh' },
        { status: 413 }
      );
    }
    
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi tạo người dùng mới', details: errorMessage },
      { status: 500 }
    );
  }
} 