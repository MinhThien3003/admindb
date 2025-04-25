// Định nghĩa interface cho dữ liệu xếp hạng tác giả
export interface AuthorRanking {
  _id: string;
  idUser: {
    _id: string;
    fullname: string;
    username?: string; // Thuộc tính tùy chọn
    email?: string; // Thuộc tính tùy chọn
    avatar: string;
    role?: "author"; // Thuộc tính tùy chọn
    gender?: "Male" | "Female"; // Thuộc tính tùy chọn
  };
  viewTotal: number; // Tổng lượt xem
  rank?: number; // Thêm trường rank cho UI hiển thị
  createdAt: string;
  updatedAt: string;
  __v?: number; // Thêm trường này nếu có trong dữ liệu MongoDB
}

/**
 * Lấy tổng lượt xem của một tác giả
 * @param authorRanking Đối tượng chứa thông tin xếp hạng tác giả
 * @returns Tổng số lượt xem
 */
function getTotalViews(authorRanking: AuthorRanking): number {
  return authorRanking.viewTotal || 0;
}

/**
 * Lấy danh sách xếp hạng tác giả nổi bật
 * @returns Promise<AuthorRanking[]> Mảng các xếp hạng tác giả
 */
export async function getAllAuthorRankings(): Promise<AuthorRanking[]> {
  try {
    // Sử dụng đường dẫn tương đối đến API route
    const apiUrl = '/api/authorRankings';
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
      console.error('Lỗi khi gọi API authorRankings:', errorText, 'Status:', response.status);
      throw new Error(`Không thể lấy danh sách xếp hạng tác giả. Status: ${response.status}`);
    }

    // Lấy dữ liệu từ response
    const result = await response.json();
    const rankings = Array.isArray(result) ? result : (result.data || []);
    console.log('Tổng số xếp hạng tác giả nhận được:', rankings.length);
    
    // Thêm trường rank dựa trên lượt xem để hiển thị
    // Sắp xếp theo tổng lượt xem - lượt xem càng cao thì xếp hạng càng cao (số rank càng thấp)
    const sortedRankings = rankings
      .sort((a: AuthorRanking, b: AuthorRanking) => {
        // Lấy tổng lượt xem từ mỗi tác giả
        const viewsA = getTotalViews(a);
        const viewsB = getTotalViews(b);
        
        // Sắp xếp giảm dần - tác giả có lượt xem cao nhất sẽ có rank = 1
        return viewsB - viewsA;
      })
      .map((ranking: AuthorRanking, index: number) => ({
        ...ranking,
        rank: index + 1 // Thêm trường rank dựa trên vị trí sau khi sắp xếp
      }));
    
    console.log('Đã sắp xếp xếp hạng dựa trên lượt xem (cao → thấp)');
    
    return sortedRankings;
  } catch (error) {
    console.error('Lỗi khi xử lý API authorRankings:', error);
    throw error;
  }
} 