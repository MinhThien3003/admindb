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
    
    // Kiểm tra header đặc biệt cho author role
    const userRole = request.headers.get('X-User-Role');
    const isAuthorCreation = userRole === 'author';

    // Đọc dữ liệu từ request
    let userData;
    try {
      userData = await request.json();
      
      // Kiểm tra forceRole cho tác giả
      const hasForceRole = userData.forceRole === 'author';
      
      // Log dữ liệu người dùng với thêm thông tin về role
      console.log('Dữ liệu người dùng mới:', {
        ...userData, 
        password: '[HIDDEN]',
        avatar: userData.avatar ? '[Avatar Base64]' : undefined,
        requestedRole: userData.role,
        forceRole: userData.forceRole,
        headerRole: userRole
      });
      
      // Kiểm tra dữ liệu bắt buộc
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
    
      // Tạo người dùng mới
      // Nếu là tác giả (qua header hoặc forceRole), thì ghi đè role 'author'
      if (isAuthorCreation || hasForceRole) {
        console.log('Tạo mới tác giả với role="author"');
        userData.role = 'author';
      }
      
      const newUser = await createUser(userData);
      
      // Nếu là tác giả, đảm bảo response trả về có role là author
      if ((isAuthorCreation || hasForceRole) && newUser.role !== 'author') {
        newUser.role = 'author';
      }
      
      return NextResponse.json(newUser);
    } catch (error: unknown) {
    console.error('Lỗi khi tạo người dùng mới:', error);
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tạo người dùng mới';
      return NextResponse.json(
        { message: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Lỗi server khi xử lý yêu cầu tạo người dùng:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
} 