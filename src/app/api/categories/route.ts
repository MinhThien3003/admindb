import { NextResponse } from 'next/server';
import config from '@/lib/config';

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