import { NextResponse } from 'next/server';

// Sử dụng dữ liệu mẫu từ route.ts
// Dữ liệu mẫu cho cấp độ tác giả
const authorLevels = [
  {
    _id: "1",
    level: 1,
    requiredExp: 0,
    title: "Tác giả mới"
  },
  {
    _id: "2",
    level: 2,
    requiredExp: 100,
    title: "Tác giả nghiệp dư"
  },
  {
    _id: "3",
    level: 3,
    requiredExp: 300,
    title: "Tác giả tiềm năng"
  },
  {
    _id: "4",
    level: 4,
    requiredExp: 700,
    title: "Tác giả chuyên nghiệp"
  },
  {
    _id: "5",
    level: 5,
    requiredExp: 1500,
    title: "Tác giả nổi tiếng"
  },
  {
    _id: "6",
    level: 6,
    requiredExp: 3000,
    title: "Tác giả huyền thoại"
  }
];

// GET /api/authorLevels/[id] - Lấy cấp độ tác giả theo ID
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authorLevel = authorLevels.find(level => level._id === params.id);
    
    if (!authorLevel) {
      return NextResponse.json(
        { error: 'Author level not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(authorLevel, { status: 200 });
  } catch (error) {
    console.error('Error fetching author level:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author level' },
      { status: 500 }
    );
  }
}

// PUT /api/authorLevels/[id] - Cập nhật cấp độ tác giả
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    
    // Kiểm tra dữ liệu đầu vào
    if (!data.level || !data.requiredExp || !data.title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Tìm cấp độ cần cập nhật
    const levelIndex = authorLevels.findIndex(level => level._id === params.id);
    
    if (levelIndex === -1) {
      return NextResponse.json(
        { error: 'Author level not found' },
        { status: 404 }
      );
    }
    
    // Kiểm tra xem level đã tồn tại chưa (nếu thay đổi level)
    const existingLevelIndex = authorLevels.findIndex(
      level => level.level === data.level && level._id !== params.id
    );
    
    if (existingLevelIndex !== -1) {
      return NextResponse.json(
        { error: 'Level already exists' },
        { status: 409 }
      );
    }
    
    // Cập nhật cấp độ tác giả
    authorLevels[levelIndex] = {
      ...authorLevels[levelIndex],
      level: data.level,
      requiredExp: data.requiredExp,
      title: data.title
    };
    
    return NextResponse.json(authorLevels[levelIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating author level:', error);
    return NextResponse.json(
      { error: 'Failed to update author level' },
      { status: 500 }
    );
  }
}

// DELETE /api/authorLevels/[id] - Xóa cấp độ tác giả
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const levelIndex = authorLevels.findIndex(level => level._id === params.id);
    
    if (levelIndex === -1) {
      return NextResponse.json(
        { error: 'Author level not found' },
        { status: 404 }
      );
    }
    
    // Xóa cấp độ tác giả
    authorLevels.splice(levelIndex, 1);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting author level:', error);
    return NextResponse.json(
      { error: 'Failed to delete author level' },
      { status: 500 }
    );
  }
}
