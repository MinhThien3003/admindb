import { NextRequest, NextResponse } from 'next/server';

// GET - Lấy tất cả cấp độ người dùng
export async function GET() {
  try {
    // Trả về một mảng rỗng để tránh lỗi
    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error('Error fetching user levels:', error);
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
    const newUserLevel = {
      id: Date.now().toString(),
      level: data.level,
      requiredExp: data.requiredExp,
      title: data.title,
    };
    
    return NextResponse.json(newUserLevel, { status: 201 });
  } catch (error) {
    console.error('Error creating user level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi tạo cấp độ người dùng mới' },
      { status: 500 }
    );
  }
}
