// Định nghĩa interface cho dữ liệu xếp hạng người đọc
export interface ReaderRanking {
  _id: string;
  idUser: {
    _id: string;
    fullname: string;
    username?: string; // Thuộc tính tùy chọn
    email?: string; // Thuộc tính tùy chọn
    avatar: string;
    role?: "reader"; // Thuộc tính tùy chọn
    gender?: "Male" | "Female"; // Thuộc tính tùy chọn
  };
  idReaderExp: {
    _id: string;
    exp?: number; // Thuộc tính tùy chọn nếu backend sử dụng totalExp
    totalExp?: number; // Thuộc tính tùy chọn nếu backend sử dụng exp
    level?: number; // Thuộc tính tùy chọn
  };
  rank?: number; // Thêm trường rank cho UI hiển thị
  createdAt: string;
  updatedAt: string;
  __v?: number; // Thêm trường này nếu có trong dữ liệu MongoDB
}

/**
 * Lấy tổng kinh nghiệm của một người dùng từ đối tượng ReaderExp
 * @param readerExp Đối tượng chứa thông tin kinh nghiệm
 * @returns Tổng số kinh nghiệm
 */
function getTotalExp(readerExp: ReaderRanking['idReaderExp']): number {
  // Ưu tiên sử dụng totalExp, nếu không có thì dùng exp, nếu không có cả hai thì trả về 0
  return readerExp.totalExp || readerExp.exp || 0;
}

/**
 * Lấy danh sách xếp hạng người đọc tích cực
 * @returns Promise<ReaderRanking[]> Mảng các xếp hạng người đọc
 */
export async function getAllReaderRankings(): Promise<ReaderRanking[]> {
  try {
    // Sử dụng đường dẫn tương đối đến API route
    const apiUrl = '/api/readerRankings';
    console.log('Gọi API từ URL:', apiUrl);
    
    // Gọi API từ frontend
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
      console.error('Lỗi khi gọi API readerRankings:', errorText, 'Status:', response.status);
      throw new Error(`Không thể lấy danh sách xếp hạng. Status: ${response.status}`);
    }

    // Lấy dữ liệu từ response
    const result = await response.json();
    const rankings = Array.isArray(result) ? result : (result.data || []);
    console.log('Tổng số xếp hạng người đọc nhận được:', rankings.length);
    
    // Thêm trường rank dựa trên exp hoặc totalExp để hiển thị
    // Sắp xếp theo kinh nghiệm - kinh nghiệm càng cao thì xếp hạng càng cao (số rank càng thấp)
    const sortedRankings = rankings
      .sort((a: ReaderRanking, b: ReaderRanking) => {
        // Lấy tổng kinh nghiệm từ mỗi người dùng
        const expA = getTotalExp(a.idReaderExp);
        const expB = getTotalExp(b.idReaderExp);
        
        // Sắp xếp giảm dần - người dùng có kinh nghiệm cao nhất sẽ có rank = 1
        return expB - expA;
      })
      .map((ranking: ReaderRanking, index: number) => ({
        ...ranking,
        rank: index + 1 // Thêm trường rank dựa trên vị trí sau khi sắp xếp
      }));
    
    console.log('Đã sắp xếp xếp hạng dựa trên kinh nghiệm (cao → thấp)');
    
    return sortedRankings;
  } catch (error) {
    console.error('Lỗi khi xử lý API readerRankings:', error);
    throw error;
  }
} 