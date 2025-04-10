import { NextResponse } from 'next/server';
import config from '@/lib/config';

// API endpoint để lấy thông tin chi tiết của novel theo ID với populate categories
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const novelId = params.id;
    
    if (!novelId) {
      return NextResponse.json(
        { error: 'ID novel không hợp lệ' },
        { status: 400 }
      );
    }
    
    console.log('Đang lấy thông tin chi tiết của novel với ID:', novelId);
    
    // Lấy URL từ config - thêm param populate=idCategories để server populate dữ liệu
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.novels}/${novelId}?populate=idCategories`;
    
    console.log('Novel API URL:', apiUrl);
    
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
      console.error('Lỗi khi gọi API novel:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { error: `Không thể lấy thông tin novel. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const responseData = await response.json();
    console.log('Novel API Response Structure:', JSON.stringify(responseData).substring(0, 200) + '...');
    
    // Kiểm tra cấu trúc dữ liệu
    let novelData = responseData;
    
    // Nhiều API trả về dạng { success: true, data: {...} }
    if (responseData && responseData.data) {
      novelData = responseData.data;
    }
    
    // Ghi log chi tiết về dữ liệu categories
    if (novelData && novelData.idCategories) {
      console.log('Novel Categories Data:', JSON.stringify(novelData.idCategories));
    } else {
      console.log('Novel không có dữ liệu categories hoặc chưa được populate');
    }
    
    // Trả về kết quả
    return NextResponse.json(novelData);
  } catch (error) {
    console.error('Lỗi khi xử lý API novel:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 