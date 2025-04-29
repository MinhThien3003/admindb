import { NextResponse } from 'next/server';
import config from '@/lib/config';

export async function GET() {
  try {
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}/authorRegisters/admin`;
    
    console.log('Gọi API authorRegisters từ URL:', apiUrl);
    
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
      console.error('Lỗi khi gọi API authorRegisters:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { error: `Không thể lấy danh sách yêu cầu. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const data = await response.json();
    console.log('Dữ liệu nhận được:', data);
    
    // Trả về kết quả
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi xử lý API authorRegisters:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 