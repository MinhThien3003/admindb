import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// API endpoint thực
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

// Xử lý GET request để lấy danh sách task của tác giả
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
    
    // Lấy authorId từ query string nếu có
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    
    // Xây dựng URL API với authorId (nếu có)
    let apiUrl = `${API_ENDPOINT}/tasks/authors`;
    if (authorId) {
      apiUrl += `?authorId=${authorId}`;
      console.log(`Đang lấy nhiệm vụ cho tác giả ID: ${authorId}`);
    } else {
      console.log('Đang lấy tất cả nhiệm vụ tác giả');
    }
    
    // Gọi API thực
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Không thể kết nối đến API');
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhiệm vụ tác giả:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy danh sách nhiệm vụ tác giả' },
      { status: 500 }
    );
  }
}

// Xử lý POST request để tạo task mới cho tác giả
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
    if (!data.title || !data.description || !data.authorId || !data.authorName || !data.reward) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Gọi API thực
    const response = await fetch(`${API_ENDPOINT}/tasks/authors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Không thể kết nối đến API');
    }
    
    const result = await response.json();
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo nhiệm vụ tác giả mới:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi tạo nhiệm vụ tác giả mới' },
      { status: 500 }
    );
  }
}

// Xử lý PUT request để cập nhật trạng thái nhiệm vụ
export async function PUT(request: NextRequest) {
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
    if (!data.id || !data.status) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Gọi API thực
    const response = await fetch(`${API_ENDPOINT}/tasks/authors/${data.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Không thể kết nối đến API');
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái nhiệm vụ:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi cập nhật trạng thái nhiệm vụ' },
      { status: 500 }
    );
  }
} 