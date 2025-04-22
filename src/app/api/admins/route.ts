import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import config from '@/lib/config';

// GET /api/admins - Lấy danh sách admins
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(config.auth.tokenCookieName)?.value;

    console.log('[API] GET /api/admins - Token:', token ? `${token.substring(0, 10)}...` : 'không có');

    if (!token) {
      console.log('[API] GET /api/admins - Unauthorized, không có token');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API] Gọi API backend để lấy danh sách admins');
    console.log('[API] URL:', `${config.api.baseUrl}${config.api.endpoints.admins}`);

    const response = await axios.get(
      `${config.api.baseUrl}${config.api.endpoints.admins}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('[API] Kết quả từ backend:', response.status);
    console.log('[API] Dữ liệu từ backend:', response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[API] Lỗi khi lấy danh sách admin:', error.message);
    if (error.response) {
      console.error('[API] Response từ server:', error.response.status, error.response.data);
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admins/:id - Cập nhật thông tin admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get(config.auth.tokenCookieName)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = params;

    const response = await axios.put(
      `${config.api.baseUrl}${config.api.endpoints.admins}/${id}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 