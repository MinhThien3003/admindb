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
    const { id } = params;
    
    console.log('=== Admin Detail API ===');
    console.log('Fetching admin detail with ID:', id);
    console.log('Token exists:', !!token);
    console.log('Config:', {
      baseUrl: config.api.baseUrl,
      endpoint: config.api.endpoints.admins
    });

    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Log truncated token
    console.log('Using token:', token.substring(0, 15) + '...');
    
    // Construct URL
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.admins}/${id}`;
    console.log('Calling backend API at URL:', apiUrl);

    // Call backend API
    try {
      const response = await axios.get(
        apiUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Log response
      console.log('Backend API responded with status:', response.status);
      console.log('Response data structure:', {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data ? 'exists' : 'undefined'
      });

      // Return response
      return NextResponse.json(response.data);
    } catch (apiError) {
      // Xử lý lỗi cụ thể từ API backend
      if (axios.isAxiosError(apiError)) {
        console.error('API call error:', {
          status: apiError.response?.status,
          data: apiError.response?.data
        });
        
        // Xử lý lỗi 401 - Unauthorized
        if (apiError.response?.status === 401) {
          return NextResponse.json(
            { 
              success: false, 
              message: apiError.response.data?.message || 'Phiên đăng nhập hết hạn hoặc không hợp lệ'
            },
            { status: 401 }
          );
        }
        
        // Nếu có response từ API nhưng bị lỗi
        if (apiError.response) {
          return NextResponse.json(
            apiError.response.data || { success: false, message: `Backend API error (${apiError.response.status})` },
            { status: apiError.response.status }
          );
        }
        
        // Lỗi request (không có response)
        if (apiError.request) {
          console.error('No response received from backend');
          return NextResponse.json(
            { success: false, message: 'Backend service unavailable' },
            { status: 503 }
          );
        }
      }
      
      // Ném lỗi để xử lý ở catch bên ngoài
      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching admin detail:');
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Return appropriate error response based on status
      if (error.response?.status === 401) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized - Backend rejected token' },
          { status: 401 }
        );
      } else if (error.response?.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Admin not found' },
          { status: 404 }
        );
      } else if (error.response) {
        // Return error from backend if available
        return NextResponse.json(
          { success: false, message: error.response.data?.message || 'Backend API error' },
          { status: error.response.status }
        );
      }
    }
    
    // Generic error
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
    const { id } = params;
    
    console.log('=== Update Admin API ===');
    console.log('Updating admin with ID:', id);
    console.log('Token exists:', !!token);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    console.log('Update data received:', data);
    
    // Construct URL
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.admins}/${id}`;
    console.log('Calling backend API at URL:', apiUrl);
    
    // Call backend API
    const response = await axios.put(
      apiUrl,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Log response
    console.log('Backend API responded with status:', response.status);
    console.log('Response data:', response.data);
    
    // Return response
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating admin:');
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response) {
        // Return error from backend if available
        return NextResponse.json(
          { 
            success: false, 
            message: error.response.data?.message || 'Backend API error',
            error: error.response.data
          },
          { status: error.response.status }
        );
      }
    }
    
    // Generic error
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 