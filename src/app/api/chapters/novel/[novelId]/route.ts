import { NextResponse } from 'next/server';
import config from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    
    if (!novelId) {
      return NextResponse.json(
        { error: 'ID tiểu thuyết không hợp lệ' },
        { status: 400 }
      );
    }
    
    console.log('Đang lấy danh sách chương của tiểu thuyết với ID:', novelId);
    
    // Lấy URL từ config và tạo endpoint
    const apiUrl = `${config.api.baseUrl}/chapters/novel/${novelId}`;
    
    console.log('Chapters API URL:', apiUrl);
    
    // Gọi API từ backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    // Kiểm tra kết quả từ API
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lỗi khi gọi API chapters:', errorText);
      console.error('Status:', response.status);
      console.error('API URL:', apiUrl);
      return NextResponse.json(
        { error: `Không thể lấy danh sách chương. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const responseData = await response.json();
    console.log('Chapters API Response:', responseData);
    
    // Kiểm tra và xử lý dữ liệu
    let chaptersData = responseData;
    
    // Nhiều API trả về dạng { success: true, data: {...} }
    if (responseData && responseData.data) {
      chaptersData = responseData.data;
    }
    
    // Trả về kết quả
    return NextResponse.json(chaptersData);
  } catch (error) {
    console.error('Lỗi khi xử lý API chapters:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 