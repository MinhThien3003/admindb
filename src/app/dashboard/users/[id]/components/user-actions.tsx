import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Upload } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserActionsProps {
  userId: string;
}

export default function UserActions({ userId }: UserActionsProps) {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditAvatarDialog, setOpenEditAvatarDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lấy thông tin người dùng hiện tại để hiển thị avatar hiện tại
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserData(userData);
        }
      } catch (error) {
        console.error('Không thể lấy thông tin người dùng:', error);
      }
    };
    
    fetchUserData();
  }, [userId]);

  // Hàm nén/resize ảnh
  const compressImage = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Tính toán kích thước mới giữ nguyên tỷ lệ
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
          
          // Tạo canvas để vẽ ảnh đã resize
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Chuyển đổi sang base64 với chất lượng nén
          const base64 = canvas.toDataURL(file.type, quality);
          
          // Kiểm tra kích thước dữ liệu base64
          const approximateSize = Math.round((base64.length * 0.75) / 1024); // Kích thước KB
          console.log(`Kích thước ảnh sau khi nén: ~${approximateSize} KB`);
          
          // Nếu vẫn quá lớn, nén tiếp
          if (approximateSize > 500) {
            // Nén nhiều hơn nữa
            resolve(compressImage(file, Math.round(width * 0.8), Math.round(height * 0.8), quality * 0.9));
          } else {
            resolve(base64);
          }
        };
        img.onerror = (error) => {
          reject(error);
        };
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Kiểm tra loại file và kích thước
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng tải lên file hình ảnh');
      return;
    }
    
    // Kiểm tra các loại hình ảnh được chấp nhận
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận các định dạng: JPG, PNG, GIF, WEBP');
      return;
    }
    
    // Kích thước tối đa (2MB)
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error('Kích thước hình ảnh không được vượt quá 2MB, hệ thống sẽ tự động nén ảnh');
      try {
        // Nén ảnh nếu quá lớn
        const compressedImage = await compressImage(file);
        setAvatarPreview(compressedImage);
        return;
      } catch (error) {
        console.error('Lỗi khi nén ảnh:', error);
        toast.error('Không thể nén ảnh, vui lòng chọn ảnh nhỏ hơn');
        return;
      }
    }
    
    try {
      // Nén ảnh để đảm bảo kích thước nhỏ
      toast.info('Đang xử lý ảnh...');
      const compressedImage = await compressImage(file);
      setAvatarPreview(compressedImage);
    } catch (error) {
      console.error('Lỗi khi xử lý ảnh:', error);
      
      // Fallback to traditional method if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setAvatarPreview(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarPreview) return;
    
    // Kiểm tra kích thước base64 trước khi gửi
    const base64Size = Math.round((avatarPreview.length * 0.75) / 1024); // KB
    if (base64Size > 800) {
      toast.error(`Ảnh vẫn quá lớn (${base64Size} KB). Vui lòng sử dụng ảnh nhỏ hơn.`);
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Lấy token xác thực
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực, vui lòng đăng nhập lại');
      }
      
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        avatar: avatarPreview
      };
      
      console.log('Đang cập nhật avatar cho người dùng ID:', userId);
      console.log('Kích thước dữ liệu gửi đi:', `${base64Size} KB`);
      
      // Gọi API PUT để cập nhật avatar người dùng
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      // Đọc response dưới dạng text trước
      const responseText = await response.text();
      console.log(`Response từ API cập nhật avatar (${response.status}):`, responseText.substring(0, 100) + '...');
      
      // Parse JSON nếu có thể
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Không thể parse JSON từ response:', e);
        responseData = { message: responseText };
      }
      
      // Xử lý response
      if (!response.ok) {
        throw new Error(responseData.message || 'Không thể cập nhật avatar');
      }
      
      toast.success('Cập nhật avatar thành công');
      setOpenEditAvatarDialog(false);
      
      // Làm mới trang để hiển thị avatar mới
      router.refresh();
    } catch (error) {
      console.error('Lỗi khi cập nhật avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      // Lấy token xác thực
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực, vui lòng đăng nhập lại');
      }
      
      // Gọi API DELETE để xóa người dùng
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Đọc response dưới dạng text trước
      const responseText = await response.text();
      console.log(`Response từ API xóa người dùng (${response.status}):`, responseText);
      
      // Parse JSON nếu có thể
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Không thể parse JSON từ response:', e);
        responseData = { message: responseText };
      }
      
      // Xử lý response
      if (!response.ok) {
        throw new Error(responseData.message || 'Không thể xóa người dùng');
      }
      
      toast.success('Xóa người dùng thành công');
      
      // Chuyển hướng về trang danh sách người dùng
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xóa người dùng');
    }
  };

  // Lấy avatar hiện tại hoặc tạo initials từ tên
  const getCurrentAvatarDisplay = () => {
    // Hiển thị avatar preview nếu có
    if (avatarPreview) {
      return <AvatarImage src={avatarPreview} alt="Xem trước" />;
    }
    
    // Hiển thị avatar hiện tại nếu có
    if (currentUserData?.avatar && typeof currentUserData.avatar === 'string' && currentUserData.avatar.length > 0 && !currentUserData.avatar.includes('null')) {
      return <AvatarImage src={currentUserData.avatar} alt={currentUserData.fullname || 'Avatar'} />;
    }
    
    // Fallback: hiển thị ký tự đầu tiên của tên
    const userInitials = currentUserData?.fullname
      ? currentUserData.fullname.substring(0, 2).toUpperCase()
      : '??';
    
    return (
      <AvatarFallback className="bg-primary/10 text-primary">
        {userInitials}
      </AvatarFallback>
    );
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={() => setOpenEditAvatarDialog(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Thay avatar
      </Button>
      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/users/${userId}/edit`)}>
        <Edit className="h-4 w-4 mr-2" />
        Chỉnh sửa
      </Button>
      <Button variant="destructive" size="sm" onClick={() => setOpenDeleteDialog(true)}>
        <Trash className="h-4 w-4 mr-2" />
        Xóa
      </Button>

      {/* Dialog xác nhận xóa người dùng */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa người dùng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn người dùng và tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog thay đổi avatar */}
      <Dialog open={openEditAvatarDialog} onOpenChange={setOpenEditAvatarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi avatar</DialogTitle>
            <DialogDescription>
              Tải lên hình ảnh mới để thay đổi avatar. Chấp nhận JPG, PNG, GIF, WEBP tối đa 2MB. Ảnh sẽ tự động được nén để tối ưu kích thước.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <Avatar className="h-32 w-32">
              {getCurrentAvatarDisplay()}
            </Avatar>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="avatar-upload">Chọn hình ảnh</Label>
              <Input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setOpenEditAvatarDialog(false);
              setAvatarPreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}>
              Hủy
            </Button>
            <Button 
              onClick={handleUploadAvatar} 
              disabled={!avatarPreview || isUploading}
            >
              {isUploading ? 'Đang tải lên...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 