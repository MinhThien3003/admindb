import { NextResponse } from 'next/server';
import config from '@/lib/config';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const apiUrl = `${config.api.baseUrl}/authorRegisters/admin/${id}/approve`;
    
    console.log('Gọi API phê duyệt yêu cầu từ URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lỗi khi phê duyệt yêu cầu:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { error: `Không thể phê duyệt yêu cầu. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Kết quả phê duyệt:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi xử lý phê duyệt yêu cầu:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 