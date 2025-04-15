import { NextRequest, NextResponse } from 'next/server';

// GET - Lấy cấp độ người dùng theo ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Giả lập dữ liệu mẫu
    const userLevel = {
      id: id,
      level: 1,
      requiredExp: 0,
      title: 'Người mới'
    };
    
    return NextResponse.json(userLevel, { status: 200 });
  } catch (error) {
    console.error('Error fetching user level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin cấp độ người dùng' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật cấp độ người dùng
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await req.json();
    
    // Validate required fields if provided
    if (data.level === undefined && data.requiredExp === undefined && data.title === undefined) {
      return NextResponse.json(
        { message: 'Không có thông tin cập nhật' },
        { status: 400 }
      );
    }
    
    // Giả lập thành công
    const updatedUserLevel = {
      id: id,
      level: data.level || 1,
      requiredExp: data.requiredExp || 0,
      title: data.title || 'Người mới',
    };
    
    return NextResponse.json(updatedUserLevel, { status: 200 });
  } catch (error) {
    console.error('Error updating user level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật cấp độ người dùng' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa cấp độ người dùng
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Giả lập thành công
    return NextResponse.json(
      { message: 'Xóa cấp độ người dùng thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi xóa cấp độ người dùng' },
      { status: 500 }
    );
  }
}
