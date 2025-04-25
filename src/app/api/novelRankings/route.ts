import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';

/**
 * Tính toán tổng lượt xem của truyện
 * @param novelData Dữ liệu truyện
 * @returns Tổng lượt xem
 */
function getTotalViews(novelData: any): number {
  return novelData.viewTotal || novelData.idNovel?.view || 0;
}

/**
 * GET /api/novelRankings
 * Lấy danh sách xếp hạng truyện nổi bật
 */
export async function GET(request: NextRequest) {
  console.log('Nhận yêu cầu GET /api/novelRankings');
  
  try {
    // Xây dựng URL API Backend
    const apiUrl = `${config.api.baseUrl}${config.api.endpoints.novelRankings}`;
    console.log('Gọi API Backend từ URL:', apiUrl);
    
    // Gọi API từ Backend
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
      console.error('Lỗi khi gọi API novelRankings từ Backend:', errorText, 'Status:', response.status);
      return NextResponse.json(
        { error: 'Không thể lấy danh sách xếp hạng truyện', details: errorText },
        { status: response.status }
      );
    }

    // Lấy dữ liệu từ response
    const data = await response.json();
    console.log('Dữ liệu nhận được từ Backend API:', typeof data, Array.isArray(data) ? data.length : 'not array');
    
    // Xử lý dữ liệu trả về
    const rankings = Array.isArray(data) ? data : (data.data || []);
    
    // Đảm bảo cấu trúc dữ liệu đúng
    const formattedRankings = rankings.map((item: any) => ({
      _id: item._id,
      idNovel: {
        _id: item.idNovel?._id,
        title: item.idNovel?.title,
        view: item.idNovel?.view || 0,
        imageUrl: item.idNovel?.imageUrl
      },
      viewTotal: item.viewTotal || item.idNovel?.view || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      __v: item.__v
    }));
    
    // Sắp xếp xếp hạng dựa trên tổng lượt xem (cao → thấp)
    const sortedRankings = formattedRankings
      .sort((a: any, b: any) => {
        const viewsA = getTotalViews(a);
        const viewsB = getTotalViews(b);
        return viewsB - viewsA;
      })
      .map((ranking: any, index: number) => ({
        ...ranking,
        rank: index + 1 // Thêm trường rank dựa trên vị trí sau khi sắp xếp
      }));
    
    console.log('Trả về', sortedRankings.length, 'xếp hạng truyện đã được sắp xếp');
    return NextResponse.json(sortedRankings);
    
  } catch (error) {
    console.error('Lỗi xử lý yêu cầu /api/novelRankings:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi xử lý yêu cầu xếp hạng truyện' },
      { status: 500 }
    );
  }
} 