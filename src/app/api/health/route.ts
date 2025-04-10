import { NextResponse } from 'next/server';
import config from '@/lib/config';

export async function GET() {
  try {
    // URL API backend
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Gọi API health check
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      // Backend khả dụng
      return NextResponse.json({
        success: true,
        message: "Kết nối đến backend thành công",
        backend: `${apiUrl}/health`,
        status: response.status,
      });
    }
    
    // Backend trả về lỗi
    return NextResponse.json({
      success: false,
      message: "Backend khả dụng nhưng trả về lỗi",
      backend: `${apiUrl}/health`,
      status: response.status,
    }, { status: response.status });
    
  } catch (error) {
    console.error("Lỗi kết nối đến backend:", error);
    return NextResponse.json({
      success: false,
      message: "Không thể kết nối đến backend API",
      error: (error as Error).message,
    }, { status: 500 });
  }
} 