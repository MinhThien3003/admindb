// Định nghĩa interface cho dữ liệu xếp hạng truyện
export interface NovelRanking {
  _id: string;
  idNovel: {
    _id: string;
    title: string;
    view: number;
    imageUrl: string;
  };
  viewTotal: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  rank?: number; // Thêm trường rank cho UI hiển thị
}

/**
 * Lấy tổng lượt xem của một truyện
 * @param novelRanking Đối tượng chứa thông tin xếp hạng truyện
 * @returns Tổng số lượt xem
 */
function getTotalViews(novelRanking: NovelRanking): number {
  return novelRanking.viewTotal || novelRanking.idNovel?.view || 0;
}

/**
 * Lấy danh sách xếp hạng truyện nổi bật
 * @returns Promise<NovelRanking[]> Mảng các xếp hạng truyện
 */
export async function getAllNovelRankings(): Promise<NovelRanking[]> {
  try {
    // Sử dụng đường dẫn tương đối đến API route
    const apiUrl = '/api/novelRankings';
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
      console.error('Lỗi khi gọi API novelRankings:', errorText, 'Status:', response.status);
      throw new Error(`Không thể lấy danh sách xếp hạng truyện. Status: ${response.status}`);
    }

    // Lấy dữ liệu từ response
    const result = await response.json();
    const rankings = Array.isArray(result) ? result : (result.data || []);
    console.log('Tổng số xếp hạng truyện nhận được:', rankings.length);
    
    // Thêm trường rank dựa trên viewTotal để hiển thị
    // Sắp xếp theo tổng lượt xem - lượt xem càng cao thì xếp hạng càng cao (số rank càng thấp)
    const sortedRankings = rankings
      .sort((a: NovelRanking, b: NovelRanking) => {
        // Lấy tổng lượt xem từ mỗi truyện
        const viewsA = getTotalViews(a);
        const viewsB = getTotalViews(b);
        
        // Sắp xếp giảm dần - truyện có lượt xem cao nhất sẽ có rank = 1
        return viewsB - viewsA;
      })
      .map((ranking: NovelRanking, index: number) => ({
        ...ranking,
        rank: index + 1 // Thêm trường rank dựa trên vị trí sau khi sắp xếp
      }));
    
    console.log('Đã sắp xếp xếp hạng dựa trên lượt xem (cao → thấp)');
    
    return sortedRankings;
  } catch (error) {
    console.error('Lỗi khi xử lý API novelRankings:', error);
    throw error;
  }
} 