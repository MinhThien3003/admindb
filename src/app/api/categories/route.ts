import { NextResponse } from 'next/server';
import config from '@/lib/config';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.categories}`;
    
    console.log('Gọi API categories từ URL:', apiUrl);
    
    // Gọi API từ backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    // Kiểm tra kết quả từ API
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lỗi khi gọi API categories:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { error: `Không thể lấy danh sách thể loại. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const responseData = await response.json();
    console.log('Response structure:', JSON.stringify(responseData).substring(0, 200) + '...');
    
    // Kiểm tra cấu trúc dữ liệu và trích xuất mảng categories
    // Nhiều API trả về dạng { success: true, data: [...] }
    let categories = [];
    if (Array.isArray(responseData)) {
      categories = responseData;
    } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
      categories = responseData.data;
    } else if (responseData && typeof responseData === 'object') {
      // Tìm trường chứa mảng dữ liệu
      const possibleArrayFields = Object.keys(responseData).filter(key => 
        Array.isArray(responseData[key])
      );
      
      if (possibleArrayFields.length > 0) {
        // Lấy mảng đầu tiên tìm thấy
        categories = responseData[possibleArrayFields[0]];
      } else {
        console.error('Không tìm thấy mảng dữ liệu trong response:', responseData);
        throw new Error('Cấu trúc dữ liệu không đúng định dạng');
      }
    } else {
      console.error('Response không đúng định dạng:', responseData);
      throw new Error('Dữ liệu không đúng định dạng');
    }
    
    console.log('Tổng số thể loại nhận được:', categories.length);
    
    // Trả về kết quả
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Lỗi khi xử lý API categories:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

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
    
    // Đọc dữ liệu từ request
    let categoryData;
    try {
      categoryData = await request.json();
      console.log('Dữ liệu thể loại mới:', categoryData);
      
      // Kiểm tra dữ liệu bắt buộc
      if (!categoryData.titleCategory) {
        return NextResponse.json(
          { message: 'Tên thể loại không được để trống' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Lỗi khi parse dữ liệu JSON:', error);
      return NextResponse.json(
        { message: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Gọi API để tạo thể loại mới
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.categories}`;
    console.log('Gọi API tạo thể loại mới tại URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || `Bearer ${authResult.token}`
      },
      body: JSON.stringify(categoryData)
    });
    
    // Kiểm tra kết quả từ API
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi khi tạo thể loại mới (${response.status}):`, errorText);
      
      // Xử lý các lỗi cụ thể
      if (response.status === 409) {
        return NextResponse.json(
          { message: 'Tên thể loại đã tồn tại' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { message: `Không thể tạo thể loại mới: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Trả về kết quả
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Lỗi khi xử lý tạo thể loại mới:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi xử lý yêu cầu', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 