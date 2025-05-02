import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import config from '@/lib/config';

// API endpoint thực
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

// Xử lý GET request để lấy danh sách task
export async function GET(request: NextRequest) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
    // Lấy URL API từ config nếu có, hoặc sử dụng giá trị mặc định
    const apiUrl = config?.api?.baseUrl 
      ? `${config.api.baseUrl}${config.api.endpoints?.tasks || '/tasks'}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}/tasks`;
    
    console.log('Gọi API tasks từ URL:', apiUrl);
    
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
      console.error('Lỗi khi gọi API tasks:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { error: `Không thể lấy danh sách nhiệm vụ. Status: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Lấy dữ liệu từ response
    const responseData = await response.json();
    console.log('Response structure:', JSON.stringify(responseData).substring(0, 200) + '...');
    
    // Kiểm tra cấu trúc dữ liệu và trích xuất mảng tasks
    let tasks = [];
    if (Array.isArray(responseData)) {
      tasks = responseData;
    } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
      tasks = responseData.data;
    } else if (responseData && typeof responseData === 'object') {
      // Tìm trường chứa mảng dữ liệu
      const possibleArrayFields = Object.keys(responseData).filter(key => 
        Array.isArray(responseData[key])
      );
      
      if (possibleArrayFields.length > 0) {
        // Lấy mảng đầu tiên tìm thấy
        tasks = responseData[possibleArrayFields[0]];
      } else {
        console.error('Không tìm thấy mảng dữ liệu trong response:', responseData);
        throw new Error('Cấu trúc dữ liệu không đúng định dạng');
      }
    } else {
      console.error('Response không đúng định dạng:', responseData);
      throw new Error('Dữ liệu không đúng định dạng');
    }
    
    console.log('Tổng số nhiệm vụ nhận được:', tasks.length);
    
    // Trả về kết quả trong định dạng tương thích với frontend
    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error('Lỗi khi xử lý API tasks:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy danh sách nhiệm vụ', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Xử lý POST request để tạo task mới
export async function POST(request: NextRequest) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
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
      ? `${config.api.baseUrl}${config.api.endpoints?.tasks || '/tasks'}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}/tasks`;
    
    // Gọi API thực
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi khi tạo nhiệm vụ mới (${response.status}):`, errorText);
      return NextResponse.json(
        { message: `Không thể tạo nhiệm vụ mới: ${response.status}` },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo công việc mới:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi tạo công việc mới' },
      { status: 500 }
    );
  }
} 