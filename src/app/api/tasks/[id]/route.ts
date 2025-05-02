import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import config from '@/lib/config';

// Xử lý PUT request để cập nhật task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
    // Lấy ID từ params
    const taskId = params.id;
    
    // Lấy dữ liệu từ body
    const data = await request.json();
    
    // Validate dữ liệu
    if (!data.taskName || !data.order || !data.expPoint) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Lấy URL API từ config nếu có, hoặc sử dụng giá trị mặc định
    const apiUrl = config?.api?.baseUrl 
      ? `${config.api.baseUrl}${config.api.endpoints?.tasks || '/tasks'}/${taskId}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}/tasks/${taskId}`;

    console.log(`Gọi API cập nhật nhiệm vụ từ URL: ${apiUrl}`);
    
    // Gọi API thực
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi khi cập nhật nhiệm vụ (${response.status}):`, errorText);
      return NextResponse.json(
        { message: `Không thể cập nhật nhiệm vụ: ${response.status}` },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi khi cập nhật nhiệm vụ:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi cập nhật nhiệm vụ', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Xử lý DELETE request để xóa task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
    // Lấy ID từ params
    const taskId = params.id;
    
    // Lấy URL API từ config nếu có, hoặc sử dụng giá trị mặc định
    const apiUrl = config?.api?.baseUrl 
      ? `${config.api.baseUrl}${config.api.endpoints?.tasks || '/tasks'}/${taskId}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}/tasks/${taskId}`;

    console.log(`Gọi API xóa nhiệm vụ từ URL: ${apiUrl}`);
    
    // Gọi API thực
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi khi xóa nhiệm vụ (${response.status}):`, errorText);
      return NextResponse.json(
        { message: `Không thể xóa nhiệm vụ: ${response.status}` },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi khi xóa nhiệm vụ:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi xóa nhiệm vụ', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Xử lý GET request để lấy chi tiết một task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
    // Lấy ID từ params
    const taskId = params.id;
    
    // Lấy URL API từ config nếu có, hoặc sử dụng giá trị mặc định
    const apiUrl = config?.api?.baseUrl 
      ? `${config.api.baseUrl}${config.api.endpoints?.tasks || '/tasks'}/${taskId}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}/tasks/${taskId}`;

    console.log(`Gọi API chi tiết nhiệm vụ từ URL: ${apiUrl}`);
    
    // Gọi API thực
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi khi lấy chi tiết nhiệm vụ (${response.status}):`, errorText);
      return NextResponse.json(
        { message: `Không thể lấy chi tiết nhiệm vụ: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nhiệm vụ:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy chi tiết nhiệm vụ', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 