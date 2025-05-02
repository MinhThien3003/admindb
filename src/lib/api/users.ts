import config from '@/lib/config';

// Định nghĩa interface cho dữ liệu người dùng
interface UserData {
  fullname: string;
  username: string;
  password: string;
  email: string;
  gender: "Male" | "Female";
  role?: "reader" | "author";
  avatar?: string;
  status?: "active" | "inactive" | "banned";
  idReaderExp?: string | null;
  [key: string]: any; // Cho phép các trường bổ sung
}

// Định nghĩa interface cho dữ liệu cập nhật
interface UpdateData {
  fullname?: string;
  username?: string;
  password?: string;
  email?: string;
  gender?: "Male" | "Female";
  role?: "reader" | "author";
  avatar?: string;
  status?: "active" | "inactive" | "banned";
  idReaderExp?: string | null;
  [key: string]: any; // Cho phép các trường bổ sung
}

/**
 * Lấy danh sách tất cả người dùng
 * @returns Promise<any[]> Mảng các user
 */
export async function getAllUsers() {
  try {
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.users}`;
    console.log('Gọi API từ URL:', apiUrl);
    
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
      console.error('Lỗi khi gọi API users:', errorText, 'Status:', response.status);
      throw new Error(`Không thể lấy danh sách người dùng. Status: ${response.status}`);
    }

    // Lấy dữ liệu từ response
    const users = await response.json();
    console.log('Tổng số người dùng nhận được:', users.length);
    
    // Lọc chỉ lấy users có role là "reader"
    const readerUsers = users.filter((user: {role?: string}) => user.role === 'reader');
    console.log('Số lượng độc giả (reader):', readerUsers.length);
    
    return readerUsers;
  } catch (error) {
    console.error('Lỗi khi xử lý API users:', error);
    throw error;
  }
}

/**
 * Lấy thông tin của một người dùng theo ID
 * @param userId ID của người dùng
 * @returns Promise<any> Thông tin người dùng
 */
export async function getUserById(userId: string) {
  try {
    if (!userId) {
      throw new Error('ID người dùng không hợp lệ');
    }

    console.log(`Đang lấy thông tin người dùng với ID: ${userId}`);
    
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.users}/${userId}`;
    console.log('Gọi API từ URL:', apiUrl);
    
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
      console.error(`Lỗi khi lấy thông tin người dùng ID ${userId}:`, errorText, 'Status:', response.status);
      return null;
    }
    
    // Lấy dữ liệu từ response
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Lỗi khi xử lý API lấy thông tin người dùng:', error);
    throw error;
  }
}

/**
 * Tạo người dùng mới
 * @param userData Dữ liệu người dùng mới
 * @returns Promise<any> Thông tin người dùng đã tạo
 */
