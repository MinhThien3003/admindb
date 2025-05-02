import { NextResponse } from 'next/server';
import config from '@/lib/config';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file ảnh' },
        { status: 400 }
      );
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Kích thước ảnh không được vượt quá 5MB' },
        { status: 413 }
      );
    }

    // Kiểm tra định dạng file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF hoặc WebP' },
        { status: 400 }
      );
    }

    // Gọi API backend để upload ảnh
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    const response = await fetch(`${config.api.baseUrl}/upload`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Không thể tải lên ảnh' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi xử lý upload ảnh:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
} 