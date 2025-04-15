import { NextRequest, NextResponse } from 'next/server';

// GET - Lấy tất cả cấp độ người dùng
export async function GET() {
  try {
    // Dữ liệu mẫu cho cấp độ người dùng
    const readerLevels = [
      {
        _id: "1",
        level: 1,
        requiredExp: 0,
        title: "Độc giả mới",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: "2",
        level: 2,
        requiredExp: 100,
        title: "Độc giả thường xuyên",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: "3",
        level: 3,
        requiredExp: 300,
        title: "Độc giả nhiệt tình",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(readerLevels, { status: 200 });
  } catch (error) {
    console.error('Error fetching reader levels:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách cấp độ người dùng' },
      { status: 500 }
    );
  }
}

// POST - Tạo cấp độ người dùng mới
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.level || !data.requiredExp || !data.title) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Giả lập thành công
    const newReaderLevel = {
      _id: Date.now().toString(),
      level: data.level,
      requiredExp: data.requiredExp,
      title: data.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(newReaderLevel, { status: 201 });
  } catch (error) {
    console.error('Error creating reader level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi tạo cấp độ người dùng mới' },
      { status: 500 }
    );
  }
}
