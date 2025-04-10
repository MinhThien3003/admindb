import { NextResponse } from 'next/server';
import config from '@/lib/config';

export async function GET() {
  try {
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.users}`;
    
    console.log('Gọi API từ URL:', apiUrl);
    
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
        { error: `Không thể lấy danh sách người dùng. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const users = await response.json();
    console.log('Tổng số người dùng nhận được:', users.length);
    
    // Lọc chỉ lấy users có role là "reader"
    const readerUsers = users.filter((user: any) => user.role === 'reader');
    console.log('Số lượng độc giả (reader):', readerUsers.length);
    
    // Trả về kết quả
    return NextResponse.json(readerUsers);
  } catch (error) {
    console.error('Lỗi khi xử lý API users:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 