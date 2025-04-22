"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Clipboard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlarmClock, 
  XCircle,
  Edit,
  Trash,
  Calendar,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { vi } from "date-fns/locale";

// Định nghĩa các kiểu dữ liệu
interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "canceled";
  priority: "low" | "medium" | "high";
  dueDate: Date;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function TasksPage() {
  // State cho danh sách công việc
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  // State cho form thêm/sửa công việc
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending" as Task["status"],
    priority: "medium" as Task["priority"],
    dueDate: new Date(),
    assignedTo: "",
  });
  
  // Tải dữ liệu mẫu khi component được tạo
  useEffect(() => {
    // Tạo một số công việc mẫu
    const mockTasks: Task[] = [
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
    
    setTasks(mockTasks);
    setLoading(false);
  }, []);
  
  // Lọc công việc dựa trên các điều kiện
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Hàm xử lý thêm công việc mới
  const handleAddTask = () => {
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: new Date(),
      assignedTo: "",
    });
    setShowAddTaskDialog(true);
  };
  
  // Hàm xử lý chỉnh sửa công việc
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
    });
    setShowEditTaskDialog(true);
  };
  
  // Hàm xử lý xóa công việc
  const handleDeleteTask = (taskId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
      // Xóa công việc khỏi state
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success("Đã xóa công việc");
    }
  };
  
  // Hàm xử lý thay đổi trạng thái công việc
  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date() } : task
    ));
    toast.success("Đã cập nhật trạng thái công việc");
  };
  
  // Hàm xử lý khi submit form thêm công việc
  const handleAddFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo công việc mới
    const newTask: Task = {
      id: `task-${tasks.length + 1}-${Date.now()}`,
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Thêm vào danh sách
    setTasks([...tasks, newTask]);
    setShowAddTaskDialog(false);
    toast.success("Đã thêm công việc mới");
  };
  
  // Hàm xử lý khi submit form sửa công việc
  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTask) return;
    
    // Cập nhật công việc
    setTasks(tasks.map(task => 
      task.id === currentTask.id 
        ? { 
            ...task, 
            ...formData,
            updatedAt: new Date() 
          } 
        : task
    ));
    
    setShowEditTaskDialog(false);
    toast.success("Đã cập nhật công việc");
  };
  
  // Hàm tạo badge cho trạng thái
  const getStatusBadge = (status: Task["status"]) => {
    const statusConfig = {
      "pending": { label: "Chờ xử lý", class: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      "in-progress": { label: "Đang thực hiện", class: "bg-blue-100 text-blue-800 border-blue-200", icon: AlarmClock },
      "completed": { label: "Hoàn thành", class: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
      "canceled": { label: "Đã hủy", class: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.class} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };
  
  // Hàm tạo badge cho mức độ ưu tiên
  const getPriorityBadge = (priority: Task["priority"]) => {
    const priorityConfig = {
      "low": { label: "Thấp", class: "bg-gray-100 text-gray-800 border-gray-200" },
      "medium": { label: "Trung bình", class: "bg-orange-100 text-orange-800 border-orange-200" },
      "high": { label: "Cao", class: "bg-red-100 text-red-800 border-red-200" },
    };
    
    const config = priorityConfig[priority];
    
    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };
  
  // Hàm thay đổi giá trị form
  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý công việc</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = "/dashboard/tasks/authors"}>
            <UserCheck className="mr-2 h-4 w-4" />
            Nhiệm vụ tác giả
          </Button>
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm công việc
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Chờ xử lý
            </CardTitle>
            <CardDescription>
              {tasks.filter(t => t.status === "pending").length} công việc
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Đang thực hiện
            </CardTitle>
            <CardDescription>
              {tasks.filter(t => t.status === "in-progress").length} công việc
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === "in-progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Đã hoàn thành
            </CardTitle>
            <CardDescription>
              {tasks.filter(t => t.status === "completed").length} công việc
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          <Clipboard className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="in-progress">Đang thực hiện</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="canceled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mức độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ưu tiên</TableHead>
              <TableHead>Người được giao</TableHead>
              <TableHead>Hạn hoàn thành</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{task.description.substring(0, 50)}...</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(task.dueDate, 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditTask(task)}
                      >
                        <span className="sr-only">Chỉnh sửa</span>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <span className="sr-only">Xóa</span>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Clipboard className="h-10 w-10 mb-2" />
                    <p>Không tìm thấy công việc nào</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog thêm công việc mới */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm công việc mới</DialogTitle>
            <DialogDescription>
              Vui lòng điền đầy đủ thông tin công việc.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => handleFormChange("title", e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleFormChange("description", e.target.value)} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleFormChange("status", value as Task["status"])}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="canceled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleFormChange("priority", value as Task["priority"])}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Hạn hoàn thành</Label>
                <DatePicker
                  selected={formData.dueDate}
                  onSelect={(date) => handleFormChange("dueDate", date)}
                  locale={vi}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Người thực hiện</Label>
                <Input 
                  id="assignedTo" 
                  value={formData.assignedTo} 
                  onChange={(e) => handleFormChange("assignedTo", e.target.value)} 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddTaskDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">Thêm công việc</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog chỉnh sửa công việc */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin công việc.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Tiêu đề</Label>
              <Input 
                id="edit-title" 
                value={formData.title} 
                onChange={(e) => handleFormChange("title", e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea 
                id="edit-description" 
                value={formData.description} 
                onChange={(e) => handleFormChange("description", e.target.value)} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleFormChange("status", value as Task["status"])}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="canceled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Mức độ ưu tiên</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleFormChange("priority", value as Task["priority"])}
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Hạn hoàn thành</Label>
                <DatePicker
                  selected={formData.dueDate}
                  onSelect={(date) => handleFormChange("dueDate", date)}
                  locale={vi}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-assignedTo">Người thực hiện</Label>
                <Input 
                  id="edit-assignedTo" 
                  value={formData.assignedTo} 
                  onChange={(e) => handleFormChange("assignedTo", e.target.value)} 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditTaskDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 