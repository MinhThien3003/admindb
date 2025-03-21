"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Image as ImageIcon, Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NovelStatus } from "@/app/dashboard/novels/page"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import React from "react"

// Định nghĩa interfaces tương tự như trong src/app/dashboard/novels/page.tsx
interface Rating {
  userId: number;
  username: string;
  stars: number;
  comment?: string;
  createdAt: string;
}

interface Chapter {
  title: string;
  content: string;
  price?: number;
  isPremium?: boolean;
  ratings?: Rating[];
}

// Export interface để sử dụng ở những nơi khác
export interface NovelData {
  id?: number;
  name: string;
  image: string;
  categories: string[];
  chapters: Chapter[];
  views: number;
  createdAt: string;
  description: string;
  averageRating?: number;
  totalRatings?: number;
  status: NovelStatus;
}

interface NovelEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: NovelData;
  onSave: (data: NovelData) => void;
  categories: string[];
}

export function NovelEditDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  categories = []
}: NovelEditDialogProps) {
  const isEditMode = !!initialData?.id
  
  // Log để debug
  console.log('initialData:', initialData)

  const [formData, setFormData] = useState<NovelData>(
    initialData || {
      name: "",
      image: "",
      categories: [],
      description: "",
      status: NovelStatus.ONGOING,
      views: 0,
      chapters: [],
      createdAt: new Date().toISOString(),
      averageRating: 0,
      totalRatings: 0
    }
  )
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [activeTab, setActiveTab] = useState("general")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState("")
  
  // Effect để cập nhật dữ liệu khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setImagePreview(initialData.image || "")
    }
  }, [initialData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleStatusChange = (value: NovelStatus) => {
    setFormData({ ...formData, status: value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Tạo object URL để xem trước ảnh
      const objectUrl = URL.createObjectURL(file)
      setImagePreview(objectUrl)
      
      // Đặt đường dẫn ảnh - trong thực tế sẽ thay bằng URL sau khi upload
      setFormData({ ...formData, image: file.name })
    }
  }
  
  const addCategory = () => {
    if (selectedCategory && !formData.categories.includes(selectedCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, selectedCategory],
      })
      setSelectedCategory("")
    }
  }

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    })
  }

  const addChapter = () => {
    if (!newChapterTitle.trim()) return
    
    const newChapter: Chapter = {
      title: newChapterTitle,
      content: "",
      isPremium: false,
    }
    
    setFormData({
      ...formData, 
      chapters: [...formData.chapters, newChapter]
    })
    setNewChapterTitle("")
  }
  
  const removeChapter = (index: number) => {
    const updatedChapters = [...formData.chapters]
    updatedChapters.splice(index, 1)
    setFormData({ ...formData, chapters: updatedChapters })
    
    if (selectedChapter === index) {
      setSelectedChapter(null)
    } else if (selectedChapter !== null && selectedChapter > index) {
      setSelectedChapter(selectedChapter - 1)
    }
  }
  
  const updateChapterTitle = (index: number, title: string) => {
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { ...updatedChapters[index], title }
    setFormData({ ...formData, chapters: updatedChapters })
  }
  
  const updateChapterContent = (index: number, content: string) => {
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { ...updatedChapters[index], content }
    setFormData({ ...formData, chapters: updatedChapters })
  }
  
  const toggleChapterPremium = (index: number, isPremium: boolean) => {
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { 
      ...updatedChapters[index], 
      isPremium,
      // Nếu không phải premium, xóa giá tiền
      price: isPremium ? (updatedChapters[index].price || 5) : undefined
    }
    setFormData({ ...formData, chapters: updatedChapters })
  }
  
  const updateChapterPrice = (index: number, priceStr: string) => {
    const price = parseFloat(priceStr)
    if (isNaN(price)) return
    
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { ...updatedChapters[index], price }
    setFormData({ ...formData, chapters: updatedChapters })
  }

  const handleSubmit = () => {
    // Kiểm tra dữ liệu trước khi lưu
    if (!formData.name || formData.name.trim() === '') {
      alert('Vui lòng nhập tên truyện')
      return
    }
    
    // Chuẩn bị dữ liệu để lưu
    const novelData: NovelData = {
      ...formData
    }
    
    // Xử lý ảnh
    if (imageFile) {
      console.log('Đang upload ảnh:', imageFile.name)
      // Trong thực tế sẽ upload ảnh lên server và nhận URL thực tế
      // Ở đây chỉ giả lập là thêm prefix
      if (!imageFile.name.startsWith('/uploads/')) {
        novelData.image = `/uploads/${imageFile.name}`
      }
    } else if (!formData.image.startsWith('/') && !formData.image.startsWith('http')) {
      // Nếu không có imageFile và đường dẫn không bắt đầu bằng "/" hoặc "http"
      // thì giả sử đây là tên file và thêm prefix
      if (formData.image && !formData.image.startsWith('/uploads/')) {
        novelData.image = `/uploads/${formData.image}`
      }
    }
    
    console.log('Lưu novel với ảnh:', novelData.image)
    onSave(novelData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Chỉnh sửa Truyện" : "Thêm Truyện mới"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="details">Danh sách chương</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Tên truyện</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên truyện"
                  required
                />
              </div>

              <div>
                <Label>Trạng thái</Label>
                <RadioGroup 
                  value={formData.status} 
                  onValueChange={(value) => handleStatusChange(value as NovelStatus)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={NovelStatus.ONGOING} id="ongoing" />
                    <Label htmlFor="ongoing" className="flex items-center cursor-pointer">
                      Đang tiến hành
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={NovelStatus.COMPLETED} id="completed" />
                    <Label htmlFor="completed" className="flex items-center cursor-pointer">
                      Hoàn thành
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={NovelStatus.DROPPED} id="dropped" />
                    <Label htmlFor="dropped" className="flex items-center cursor-pointer">
                      Đã drop
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Bìa truyện</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full h-60 rounded-md overflow-hidden mb-2">
                      {imagePreview.startsWith('data:') || imagePreview.startsWith('blob:') ? (
                        // Hiển thị ảnh từ file đã upload
                        <Image 
                          src={imagePreview} 
                          alt="Bìa truyện" 
                          fill 
                          style={{ objectFit: 'contain' }} 
                        />
                      ) : (
                        // Hiển thị ảnh từ đường dẫn có sẵn
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          {imagePreview.startsWith('/') || imagePreview.startsWith('http') ? (
                            <Image 
                              src={imagePreview} 
                              alt="Bìa truyện" 
                              fill 
                              style={{ objectFit: 'contain' }} 
                            />
                          ) : (
                            <div className="text-muted-foreground text-center px-4">
                              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                              <p>{imagePreview}</p>
                              <p className="text-xs mt-1">(Đường dẫn ảnh: {imagePreview})</p>
                            </div>
                          )}
                        </div>
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => {
                          setImagePreview("")
                          setImageFile(null)
                          setFormData({ ...formData, image: "" })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors relative"
                      onClick={() => document.getElementById('cover-upload')?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Kéo thả ảnh hoặc click để tải lên
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SVG, PNG, JPG (tối đa 5MB)
                        </p>
                      </div>
                      <input 
                        id="cover-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Thể loại</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {formData.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="px-3 py-1">
                      {category}
                      <button
                        type="button"
                        className="ml-2"
                        onClick={() => removeCategory(category)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chọn thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {categories
                          .filter(cat => !formData.categories.includes(cat))
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addCategory} disabled={!selectedCategory}>
                    Thêm
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả truyện"
                  rows={5}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Danh sách chương</h3>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Tiêu đề chương mới"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={addChapter}
                  disabled={!newChapterTitle.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              </div>
              
              {formData.chapters.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {formData.chapters.map((chapter, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-md p-3 ${selectedChapter === index ? 'border-primary' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Input
                            value={chapter.title}
                            onChange={(e) => updateChapterTitle(index, e.target.value)}
                            className="flex-1 mr-2"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeChapter(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`chapter-premium-${index}`}
                              checked={chapter.isPremium || false}
                              onCheckedChange={(checked) => 
                                toggleChapterPremium(index, checked === true)
                              }
                            />
                            <Label htmlFor={`chapter-premium-${index}`}>Chương trả phí</Label>
                          </div>
                          
                          {chapter.isPremium && (
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`chapter-price-${index}`}>Giá (xu):</Label>
                              <Input
                                id={`chapter-price-${index}`}
                                type="number"
                                value={chapter.price || 5}
                                onChange={(e) => updateChapterPrice(index, e.target.value)}
                                className="w-20"
                                min={1}
                              />
                            </div>
                          )}
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedChapter(selectedChapter === index ? null : index)}
                        >
                          {selectedChapter === index ? "Ẩn nội dung" : "Hiển thị nội dung"}
                        </Button>
                        
                        {selectedChapter === index && (
                          <div className="mt-2">
                            <Textarea
                              value={chapter.content}
                              onChange={(e) => updateChapterContent(index, e.target.value)}
                              placeholder="Nội dung chương..."
                              rows={6}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Chưa có chương nào. Hãy thêm chương đầu tiên!
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 