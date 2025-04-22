import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Dữ liệu mẫu cho các task của tác giả
const mockAuthorTasks = [
  {
    id: "task-a1",
    title: "Hoàn thành chương 5 của truyện 'Hành trình phiêu lưu'",
    description: "Cần hoàn thành chương 5 với ít nhất 3000 từ và nộp trước hạn để đảm bảo lịch phát hành.",
    status: "pending",
    authorId: "author-1",
    authorName: "Nguyễn Văn A",
    dueDate: new Date(2023, 11, 25),
    createdAt: new Date(2023, 11, 20),
    updatedAt: new Date(2023, 11, 20),
    reward: 50000,
  },
  {
    id: "task-a2",
    title: "Chỉnh sửa nội dung chương 3",
    description: "Có một số lỗi chính tả và nội dung ở chương 3 cần được sửa lại theo góp ý của biên tập viên.",
    status: "in-progress",
    authorId: "author-1",
    authorName: "Nguyễn Văn A",
    dueDate: new Date(2023, 11, 22),
    createdAt: new Date(2023, 11, 18),
    updatedAt: new Date(2023, 11, 19),
    reward: 20000,
  },
  {
    id: "task-a3",
    title: "Xây dựng cốt truyện cho phần 2",
    description: "Cần phác thảo cốt truyện chính cho phần 2 của bộ truyện, bao gồm các tình tiết chính và sự phát triển nhân vật.",
    status: "completed",
    authorId: "author-1",
    authorName: "Nguyễn Văn A",
    dueDate: new Date(2023, 11, 15),
    createdAt: new Date(2023, 11, 10),
    updatedAt: new Date(2023, 11, 14),
    completedAt: new Date(2023, 11, 14),
    reward: 100000,
  },
  {
    id: "task-a4",
    title: "Trả lời bình luận độc giả",
    description: "Cần trả lời các bình luận quan trọng của độc giả trong phần bình luận của chương mới nhất.",
    status: "canceled",
    authorId: "author-1",
    authorName: "Nguyễn Văn A",
    dueDate: new Date(2023, 11, 18),
    createdAt: new Date(2023, 11, 15),
    updatedAt: new Date(2023, 11, 16),
    reward: 10000,
  },
  {
    id: "task-b1",
    title: "Hoàn thành chương cuối của truyện 'Bí ẩn vùng đất xa xôi'",
    description: "Cần hoàn thành chương cuối cùng để kết thúc bộ truyện. Yêu cầu đảm bảo tính liên kết với các chương trước.",
    status: "pending",
    authorId: "author-2",
    authorName: "Trần Thị B",
    dueDate: new Date(2023, 11, 30),
    createdAt: new Date(2023, 11, 20),
    updatedAt: new Date(2023, 11, 20),
    reward: 80000,
  }
];

// Xử lý GET request để lấy danh sách task của tác giả
export async function GET(request: NextRequest) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
    // Lấy authorId từ query string nếu có
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    
    // Lọc task theo authorId nếu được cung cấp
    let tasks = mockAuthorTasks;
    if (authorId) {
      tasks = mockAuthorTasks.filter(task => task.authorId === authorId);
      console.log(`Đang lấy nhiệm vụ cho tác giả ID: ${authorId}, số lượng: ${tasks.length}`);
    } else {
      console.log(`Đang lấy tất cả nhiệm vụ tác giả, số lượng: ${tasks.length}`);
    }
    
    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhiệm vụ tác giả:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy danh sách nhiệm vụ tác giả' },
      { status: 500 }
    );
  }
}

// Xử lý POST request để tạo task mới cho tác giả
export async function POST(request: NextRequest) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
    // Lấy dữ liệu từ body
    const data = await request.json();
    
    // Validate dữ liệu
    if (!data.title || !data.description || !data.authorId || !data.authorName || !data.reward) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Tạo task mới
    const newTask = {
      id: `task-a${Date.now()}`,
      title: data.title,
      description: data.description,
      status: "pending",
      authorId: data.authorId,
      authorName: data.authorName,
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Mặc định 7 ngày
      createdAt: new Date(),
      updatedAt: new Date(),
      reward: data.reward
    };
    
    // Trong thực tế, sẽ lưu vào database
    mockAuthorTasks.push(newTask);
    
    return NextResponse.json({
      success: true,
      message: 'Tạo nhiệm vụ tác giả mới thành công',
      data: newTask
    }, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo nhiệm vụ tác giả mới:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi tạo nhiệm vụ tác giả mới' },
      { status: 500 }
    );
  }
}

// Xử lý PUT request để cập nhật trạng thái nhiệm vụ
export async function PUT(request: NextRequest) {
  try {
    // Xác thực token
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error },
        { status: 401 }
      );
    }
    
    // Lấy dữ liệu từ body
    const data = await request.json();
    
    // Validate dữ liệu
    if (!data.id || !data.status) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Tìm task cần cập nhật
    const taskIndex = mockAuthorTasks.findIndex(task => task.id === data.id);
    if (taskIndex === -1) {
      return NextResponse.json(
        { message: 'Không tìm thấy nhiệm vụ' },
        { status: 404 }
      );
    }
    
    // Cập nhật thông tin
    const updatedTask = {
      ...mockAuthorTasks[taskIndex],
      status: data.status,
      updatedAt: new Date()
    };
    
    // Nếu đánh dấu hoàn thành, thêm thời gian hoàn thành
    if (data.status === 'completed' && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
    }
    
    // Cập nhật task trong mảng
    mockAuthorTasks[taskIndex] = updatedTask;
    
    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái nhiệm vụ thành công',
      data: updatedTask
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái nhiệm vụ:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi cập nhật trạng thái nhiệm vụ' },
      { status: 500 }
    );
  }
} 