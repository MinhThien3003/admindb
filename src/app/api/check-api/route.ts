import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '/admins/login';
  const method = searchParams.get('method') || 'GET';
  
  try {
    // URL API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const fullUrl = `${apiUrl}${endpoint}`;
    
    console.log(`Kiểm tra API: ${fullUrl} với method ${method}`);
    
    // Tạo options cho fetch request
    const fetchOptions: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Thêm body nếu là POST request
    if (method === 'POST') {
      // Dữ liệu mẫu cho POST request (có thể điều chỉnh qua query params)
      const testUsername = searchParams.get('username') || 'admin';
      const testPassword = searchParams.get('password') || 'admin123';
      
      fetchOptions.body = JSON.stringify({
        username: testUsername,
        password: testPassword
      });
    }
    
    // Gửi request
    const response = await fetch(fullUrl, fetchOptions);
    
    // Đọc response dưới dạng text
    const responseText = await response.text();
    
    try {
      // Thử parse JSON
      const data = JSON.parse(responseText);
      
      return NextResponse.json({
        url: fullUrl,
        method: method,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });
    } catch (e) {
      // Trả về text nếu không parse được JSON
      return NextResponse.json({
        url: fullUrl,
        method: method,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        text: responseText
      });
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra API:", error);
    return NextResponse.json({
      error: (error as Error).message,
    }, { status: 500 });
  }
} 