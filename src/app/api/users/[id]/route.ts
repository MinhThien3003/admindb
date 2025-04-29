import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/api/users';
import { verifyAuth } from '@/lib/auth';

// API endpoint để lấy thông tin một người dùng theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    console.log(`Đang lấy thông tin người dùng với ID: ${userId}`);
    
    // Gọi hàm API để lấy thông tin người dùng
    const userData = await getUserById(userId);
    
    if (!userData) {
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}

// API endpoint để cập nhật thông tin người dùng
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const userId = params.id;
    console.log(`Đang cập nhật thông tin người dùng với ID: ${userId}`);
    
    // Kiểm tra ID hợp lệ
    if (!userId) {
      console.error('ID người dùng không hợp lệ');
      return NextResponse.json(
        { message: 'ID người dùng không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Đọc và xử lý dữ liệu avatar (xử lý kích thước lớn)
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
    
    let data;
    try {
      if (!requestText || requestText.trim() === '') {
        console.error('Request body rỗng');
        return NextResponse.json(
          { message: 'Dữ liệu cập nhật trống' },
          { status: 400 }
        );
      }
      
      data = JSON.parse(requestText);
      console.log('Dữ liệu người dùng đã parse:', {
        ...data, 
        password: data.password ? '[HIDDEN]' : undefined,
        avatar: data.avatar ? `[Avatar: ${data.avatar.substring(0, 20)}...]` : undefined
      });
      
      // Kiểm tra dữ liệu cơ bản
      if (!data.fullname && !data.email && !data.username && !data.gender && !data.status && !data.password && !data.avatar) {
        console.error('Không có trường dữ liệu nào được cung cấp để cập nhật');
        return NextResponse.json(
          { message: 'Không có thông tin cập nhật hợp lệ' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Lỗi khi parse dữ liệu JSON:', error);
      return NextResponse.json(
        { message: 'Dữ liệu không hợp lệ', error: String(error) },
        { status: 400 }
      );
    }
    
    // Kiểm tra kích thước avatar
    if (data.avatar && typeof data.avatar === 'string') {
      // Ước tính kích thước base64 (3/4 * chiều dài chuỗi)
      const avatarSizeKB = Math.round((data.avatar.length * 0.75) / 1024);
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
    
    try {
      // Gọi hàm API để cập nhật thông tin người dùng
      console.log(`Gọi hàm updateUser với userId: ${userId} và dữ liệu cập nhật:`, {
        ...data,
        password: data.password ? '[HIDDEN]' : undefined,
        avatar: data.avatar ? '[AVATAR DATA]' : undefined
      });

      const updatedUser = await updateUser(userId, data);
      
      if (!updatedUser) {
        console.error(`Không thể cập nhật người dùng ID ${userId}: updateUser trả về null/undefined`);
        return NextResponse.json(
          { message: 'Không tìm thấy người dùng để cập nhật hoặc cập nhật thất bại', status: 'error' },
          { status: 404 }
        );
      }
      
      console.log('Cập nhật thành công người dùng:', {
        id: updatedUser._id || userId,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        status: updatedUser.status
      });
      
      return NextResponse.json({
        message: 'Cập nhật thông tin người dùng thành công',
        data: updatedUser,
        status: 'success'
      });
    } catch (updateError) {
      console.error('Lỗi từ hàm updateUser:', updateError);
      
      // Kiểm tra lỗi cụ thể (email hoặc username đã tồn tại)
      const errorMessage = updateError instanceof Error ? updateError.message : String(updateError);
      console.error('Chi tiết lỗi:', errorMessage);
      
      if (errorMessage.includes('email') && errorMessage.includes('exist')) {
        return NextResponse.json(
          { message: 'Email đã được sử dụng', status: 'error' },
          { status: 409 }
        );
      }
      
      if (errorMessage.includes('username') && errorMessage.includes('exist')) {
        return NextResponse.json(
          { message: 'Tên đăng nhập đã được sử dụng', status: 'error' },
          { status: 409 }
        );
      }

      // Nếu là lỗi từ backend
      if (updateError instanceof Error && 'response' in updateError) {
        const axiosError = updateError as any;
        if (axiosError.response) {
          console.error('Lỗi từ backend:', {
            status: axiosError.response.status,
            data: axiosError.response.data
          });
          return NextResponse.json(
            { 
              message: axiosError.response.data?.message || 'Lỗi từ backend',
              status: 'error',
              details: axiosError.response.data
            },
            { status: axiosError.response.status }
          );
        }
      }
      
      throw updateError; // Ném lỗi để xử lý ở catch bên ngoài
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    
    // Lấy thông tin chi tiết về lỗi
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('Chi tiết lỗi:', errorMessage);
    console.error('Stack trace:', errorStack);
    
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi cập nhật thông tin người dùng', details: errorMessage, status: 'error' },
      { status: 500 }
    );
  }
}

// API endpoint để xóa người dùng
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      console.error('Xác thực token thất bại:', authResult.error);
      return NextResponse.json(
        { message: 'Không có quyền truy cập hoặc phiên làm việc đã hết hạn', error: authResult.error },
        { status: 401 }
      );
    }
    
    const userId = params.id;
    console.log(`Đang xóa người dùng với ID: ${userId}`);
    
    // Kiểm tra ID hợp lệ
    if (!userId) {
      console.error('ID người dùng không hợp lệ');
      return NextResponse.json(
        { message: 'ID người dùng không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Gọi hàm API để xóa người dùng
    const result = await deleteUser(userId);
    
    if (!result) {
      console.error(`Không tìm thấy người dùng với ID ${userId} để xóa`);
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng để xóa' },
        { status: 404 }
      );
    }
    
    console.log(`Xóa người dùng ID ${userId} thành công`);
    return NextResponse.json({
      message: 'Xóa người dùng thành công',
      status: 'success'
    });
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi xóa người dùng', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 