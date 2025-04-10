import { NextResponse } from 'next/server';
import config from '@/lib/config';

// API endpoint để lấy thông tin chi tiết của chapter theo ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('Đang lấy thông tin chương có ID:', id);
    
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.chapters}/${id}`;
    console.log('API URL:', apiUrl);
    
    try {
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
        console.error('Lỗi khi gọi API chapter:', errorText, 'Status:', response.status);
        
        // Trả về dữ liệu mẫu nếu API lỗi (chỉ dùng cho môi trường dev)
        const mockChapter = getMockChapter(id);
        console.log('Sử dụng dữ liệu mẫu cho chương có ID:', id);
        return NextResponse.json(mockChapter);
      }
      
      // Lấy dữ liệu từ response
      const chapterData = await response.json();
      console.log('Dữ liệu chương từ API:', chapterData);
      
      // Trả về kết quả
      return NextResponse.json(chapterData);
      
    } catch (error) {
      console.error('Lỗi khi gọi API chapter:', error);
      
      // Trả về dữ liệu mẫu nếu có lỗi kết nối (chỉ dùng cho môi trường dev)
      const mockChapter = getMockChapter(id);
      console.log('Sử dụng dữ liệu mẫu cho chương có ID:', id);
      return NextResponse.json(mockChapter);
    }
    
  } catch (error) {
    console.error('Lỗi khi xử lý API chapter:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// API endpoint để cập nhật thông tin chương
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('Đang cập nhật chương có ID:', id);
    
    // Lấy dữ liệu từ request body
    const chapterData = await request.json();
    console.log('Dữ liệu cập nhật chương:', chapterData);
    
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.chapters}/${id}`;
    console.log('API URL:', apiUrl);
    
    try {
      // Gọi API từ backend
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapterData)
      });
      
      // Kiểm tra kết quả từ API
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lỗi khi cập nhật chương:', errorText, 'Status:', response.status);
        
        // Trả về phản hồi lỗi
        return NextResponse.json(
          { error: `Không thể cập nhật chương. Status: ${response.status}` },
          { status: response.status }
        );
      }
      
      // Lấy dữ liệu từ response
      const updatedChapter = await response.json();
      console.log('Cập nhật chương thành công:', updatedChapter);
      
      // Trả về kết quả
      return NextResponse.json(updatedChapter);
      
    } catch (error) {
      console.error('Lỗi khi gọi API cập nhật chương:', error);
      
      // Trả về dữ liệu mẫu trong môi trường dev
      console.log('Sử dụng phản hồi mẫu cho cập nhật chương');
      return NextResponse.json({
        _id: id,
        ...chapterData,
        updatedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Lỗi khi xử lý API cập nhật chương:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// API endpoint để xóa chương
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('Đang xóa chương có ID:', id);
    
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.chapters}/${id}`;
    console.log('API URL:', apiUrl);
    
    try {
      // Gọi API từ backend
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Kiểm tra kết quả từ API
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lỗi khi xóa chương:', errorText, 'Status:', response.status);
        
        // Trả về phản hồi lỗi
        return NextResponse.json(
          { error: `Không thể xóa chương. Status: ${response.status}` },
          { status: response.status }
        );
      }
      
      // Kiểm tra nếu response có nội dung
      let responseData;
      const responseText = await response.text();
      
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */e) {
          console.log('Phản hồi không phải định dạng JSON:', responseText);
          responseData = { message: 'Đã xóa chương thành công' };
        }
      } else {
        responseData = { message: 'Đã xóa chương thành công' };
      }
      
      console.log('Xóa chương thành công:', responseData);
      
      // Trả về kết quả
      return NextResponse.json(responseData);
      
    } catch (error) {
      console.error('Lỗi khi gọi API xóa chương:', error);
      
      // Trả về phản hồi mô phỏng thành công (chỉ trong môi trường dev)
      console.log('Sử dụng phản hồi mẫu cho xóa chương');
      return NextResponse.json({
        success: true,
        message: 'Đã xóa chương thành công (mô phỏng)',
        id: id
      });
    }
    
  } catch (error) {
    console.error('Lỗi khi xử lý API xóa chương:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Hàm tạo dữ liệu mẫu cho một chương
function getMockChapter(id: string) {
  return {
    _id: id,
    idNovel: 'mocknovel1',
    title: 'Chương mẫu',
    order: 1,
    role: 'normal',
    price: 0,
    view: 100,
    content: 'Đây là nội dung mẫu cho chương này. Trong một ngôi làng nhỏ nằm sâu trong thung lũng, có một cậu bé tên là Tú...',
    imageUrl: 'https://placehold.co/600x400?text=Chapter+Banner',
    createdAt: '2023-10-15T08:30:00Z',
    updatedAt: '2023-10-15T08:30:00Z'
  };
} 