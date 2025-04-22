import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';
import { verifyAuth } from '@/lib/auth';

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
    
    const categoryId = params.id;
    console.log(`Đang cập nhật thông tin thể loại với ID: ${categoryId}`);
    
    // Kiểm tra ID hợp lệ
    if (!categoryId) {
      console.error('ID thể loại không hợp lệ');
      return NextResponse.json(
        { message: 'ID thể loại không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Đọc dữ liệu từ request
    let requestData;
    try {
      requestData = await request.json();
      console.log('Dữ liệu cập nhật:', requestData);
      
      if (!requestData.titleCategory) {
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
    
    // Gọi API để cập nhật thông tin thể loại
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.categories}/${categoryId}`;
    console.log('Gọi API tại URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || `Bearer ${authResult.token}`
      },
      body: JSON.stringify(requestData)
    });
    
    // Kiểm tra kết quả từ API
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi khi cập nhật thể loại (${response.status}):`, errorText);
      
      // Xử lý các lỗi cụ thể
      if (response.status === 409) {
        return NextResponse.json(
          { message: 'Tên thể loại đã tồn tại' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { message: `Không thể cập nhật thể loại: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Trả về kết quả
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Lỗi khi xử lý cập nhật thể loại:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi xử lý yêu cầu', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: 'Không có quyền truy cập hoặc phiên làm việc đã hết hạn', error: authResult.error },
        { status: 401 }
      );
    }
    
    const categoryId = params.id;
    console.log(`Đang xóa thể loại với ID: ${categoryId}`);
    
    // Gọi API để xóa thể loại
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.categories}/${categoryId}`;
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || `Bearer ${authResult.token}`
      }
    });
    
    // Kiểm tra kết quả từ API
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi khi xóa thể loại (${response.status}):`, errorText);
      
      if (response.status === 409) {
        return NextResponse.json(
          { message: 'Không thể xóa thể loại đang được sử dụng bởi truyện' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { message: `Không thể xóa thể loại: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Trả về kết quả
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Lỗi khi xử lý xóa thể loại:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi xử lý yêu cầu', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 