export async function createUser(userData: UserData) {
  try {
    if (!userData) {
      throw new Error('Dữ liệu người dùng không hợp lệ');
    }

    // Kiểm tra các trường bắt buộc
    if (!userData.username || !userData.email || !userData.fullname || !userData.password) {
      throw new Error('Thiếu thông tin bắt buộc (username, email, fullname, password)');
    }

    // Kiểm tra gender
    if (!userData.gender || !['Male', 'Female'].includes(userData.gender)) {
      throw new Error('Giới tính phải là "Male" hoặc "Female"');
    }

    // Lưu lại role ban đầu
    const originalRole = userData.role;
    const isAuthorRole = originalRole === 'author';

    // Đảm bảo role là "reader" nếu không phải author, và thêm idReaderExp nếu chưa có
    userData = {
      ...userData,
      role: isAuthorRole ? 'author' : 'reader', // Giữ nguyên role author nếu đã có
      idReaderExp: userData.idReaderExp || null // Thêm trường idReaderExp nếu chưa có
    };

    // Thêm log để debug role
    console.log('Role trước khi gửi API:', {
      originalRole,
      isAuthorRole,
      finalRole: userData.role
    });

    // Ghi log dữ liệu (loại bỏ avatar và password nếu quá dài để tránh spam log)
    const logData = { ...userData };
    if (logData.avatar && logData.avatar.length > 100) {
      logData.avatar = `[Base64 Avatar: ${logData.avatar.substring(0, 30)}... (${logData.avatar.length} chars)]`;
    }
    if (logData.password) {
      logData.password = '[HIDDEN]';
    }
    console.log('Dữ liệu người dùng mới:', JSON.stringify(logData, null, 2));
    
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.users}`;
    console.log('API URL:', apiUrl);
    
    // Lấy token xác thực từ localStorage hoặc cookie
    let token;
    try {
      // Kiểm tra xem đang chạy ở môi trường nào
      if (typeof window !== 'undefined') {
        // Browser environment - có thể sử dụng localStorage
        token = localStorage.getItem('admin_token');
        console.log('Lấy token từ localStorage:', token ? 'Tìm thấy token' : 'Không tìm thấy token');
      } else {
        // Server environment - không thể sử dụng localStorage
        console.log('Đang chạy ở môi trường server, không thể sử dụng localStorage');
        throw new Error('Không thể lấy token xác thực trong môi trường server');
      }
      
      if (!token) {
        console.error('Không tìm thấy token trong localStorage');
        throw new Error('Không có token xác thực, vui lòng đăng nhập lại');
      }
    } catch (error) {
      console.error('Lỗi khi truy cập localStorage:', error);
      throw new Error('Không thể xác thực yêu cầu. Vui lòng tải lại trang và đăng nhập lại.');
    }
    
    // Gọi API từ backend với timeout
    console.log('Gửi request POST đến:', apiUrl);
    console.log('Dữ liệu gửi đi:', JSON.stringify({
      ...logData,
      avatar: logData.avatar ? '[Avatar Base64 String]' : null
    }));
    
    // Thiết lập timeout cho request API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
    
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Xóa timeout nếu request thành công
    } catch (networkError) {
      clearTimeout(timeoutId);
      
      if (networkError instanceof DOMException && networkError.name === 'AbortError') {
        console.error('Request bị hủy do timeout');
        throw new Error('Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại sau.');
      }
      
      console.error('Lỗi kết nối đến API:', networkError);
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.');
    }
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

    // Đọc response data
    const responseText = await response.text();
    console.log(`Response từ API tạo người dùng (status: ${response.status}):`);
    console.log(`Headers:`, Object.fromEntries([...response.headers.entries()]));
    console.log(`Body:`, responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Parse JSON từ text nếu có thể
    let responseData;
    try {
      // Kiểm tra xem response có nội dung không
      if (responseText && responseText.trim() !== '') {
        responseData = JSON.parse(responseText);
      } else {
        // Nếu response trống, tạo một đối tượng mặc định
        console.warn('Response text trống từ API');
        responseData = { 
          success: response.ok, 
          message: response.ok ? 'Tạo người dùng thành công' : 'Lỗi không xác định', 
          data: null 
        };
      }
    } catch (e) {
      console.error('Không thể parse JSON từ response:', e);
      throw new Error('Không thể xử lý phản hồi từ server');
    }

    // Kiểm tra kết quả từ API
    if (!response.ok) {
      console.error('Lỗi khi tạo người dùng mới:', responseData);
      throw new Error(responseData.message || `Không thể tạo người dùng mới: ${response.statusText}`);
    }
    
    return responseData.data || responseData;
  } catch (error) {
    console.error('Lỗi khi xử lý API tạo người dùng mới:', error);
    throw error;
  }
}

/**
 * Cập nhật thông tin người dùng
 * @param userId ID của người dùng
 * @param updateData Dữ liệu cập nhật
 * @returns Promise<any> Thông tin người dùng đã cập nhật
 */
export async function updateUser(userId: string, updateData: UpdateData) {
  try {
    if (!userId || !updateData) {
      throw new Error('ID người dùng hoặc dữ liệu cập nhật không hợp lệ');
    }

    console.log(`Đang cập nhật thông tin người dùng với ID: ${userId}`);
    
    // Ghi log dữ liệu cập nhật (loại bỏ avatar để tránh ghi log quá dài)
    const logData = { ...updateData };
    if (logData.avatar && logData.avatar.length > 100) {
      logData.avatar = `[Base64 Avatar: ${logData.avatar.substring(0, 30)}... (${logData.avatar.length} chars)]`;
    }
    if (logData.password) {
      logData.password = '[HIDDEN]';
    }
    console.log('Dữ liệu cập nhật:', JSON.stringify(logData, null, 2));
    
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.users}/${userId}`;
    console.log('API URL:', apiUrl);
    
    // Lấy token xác thực từ localStorage hoặc cookie
    let token;
    try {
      // Kiểm tra xem đang chạy ở môi trường nào
      if (typeof window !== 'undefined') {
        // Browser environment - có thể sử dụng localStorage
        token = localStorage.getItem('admin_token');
        console.log('Lấy token từ localStorage:', token ? 'Tìm thấy token' : 'Không tìm thấy token');
      } else {
        // Server environment - lấy token từ cookie
        const cookies = require('next/headers').cookies();
        token = cookies.get('admin_token')?.value;
        console.log('Lấy token từ cookie:', token ? 'Tìm thấy token' : 'Không tìm thấy token');
      }
      
      if (!token) {
        console.error('Không tìm thấy token');
        throw new Error('Không có token xác thực, vui lòng đăng nhập lại');
      }
    } catch (error) {
      console.error('Lỗi khi lấy token:', error);
      throw new Error('Không thể xác thực yêu cầu. Vui lòng tải lại trang và đăng nhập lại.');
    }
    
    // Thiết lập timeout cho request API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
    
    let response;
    try {
      // Gọi API từ backend
      console.log('Bắt đầu gửi request đến API:', apiUrl);
      console.log('Dữ liệu gửi đi:', JSON.stringify({
        ...updateData,
        password: updateData.password ? '[HIDDEN]' : undefined,
        avatar: updateData.avatar ? '[AVATAR DATA]' : undefined
      }));
      
      response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Xóa timeout nếu request thành công
      console.log('Nhận được phản hồi từ server với status:', response.status);
    } catch (networkError) {
      clearTimeout(timeoutId);
      
      console.error('Chi tiết lỗi kết nối:', networkError);
      
      if (networkError instanceof DOMException && networkError.name === 'AbortError') {
        console.error('Request bị hủy do timeout');
        throw new Error('Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại sau.');
      }
      
      console.error('Lỗi kết nối đến API:', networkError);
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại sau.');
    }

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

    // Đọc response data dưới dạng text trước để ghi log
    let responseText = '';
    try {
      responseText = await response.text();
      console.log(`Response từ API cập nhật người dùng (${response.status}):`);
      console.log(`Body:`, responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
    } catch (textError) {
      console.error('Lỗi khi đọc response text:', textError);
      throw new Error('Không thể đọc dữ liệu phản hồi từ server');
    }
    
    // Parse JSON từ text nếu có thể
    let responseData;
    try {
      // Kiểm tra xem response có nội dung không
      if (responseText && responseText.trim() !== '') {
        responseData = JSON.parse(responseText);
        console.log('Response data đã parse:', typeof responseData, responseData ? 'có dữ liệu' : 'không có dữ liệu');
      } else {
        // Nếu response trống, tạo một đối tượng mặc định
        console.warn('Response text trống từ API');
        responseData = { 
          success: response.ok, 
          message: response.ok ? 'Cập nhật người dùng thành công' : 'Lỗi không xác định',
          data: null 
        };
      }
    } catch (e) {
      console.error('Không thể parse JSON từ response:', e);
      console.error('Response text gốc:', responseText);
      
      if (response.ok) {
        // Nếu status OK nhưng không parse được JSON, tạo response mặc định
        console.warn('Response không phải JSON nhưng status OK. Tạo dữ liệu mặc định');
        responseData = { 
          success: true, 
          message: 'Cập nhật người dùng thành công',
          data: { _id: userId, ...updateData }
        };
      } else {
        throw new Error(`Không thể xử lý phản hồi từ server. Response text: ${responseText.substring(0, 100)}...`);
      }
    }

    // Kiểm tra các loại lỗi phổ biến
    if (!response.ok) {
      console.error('Lỗi khi cập nhật người dùng:', responseData);
      
      // Xử lý mã lỗi cụ thể
      if (response.status === 409) {
        // Xác định xem là email hay username bị trùng
        if (responseData && responseData.message && responseData.message.toLowerCase().includes('email')) {
          throw new Error('Email đã tồn tại trong hệ thống');
        } else if (responseData && responseData.message && responseData.message.toLowerCase().includes('username')) {
          throw new Error('Tên đăng nhập đã tồn tại trong hệ thống');
        } else {
          throw new Error('Email hoặc tên đăng nhập đã tồn tại trong hệ thống');
        }
      } else if (response.status === 401) {
        throw new Error('Không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.');
      } else if (response.status === 400) {
        throw new Error(responseData && responseData.message ? responseData.message : 'Dữ liệu không hợp lệ');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy người dùng với ID đã cung cấp');
      }
      
      // Trường hợp chung cho các lỗi khác
      throw new Error(responseData && responseData.message ? responseData.message : `Không thể cập nhật thông tin người dùng: ${response.statusText}`);
    }
    
    // Nếu không có lỗi, trả về dữ liệu
    console.log('Cập nhật người dùng thành công:', userId);
    
    // Xử lý các loại response thành công nhưng không có dữ liệu
    if (!responseData) {
      console.warn('Không có dữ liệu trong response nhưng status OK');
      return { _id: userId, ...updateData };
    }
    
    // Nếu responseData là đối tượng rỗng
    if (responseData && Object.keys(responseData).length === 0) {
      console.warn('Response data là đối tượng rỗng nhưng status OK');
      return { _id: userId, ...updateData };
    }
    
    return responseData.data || responseData;
  } catch (error) {
    console.error('Lỗi khi xử lý API cập nhật thông tin người dùng:', error);
    throw error;
  }
}

/**
 * Xóa người dùng
 * @param userId ID của người dùng cần xóa
 * @returns Promise<boolean> Kết quả xóa
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      throw new Error('ID người dùng không hợp lệ');
    }

    console.log(`Đang xóa người dùng với ID: ${userId}`);
    
    // Lấy URL từ config
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.users}/${userId}`;
    console.log('Gọi API từ URL:', apiUrl);
    
    // Gọi API từ backend
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Đọc response data
    const responseText = await response.text();
    console.log(`Response từ API xóa người dùng (${response.status}):`, responseText);
    
    // Parse JSON từ text nếu có thể
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Không thể parse JSON từ response:', e);
      // Trường hợp response rỗng vẫn được xem là thành công nếu status OK
      if (response.ok) {
        return true;
      }
      throw new Error('Không thể xử lý phản hồi từ server');
    }

    // Kiểm tra kết quả từ API
    if (!response.ok) {
      console.error(`Lỗi khi xóa người dùng ID ${userId}:`, responseData);
      throw new Error(responseData.message || `Không thể xóa người dùng: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi khi xử lý API xóa người dùng:', error);
    throw error;
  }
} 