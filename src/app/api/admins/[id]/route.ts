import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import config from '@/lib/config';

// GET /api/admins/:id - Lấy thông tin chi tiết một admin
export async function GET(
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

    const { id } = params;
    console.log('Fetching admin detail with ID:', id);

    const response = await axios.get(
      `${config.api.baseUrl}${config.api.endpoints.admins}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching admin detail:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 