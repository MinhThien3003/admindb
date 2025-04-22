import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Dữ liệu mẫu cho các task
const mockTasks = [
  {
    id: "task-1",
    title: "Sửa lỗi đăng nhập trên trang web",
    description: "Người dùng báo cáo không thể đăng nhập trên iOS Safari. Cần kiểm tra và khắc phục lỗi này.",
    status: "in-progress",
    priority: "high",
    dueDate: new Date(2023, 11, 25),
    assignedTo: "Nguyễn Văn A",
    createdAt: new Date(2023, 11, 20),
    updatedAt: new Date(2023, 11, 21),
  },
  {
    id: "task-2",
    title: "Thêm tính năng đánh giá sao cho truyện",
    description: "Phát triển tính năng cho phép người dùng đánh giá truyện bằng sao (1-5 sao).",
    status: "pending",
    priority: "medium",
    dueDate: new Date(2023, 11, 28),
    assignedTo: "Trần Thị B",
    createdAt: new Date(2023, 11, 19),
    updatedAt: new Date(2023, 11, 19),
  },
  {
    id: "task-3",
    title: "Tối ưu hóa thời gian tải trang chủ",
    description: "Cải thiện hiệu suất trang chủ, giảm thời gian tải xuống dưới 2 giây.",
    status: "completed",
    priority: "high",
    dueDate: new Date(2023, 11, 15),
    assignedTo: "Lê Văn C",
    createdAt: new Date(2023, 11, 10),
    updatedAt: new Date(2023, 11, 14),
  },
  {
    id: "task-4",
    title: "Cập nhật giao diện trang cá nhân",
    description: "Thiết kế lại trang cá nhân của người dùng theo mẫu mới đã được phê duyệt.",
    status: "pending",
    priority: "low",
    dueDate: new Date(2023, 11, 30),
    assignedTo: "Phạm Thị D",
    createdAt: new Date(2023, 11, 18),
    updatedAt: new Date(2023, 11, 18),
  },
  {
    id: "task-5",
    title: "Sửa lỗi thanh toán trên thiết bị di động",
    description: "Khắc phục vấn đề người dùng không thể hoàn tất thanh toán trên ứng dụng di động.",
    status: "canceled",
    priority: "high",
    dueDate: new Date(2023, 11, 12),
    assignedTo: "Nguyễn Văn A",
    createdAt: new Date(2023, 11, 5),
    updatedAt: new Date(2023, 11, 11),
  },
];

// Xử lý GET request để lấy danh sách task
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
    
    return NextResponse.json({
      success: true,
      data: mockTasks
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công việc:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi lấy danh sách công việc' },
      { status: 500 }
    );
  }
}

// Xử lý POST request để tạo task mới
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
    if (!data.title || !data.description || !data.priority || !data.assignedTo) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    // Tạo task mới
    const newTask = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: data.status || "pending",
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
      assignedTo: data.assignedTo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Trong thực tế, sẽ lưu vào database
    mockTasks.push(newTask);
    
    return NextResponse.json({
      success: true,
      message: 'Tạo công việc mới thành công',
      data: newTask
    }, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo công việc mới:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi tạo công việc mới' },
      { status: 500 }
    );
  }
} 