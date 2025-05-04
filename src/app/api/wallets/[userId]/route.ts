import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import config from "@/lib/config";

// API endpoint để lấy thông tin ví của tác giả
export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const { params } = context;
    
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }

    // Lấy userId từ params - đảm bảo nó là một giá trị hợp lệ
    if (!params || !params.userId) {
      return NextResponse.json(
        { message: "ID tác giả không hợp lệ" },
        { status: 400 }
      );
    }
    
    const userId = params.userId;
    console.log(`Đang lấy thông tin ví cho tác giả ID: ${userId}`);

    // Xây dựng URL API - sử dụng endpoint wallets
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.wallets.authors}/${userId}`;
    console.log(`URL API đầy đủ: ${apiUrl}`);

    // Gọi API thực tế
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${authResult.token}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    // Kiểm tra kết quả
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lỗi khi gọi API ví tác giả:", errorText, "Status:", response.status);
      
      if (response.status === 404) {
        return NextResponse.json(
          { message: "Không tìm thấy ví của tác giả này" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: `Không thể lấy thông tin ví tác giả. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const responseData = await response.json();
    console.log("Dữ liệu API gốc:", responseData);
    
    // Kiểm tra định dạng dữ liệu từ API
    if (responseData && responseData.wallet) {
      // Lấy dữ liệu wallet từ response
      const walletData = responseData.wallet;
      
      // Định dạng lại dữ liệu theo cấu trúc mong muốn để hiển thị
      const formattedWalletData = {
        _id: walletData._id,
        userId: {
          _id: walletData.userId,
          fullname: responseData.authorInfo?.fullname || "Tác giả",
          username: responseData.authorInfo?.username || "username",
          avatar: responseData.authorInfo?.avatar || "https://res.cloudinary.com/dq7xydlgs/image/upload/v1743989588/user_avatar/default_avatar.jpg"
        },
        totalRevenue: walletData.balance || 0,
        monthlyRevenue: responseData.monthlyRevenue || { 
          // Nếu không có dữ liệu theo tháng, sử dụng tháng hiện tại
          [new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }).replace('/', '/')]: walletData.balance || 0
        },
        lastUpdated: walletData.updatedAt,
        createdAt: walletData.createdAt,
        updatedAt: walletData.updatedAt
      };
      
      console.log("Dữ liệu ví định dạng lại:", formattedWalletData);
      return NextResponse.json(formattedWalletData);
    }
    
    // Nếu không có định dạng wallet đặc biệt, trả về dữ liệu gốc
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Lỗi khi xử lý API ví tác giả:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi xử lý yêu cầu", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 