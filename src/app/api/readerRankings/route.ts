import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';
import { ReaderRanking } from '@/lib/api/readerRankings';

// Hàm lấy tổng kinh nghiệm của người dùng
function getTotalExp(readerExp: any): number {
  if (!readerExp) return 0;
  return readerExp.totalExp || readerExp.exp || 0;
}

// API Routes for /api/readerRankings

// Xử lý GET request - lấy danh sách xếp hạng người dùng tích cực
export async function GET() {
  try {
    // Gọi API từ backend
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.readerRankings}`;
    console.log('Backend API URL:', apiUrl);
    
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
      console.error('Lỗi khi gọi backend API readerRankings:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { message: `Không thể lấy danh sách xếp hạng từ backend. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const responseData = await response.json();
    console.log('Dữ liệu thô nhận từ backend:', JSON.stringify(responseData).substring(0, 300) + '...');
    
    // Kiểm tra cấu trúc dữ liệu
    // Nếu dữ liệu được bọc trong trường "data", lấy nó ra
    const rawRankings = Array.isArray(responseData) ? responseData : 
                       (responseData.data && Array.isArray(responseData.data) ? responseData.data : []);
    
    if (rawRankings.length === 0) {
      console.warn('Không tìm thấy dữ liệu xếp hạng trong phản hồi');
      return NextResponse.json([]);
    }
    
    console.log(`Đã tìm thấy ${rawRankings.length} mục xếp hạng, đang xử lý...`);
    console.log('Mẫu dữ liệu đầu tiên:', JSON.stringify(rawRankings[0]).substring(0, 200) + '...');
    
    // Chuyển đổi dữ liệu để đảm bảo tất cả các trường cần thiết đều có mặt
    const formattedRankings = rawRankings.map((item: any) => {
      // Đảm bảo idUser là object
      const idUser = typeof item.idUser === 'object' ? item.idUser : { 
        _id: typeof item.idUser === 'string' ? item.idUser : `user_${Math.random().toString(36).substr(2, 9)}`,
        fullname: "Người dùng",
        avatar: ""
      };
      
      // Đảm bảo idReaderExp là object
      const idReaderExp = typeof item.idReaderExp === 'object' ? item.idReaderExp : {
        _id: typeof item.idReaderExp === 'string' ? item.idReaderExp : `exp_${Math.random().toString(36).substr(2, 9)}`,
        totalExp: 0
      };
      
      // Nếu có totalExp nhưng không có exp, sử dụng totalExp làm exp để hiển thị
      if (idReaderExp.totalExp !== undefined && idReaderExp.exp === undefined) {
        idReaderExp.exp = idReaderExp.totalExp;
      }
      
      // Đảm bảo các trường cần thiết khác
      return {
        _id: item._id || `rank_${Math.random().toString(36).substr(2, 9)}`,
        idUser,
        idReaderExp,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        __v: item.__v
      };
    });
    
    // Sắp xếp dữ liệu theo kinh nghiệm (cao đến thấp) trước khi trả về
    const sortedRankings = formattedRankings.sort((a, b) => {
      const expA = getTotalExp(a.idReaderExp);
      const expB = getTotalExp(b.idReaderExp);
      return expB - expA; // Sắp xếp giảm dần theo exp
    }).map((ranking, index) => ({
      ...ranking,
      rank: index + 1 // Thêm thông tin rank dựa trên vị trí sau khi sắp xếp
    }));
    
    console.log(`Đã sắp xếp ${sortedRankings.length} xếp hạng theo kinh nghiệm (cao → thấp)`);
    
    // Trả về dữ liệu đã được định dạng và sắp xếp
    return NextResponse.json(sortedRankings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xếp hạng người đọc:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy danh sách xếp hạng người đọc', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 