"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  Clipboard, 
  Plus, 
  Edit,
  Trash,
  Calendar,
  Trophy,
  ListOrdered,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Định nghĩa các kiểu dữ liệu
interface Task {
  _id: string;
  taskName: string;
  description: string;
  order: number;
  expPoint: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export default function TasksPage() {
  // State cho danh sách nhiệm vụ
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  
  // State cho form thêm/sửa nhiệm vụ
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    order: 1,
    expPoint: 100,
  });
  
  // Tải dữ liệu từ API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('admin_token');
        
        if (!token) {
          toast.error('Vui lòng đăng nhập để xem danh sách nhiệm vụ');
          return;
        }
        
        const response = await fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Lỗi API (${response.status}):`, errorText);
          throw new Error(`Không thể tải danh sách nhiệm vụ: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Dữ liệu nhiệm vụ:', responseData);
        
        // Xử lý cấu trúc dữ liệu nhận được từ API
        let tasksData = [];
        
        if (Array.isArray(responseData)) {
          // Trường hợp API trả về trực tiếp là mảng
          tasksData = responseData;
        } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
          // Trường hợp API trả về object có trường data là mảng
          tasksData = responseData.data;
        } else if (responseData && typeof responseData === 'object') {
          // Tìm trường chứa mảng dữ liệu
          const arrayFields = Object.keys(responseData).filter(key => 
            Array.isArray(responseData[key])
          );
          
          if (arrayFields.length > 0) {
            tasksData = responseData[arrayFields[0]];
          } else {
            console.error('Không tìm thấy mảng dữ liệu trong response:', responseData);
            throw new Error('Cấu trúc dữ liệu không đúng định dạng');
          }
        } else {
          console.error('Dữ liệu không đúng định dạng:', responseData);
          throw new Error('Dữ liệu không đúng định dạng');
        }
        
        console.log('Tasks đã xử lý:', tasksData);
        
        // Chuẩn hóa dữ liệu nếu cần
        const formattedTasks = tasksData.map((task: Partial<Task>) => ({
          ...task,
          order: task.order || 0,
          expPoint: task.expPoint || 0,
          description: task.description || ''
        }));
        
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhiệm vụ:', error);
        toast.error(error instanceof Error ? error.message : 'Lỗi khi tải danh sách nhiệm vụ');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Lọc nhiệm vụ dựa trên tìm kiếm
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      (task.taskName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });

  // Tính toán tổng điểm kinh nghiệm của tất cả nhiệm vụ
  const totalExpPoints = tasks.reduce((total, task) => total + task.expPoint, 0);
  
  // Hàm xử lý thêm nhiệm vụ mới
  const handleAddTask = () => {
    setFormData({
      taskName: "",
      description: "",
      order: 1,
      expPoint: 100,
    });
    setShowAddTaskDialog(true);
  };
  
  // Hàm xử lý chỉnh sửa nhiệm vụ
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      taskName: task.taskName,
      description: task.description,
      order: task.order,
      expPoint: task.expPoint,
    });
    setShowEditTaskDialog(true);
  };
  
  // Hàm xử lý xóa nhiệm vụ
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này không?")) {
      try {
        const token = sessionStorage.getItem('admin_token');
        
        if (!token) {
          toast.error('Vui lòng đăng nhập để xóa nhiệm vụ');
          return;
        }
        
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Không thể xóa nhiệm vụ');
        }
        
        // Xóa nhiệm vụ khỏi state
        setTasks(tasks.filter(task => task._id !== taskId));
        toast.success("Đã xóa nhiệm vụ thành công");
      } catch (error) {
        console.error('Lỗi khi xóa nhiệm vụ:', error);
        toast.error('Lỗi khi xóa nhiệm vụ');
      }
    }
  };

  // Hàm xử lý gửi form thêm nhiệm vụ mới
  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem('admin_token');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập để thêm nhiệm vụ');
        return;
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Không thể thêm nhiệm vụ mới');
      }
      
      const newTask = await response.json();
      
      // Thêm nhiệm vụ mới vào state
      setTasks([...tasks, newTask.data]);
      setShowAddTaskDialog(false);
      toast.success("Đã thêm nhiệm vụ mới thành công");
    } catch (error) {
      console.error('Lỗi khi thêm nhiệm vụ mới:', error);
      toast.error('Lỗi khi thêm nhiệm vụ mới');
    }
  };

  // Hàm xử lý gửi form chỉnh sửa nhiệm vụ
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTask) return;
    
    try {
      const token = sessionStorage.getItem('admin_token');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập để cập nhật nhiệm vụ');
        return;
      }
      
      const response = await fetch(`/api/tasks/${currentTask._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Không thể cập nhật nhiệm vụ');
      }
      
      const updatedTask = await response.json();
      
      // Cập nhật state với thông tin mới
      setTasks(tasks.map(task => 
        task._id === currentTask._id ? updatedTask.data : task
      ));
      setShowEditTaskDialog(false);
      toast.success("Đã cập nhật nhiệm vụ thành công");
    } catch (error) {
      console.error('Lỗi khi cập nhật nhiệm vụ:', error);
      toast.error('Lỗi khi cập nhật nhiệm vụ');
    }
  };
  
  // Hàm xử lý thay đổi dữ liệu form
  const handleFormChange = (field: string, value: unknown) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Hàm tạo badge cho điểm thưởng
  const getExpPointBadge = (points: number) => {
    let colorClass = '';
    
    if (points < 200) {
      colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
    } else if (points < 500) {
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (points < 1000) {
      colorClass = 'bg-green-100 text-green-800 border-green-200';
    } else {
      colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
    }
    
    return (
      <Badge variant="outline" className={`${colorClass} flex items-center gap-1`}>
        <Trophy className="h-3 w-3" />
        <span>{points} điểm</span>
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý nhiệm vụ</h2>
        <Button 
          onClick={handleAddTask}
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Thêm nhiệm vụ mới</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số nhiệm vụ
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {tasks.length}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">
              Nhiệm vụ đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng điểm kinh nghiệm
            </CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {totalExpPoints}
            </div>
            <p className="text-xs text-green-600/80 mt-1">
              Tổng điểm thưởng tất cả nhiệm vụ
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cập nhật gần nhất
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold text-orange-700">
              {tasks.length > 0 
                ? format(new Date(tasks.sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                  )[0].updatedAt), 'dd/MM/yyyy HH:mm') 
                : 'Chưa có dữ liệu'}
            </div>
            <p className="text-xs text-orange-600/80 mt-1">
              Thời gian cập nhật gần nhất
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Clipboard className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhiệm vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="rounded-md border shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Nhiệm vụ</TableHead>
                <TableHead className="w-[100px] text-center">Thứ tự</TableHead>
                <TableHead className="w-[150px]">Điểm thưởng</TableHead>
                <TableHead className="w-[150px]">Ngày tạo</TableHead>
                <TableHead className="w-[150px]">Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <p className="text-muted-foreground">Không có nhiệm vụ nào.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task._id} className="group hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div>
                        <div className="text-blue-600 font-semibold">{task.taskName}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {task.order}
                      </Badge>
                    </TableCell>
                    <TableCell>{getExpPointBadge(task.expPoint)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(task.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(task.updatedAt), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleEditTask(task)}
                        >
                          <span className="sr-only">Sửa</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          <span className="sr-only">Xóa</span>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog thêm nhiệm vụ mới */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm nhiệm vụ mới</DialogTitle>
            <DialogDescription>
              Điền thông tin nhiệm vụ và bấm Thêm để tạo nhiệm vụ mới.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Tên nhiệm vụ <span className="text-red-500">*</span></Label>
              <Input 
                id="taskName" 
                value={formData.taskName} 
                onChange={(e) => handleFormChange("taskName", e.target.value)} 
                required 
                placeholder="Nhập tên nhiệm vụ"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleFormChange("description", e.target.value)} 
                rows={4} 
                placeholder="Nhập mô tả chi tiết về nhiệm vụ"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự <span className="text-red-500">*</span></Label>
                <Input 
                  id="order" 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => handleFormChange("order", Number(e.target.value))} 
                  min="1"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expPoint">Điểm thưởng <span className="text-red-500">*</span></Label>
                <Input 
                  id="expPoint" 
                  type="number"
                  value={formData.expPoint} 
                  onChange={(e) => handleFormChange("expPoint", Number(e.target.value))} 
                  min="1"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setShowAddTaskDialog(false)}
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Thêm nhiệm vụ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa nhiệm vụ */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhiệm vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin nhiệm vụ và bấm Lưu thay đổi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-taskName">Tên nhiệm vụ <span className="text-red-500">*</span></Label>
              <Input 
                id="edit-taskName" 
                value={formData.taskName} 
                onChange={(e) => handleFormChange("taskName", e.target.value)} 
                required 
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea 
                id="edit-description" 
                value={formData.description} 
                onChange={(e) => handleFormChange("description", e.target.value)} 
                rows={4} 
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-order">Thứ tự <span className="text-red-500">*</span></Label>
                <Input 
                  id="edit-order" 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => handleFormChange("order", Number(e.target.value))} 
                  min="1"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-expPoint">Điểm thưởng <span className="text-red-500">*</span></Label>
                <Input 
                  id="edit-expPoint" 
                  type="number"
                  value={formData.expPoint} 
                  onChange={(e) => handleFormChange("expPoint", Number(e.target.value))} 
                  min="1"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setShowEditTaskDialog(false)}
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 