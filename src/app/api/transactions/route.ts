import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import config from '@/lib/config';

// Xử lý GET request để lấy danh sách giao dịch
export async function GET(request: NextRequest) {
  try {
    // Xác thực token
    console.log('Bắt đầu xử lý GET /api/transactions...');
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      console.log('Xác thực token thất bại:', authResult.error);
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    console.log('Xác thực token thành công, token:', authResult.token?.substring(0, 10) + '...');
    
    // Lấy URL API từ config nếu có, hoặc sử dụng giá trị mặc định
    const apiUrl = config?.api?.baseUrl 
      ? `${config.api.baseUrl}${config.api.endpoints?.transactions || '/transactions'}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}/transactions`;
    
    console.log('Gọi API transactions từ URL:', apiUrl);
    
    // Log headers
    console.log('Headers được sử dụng:', {
      Authorization: `Bearer ${authResult.token?.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    });
    
    // Gọi API thực
    let response;
    try {
      response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${authResult.token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      console.log('Đã nhận phản hồi từ API:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
    } catch (fetchError) {
      console.error('Lỗi kết nối đến API:', fetchError);
      throw new Error(`Không thể kết nối đến API: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    }
    
    // Đọc phản hồi dạng text trước
    let responseText;
    try {
      responseText = await response.text();
      console.log('Phản hồi dạng text:', responseText.substring(0, 200) + '...');
    } catch (textError) {
      console.error('Không thể đọc phản hồi dạng text:', textError);
      throw new Error('Không thể đọc phản hồi từ API');
    }
    
    if (!response.ok) {
      console.error('Lỗi khi gọi API transactions:', responseText, 'Status:', response.status);
      return NextResponse.json(
        { error: `Không thể lấy danh sách giao dịch. Status: ${response.status}`, responseText },
        { status: response.status }
      );
    }
    
    // Lấy dữ liệu từ response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Response đã parse thành công:', {
        type: typeof responseData,
        isArray: Array.isArray(responseData),
        hasData: responseData?.data !== undefined,
        dataIsArray: Array.isArray(responseData?.data)
      });
    } catch (parseError) {
      console.error('Lỗi khi parse JSON:', parseError, 'Text:', responseText.substring(0, 200));
      return NextResponse.json(
        { error: 'Không thể parse phản hồi JSON', responseText: responseText.substring(0, 500) },
        { status: 500 }
      );
    }
    
    // Kiểm tra cấu trúc dữ liệu và trích xuất mảng transactions
    let transactions = [];
    if (Array.isArray(responseData)) {
      console.log('Phản hồi là trực tiếp mảng, độ dài:', responseData.length);
      transactions = responseData;
    } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
      console.log('Phản hồi có trường data là mảng, độ dài:', responseData.data.length);
      transactions = responseData.data;
    } else if (responseData && typeof responseData === 'object') {
      // Tìm trường chứa mảng dữ liệu
      const possibleArrayFields = Object.keys(responseData).filter(key => 
        Array.isArray(responseData[key])
      );
      
      console.log('Các trường có thể chứa mảng:', possibleArrayFields);
      
      if (possibleArrayFields.length > 0) {
        // Lấy mảng đầu tiên tìm thấy
        const arrayField = possibleArrayFields[0];
        transactions = responseData[arrayField];
        console.log(`Sử dụng mảng từ trường ${arrayField}, độ dài:`, transactions.length);
      } else {
        console.error('Không tìm thấy mảng dữ liệu trong response:', responseData);
        return NextResponse.json(
          { error: 'Cấu trúc dữ liệu không đúng định dạng', data: responseData },
          { status: 500 }
        );
      }
    } else {
      console.error('Response không đúng định dạng:', responseData);
      return NextResponse.json(
        { error: 'Dữ liệu không đúng định dạng', data: responseData },
        { status: 500 }
      );
    }
    
    console.log('Tổng số giao dịch nhận được:', transactions.length);
    if (transactions.length > 0) {
      console.log('Mẫu giao dịch đầu tiên:', JSON.stringify(transactions[0]));
    } else {
      console.log('Danh sách giao dịch rỗng');
    }
    
    // Trả về kết quả trong định dạng tương thích với frontend
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Lỗi khi xử lý API transactions:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy danh sách giao dịch', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 