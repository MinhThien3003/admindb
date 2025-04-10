import { NextResponse } from 'next/server';
import config from '@/lib/config';

// API endpoint để lấy danh sách chapters (có thể filter theo novelId)
export async function GET(request: Request) {
  try {
    // Lấy các tham số từ URL
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novelId');
    
    // Lấy URL từ config và thêm tham số nếu có
    let apiUrl = `${config.api.baseUrl}${config.api.endpoints.chapters}`;
    
    // Nếu có novelId, thêm vào URL để lọc theo truyện
    if (novelId) {
      apiUrl += `?idNovel=${novelId}`;
      console.log('Đang lấy danh sách chapters của truyện có ID:', novelId);
    } else {
      console.log('Đang lấy tất cả các chapters');
    }
    
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
        console.error('Lỗi khi gọi API chapters:', errorText, 'Status:', response.status);
        
        // Trả về dữ liệu mẫu nếu API lỗi (chỉ dùng cho môi trường dev)
        const mockChapters = novelId ? getMockChaptersForNovel(novelId) : getMockChapters();
        console.log('Sử dụng dữ liệu mẫu:', mockChapters.length, 'chương');
        return NextResponse.json(mockChapters);
      }
      
      // Lấy dữ liệu từ response
      const responseData = await response.json();
      console.log('Response structure:', JSON.stringify(responseData).substring(0, 200) + '...');
      
      // Kiểm tra cấu trúc dữ liệu và trích xuất mảng chapters
      let chapters = [];
      
      if (Array.isArray(responseData)) {
        chapters = responseData;
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        chapters = responseData.data;
      } else {
        console.error('Dữ liệu không đúng định dạng:', responseData);
        // Trả về dữ liệu mẫu nếu API trả về format không đúng (chỉ dùng cho môi trường dev) 
        const mockChapters = novelId ? getMockChaptersForNovel(novelId) : getMockChapters();
        console.log('Sử dụng dữ liệu mẫu:', mockChapters.length, 'chương');
        return NextResponse.json(mockChapters);
      }
      
      console.log('Tổng số chapters nhận được:', chapters.length);
      
      // Trả về kết quả
      return NextResponse.json(chapters);
      
    } catch (error) {
      console.error('Lỗi khi gọi API chapters:', error);
      
      // Trả về dữ liệu mẫu nếu có lỗi kết nối (chỉ dùng cho môi trường dev)
      const mockChapters = novelId ? getMockChaptersForNovel(novelId) : getMockChapters();
      console.log('Sử dụng dữ liệu mẫu:', mockChapters.length, 'chương');
      return NextResponse.json(mockChapters);
    }
    
  } catch (error) {
    console.error('Lỗi khi xử lý API chapters:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// API endpoint để tạo chapter mới
export async function POST(request: Request) {
  try {
    // Dữ liệu mẫu trả về khi tạo chương mới (chỉ dùng cho môi trường dev)
    return NextResponse.json({
      _id: `mockchapter_${Date.now()}`,
      title: 'Chương mới',
      order: 1,
      role: 'normal',
      price: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Lỗi khi xử lý API tạo chương mới:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Dữ liệu mẫu cho danh sách tất cả các chương
function getMockChapters() {
  return [
    {
      _id: 'mockchapter1',
      idNovel: 'mocknovel1',
      title: 'Chương 1: Khởi đầu',
      order: 1,
      role: 'normal',
      price: 0,
      view: 152,
      createdAt: '2023-10-15T08:30:00Z',
      updatedAt: '2023-10-15T08:30:00Z'
    },
    {
      _id: 'mockchapter2',
      idNovel: 'mocknovel1',
      title: 'Chương 2: Cuộc phiêu lưu',
      order: 2,
      role: 'normal',
      price: 0,
      view: 130,
      createdAt: '2023-10-17T10:15:00Z',
      updatedAt: '2023-10-17T10:15:00Z'
    },
    {
      _id: 'mockchapter3',
      idNovel: 'mocknovel2',
      title: 'Chương 1: Bí mật',
      order: 1,
      role: 'normal',
      price: 0,
      view: 85,
      createdAt: '2023-10-20T14:45:00Z',
      updatedAt: '2023-10-20T14:45:00Z'
    }
  ];
}

// Dữ liệu mẫu cho một tiểu thuyết cụ thể
function getMockChaptersForNovel(novelId: string) {
  if (novelId === 'mocknovel1') {
    return [
      {
        _id: 'mockchapter1',
        idNovel: 'mocknovel1',
        title: 'Chương 1: Khởi đầu',
        order: 1,
        role: 'normal',
        price: 0,
        view: 152,
        createdAt: '2023-10-15T08:30:00Z',
        updatedAt: '2023-10-15T08:30:00Z'
      },
      {
        _id: 'mockchapter2',
        idNovel: 'mocknovel1',
        title: 'Chương 2: Cuộc phiêu lưu',
        order: 2,
        role: 'normal',
        price: 0,
        view: 130,
        createdAt: '2023-10-17T10:15:00Z',
        updatedAt: '2023-10-17T10:15:00Z'
      }
    ];
  } else {
    // Tạo dữ liệu mẫu cho ID novel bất kỳ
    return [
      {
        _id: `mockchapter_${novelId}_1`,
        idNovel: novelId,
        title: 'Chương 1: Khởi đầu',
        order: 1,
        role: 'normal',
        price: 0,
        view: 100,
        createdAt: '2023-11-01T09:00:00Z',
        updatedAt: '2023-11-01T09:00:00Z'
      },
      {
        _id: `mockchapter_${novelId}_2`,
        idNovel: novelId,
        title: 'Chương 2: Phát triển',
        order: 2,
        role: 'vip',
        price: 2000,
        view: 50,
        createdAt: '2023-11-05T11:30:00Z',
        updatedAt: '2023-11-05T11:30:00Z'
      }
    ];
  }
} 