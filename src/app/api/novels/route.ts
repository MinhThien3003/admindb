import { NextResponse } from 'next/server';
import config from '@/lib/config';

// Thêm GET method để kiểm tra cấu trúc dữ liệu
export async function GET() {
  try {
    const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.novels}`);
    const data = await response.json();
    console.log('Cấu trúc dữ liệu novels:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách novels:', error);
    return NextResponse.json({ error: 'Không thể lấy danh sách novels' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Log request headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Request headers:', headers);

    // Lấy và log raw body
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Parse JSON
    let requestData;
    try {
      requestData = JSON.parse(rawBody);
      console.log('Parsed request data:', requestData);
    } catch (error) {
      console.error('Lỗi khi parse JSON:', error);
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ - không thể parse JSON' },
        { status: 400 }
      );
    }
    
    // Validate cấu trúc dữ liệu
    if (!requestData.data) {
      console.error('Thiếu trường data trong request:', requestData);
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ - thiếu trường data' },
        { status: 400 }
      );
    }

    const { title, description, status, imageUrl, idCategories } = requestData.data;
    console.log('Extracted fields:', { title, description, status, imageUrl, idCategories });

    // Validate các trường bắt buộc
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Tiêu đề không được để trống' },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Mô tả không được để trống' },
        { status: 400 }
      );
    }

    if (!Array.isArray(idCategories) || idCategories.length === 0) {
      console.error('Lỗi validate categories:', { idCategories, isArray: Array.isArray(idCategories) });
      return NextResponse.json(
        { error: 'Vui lòng chọn ít nhất một thể loại' },
        { status: 400 }
      );
    }

    if (status && !['ongoing', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    // Log dữ liệu gửi tới backend
    console.log('URL backend:', `${config.api.baseUrl}${config.api.endpoints.novels}`);
    console.log('Dữ liệu gửi tới backend:', requestData);
    
    // Gọi API backend
    const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.novels}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Lấy response dưới dạng text và log
    const responseText = await response.text();
    console.log('Raw response từ backend:', responseText);

    // Parse JSON response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed response data:', responseData);
    } catch (error) {
      console.error('Không thể parse response thành JSON:', error);
      return NextResponse.json(
        { error: 'Server trả về dữ liệu không hợp lệ' },
        { status: 500 }
      );
    }

    // Kiểm tra kết quả từ API
    if (!response.ok) {
      console.error('Lỗi từ backend:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      return NextResponse.json(
        { 
          error: responseData.error || 
            (responseData.data && responseData.data.message) || 
            `Không thể tạo tiểu thuyết. Status: ${response.status}`,
          details: responseData
        },
        { status: response.status }
      );
    }
    
    // Trả về kết quả thành công
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Lỗi khi xử lý tạo tiểu thuyết:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 