"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash, Star, Clock, CheckCircle, XCircle } from "lucide-react"
import { NovelStatus } from "@/app/dashboard/novels/page"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Định nghĩa interface cho Rating
interface Rating {
  userId: number;
  username: string;
  stars: number;
  comment?: string;
  createdAt: string;
}

// Định nghĩa interface cho Chapter
interface Chapter {
  title: string;
  content: string;
  isPremium?: boolean;
  price?: number;
  ratings?: Rating[];
}

// Định nghĩa interface cho Novel
interface Novel {
  id: number;
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

interface NovelFormProps {
  initialData: Novel;
  selectedChapter: Chapter | null;
  onChapterChange: (chapter: Chapter) => void;
  onSubmit: (data: Partial<Novel>) => void;
}

export function NovelForm({
  initialData,
  selectedChapter,
  onChapterChange,
  onSubmit,
}: NovelFormProps) {
  const [formData, setFormData] = useState<Novel>(initialData)
  const [activeTab, setActiveTab] = useState("details")
  const [newCategory, setNewCategory] = useState("")
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as NovelStatus })
  }

  const handleChapterSelect = (chapter: Chapter) => {
    onChapterChange(chapter)
  }

  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { ...updatedChapters[index], [name]: value }
    setFormData({ ...formData, chapters: updatedChapters })
  }

  const handleChapterPremiumChange = (checked: boolean, index: number) => {
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { 
      ...updatedChapters[index], 
      isPremium: checked,
      // Nếu không phải premium, xóa giá tiền
      price: checked ? (updatedChapters[index].price || 0) : undefined
    }
    setFormData({ ...formData, chapters: updatedChapters })
  }

  const handleChapterPriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseFloat(e.target.value)
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { 
      ...updatedChapters[index], 
      price: isNaN(value) ? 0 : value 
    }
    setFormData({ ...formData, chapters: updatedChapters })
  }

  const addChapter = () => {
    const newChapter = {
      title: `Chapter ${formData.chapters.length + 1}`,
      content: "",
      isPremium: false
    }
    setFormData({
      ...formData,
      chapters: [...formData.chapters, newChapter],
    })
    onChapterChange(newChapter)
  }

  const removeChapter = (index: number) => {
    const updatedChapters = formData.chapters.filter((_, i) => i !== index)
    setFormData({ ...formData, chapters: updatedChapters })
    
    if (updatedChapters.length > 0) {
      onChapterChange(updatedChapters[0])
    } else {
      onChapterChange({ title: "", content: "" })
    }
  }

  const addCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory],
      })
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    })
  }

  // Tính điểm trung bình của một chương
  const calculateChapterRating = (ratings: Rating[] = []) => {
    if (ratings.length === 0) return 0;
    const totalStars = ratings.reduce((sum, rating) => sum + rating.stars, 0);
    return parseFloat((totalStars / ratings.length).toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Tính toán lại điểm trung bình và tổng số đánh giá
    let totalStars = 0;
    let totalRatings = 0;
    
    formData.chapters.forEach(chapter => {
      if (chapter.ratings && chapter.ratings.length > 0) {
        totalStars += chapter.ratings.reduce((sum, rating) => sum + rating.stars, 0);
        totalRatings += chapter.ratings.length;
      }
    });
    
    const averageRating = totalRatings > 0 
      ? parseFloat((totalStars / totalRatings).toFixed(1)) 
      : 0;
    
    const updatedData = {
      ...formData,
      averageRating,
      totalRatings
    };
    
    onSubmit(updatedData)
    toast({
      title: "Thành công",
      description: "Đã lưu thông tin truyện",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Thông tin chung</TabsTrigger>
          <TabsTrigger value="chapters">Danh sách chương</TabsTrigger>
          <TabsTrigger value="editor">Nội dung chương</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div>
            <Label htmlFor="name">Tên truyện</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NovelStatus.ONGOING}>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    Đang tiến hành
                  </div>
                </SelectItem>
                <SelectItem value={NovelStatus.COMPLETED}>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Hoàn thành
                  </div>
                </SelectItem>
                <SelectItem value={NovelStatus.DROPPED}>
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Đã drop
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Đường dẫn ảnh bìa</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div>
            <Label>Thể loại</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center bg-secondary px-3 py-1 rounded-full"
                >
                  <span>{category}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1"
                    onClick={() => removeCategory(category)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Thêm thể loại mới"
                className="mr-2"
              />
              <Button type="button" onClick={addCategory}>
                Thêm
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chapters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Danh sách chương</h3>
            <Button type="button" onClick={addChapter} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Thêm chương
            </Button>
          </div>

          <ScrollArea className="h-[400px] border rounded-md p-4">
            <div className="space-y-4">
              {formData.chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="border rounded-md p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <Label htmlFor={`chapter-title-${index}`}>Tiêu đề</Label>
                      <Input
                        id={`chapter-title-${index}`}
                        name="title"
                        value={chapter.title}
                        onChange={(e) => handleChapterChange(e, index)}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      onClick={() => removeChapter(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`chapter-premium-${index}`}
                      checked={chapter.isPremium || false}
                      onCheckedChange={(checked) => 
                        handleChapterPremiumChange(checked === true, index)
                      }
                    />
                    <Label htmlFor={`chapter-premium-${index}`}>Chương trả phí</Label>
                  </div>

                  {chapter.isPremium && (
                    <div>
                      <Label htmlFor={`chapter-price-${index}`}>Giá (xu)</Label>
                      <Input
                        id={`chapter-price-${index}`}
                        type="number"
                        min="0"
                        step="1"
                        value={chapter.price || 0}
                        onChange={(e) => handleChapterPriceChange(e, index)}
                        required={chapter.isPremium}
                      />
                    </div>
                  )}

                  {/* Hiển thị thông tin đánh giá nếu có */}
                  {chapter.ratings && chapter.ratings.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">
                          {calculateChapterRating(chapter.ratings)} ({chapter.ratings.length} đánh giá)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleChapterSelect(chapter)}
                    >
                      Chỉnh sửa nội dung
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="editor">
          {selectedChapter ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{selectedChapter.title}</h3>
              <Textarea
                value={selectedChapter.content}
                onChange={(e) => {
                  const index = formData.chapters.findIndex(
                    (c) => c.title === selectedChapter.title
                  )
                  if (index !== -1) {
                    handleChapterChange(e, index)
                  }
                }}
                placeholder="Nhập nội dung chương..."
                className="min-h-[400px]"
                name="content"
              />
            </div>
          ) : (
            <div className="text-center py-10">
              <p>Vui lòng chọn một chương để chỉnh sửa</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit">Lưu thay đổi</Button>
      </div>
    </form>
  )
}