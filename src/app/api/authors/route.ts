import { NextResponse } from 'next/server';
import config from '@/lib/config';

export async function GET() {
  try {
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.users}`;
    
    console.log('Gọi API authors từ URL:', apiUrl);
    
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
      console.error('Lỗi khi gọi API users:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { error: `Không thể lấy danh sách tác giả. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const users = await response.json();
    console.log('Tổng số người dùng nhận được:', users.length);
    
    // Lọc chỉ lấy users có role là "author"
    const authorUsers = users.filter((user: any) => user.role === 'author');
    console.log('Số lượng tác giả (author):', authorUsers.length);
    
    // Trả về kết quả
    return NextResponse.json(authorUsers);
  } catch (error) {
    console.error('Lỗi khi xử lý API authors:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 